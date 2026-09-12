// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {Lands} from "../../src/new/LandsV3.sol";
import {Town, TownWar} from "../../src/new/Town.sol";

/**
 * @notice Fills a fresh deployment with enough of a game to look at.
 *
 * A newly deployed world is empty: no lands, no buildings, no clans, so every
 * screen renders its zero state and none of the map's colour rules can be seen.
 * This mints a spread of lands across three owners, builds on some of them, and
 * founds a clan, so that:
 *
 *   - the world map shows settlement rather than an empty grid;
 *   - the three marker tones each have something to colour — your own land, a
 *     clan ally's, and a stranger's;
 *   - opening a parcel shows real buildings and balances;
 *   - the clan page has a clan on it, with a member who is not the founder.
 *
 * @dev Testnet only, and it says so: the two extra owners are throwaway keys
 *      written in plain text below, funded with a few finney of Sepolia ETH so
 *      they can sign the one transaction each that they need to. Never point
 *      this at a chain that matters.
 *
 * Re-runnable: every step checks the chain first and skips what is already
 * there, so a run cut short — by a timeout, a gas ceiling, an RPC hiccup —
 * can simply be run again and will carry on from where it stopped.
 *
 * Usage:
 *   forge script script/new/SeedGame.s.sol:SeedGame \
 *     --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast --slow
 */
