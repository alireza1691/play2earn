// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Lands, Lands__IncorrectPrice, Lands__MintLimitReached,
        Lands__LandNotForSale, Lands__LandAlreadyOwned} from "../../src/new/LandsV3.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

contract LandsMintTest is Test {
    Lands lands;
    Lands implementation;
    uint256 constant PRICE = 0.02 ether;
    address buyer = address(0xA11CE);

    function setUp() public {
        implementation = new Lands();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(Lands.initialize, (PRICE, address(this)))
        );
        lands = Lands(payable(address(proxy)));
        vm.deal(buyer, 100 ether);
    }

    // ---------------------------------------------------------------- C-06

    /// State must live in the proxy, which is exactly what the old
    /// TransparentUpgradeableProxy wrapper got wrong.
    function test_C06_proxyHoldsTheState() public {
        assertEq(lands.name(), "Plot War Lands", "ERC721 name initialised");
        assertEq(lands.symbol(), "PWL", "ERC721 symbol initialised");
        assertEq(lands.getPrice(), PRICE, "price initialised");
        assertEq(lands.owner(), address(this), "owner initialised");
    }

    /// The implementation itself must never be initialisable.
    function test_C06_implementationIsLocked() public {
        vm.expectRevert();
        implementation.initialize(PRICE, address(this));
    }

    function test_C06_ownerCanUpgradeAndStrangerCannot() public {
        Lands newImplementation = new Lands();

        vm.prank(buyer);
        vm.expectRevert();
        lands.upgradeToAndCall(address(newImplementation), "");

        vm.prank(buyer);
        lands.mintLand{value: PRICE}(100, 100);

        lands.upgradeToAndCall(address(newImplementation), "");
        assertEq(lands.ownerOf(100100), buyer, "state survives the upgrade");
        assertEq(lands.getPrice(), PRICE, "price survives the upgrade");
    }

    // ---------------------------------------------------------------- M-08

    function test_exactPriceMints() public {
        vm.prank(buyer);
        lands.mintLand{value: PRICE}(100, 100);
        assertEq(lands.ownerOf(100100), buyer, "minted to buyer");
        assertEq(address(lands).balance, PRICE, "no stray value");
    }

    /// Overpayment used to be swallowed by the contract; now it is refused.
    function test_overpaymentReverts() public {
        vm.prank(buyer);
        vm.expectRevert(Lands__IncorrectPrice.selector);
        lands.mintLand{value: PRICE + 0.01 ether}(100, 100);
    }

    function test_underpaymentReverts() public {
        vm.prank(buyer);
        vm.expectRevert(Lands__IncorrectPrice.selector);
        lands.mintLand{value: PRICE - 1}(100, 100);
    }

    /// A price cut must not silently keep the difference from in-flight buys.
    function test_priceCutRefusesTheOldValue() public {
        lands.changePrice(0.01 ether);
        vm.prank(buyer);
        vm.expectRevert(Lands__IncorrectPrice.selector);
        lands.mintLand{value: PRICE}(100, 100);
        assertEq(address(lands).balance, 0, "nothing stranded");
    }

    // ---------------------------------------------------------------- mint cap

    function test_addressCanMintUpToTwenty() public {
        // Walks the map for sellable parcels: a fixed run of coordinates would now
        // hit a Jungle and be refused.
        (uint8[] memory xs, uint8[] memory ys) = _findForSale(21);
        for (uint8 i = 0; i < 20; i++) {
            vm.prank(buyer);
            lands.mintLand{value: PRICE}(xs[i], ys[i]);
        }
        assertEq(lands.mintedPerAddress(buyer), 20, "cap reached");

        vm.prank(buyer);
        vm.expectRevert(Lands__MintLimitReached.selector);
        lands.mintLand{value: PRICE}(xs[20], ys[20]);
    }

    /// The cap is per address, so it raises the cost of hoarding rather than
    /// preventing it. Pinned here so the limitation stays visible.
    function test_capIsPerAddressNotPerPerson() public {
        address second = address(0xB0B);
        vm.deal(second, 10 ether);

        (uint8[] memory xs, uint8[] memory ys) = _findForSale(21);
        for (uint8 i = 0; i < 20; i++) {
            vm.prank(buyer);
            lands.mintLand{value: PRICE}(xs[i], ys[i]);
        }
        vm.prank(second);
        lands.mintLand{value: PRICE}(xs[20], ys[20]);
        uint256 id = uint256(xs[20]) * 1000 + ys[20];
        assertEq(lands.ownerOf(id), second, "a second wallet starts fresh");
    }

    // ---------------------------------------------------------------- M-10

    /// Every land used to resolve to one shared metadata document.
    function test_M10_tokenUriIsPerToken() public {
        vm.startPrank(buyer);
        lands.mintLand{value: PRICE}(100, 100);
        lands.mintLand{value: PRICE}(100, 101);
        vm.stopPrank();

        string memory first = lands.tokenURI(100100);
        string memory second = lands.tokenURI(100101);

        assertTrue(
            keccak256(bytes(first)) != keccak256(bytes(second)),
            "two lands must not share a URI"
        );
        assertEq(
            first,
            "https://gateway.pinata.cloud/ipfs/QmQjVmvqXn3qVTEZo1U6tJfvCAB85Uj5DnBaSbZRrNy7NE/100100.json",
            "id embedded in the path"
        );
    }

    function test_M10_ownerCanRepointTheMetadata() public {
        vm.prank(buyer);
        lands.mintLand{value: PRICE}(100, 100);

        lands.setBaseURI("ipfs://newroot");
        assertEq(lands.tokenURI(100100), "ipfs://newroot/100100.json", "base swapped");

        vm.prank(buyer);
        vm.expectRevert();
        lands.setBaseURI("ipfs://attacker");
    }

    /// Collects `count` parcels that players are actually allowed to buy.
    function _findForSale(uint256 count)
        internal view returns (uint8[] memory xs, uint8[] memory ys)
    {
        xs = new uint8[](count);
        ys = new uint8[](count);
        uint256 found;
        for (uint8 x = 100; x < 200 && found < count; x++) {
            for (uint8 y = 100; y < 200 && found < count; y++) {
                if (lands.naturalType(uint256(x) * 1000 + y) == Lands.LandType.Town) {
                    xs[found] = x;
                    ys[found] = y;
                    found++;
                }
            }
        }
        require(found == count, "not enough sellable parcels");
    }

    // ---------------------------------------------------------------- land types

    /// Finds one parcel of each type, so the tests below work off the real
    /// distribution rather than a hand-picked id.
    function _findByType(Lands.LandType wanted) internal view returns (uint8 x, uint8 y) {
        for (uint8 i = 100; i < 200; i++) {
            for (uint8 j = 100; j < 200; j++) {
                if (lands.naturalType(uint256(i) * 1000 + j) == wanted) {
                    return (i, j);
                }
            }
        }
        revert("no parcel of that type");
    }

    /// Roughly a tenth of the map is wild, and the map is exactly 10,000 parcels.
    function test_mapIsTenThousandParcelsAboutATenthWild() public {
        uint256 total;
        uint256 jungle;
        for (uint8 x = 100; x < 200; x++) {
            for (uint8 y = 100; y < 200; y++) {
                total++;
                if (lands.naturalType(uint256(x) * 1000 + y) == Lands.LandType.Jungle) {
                    jungle++;
                }
            }
        }
        assertEq(total, 10_000, "the coordinate range is the supply cap");
        assertGt(jungle, 800, "wild share is near a tenth");
        assertLt(jungle, 1_200, "wild share is near a tenth");
    }

    /// The type is a pure function of the id, so the frontend can colour the whole
    /// map without a single chain call.
    function test_naturalTypeIsDeterministic() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Jungle);
        uint256 id = uint256(x) * 1000 + y;
        assertEq(uint8(lands.naturalType(id)), uint8(lands.naturalType(id)), "stable");
        assertEq(uint8(lands.landType(id)), uint8(Lands.LandType.Jungle), "no override yet");
    }

    function test_jungleCannotBeBought() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Jungle);
        assertFalse(lands.isForSale(uint256(x) * 1000 + y), "wild land is off the market");

        vm.prank(buyer);
        vm.expectRevert(Lands__LandNotForSale.selector);
        lands.mintLand{value: PRICE}(x, y);
    }

    function test_ownerUnlocksJungleByMakingItTown() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Jungle);
        uint256 id = uint256(x) * 1000 + y;

        lands.setLandType(id, Lands.LandType.Town);
        assertEq(uint8(lands.landType(id)), uint8(Lands.LandType.Town), "unlocked");
        assertTrue(lands.isForSale(id), "now on the market");

        vm.prank(buyer);
        lands.mintLand{value: PRICE}(x, y);
        assertEq(lands.ownerOf(id), buyer, "sold");
    }

    /// The override stores type+1, so overriding *to* Town has to be distinguishable
    /// from having no override at all.
    function test_overridingToTownIsNotMistakenForNoOverride() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Jungle);
        uint256 id = uint256(x) * 1000 + y;

        assertEq(uint8(lands.landType(id)), uint8(Lands.LandType.Jungle), "wild by nature");
        lands.setLandType(id, Lands.LandType.Town);
        assertEq(uint8(lands.landType(id)), uint8(Lands.LandType.Town), "override wins");
        assertEq(uint8(lands.naturalType(id)), uint8(Lands.LandType.Jungle), "nature unchanged");
    }

    /// The guard that keeps this from being a rug: once a parcel is owned, its type
    /// is frozen. Lands has no burn, so that is permanent.
    function test_ownerCannotRetypeLandSomebodyOwns() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Town);
        uint256 id = uint256(x) * 1000 + y;

        vm.prank(buyer);
        lands.mintLand{value: PRICE}(x, y);

        vm.expectRevert(Lands__LandAlreadyOwned.selector);
        lands.setLandType(id, Lands.LandType.Jungle);
    }

    function test_strangerCannotRetype() public {
        (uint8 x, uint8 y) = _findByType(Lands.LandType.Jungle);
        vm.prank(buyer);
        vm.expectRevert();
        lands.setLandType(uint256(x) * 1000 + y, Lands.LandType.Town);
    }

    function test_ownerCanUnlockInBatches() public {
        uint256[] memory ids = new uint256[](3);
        uint256 found;
        for (uint8 x = 100; x < 200 && found < 3; x++) {
            for (uint8 y = 100; y < 200 && found < 3; y++) {
                uint256 id = uint256(x) * 1000 + y;
                if (lands.naturalType(id) == Lands.LandType.Jungle) {
                    ids[found++] = id;
                }
            }
        }
        lands.setLandTypes(ids, Lands.LandType.Town);
        for (uint256 i = 0; i < 3; i++) {
            assertTrue(lands.isForSale(ids[i]), "each unlocked");
        }
    }

    /// ownerOf reverts for unminted tokens in OZ v5; this is the non-reverting form
    /// Town needs to ask "is this parcel wild?".
    function test_ownerOfOrZeroDoesNotRevertForUnminted() public {
        assertEq(lands.ownerOfOrZero(199199), address(0), "nobody owns it");
    }

    // ---------------------------------------------------------------- M-09

    function test_withdrawReachesAContractRecipient() public {
        vm.prank(buyer);
        lands.mintLand{value: PRICE}(100, 100);

        GreedyReceiver recipient = new GreedyReceiver();
        lands.withdraw(payable(address(recipient)));

        // transfer()'s 2300 gas stipend could not pay for this receiver's storage
        // write; call() can.
        assertEq(address(recipient).balance, PRICE, "funds delivered");
        assertEq(recipient.received(), PRICE, "receiver ran its logic");
    }
}

/// A recipient that does more than 2300 gas of work on receive, standing in for a
/// multisig or smart wallet.
contract GreedyReceiver {
    uint256 public received;
    receive() external payable {
        received += msg.value;
    }
}
