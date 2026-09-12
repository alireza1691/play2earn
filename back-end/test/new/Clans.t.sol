// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {Clans} from "../../src/new/Clans.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

contract MockLands {
    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;
    function setOwner(uint256 tokenId, address newOwner) external {
        address previous = owners[tokenId];
        if (previous != address(0)) balances[previous] -= 1;
        if (newOwner != address(0)) balances[newOwner] += 1;
        owners[tokenId] = newOwner;
    }

    /// Clans asks this to refuse members who hold no land.
    function balanceOf(address account) external view returns (uint256) { return balances[account]; }
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = owners[tokenId];
        // Match ERC721: an unminted token has no owner and reverts.
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    /// Match Lands: the non-reverting form, which is what Town asks.
    function ownerOfOrZero(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }

    /// Every parcel in these tests is an ordinary Town unless a test says otherwise.
    function landType(uint256) external pure returns (uint8) { return 0; }
}

contract ClansTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address carol = address(0xCA401);

    uint256 constant ALICE_LAND = 101101;
    uint256 constant BOB_LAND = 105105;
    uint256 constant CAROL_LAND = 109109;
    uint256 constant MACEMAN = 0;

    function setUp() public {
        vm.warp(1_000_000);
        lands = new MockLands();
        plot = new PLOT(address(this));

        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(TownBase.initialize, (address(plot), address(lands), true, address(this)))
        );
        town = Town(address(proxy));
        // War is a separate deployed contract Town delegatecalls into; without
        // this every dispatch reverts with WarModuleNotSet.
        town.setWarModule(address(new TownWar()));

        lands.setOwner(ALICE_LAND, alice);
        lands.setOwner(BOB_LAND, bob);
        lands.setOwner(CAROL_LAND, carol);

        uint256[2] memory b = [uint256(25_000_000 ether), 25_000_000 ether];
        uint256[2] memory g = [uint256(50_000_000 ether), 50_000_000 ether];
        plot.approve(address(town), 50_000_000 ether);
        town.seedPool(b, g);
    }

    /// Seeded lands start at townhall 2; clan founding wants 3.
    function _raiseTownhall(address who, uint256 land) internal {
        vm.startPrank(who);
        town.buildTownhall(land);
        town.finishNow(land);
        vm.stopPrank();
    }

    function _foundClan(address who, uint256 land, string memory name) internal returns (uint256 id) {
        _raiseTownhall(who, land);
        vm.prank(who);
        id = town.createClan(land, name);
    }

    // ================================================================
    //                          founding
    // ================================================================

    function test_foundingRequiresTownhallLevel3() public {
        // Seeded land is level 2.
        vm.prank(alice);
        vm.expectRevert(TownBase.TownhallUpgradeRequired.selector);
        town.createClan(ALICE_LAND, "Ironclad");
    }

    function test_foundingChargesGold() public {
        _raiseTownhall(alice, ALICE_LAND);
        uint256 goldBefore = town.getLandIdData(ALICE_LAND).goodsBalance[1];

        vm.prank(alice);
        town.createClan(ALICE_LAND, "Ironclad");

        assertEq(
            town.getLandIdData(ALICE_LAND).goodsBalance[1],
            goldBefore - town.ClanCreationGold(),
            "founding costs exactly ClanCreationGold"
        );
    }

    function test_founderBecomesLeaderAndMember() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");

        assertEq(id, 1, "clan ids start at 1");
        assertEq(town.clanOf(alice), id);
        assertEq(town.clanCount(), 1);

        (string memory name, address leader, address[] memory members) = town.getClan(id);
        assertEq(name, "Ironclad");
        assertEq(leader, alice);
        assertEq(members.length, 1);
        assertEq(members[0], alice);
    }

    function test_cannotFoundASecondClan() public {
        _foundClan(alice, ALICE_LAND, "Ironclad");
        // A second land, high enough townhall, same owner.
        lands.setOwner(BOB_LAND, alice);
        _raiseTownhall(alice, BOB_LAND);

        vm.prank(alice);
        vm.expectRevert(Clans.AlreadyInClan.selector);
        town.createClan(BOB_LAND, "Second");
    }

    function test_nameMustNotBeEmptyOrOverlong() public {
        _raiseTownhall(alice, ALICE_LAND);

        vm.prank(alice);
        vm.expectRevert(Clans.InvalidClanName.selector);
        town.createClan(ALICE_LAND, "");

        vm.prank(alice);
        vm.expectRevert(Clans.InvalidClanName.selector);
        town.createClan(ALICE_LAND, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"); // 33 chars
    }

    function test_insufficientGoldReverts() public {
        _raiseTownhall(alice, ALICE_LAND);
        // Drain the land's gold by upgrading until it cannot pay.
        uint256 gold = town.getLandIdData(ALICE_LAND).goodsBalance[1];
        vm.assume(gold > 0);
        // Spend it down using the pool: sell everything for PLOT.
        vm.startPrank(alice);
        TownWar(address(town)).sellGood(ALICE_LAND, 1, gold, 0);
        vm.expectRevert(TownBase.InsufficientBalance.selector);
        town.createClan(ALICE_LAND, "Broke");
        vm.stopPrank();
    }

    // ================================================================
    //                     membership lifecycle
    // ================================================================

    /// @dev Parcels handed out by `_giveLand`. Clans refuses landless members,
    ///      so the filler addresses these tests invent need one each.
    uint256 private nextSpareLand = 150150;

    function _giveLand(address who) internal returns (uint256 id) {
        id = nextSpareLand++;
        lands.setOwner(id, who);
    }

    function _joinClan(uint256 id, address leader, address member) internal {
        if (lands.balanceOf(member) == 0) _giveLand(member);
        vm.prank(leader);
        town.inviteToClan(member);
        vm.prank(member);
        town.joinClan(id);
    }

    function test_inviteThenJoin() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        assertEq(town.clanOf(bob), id);
        (,, address[] memory members) = town.getClan(id);
        assertEq(members.length, 2);
    }

    function test_joiningWithoutAnInviteReverts() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(bob);
        vm.expectRevert(Clans.NotInvited.selector);
        town.joinClan(id);
    }

    function test_inviteIsSingleUse() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        vm.prank(bob);
        town.leaveClan();

        // The consumed invite must not let them back in on their own.
        vm.prank(bob);
        vm.expectRevert(Clans.NotInvited.selector);
        town.joinClan(id);
    }

    function test_onlyLeaderInvites() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        vm.prank(bob);
        vm.expectRevert(Clans.NotClanLeader.selector);
        town.inviteToClan(carol);
    }

    function test_revokedInviteCannotBeUsed() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.startPrank(alice);
        town.inviteToClan(bob);
        town.revokeClanInvite(bob);
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert(Clans.NotInvited.selector);
        town.joinClan(id);
    }

    function test_clanFillsAt20() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        // 19 more takes it to the cap of 20.
        for (uint256 i = 0; i < town.MaxClanMembers() - 1; i++) {
            _joinClan(id, alice, address(uint160(0x1000 + i)));
        }
        (,, address[] memory members) = town.getClan(id);
        assertEq(members.length, town.MaxClanMembers());

        vm.prank(alice);
        vm.expectRevert(Clans.ClanIsFull.selector);
        town.inviteToClan(bob);
    }

    function test_leaderCannotAbandonAPopulatedClan() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        vm.prank(alice);
        vm.expectRevert(Clans.LeaderCannotLeave.selector);
        town.leaveClan();
    }

    function test_soleLeaderLeavingDisbands() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(alice);
        town.leaveClan();

        assertEq(town.clanOf(alice), 0);
        (, address leader, address[] memory members) = town.getClan(id);
        assertEq(leader, address(0));
        assertEq(members.length, 0);
    }

    function test_leadershipTransferThenLeave() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        vm.prank(alice);
        town.transferClanLeadership(bob);
        (, address leader,) = town.getClan(id);
        assertEq(leader, bob, "bob now leads");

        vm.prank(alice);
        town.leaveClan(); // no longer the leader, so free to go
        assertEq(town.clanOf(alice), 0);
    }

    function test_leadershipOnlyToAMember() public {
        _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(alice);
        vm.expectRevert(Clans.NotInClan.selector);
        town.transferClanLeadership(carol);
    }

    function test_kick() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        vm.prank(alice);
        town.kickFromClan(bob);
        assertEq(town.clanOf(bob), 0);

        (,, address[] memory members) = town.getClan(id);
        assertEq(members.length, 1);
        assertEq(members[0], alice, "swap-and-pop keeps the survivor");
    }

    /// Removal is swap-and-pop, so the list must stay intact when the departing
    /// member is not the last one.
    function test_removingFromTheMiddleKeepsTheList() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);
        _joinClan(id, alice, carol);

        vm.prank(bob);
        town.leaveClan();

        (,, address[] memory members) = town.getClan(id);
        assertEq(members.length, 2);
        assertEq(town.clanOf(alice), id);
        assertEq(town.clanOf(carol), id, "carol's membership survived the swap");
        assertEq(town.clanOf(bob), 0);

        // And carol can still be removed by her (moved) slot.
        vm.prank(carol);
        town.leaveClan();
        (,, address[] memory left) = town.getClan(id);
        assertEq(left.length, 1);
    }

    // ================================================================
    //                    joining by request
    // ================================================================

    function test_requestThenApprove() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");

        vm.prank(bob);
        town.requestToJoinClan(id);

        assertEq(town.requestedClanOf(bob), id);
        address[] memory queue = town.getClanRequests(id);
        assertEq(queue.length, 1);
        assertEq(queue[0], bob);

        vm.prank(alice);
        town.approveClanRequest(bob);

        assertEq(town.clanOf(bob), id, "approved applicant is a member");
        assertEq(town.requestedClanOf(bob), 0, "and no longer queued");
        assertEq(town.getClanRequests(id).length, 0);
    }

    function test_requestThenReject() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(bob);
        town.requestToJoinClan(id);

        vm.prank(alice);
        town.rejectClanRequest(bob);

        assertEq(town.clanOf(bob), 0, "rejection does not admit anyone");
        assertEq(town.requestedClanOf(bob), 0);
        assertEq(town.getClanRequests(id).length, 0);

        // ...and they are free to apply again.
        vm.prank(bob);
        town.requestToJoinClan(id);
        assertEq(town.requestedClanOf(bob), id);
    }

    function test_applicantCanWithdraw() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.startPrank(bob);
        town.requestToJoinClan(id);
        town.cancelClanRequest();
        vm.stopPrank();

        assertEq(town.requestedClanOf(bob), 0);
        assertEq(town.getClanRequests(id).length, 0);
    }

    function test_onlyLeaderDecides() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);
        vm.prank(carol);
        town.requestToJoinClan(id);

        vm.prank(bob);
        vm.expectRevert(Clans.NotClanLeader.selector);
        town.approveClanRequest(carol);
    }

    function test_oneApplicationAtATime() public {
        uint256 first = _foundClan(alice, ALICE_LAND, "Ironclad");
        uint256 second = _foundClan(bob, BOB_LAND, "Sunspear");

        vm.startPrank(carol);
        town.requestToJoinClan(first);
        vm.expectRevert(Clans.AlreadyRequested.selector);
        town.requestToJoinClan(second);
        vm.stopPrank();
    }

    /// Taking an invitation while an application is pending elsewhere must not
    /// leave the applicant sitting in that other clan's queue forever.
    function test_joiningElsewhereClearsThePendingApplication() public {
        uint256 first = _foundClan(alice, ALICE_LAND, "Ironclad");
        uint256 second = _foundClan(bob, BOB_LAND, "Sunspear");

        vm.prank(carol);
        town.requestToJoinClan(first);
        assertEq(town.getClanRequests(first).length, 1);

        _joinClan(second, bob, carol);

        assertEq(town.clanOf(carol), second);
        assertEq(town.requestedClanOf(carol), 0);
        assertEq(town.getClanRequests(first).length, 0, "queue was cleaned up");
    }

    function test_membersCannotApply() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(alice);
        vm.expectRevert(Clans.AlreadyInClan.selector);
        town.requestToJoinClan(id);
    }

    function test_cannotApplyToAFullClan() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        for (uint256 i = 0; i < town.MaxClanMembers() - 1; i++) {
            _joinClan(id, alice, address(uint160(0x2000 + i)));
        }
        vm.prank(bob);
        vm.expectRevert(Clans.ClanIsFull.selector);
        town.requestToJoinClan(id);
    }

    function test_approvingSomeoneWhoLeftInTheMeantimeReverts() public {
        uint256 first = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(carol);
        town.requestToJoinClan(first);

        // Carol founds her own clan before Alice gets round to the queue.
        _raiseTownhall(carol, CAROL_LAND);
        vm.prank(carol);
        town.createClan(CAROL_LAND, "Own");

        vm.prank(alice);
        vm.expectRevert(Clans.NoSuchRequest.selector);
        town.approveClanRequest(carol);
    }

    function test_requestQueueSurvivesMiddleRemoval() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        address a = address(0xAA1);
        address b = address(0xBB2);
        address c = address(0xCC3);
        _giveLand(a);
        _giveLand(b);
        _giveLand(c);
        vm.prank(a); town.requestToJoinClan(id);
        vm.prank(b); town.requestToJoinClan(id);
        vm.prank(c); town.requestToJoinClan(id);

        vm.prank(alice);
        town.rejectClanRequest(b);

        address[] memory queue = town.getClanRequests(id);
        assertEq(queue.length, 2);
        assertEq(town.requestedClanOf(a), id);
        assertEq(town.requestedClanOf(c), id, "c survived the swap");
        assertEq(town.requestedClanOf(b), 0);
    }

    // ================================================================
    //                       the point of it all
    // ================================================================

    function _dispatch(address who, uint256 from, uint256 target, uint256 count) internal {
        uint256[6] memory order;
        order[MACEMAN] = count;
        vm.startPrank(who);
        TownWar(address(town)).recruit(from, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = count;
        TownWar(address(town)).dispatchArmy(sent, from, target);
        vm.stopPrank();
    }

    function test_alliesRecogniseEachOther() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        assertTrue(town.areAllies(ALICE_LAND, BOB_LAND));
        assertEq(town.clanOfLand(ALICE_LAND), id);
        assertFalse(town.areAllies(ALICE_LAND, CAROL_LAND), "carol is unaffiliated");
    }

    function test_cannotDispatchAtAnAlly() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        uint256[6] memory order;
        order[MACEMAN] = 5;
        vm.startPrank(alice);
        TownWar(address(town)).recruit(ALICE_LAND, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 5;
        vm.expectRevert(Clans.CannotAttackAlly.selector);
        TownWar(address(town)).dispatchArmy(sent, ALICE_LAND, BOB_LAND);
        vm.stopPrank();
    }

    function test_unaffiliatedNeighboursAreStillFairGame() public {
        _foundClan(alice, ALICE_LAND, "Ironclad");
        _dispatch(alice, ALICE_LAND, CAROL_LAND, 5); // must not revert
    }

    function test_twoDifferentClansCanStillFight() public {
        _foundClan(alice, ALICE_LAND, "Ironclad");
        _foundClan(bob, BOB_LAND, "Sunspear");
        assertFalse(town.areAllies(ALICE_LAND, BOB_LAND));
        _dispatch(alice, ALICE_LAND, BOB_LAND, 5); // must not revert
    }

    /// The army is already marching when the target joins the clan. The arrival
    /// is what does the damage, so that is where it has to be stopped too.
    function test_becomingAlliesMidFlightCancelsTheBattle() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _dispatch(alice, ALICE_LAND, BOB_LAND, 5);

        _joinClan(id, alice, bob);
        skip(30 days); // long past arrival

        vm.prank(alice);
        vm.expectRevert(Clans.CannotAttackAlly.selector);
        TownWar(address(town)).war(ALICE_LAND, 0);
    }

    /// ...and the army is not stranded by that.
    function test_theStoppedArmyCanComeHome() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _dispatch(alice, ALICE_LAND, BOB_LAND, 5);
        _joinClan(id, alice, bob);
        skip(30 days);

        vm.prank(alice);
        TownWar(address(town)).retreat(ALICE_LAND, 0); // must not revert
    }

    // ================================================================
    //                        views for the map
    // ================================================================

    function test_clansOfBatchesAddresses() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        _joinClan(id, alice, bob);

        address[] memory who = new address[](3);
        who[0] = alice;
        who[1] = bob;
        who[2] = carol;

        uint256[] memory ids = town.clansOf(who);
        assertEq(ids[0], id);
        assertEq(ids[1], id);
        assertEq(ids[2], 0, "unaffiliated reads as 0, not a revert");
    }

    /// The map asks about lands nobody has minted. That must answer 0 rather
    /// than reverting out of ownerOf and taking the whole call down.
    function test_unmintedLandHasNoClan() public {
        _foundClan(alice, ALICE_LAND, "Ironclad");
        assertEq(town.clanOfLand(199199), 0);
        assertFalse(town.areAllies(ALICE_LAND, 199199));
    }

    // ================================================================
    //                     members must hold land
    // ================================================================

    /// Someone who owns nothing on the map. A clan is what makes lands allies,
    /// so a member with no land is a seat that shows nowhere.
    address constant DRIFTER = address(0xD41F7);

    function test_invitedLandlessAddressCannotJoin() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(alice);
        town.inviteToClan(DRIFTER);

        vm.prank(DRIFTER);
        vm.expectRevert(Clans.LandRequired.selector);
        town.joinClan(id);

        assertEq(town.clanOf(DRIFTER), 0);
        (,, address[] memory members) = town.getClan(id);
        assertEq(members.length, 1, "the roster did not grow");
    }

    function test_landlessAddressCannotApply() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(DRIFTER);
        vm.expectRevert(Clans.LandRequired.selector);
        town.requestToJoinClan(id);

        assertEq(town.getClanRequests(id).length, 0, "no queue entry either");
    }

    /// The application is checked when it is made, but the applicant can part
    /// with their land while it sits in the queue.
    function test_applicantWhoSoldTheirLandCannotBeApproved() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(bob);
        town.requestToJoinClan(id);

        lands.setOwner(BOB_LAND, carol);

        vm.prank(alice);
        vm.expectRevert(Clans.LandRequired.selector);
        town.approveClanRequest(bob);
    }

    function test_buyingALandOpensTheDoor() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        vm.prank(alice);
        town.inviteToClan(DRIFTER);

        _giveLand(DRIFTER);
        vm.prank(DRIFTER);
        town.joinClan(id);

        assertEq(town.clanOf(DRIFTER), id);
    }

    /// Founding goes through `_addMember` like every other way in, and the
    /// founder proves ownership of the land that pays for it, so the check must
    /// not be in its way.
    function test_foundingStillWorksForALandholder() public {
        uint256 id = _foundClan(alice, ALICE_LAND, "Ironclad");
        assertEq(town.clanOf(alice), id);
    }
}