contract SeedGame is Script {
    /// Deterministic throwaway keys. Public by design — see the note above.
    uint256 constant ALLY_KEY = 0xA11111111111111111111111111111111111111111111111111111111111111;
    uint256 constant RIVAL_KEY = 0xB22222222222222222222222222222222222222222222222222222222222222;

    /// Enough for the one or two transactions each of them sends.
    ///
    /// Was 0.0006, which is roughly what joinClan costs and therefore not enough
    /// to cover it: the run reached the last step and died with "insufficient
    /// funds" on the ally's own wallet, not the deployer's. Sized with room now —
    /// it is testnet ETH, and being stingy here cost a whole run.
    uint256 constant GAS_ALLOWANCE = 0.005 ether;

    uint256 constant FARM = 0;
    uint256 constant GOLD_MINE = 1;

    /// Parcels handed to the rival already built and garrisoned, so there is
    /// something to attack the moment the deployment is up. Spread across the
    /// map and kept away from the player's own cluster around 104104.
    uint256[4] ENEMY_LANDS = [uint256(147151), 148152, 162140, 175168];

    /// A garrison of 40 sits under the 50 a level-1 training camp allows, and is
    /// enough that a careless attack loses.
    uint256 constant ENEMY_GARRISON = 40;

    /// Bought in, not farmed. Enough to cover the buildings, the recruits and a
    /// loot pile worth the march.
    uint256 constant ENEMY_FOOD = 30_000 ether;
    uint256 constant ENEMY_GOLD = 30_000 ether;

    /// PLOT deposited once, to pay for every goods purchase the run makes.
    /// See the note at the deposit for how this number is arrived at.
    uint256 constant SEED_PLOT_BUDGET = 700_000 ether;

    Lands lands;
    Town town;
    PLOT plot;

    function run() external {
        string memory file = vm.readFile("deployments/sepolia.json");
        lands = Lands(payable(vm.parseJsonAddress(file, ".lands")));
        town = Town(vm.parseJsonAddress(file, ".town"));
        plot = PLOT(vm.parseJsonAddress(file, ".token"));

        address ally = vm.addr(ALLY_KEY);
        address rival = vm.addr(RIVAL_KEY);

        console2.log("lands", address(lands));
        console2.log("town ", address(town));
        console2.log("ally ", ally);
        console2.log("rival", rival);

        uint256 originalPrice = lands.getPrice();

        vm.startBroadcast();
        // Minting is the cheapest way to make the map look alive, and at the
        // live price 14 lands would cost 0.28 ETH of testnet funds nobody has.
        // The owner can set the price, so: free while seeding, restored after.
        lands.changePrice(0);

        _mintSpread();

        // One deposit funds every purchase below. Goods come out of the AMM, so
        // the starter pack does not have to stretch to cover build costs.
        //
        // Budget, and why it is not tighter: _buildOut spends 40k on each of two
        // lands, _foundClan 120k, and _armEnemies 60k on each of four — 440k in
        // all. This used to deposit 400k, which covered the first two and left
        // the enemies to revert on the last purchase. The margin above 440k is
        // there so adding one more enemy parcel does not silently break the
        // script again; the deployer holds 950M PLOT, so it costs nothing.
        if (town.getPlotBalance(msg.sender) < SEED_PLOT_BUDGET) {
            plot.approve(address(town), SEED_PLOT_BUDGET * 2);
            town.deposit(SEED_PLOT_BUDGET);
        }

        _buildOut();
        uint256 clanId = _foundClan();
        _handOutLands(ally);
        _armEnemies();
        _handOutEnemyLands(rival);

        // Fund the throwaways for the transactions they have to sign
        // themselves — joining a clan is not something the leader can do for
        // them, which is rather the point of it.
        if (ally.balance < GAS_ALLOWANCE / 2) payable(ally).transfer(GAS_ALLOWANCE);
        if (town.clanOf(ally) == 0 && !town.isClanInvited(clanId, ally)) {
            town.inviteToClan(ally);
        }

        // Left low rather than restored: the whole point is that whoever is
        // testing can mint a few lands of their own without hunting a faucet.
        lands.changePrice(0.0001 ether);
        vm.stopBroadcast();

        if (town.clanOf(ally) == 0) {
            vm.startBroadcast(ALLY_KEY);
            town.joinClan(clanId);
            vm.stopBroadcast();
        }

        _report(originalPrice, ally, rival, clanId);
    }

    /// Lands scattered over the map, not one solid block, so the map reads as
    /// several settlements rather than a single stain.
    /// @dev Every coordinate here is a natural Town. mintLand reverts on a
    ///      jungle with Lands__LandNotForSale, and a revert inside a broadcast
    ///      unwinds the whole script — so the guard below is a backstop, not a
    ///      filter to lean on. If you change a coordinate, check its type first:
    ///      keccak256(abi.encode(tokenId)) % 100 < 10 is a jungle.
    function _mintSpread() internal {
        uint8[10] memory xs = [104, 105, 106, 112, 129, 129, 147, 148, 162, 175];
        uint8[10] memory ys = [104, 104, 105, 118, 133, 132, 151, 152, 140, 168];
        for (uint256 i = 0; i < xs.length; i++) {
            uint256 id = uint256(xs[i]) * 1000 + ys[i];
            if (lands.landType(id) != Lands.LandType.Town) continue;
            if (_ownerOf(id) == address(0)) {
                lands.mintLand(xs[i], ys[i]);
            }
        }
    }

    /// @dev ownerOf reverts on an unminted token; this turns that into a zero
    ///      address so the guards above can just ask.
    function _ownerOf(uint256 id) internal view returns (address) {
        try lands.ownerOf(id) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function _buildingCount(uint256 id) internal view returns (uint256) {
        return town.getLandIdData(id).buildedResourceBuildings.length;
    }

    /// @dev Every build occupies the land's single worker, so each one is
    ///      followed by finishNow — otherwise the next call reverts with
    ///      WorkerIsBusy and the whole script unwinds.
    function _buildOut() internal {
        uint256[2] memory built = [uint256(104104), 112118];
        for (uint256 i = 0; i < built.length; i++) {
            uint256 id = built[i];
            if (_buildingCount(id) >= 2) continue;
            if (!town.hasStarted(id)) town.startLand(id);
            // The starter 400/400 does not cover two buildings plus the gold it
            // costs to skip their two-hour timers, so top the land up first.
            TownWar(address(town)).buyGood(id, 0, 20_000 ether, 0);
            TownWar(address(town)).buyGood(id, 1, 20_000 ether, 0);
            town.buildResourceBuilding(id, uint8(FARM));
            town.finishNow(id);
            town.buildResourceBuilding(id, uint8(GOLD_MINE));
            town.finishNow(id);
        }
        // Walls need a townhall at least a level above them, so this one gets a
        // townhall first — which also gives the town view something to render
        // beyond two resource buildings.
        if (town.getLandIdData(104104).townhallLevel == 0) {
            town.buildTownhall(104104);
            town.finishNow(104104);
        }
        if (town.getLandIdData(104104).wallLevel == 0) {
            town.buildWalls(104104);
            town.finishNow(104104);
        }
    }

    /// Founding needs a level 3 townhall and 500 gold, which is far more than
    /// the starter pack. Goods come from the pool, paid for in PLOT.
    function _foundClan() internal returns (uint256) {
        uint256 seat = 106105;
        if (town.clanOf(msg.sender) != 0) return town.clanOf(msg.sender);

        if (!town.hasStarted(seat)) town.startLand(seat);
        if (town.getLandIdData(seat).goodsBalance[1] < 5_000 ether) {
            TownWar(address(town)).buyGood(seat, 0, 60_000 ether, 0); // food
            TownWar(address(town)).buyGood(seat, 1, 60_000 ether, 0); // gold
        }

        // 300/300, then 600/600, then 1200/1200 — the cost doubles per level.
        while (town.getLandIdData(seat).townhallLevel < 3) {
            town.buildTownhall(seat);
            town.finishNow(seat);
        }
        return town.createClan(seat, "Vanguard");
    }

    /// Two lands each to an ally and a rival, so the map has all three marker
    /// tones on it at once instead of a field of one colour.
    function _handOutLands(address ally) internal {
        if (_ownerOf(129133) == msg.sender) lands.transferFrom(msg.sender, ally, 129133);
        if (_ownerOf(129132) == msg.sender) lands.transferFrom(msg.sender, ally, 129132);
    }

    /// Lands worth attacking: goods to loot and a garrison to get through.
    ///
    /// @dev Everything here is done by the deployer *before* the land changes
    ///      hands. Town keys its state by token id and Lands has no transfer
    ///      hook — it does not even know Town exists — so the buildings, the
    ///      stores and the garrison all survive the transfer. Doing it the other
    ///      way round would mean funding each rival with PLOT and gas and having
    ///      them sign a dozen transactions each, for an identical result.
    function _armEnemies() internal {
        for (uint256 i = 0; i < ENEMY_LANDS.length; i++) {
            uint256 id = ENEMY_LANDS[i];
            if (_ownerOf(id) != msg.sender) continue;   // already handed over
            if (town.getArmy(id)[0] > 0) continue;      // already garrisoned

            if (!town.hasStarted(id)) town.startLand(id);

            // The starter pack covers none of this. Buy in rather than wait for
            // production: the whole point is that the land is worth raiding the
            // moment the deployment is up.
            TownWar(address(town)).buyGood(id, FARM, ENEMY_FOOD, 0);
            TownWar(address(town)).buyGood(id, GOLD_MINE, ENEMY_GOLD, 0);

            // A farm and a mine so the stores keep refilling after a raid, and
            // so the parcel view has something in it.
            if (_buildingCount(id) < 2) {
                town.buildResourceBuilding(id, uint8(FARM));
                town.finishNow(id);
                town.buildResourceBuilding(id, uint8(GOLD_MINE));
                town.finishNow(id);
            }

            // Both of the military buildings below require a townhall at least
            // a level above them, so this comes first — barracks and camp both
            // revert with TownhallUpgradeRequired against a bare parcel.
            if (town.getLandIdData(id).townhallLevel == 0) {
                town.buildTownhall(id);
                town.finishNow(id);
            }

            // Barracks gates which warrior types may be recruited; the training
            // camp is what lifts the garrison cap from 10 to 50 per level.
            if (town.getLandIdData(id).barracksLevel == 0) {
                town.buildBarracks(id);
                town.finishNow(id);
            }
            if (town.getLandIdData(id).trainingCampLevel == 0) {
                town.buildTrainingCamp(id);
                town.finishNow(id);
            }

            // Spearmen only: barracks level 1 permits warrior type 0, and a flat
            // wall of the cheapest unit is the clearest thing to test against.
            uint256[6] memory order;
            order[0] = ENEMY_GARRISON;
            TownWar(address(town)).recruit(id, order);
        }
    }

    /// Hand the armed lands over. Separate from _armEnemies so a run cut short
    /// between the two leaves lands that are armed but still ours, which the
    /// guards above simply pick up again.
    function _handOutEnemyLands(address rival) internal {
        for (uint256 i = 0; i < ENEMY_LANDS.length; i++) {
            uint256 id = ENEMY_LANDS[i];
            if (_ownerOf(id) == msg.sender) lands.transferFrom(msg.sender, rival, id);
        }
    }

    function _report(uint256 originalPrice, address ally, address rival, uint256 clanId) internal view {
        console2.log("");
        console2.log("lands minted      ", uint256(10));
        console2.log("clan id           ", clanId);
        console2.log("clan leader       ", msg.sender);
        console2.log("clan member (ally)", ally);
        console2.log("rival (no clan)   ", rival);
        console2.log("land price was    ", originalPrice);
        console2.log("land price now    ", lands.getPrice());
    }
}
