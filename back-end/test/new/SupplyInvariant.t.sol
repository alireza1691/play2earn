// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
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
    function ownerOf(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    function ownerOfOrZero(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    /// Every parcel in these tests is an ordinary Town unless a test says otherwise.
    function landType(uint256) external pure returns (uint8) { return 0; }
}

/// @notice Drives Town through random sequences of every action that moves goods.
/// @dev Each action is bounded to stay inside the game's own rules; calls that would
///      legitimately revert (worker busy, not enough goods) are swallowed, because
///      the invariant is about accounting, not about which calls succeed.
contract GoodsHandler is Test {
    Town public town;
    MockLands public lands;
    PLOT public plot;

    uint256[3] public LANDS_LIST = [uint256(101101), 105105, 109109];

    constructor(Town town_, MockLands lands_, PLOT bmt_) {
        town = town_;
        lands = lands_;
        plot = bmt_;
    }

    function _land(uint256 seed) internal view returns (uint256) {
        return LANDS_LIST[seed % 3];
    }

    function build(uint256 landSeed, uint256 typeSeed) external {
        try town.buildResourceBuilding(_land(landSeed), uint8(typeSeed % 2)) {} catch {}
    }

    function claim(uint256 landSeed) external {
        try town.claimAll(_land(landSeed)) {} catch {}
    }

    function upgradeBuilding(uint256 landSeed, uint256 idSeed) external {
        uint256 landId = _land(landSeed);
        uint256[] memory built = town.getLandIdData(landId).buildedResourceBuildings;
        if (built.length == 0) return;
        try town.upgradeResourceBuilding(built[idSeed % built.length], landId) {} catch {}
    }

    function buildTownhall(uint256 landSeed) external {
        try town.buildTownhall(_land(landSeed)) {} catch {}
    }

    function buildWalls(uint256 landSeed) external {
        try town.buildWalls(_land(landSeed)) {} catch {}
    }

    /// Founding a clan burns 500 gold, so it is a supply sink like any other
    /// and belongs under the same invariant. The handler owns all three lands,
    /// so only the first attempt can succeed — that is enough to put the sink
    /// through the accounting.
    function createClan(uint256 landSeed) external {
        try town.createClan(_land(landSeed), "Handler") {} catch {}
    }

    function recruit(uint256 landSeed, uint256 amount) external {
        uint256[6] memory order;
        order[0] = bound(amount, 1, 40);
        try TownWar(address(town)).recruit(_land(landSeed), order) {} catch {}
    }

    function buyGood(uint256 landSeed, uint256 goodSeed, uint256 amount) external {
        uint256 spend = bound(amount, 1 ether, 500 ether);
        deal(address(plot), address(this), spend);
        plot.approve(address(town), spend);
        try town.deposit(spend) {} catch { return; }
        try TownWar(address(town)).buyGood(_land(landSeed), goodSeed % 2, spend, 0) {} catch {}
    }

    function sellGood(uint256 landSeed, uint256 goodSeed, uint256 amount) external {
        uint256 landId = _land(landSeed);
        uint256 goodIndex = goodSeed % 2;
        uint256 held = town.getLandIdData(landId).goodsBalance[goodIndex];
        if (held == 0) return;
        try TownWar(address(town)).sellGood(landId, goodIndex, bound(amount, 1, held), 0) {} catch {}
    }

    function swapGoods(uint256 landSeed, uint256 goodSeed, uint256 amount) external {
        uint256 landId = _land(landSeed);
        uint256 fromIndex = goodSeed % 2;
        uint256 held = town.getLandIdData(landId).goodsBalance[fromIndex];
        if (held == 0) return;
        try TownWar(address(town)).swapGoods(landId, fromIndex, bound(amount, 1, held), 0) {} catch {}
    }

    function transferGoods(uint256 fromSeed, uint256 toSeed, uint256 goodSeed, uint256 amount) external {
        uint256 fromId = _land(fromSeed);
        uint256 toId = _land(toSeed);
        if (fromId == toId) return;
        uint256 goodIndex = goodSeed % 2;
        uint256 held = town.getLandIdData(fromId).goodsBalance[goodIndex];
        if (held == 0) return;
        try town.transferGoods(goodIndex, bound(amount, 1, held), fromId, toId) {} catch {}
    }

    function finishNow(uint256 landSeed) external {
        try town.finishNow(_land(landSeed)) {} catch {}
    }

    function warp(uint256 hoursAhead) external {
        vm.warp(block.timestamp + bound(hoursAhead, 1 hours, 72 hours));
    }
}

/// @notice totalExistedGood must always equal the goods actually held on lands.
///
/// This is the property N-01 is about: five separate paths update that counter, and
/// before this round each of them recorded something different from what it moved.
contract SupplyInvariantTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;
    GoodsHandler handler;

    function setUp() public {
        vm.warp(1_000_000);
        lands = new MockLands();
        plot = new PLOT(address(this));

        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), true, address(this))
            )
        );
        town = Town(address(proxy));
        // War is a separate deployed contract Town delegatecalls into; without
        // this every dispatch reverts with WarModuleNotSet.
        town.setWarModule(address(new TownWar()));

        uint256 plotSide = 25_000_000 ether;
        uint256[2] memory plotSides = [plotSide, plotSide];
        uint256[2] memory goodsSides = [plotSide * 2, plotSide * 2];
        plot.approve(address(town), plotSide * 2);
        town.seedPool(plotSides, goodsSides);

        handler = new GoodsHandler(town, lands, plot);
        for (uint256 i = 0; i < 3; i++) {
            lands.setOwner(handler.LANDS_LIST(i), address(handler));
        }

        targetContract(address(handler));
    }

    /// Sum of every land's balance == the global counter, for both goods.
    function invariant_supplyMatchesLandBalances() public {
        uint256[2] memory held;
        for (uint256 i = 0; i < 3; i++) {
            uint256[2] memory goods = town.getLandIdData(handler.LANDS_LIST(i)).goodsBalance;
            held[0] += goods[0];
            held[1] += goods[1];
        }

        uint256[2] memory counted = town.getTotalExistedGood();
        assertEq(counted[0], held[0], "food supply drifted");
        assertEq(counted[1], held[1], "gold supply drifted");
    }

    /// C-02: the contract must always hold every PLOT it owes — player balances plus
    /// both pool reserves. Selling goods can only pay out of the reserve, so this
    /// cannot drift the way the old unbacked plotBalance did.
    function invariant_contractIsSolvent() public {
        (uint256[2] memory plotRes,) = TownWar(address(town)).getReserves();
        uint256 owed = town.getPlotBalance(address(handler)) + plotRes[0] + plotRes[1];
        assertEq(plot.balanceOf(address(town)), owed, "contract owes more than it holds");
    }

    /// A pool reserve can be pushed down but never to zero.
    function invariant_poolsAreNeverEmpty() public {
        (uint256[2] memory plotRes, uint256[2] memory goodsRes) = TownWar(address(town)).getReserves();
        assertGt(plotRes[0], 0, "food pool PLOT emptied");
        assertGt(plotRes[1], 0, "gold pool PLOT emptied");
        assertGt(goodsRes[0], 0, "food pool goods emptied");
        assertGt(goodsRes[1], 0, "gold pool goods emptied");
    }

    /// The counter must never be readable as more than was ever created.
    function invariant_supplyNeverUnderflowsIntoNonsense() public {
        uint256[2] memory counted = town.getTotalExistedGood();
        assertLt(counted[0], type(uint128).max, "food counter is nonsense");
        assertLt(counted[1], type(uint128).max, "gold counter is nonsense");
    }
}
