//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/interfaces/IERC721.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {Clans} from "./Clans.sol";
/// @dev Signatures must match Lands exactly. They previously declared mintLand as
///      non-payable, getPrice as pure, and URI/tokenURI as returning uint256, so any
///      call through this interface would have reverted.
interface ILands is IERC721 {
    function mintLand(uint8 x, uint8 y) external payable;
    function getPrice() external view returns (uint256);
    function ownerOfOrZero(uint256 tokenId) external view returns (address);
    /// @dev 0 = Town, 1 = Jungle. Mirrors Lands.LandType.
    function landType(uint256 tokenId) external view returns (uint8);
    function URI() external view returns (string memory);
}   
// interface IHeroes is IERC721 {
//     function getHero(uint256) external view returns(uint256[] memory);
// }
library TransferHelper {
    /// @notice Transfers tokens from the targeted address to the given destination
    /// @notice Errors with 'STF' if transfer fails
    /// @param token The contract address of the token to be transferred
    /// @param from The originating address from which the tokens will be transferred
    /// @param to The destination address of the transfer
    /// @param value The amount to be transferred
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'STF');
    }

    /// @notice Transfers tokens from msg.sender to a recipient
    /// @dev Errors with ST if transfer fails
    /// @param token The contract address of the token which will be transferred
    /// @param to The recipient of the transfer
    /// @param value The value of the transfer
    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'ST');
    }

    /// @notice Approves the stipulated contract to spend the given allowance in the given token
    /// @dev Errors with 'SA' if transfer fails
    /// @param token The contract address of the token to be approved
    /// @param to The target of the approval
    /// @param value The amount of the given token the target will be allowed to spend
    function safeApprove(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.approve.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'SA');
    }

    /// @notice Transfers ETH to the recipient address
    /// @dev Fails with `STE`
    /// @param to The destination of the transfer
    /// @param value The value to be transferred
    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, 'STE');
    }
}
library Utils {
    /// @notice Share of its army the winner keeps in the closest possible fight.
    ///         Higher means war is cheaper, so attacking pays at smaller margins.
    ///         At 40 an attack turns a profit from roughly 1.1x superiority upward.
    uint256 internal constant WinnerMinSurvivors = 40;
    /// @notice Most the loser can walk away with, reached in an even fight.
    uint256 internal constant LoserMaxSurvivors = 25;
    /// @notice Share of the defender's goods a total rout can carry off.
    uint256 internal constant MaxLootPercent = 50;

    /// @notice Resolves a battle.
    /// @return attackSuccess     whether the attacker takes the town
    /// @return attackerSurvivors percent of the attacking army left standing
    /// @return defenderSurvivors percent of the defending army left standing
    /// @return lootPercent       share of the defender's goods the attacker may take
    ///
    /// @dev Each side gets one strength number, damage multiplied by health:
    ///
    ///          A = attackPower  * attackerHp
    ///          D = defensePower * defenderHp
    ///
    ///      and the larger one wins. Losses come from how close `ratio` says the
    ///      fight was, so both results are bounded to 0..100 by construction.
    ///
    ///      The previous version compared power against health across sides through
    ///      three un-chained `if` statements whose ranges did not meet. Exact ties
    ///      fell through every branch and left both percentages at zero, wiping out
    ///      both armies; other paths divided by a zero defender and could return a
    ///      winner with fewer survivors than the loser, which then underflowed in
    ///      `war`. None of those states can be reached from here.
    function calculateWar(uint256 attackPower, uint256 attackerHp, uint256 defensePower, uint256 defenderHp)
        internal pure
        returns (bool attackSuccess, uint256 attackerSurvivors, uint256 defenderSurvivors, uint256 lootPercent)
    {
        uint256 attackerStrength = attackPower * attackerHp;
        uint256 defenderStrength = defensePower * defenderHp;

        // Nobody brought an army: nothing happens to anyone.
        if (attackerStrength == 0 && defenderStrength == 0) {
            return (false, 100, 100, 0);
        }

        uint256 strongest = attackerStrength > defenderStrength ? attackerStrength : defenderStrength;
        uint256 weakest = attackerStrength > defenderStrength ? defenderStrength : attackerStrength;
        uint256 ratio = (weakest * 100) / strongest; // 0 = rout, 100 = dead even

        uint256 winnerSurvivors = 100 - (ratio * (100 - WinnerMinSurvivors)) / 100;
        uint256 loserSurvivors = (ratio * LoserMaxSurvivors) / 100;

        attackSuccess = attackerStrength > defenderStrength;
        if (attackSuccess) {
            attackerSurvivors = winnerSurvivors;
            defenderSurvivors = loserSurvivors;
            lootPercent = ((100 - ratio) * MaxLootPercent) / 100;
        } else {
            attackerSurvivors = loserSurvivors;
            defenderSurvivors = winnerSurvivors;
        }
    }

    /// @param secondsPerUnit Marching time for one unit of map distance.
    /// @dev The old signature took a `speed` and computed `distance * 100 / speed`,
    ///      which was tuned against the broken coordinate split. With coordinates
    ///      decoded correctly the map is only ~140 units corner to corner, so the
    ///      pace is now expressed directly instead of through an inverse divisor.
    function calculateDistance(uint256 fromTokenId, uint256 toTokenId, uint secondsPerUnit) internal  pure returns (uint distance, uint estimatedTime) {
        (uint256 fromX, uint256 fromY) = separateCoordinates(fromTokenId) ;
        (uint256 toX, uint256 toY) = separateCoordinates(toTokenId) ;
        // Calculate the Euclidean distance between the two coordinates using the Pythagorean theorem
        uint deltaX = toX > fromX ? toX - fromX : fromX - toX;
        uint deltaY = toY > fromY ? toY - fromY : fromY - toY;
        distance = sqrt(deltaX**2 + deltaY**2);

        estimatedTime = distance * secondsPerUnit;

        return (distance, estimatedTime);
    }
    /// @dev Lands encodes a token id as the decimal concatenation of x and y. Both are
    ///      always three digits (100-199), so the id is x * 1000 + y. Splitting on 100
    ///      turned 123145 into (1231, 45) and made every distance wrong.
    function separateCoordinates(uint256 tokenId) internal pure returns (uint256, uint256) {
        return (tokenId / 1000, tokenId % 1000);
    }

    function sqrt(uint x) internal  pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}

contract Barracks is Initializable {

  /*  ******************************************************************************
                                   Instances
    *******************************************************************************  */

  /*  ******************************************************************************
                                    VARIABLES
    *******************************************************************************  */

    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;

    mapping (uint256 => DispatchedArmy[]) internal dispatchedArmies;
    
  struct DispatchedArmy {
        uint256[] amounts;
        uint256 totalArmyAmount;
        uint256 totalPower;
        uint256 totalHp;
        uint256 remainedTime;
        uint256 target;
        uint256[2] lootedAmounts;
        bool isReturning;
        uint256 remainedArmybyPercent;
        /// @dev Appended, not inserted: the frontend reads this struct by field
        ///      name, so existing fields keep their positions.
        uint256 departedAt;
    }


    struct WarriorInfo {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        string name;
        uint256 price;
    }

  
    WarriorInfo[] warriorTypes;


  /*  ******************************************************************************
                                    Constructor
    *******************************************************************************  */


    /// @dev Behind a proxy, constructor writes land in the implementation's storage
    ///      and are invisible to the proxy, so all setup moved into initializers.
    function __Barracks_init() internal onlyInitializing {
        // HEROES = IHeroes(heroesContract);
        warriorTypes.push(WarriorInfo( 45, 30, 70, "Maceman",7 ether));
        warriorTypes.push(WarriorInfo( 20, 60, 70, "Spearman",8 ether));
        warriorTypes.push(WarriorInfo( 60, 70, 90,"Swordsman",15 ether));
        warriorTypes.push(WarriorInfo( 50, 50, 70,"Archer",10 ether));
        warriorTypes.push(WarriorInfo( 45, 80, 110,"Shieldman",22 ether));
        warriorTypes.push(WarriorInfo( 90, 60, 100,"Knight",30 ether));
    }



  /*  ******************************************************************************
                                    External & public functions
    *******************************************************************************  */



  /*  ******************************************************************************
                                    View functions
    *******************************************************************************  */

    function getArmy(uint256 landTokenId) view public returns (uint256[6] memory amounts) {
        uint256 typesLength = warriorTypes.length;
        for (uint i = 0; i < typesLength;) {
            amounts[i] = landArmy[landTokenId][i];
            unchecked { ++i; }
        }
        return amounts;
    }


  /*  ******************************************************************************
                                    Internal functions
    *******************************************************************************  */

    function _getArmyInfo(uint256 landTokenId) view public returns (uint256 attPower , uint256 defPower,uint256 hp, uint256 totalArmy) {
        uint256 typesLength = warriorTypes.length;
        for (uint i = 0; i < typesLength;) {
            // Cached: this slot was previously read four times per iteration.
            uint256 warriorAmount = landArmy[landTokenId][i];
            attPower += warriorTypes[i].attackPower * warriorAmount;
            defPower += warriorTypes[i].defPower * warriorAmount;
            hp += warriorTypes[i].hp * warriorAmount;
            totalArmy += warriorAmount;
            unchecked { ++i; }
        }
    }
    function _reduceBatchWarriorByPercent(uint256 remainedPercent, uint256 landId) internal {
        uint256 typesLength = warriorTypes.length;
        for (uint i = 0; i < typesLength;) {
            uint256 currentAmount = landArmy[landId][i];
            if (currentAmount > 0) {
                landArmy[landId][i] = currentAmount * remainedPercent / 100;
            }
            unchecked { ++i; }
        }
    }
    function _addEnteredBatchWarriorByPercent(uint256[] memory enteredArmy, uint256 percentage, uint256 landId) internal{
        uint256 typesLength = warriorTypes.length;
        for (uint i = 0; i < typesLength;) {
            uint256 enteredAmount = enteredArmy[i];
            if (enteredAmount > 0) {
                landArmy[landId][i] += enteredAmount * percentage / 100;
            }
            unchecked { ++i; }
        }
    }


    function _addWarrior(uint256 warriorType, uint256 amount, uint256 landId) internal  {
        landArmy[landId][warriorType] += amount;
    }


    // NOTE: `_attack` was removed here. It never assigned attackerPower/attackerHp,
    // so every fight it resolved was a guaranteed loss for the attacker. Its only
    // caller (`Town.attack`) is commented out; live combat runs through `Town.war`.

}


/**
 * @notice Storage, modifiers and the helpers both halves of the game need.
 *
 * @dev Town outgrew the 24576-byte contract limit, so the war module lives in
 *      its own deployed contract and Town reaches it by delegatecall. Both are
 *      built on this base, which is what makes their storage layouts identical
 *      by construction — there is no hand-maintained mirror of the layout to
 *      drift out of step.
 */
abstract contract TownBase is Barracks, Clans, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {

  /*  ******************************************************************************
                                    Errors
    *******************************************************************************  */

  
    error CallerIsNotOwner();
    error ClaimBeforeAction();
    error UnAuthorizedToken();
    error InvalidLand();
    error InsufficientBalance();
    error InsufficientGoods();
    error InsufficientArmy();
    error InvalidItem();
    error MaxCapacity();
    error WorkerIsBusy();
    error BarracksLevelLowerThanWarrior();
    error AlreadyFinished();
    error TownhallUpgradeRequired();
    error TownhallMaxLevel();
    error RaidTooSoon();
    error LandAlreadyStarted();
    error TooManyDispatches();
    error SameLand();
    error PoolAlreadySeeded();
    error PoolNotSeeded();
    error InsufficientLiquidity();
    /// @dev The pool moved against the trade between quoting and mining it.
    error SlippageExceeded();
    error FaucetClosed();
    error FaucetOnCooldown();
    error FaucetEmpty();

  /*  ******************************************************************************
                                    Events
    *******************************************************************************  */

    event Deposit(address indexed accountAddress,uint256 tokenAmount);
    event Withdraw(address indexed accountAddress,uint256 tokenAmount);
    event Build( uint256 buildingTypeIndex, uint256 indexed buildingId, uint256 indexed landTokenId );
    event Upgrade( uint256 indexed buildingId, uint256 level );
    event UpgradeBarracks( uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeWalls(uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeTownhall(uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeTrainingCamp(uint256 indexed landTokenId, uint256 currentLevel );
    event Attack( uint256 indexed attackerLandId, uint256 indexed defenderLandId, bool indexed success , uint256[2] lootAmounts);
    event GoodsProduction( uint256[2] amounts, uint256 indexed landId );
    event GoodsConsumption( uint256[2] amounts, uint256 indexed landId );
    event RecruitWarrior( uint256[] typesAmount, uint256 indexed landId );
    event WarriorLosses( uint256[] typesAmount, uint256 indexed landId );
    event LandStarted( uint256 indexed landId, uint256[2] amounts );
    event WildLandRegenerated(uint256 indexed landId, uint256[2] goods, uint256 garrison);
    event WarriorEdited( uint256 indexed index, uint8[3] stats, uint256 price );
    event PoolSeeded( uint256[2] bmtAmounts, uint256[2] goodsAmounts );
    event LiquidityAdded( uint256 indexed goodIndex, uint256 plotAmount );
    event FaucetFunded( uint256 plotAmount );
    event FaucetToggled( bool enabled );
    event FaucetClaimed( address indexed claimer, uint256 indexed landId, uint256[2] goods, uint256 plotAmount );
    event PoolSync( uint256 indexed goodIndex, uint256 plotReserve, uint256 goodsReserve );
    event BuyGood( uint256 indexed landId, uint256 goodIndex, uint256 bmtSpent, uint256 goodsReceived );
    event SellGood( uint256 indexed landId, uint256 goodIndex, uint256 goodsSold, uint256 bmtReceived );
    event SwapGoods( uint256 indexed landId, uint256 fromIndex, uint256 amountIn, uint256 amountOut );
    event DispatchArmy( uint256 indexed fromLandId, uint256 indexed targetLandId, uint256[] amounts, uint256 arrivesAt );
    event Retreat( uint256 indexed landId, uint256 dispatchIndex, uint256 arrivesAt );
    event ArmyReturned( uint256 indexed landId, uint256[] amounts, uint256 survivingPercent, uint256[2] loot );
    

  /*  ******************************************************************************
                                    Instances
    *******************************************************************************  */

    ILands LANDS;
    IERC20 PLOT;



  /*  ******************************************************************************
                                    Variables
    *******************************************************************************  */

    // Constants:

    uint256 internal constant  WorkerGoldPerMinute = 1 ether ;
    uint256 internal constant BaseArmyCapacity = 50;
    /// @notice Garrison allowed before any training camp is built.
    uint256 internal constant NoCampArmyCapacity = 10;
    uint256 internal constant BaseWarriorRequiredFood = 3 ether;
    uint256 internal constant BaseFoodRevenuePer3hours = 2 ether;
    uint256 internal constant BaseGoldRevenuePer3hours = 2 ether;
    uint256 internal constant BaseWarriorLootCapacity = 30 ether;
    uint256 internal constant RetreatCostPerWarrior = 5 ether;

    /// Daily testnet handout: enough to build and trade with, nowhere near
    /// enough to skip playing. One claim per address per day, not per land —
    /// otherwise owning ten parcels would mean ten times the faucet.
    uint256 internal constant FaucetGoods = 1000 ether;
    uint256 internal constant FaucetPlot = 1000 ether;
    uint256 internal constant FaucetCooldown = 1 days;
    uint256 internal constant DispatchCostPerWarrior = 1 ether;
    uint256 internal constant WithdrawalFee = 10;
    uint256 internal constant SwapFee = 5;
    uint256 internal constant TrnasferCostPercentage = 5;
    uint256 internal constant BaseBuildTimestamp = 2 hours;
    uint256 internal constant BaseTownhallBuildTimestamp = 6 hours;
    uint8 internal constant MaxResourceBuildingsCapacity = 8;
    uint256 internal constant BaseGoodCapacityOfBuilding = 40 ether;
    uint256 internal constant RevenuePeriod = 3 hours;

    // Wall defence bonus, in tenths of a percent so the 2.5% tier stays exact.
    // Levels 1-10 give 5.0% each; levels 11-20 give 2.5% each, topping out at 75%.
    // WallBonusCap holds the bonus to 50% while townhall (and so walls) stop at 10.
    // Raise it to 750 when levels above 10 are unlocked.
    uint256 internal constant WallBonusFirstTier = 50;   // 5.0% per level
    uint256 internal constant WallBonusSecondTier = 25;  // 2.5% per level
    uint256 internal constant WallBonusTierBreak = 10;
    uint256 internal constant WallBonusMaxLevel = 20;
    uint256 internal constant WallBonusCap = 500;        // 50.0%

    /// @notice Townhall stops here. Walls, barracks and the training camp are all
    ///         gated behind it, so this caps every town building at level 10 too —
    ///         which is what the 50% wall bonus cap assumes.
    uint256 public constant MaxTownhallLevel = 10;

    /// @notice Bounds for editWarrior. Wide enough to retune balance, tight enough
    ///         that no edit can make a unit meaningless or unbeatable.
    uint8 internal constant MinWarriorStat = 5;
    uint8 internal constant MaxWarriorStat = 200;
    uint8 internal constant MinWarriorHp = 20;
    uint8 internal constant MaxWarriorHp = 250;
    uint256 internal constant MinWarriorPrice = 1 ether;
    uint256 internal constant MaxWarriorPrice = 200 ether;

    /// @notice Goods granted to a land the first time its owner starts it.
    ///         Sized to buy exactly the four resource buildings a townhall-0 land
    ///         is allowed to hold (2 farms + 2 gold mines = 400 food / 400 gold)
    ///         and nothing beyond them — every town building needs a townhall,
    ///         which this cannot afford.
    uint256 public constant StarterFood = 400 ether;
    uint256 public constant StarterGold = 400 ether;

    /// @notice Marching time per unit of map distance. Coordinates run 100-199, so the
    ///         map is ~140 units corner to corner: a neighbour is 2.5 minutes away and
    ///         the far corner just under 6 hours.
    uint256 internal constant TravelSecondsPerUnit = 150;

    /// @notice What a wild parcel holds when untouched, and how fast it comes back.
    ///         A full refill takes WildRegenPeriod; raiding sooner takes a share.
    uint256 internal constant WildGoodsPerType = 2000 ether;
    uint256 internal constant WildRegenPeriod = 7 days;
    uint256 internal constant WildGarrisonSize = 30;
    uint256 internal constant WildGarrisonType = 1;   // Spearman: 60 def, 70 hp

    /// @notice How long a raider must wait before hitting the same parcel again.
    ///         Without it a bot would sit on a parcel and take every refill.
    uint256 internal constant WildRaidCooldown = 24 hours;

    /// @dev Mirrors Lands.LandType.Jungle.
    uint8 internal constant LandTypeJungle = 1;

    /// @notice Concurrent dispatches per land. Without a bound the array grows
    ///         forever and getDispatchedArmies eventually exceeds the block gas
    ///         limit, locking the land out of its own armies.
    uint256 public constant MaxDispatchedArmies = 10;

    /// @notice What founding a clan costs the founding land: gold, and a
    ///         townhall at least this high.
    uint256 public constant ClanCreationGold = 500 ether;
    uint256 public constant ClanCreationTownhallLevel = 3;

    /// @notice Trading fee on every pool swap, in basis points. Charged on the input
    ///         and left inside the reserves, so every trade deepens the pool.
    uint256 internal constant SwapFeeBps = 500; // 5.00%
    uint256 internal constant BpsDenominator = 10000;
    // Base build costs as [food, gold]. Held as constants rather than storage
    // arrays: an inline array initialiser runs in the constructor, which a proxy
    // never sees, and each read cost two SLOADs.
    uint256 internal constant BarracksFood = 150 ether;
    uint256 internal constant BarracksGold = 200 ether;
    uint256 internal constant WallFood = 50 ether;
    uint256 internal constant WallGold = 175 ether;
    uint256 internal constant TownhallFood = 300 ether;
    uint256 internal constant TownhallGold = 300 ether;
    uint256 internal constant TrainingCampFood = 200 ether;
    uint256 internal constant TrainingCampGold = 50 ether;

    ResourceBuildingInfo[] internal resourceBuildings;


    // Variables:

    // Assigned in initialize(); an inline initialiser would never reach the proxy.
    uint256 internal tokenIdCounter;
    uint256[2] internal totalExistedGood;

    /// @notice Constant-product reserves, one pool per good, PLOT on both sides.
    ///         price(good) = plotReserve / goodsReserve, and the product of the two
    ///         reserves can only ever grow (fees), so a pool can never be emptied:
    ///         the more goods are sold in, the less PLOT each one fetches.
    uint256[2] internal plotReserve;
    uint256[2] internal goodsReserve;
    bool internal poolSeeded;
  

    struct ResourceBuildingInfo {
        uint256 requiredFood;
        uint256 requiredGold;
        uint256 revTokenIndex;
        string buildingName;
    }

  
    /// @dev Packed into a single slot. Costs double each level so nothing gets near
    ///      uint32; land ids top out at 199199; timestamps fit uint64 for the next
    ///      half-trillion years. Was four full slots.
    struct ResourceBuildingStatus {
        uint32 level;
        uint64 latestActionTimestamp;
        uint32 attachedLand;
        uint8 buildingTypeIndex;
    }

    /// @notice Wide mirror of ResourceBuildingStatus. Kept so `getStatus` returns the
    ///         same ABI tuple it always has and no consumer has to change.
    struct ResourceBuildingStatusView {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
        uint8 buildingTypeIndex;
    }

    /// @dev Field order is chosen for packing: the timestamp and the four levels
    ///      share one slot (64 + 8*4 = 96 bits). Every level is capped at
    ///      MaxTownhallLevel, so uint8 is generous. Was eight slots, now four.
    struct LandIdData {
        uint256[2] goodsBalance;
        uint256[] buildedResourceBuildings;
        uint64 latestBuildTimeStamp;
        uint8 barracksLevel;
        uint8 wallLevel;
        uint8 townhallLevel;
        uint8 trainingCampLevel;
    }

    /// @notice Wide mirror of LandIdData, in the original field order, so that
    ///         `getLandIdData` keeps returning exactly the tuple the frontend
    ///         already decodes.
    struct LandIdDataView {
        uint256[2] goodsBalance;
        uint256 latestBuildTimeStamp;
        uint256[] buildedResourceBuildings;
        uint256 barracksLevel;
        uint256 wallLevel;
        uint256 townhallLevel;
        uint256 trainingCampLevel;
    }

    mapping (uint256 => LandIdData) internal landData;

    mapping (uint256 => ResourceBuildingStatus) internal tokenIdStatus;

    /// @notice Token ID => Land ID
    mapping (uint256 => uint256) internal belongTo;

    mapping (address => uint256) internal plotBalance;

    /// @notice Lands that have already drawn their starter goods. Keyed by land, not
    ///         by owner, so selling the land does not hand a second pack to the buyer.
    mapping (uint256 => bool) internal landStarted;

    /// @notice Land id => building type => how many of that type stand on it.
    mapping (uint256 => mapping (uint256 => uint256)) internal buildingsOfType;

    /// @notice When a wild parcel was last topped up. Zero means it has never been
    ///         raided, in which case it counts as full.
    /// @dev Appended at the end of the layout: TownBase sits behind a proxy and is
    ///      shared by Town and TownWar, so both see the same slots.
    mapping (uint256 => uint64) internal wildLastRegenAt;

    /// @notice Wild parcel => raider => when that raider may come back.
    mapping (uint256 => mapping (address => uint64)) internal wildRaidCooldown;

    /*  ---- faucet. Appended last; see the upgradeability rules in CLAUDE.md ----  */

    /// @notice Whether the daily faucet is open. Owner-set, and false by default
    ///         so a mainnet deployment has it off without anyone remembering to.
    bool public faucetEnabled;

    /// @notice PLOT set aside for the faucet, funded by the owner.
    /// @dev Tracked separately from plotReserve and plotBalance because it is
    ///      neither: it is not pool depth and it is not owed to any player yet.
    ///      Solvency is
    ///      `balanceOf(town) == Σ plotBalance + plotReserve[0..1] + faucetReserve`.
    uint256 public faucetReserve;

    /// @notice Claimer => when they may claim again.
    mapping (address => uint64) public faucetNextClaimAt;


  /*  ******************************************************************************
                                    Constructor
    *******************************************************************************  */

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // The implementation itself must never be initialisable; only the proxy is.
        _disableInitializers();
    }

    /// @param seedTestLands Stocks three fixed lands with goods and level-2 buildings.
    ///        Pass true on testnet only — on mainnet these are an unearned head start
    ///        for whoever mints those three coordinates first.
    function initialize(
        address plotToken,
        address landsAddress,
        bool seedTestLands,
        address initialOwner
    ) public initializer {
        if (plotToken == address(0) || landsAddress == address(0) || initialOwner == address(0)) {
            revert InvalidItem();
        }
        __Ownable_init(initialOwner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __Barracks_init();

        PLOT = IERC20(plotToken);
        LANDS = ILands(landsAddress);
        tokenIdCounter = 1;
        resourceBuildings.push(ResourceBuildingInfo( 75 ether, 125 ether, 0,"Farm"));
        resourceBuildings.push(ResourceBuildingInfo( 125 ether, 75 ether, 1,"Gold mine"));

        if (seedTestLands) {
            _seedLand(101101);
            _seedLand(105105);
            _seedLand(109109);
        }
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _seedLand(uint256 landTokenId) internal {
        LandIdData storage landProps = landData[landTokenId];
        landProps.goodsBalance[0] += 10000 ether;
        landProps.goodsBalance[1] += 10000 ether;
        // Seeded goods are real goods. Leaving them out of the counter was the
        // hidden head start that made the old conditional subtraction necessary.
        totalExistedGood[0] += 10000 ether;
        totalExistedGood[1] += 10000 ether;
        landProps.barracksLevel = 2;
        landProps.townhallLevel = 2;
        landProps.trainingCampLevel = 2;
        landProps.wallLevel = 2;
        landStarted[landTokenId] = true;
    }


  /*  ******************************************************************************
                                   Owner controls
    *******************************************************************************  */

    /// @notice Funds both pools once. The PLOT is pulled from the caller; the goods
    ///         side is created here, since goods only ever exist as game state.
    /// @param bmtAmounts PLOT to place in the [food, gold] pools.
    /// @param goodsAmounts Goods to place opposite them.
    /// @dev Opening price per good is bmtAmounts[i] / goodsAmounts[i]. Seeding the
    ///      goods side heavier than the PLOT side makes selling less rewarding from
    ///      day one, which is the cheapest brake on goods-to-PLOT extraction.
    function seedPool(uint256[2] calldata bmtAmounts, uint256[2] calldata goodsAmounts)
        external onlyOwner nonReentrant
    {
        if (poolSeeded) {
            revert PoolAlreadySeeded();
        }
        if (bmtAmounts[0] == 0 || bmtAmounts[1] == 0 || goodsAmounts[0] == 0 || goodsAmounts[1] == 0) {
            revert InsufficientLiquidity();
        }

        poolSeeded = true;
        plotReserve[0] = bmtAmounts[0];
        plotReserve[1] = bmtAmounts[1];
        goodsReserve[0] = goodsAmounts[0];
        goodsReserve[1] = goodsAmounts[1];

        TransferHelper.safeTransferFrom(
            address(PLOT), msg.sender, address(this), bmtAmounts[0] + bmtAmounts[1]
        );

        emit PoolSeeded(bmtAmounts, goodsAmounts);
    }

    /// @notice Retunes one warrior type.
    /// @dev Lived on `Vars`, which kept its own second copy of `warriorTypes` that
    ///      this contract never read — so editing it changed nothing. Now it edits
    ///      the array the game actually fights with.
    ///
    ///      Bounded on purpose: stats are read live by every battle, so an
    ///      unconstrained setter would let the owner decide a war in flight.
    function editWarrior(uint256 index, uint8[3] calldata stats, uint256 price) external onlyOwner {
        if (index >= warriorTypes.length) {
            revert InvalidItem();
        }
        if (stats[0] < MinWarriorStat || stats[0] > MaxWarriorStat) revert InvalidItem();
        if (stats[1] < MinWarriorStat || stats[1] > MaxWarriorStat) revert InvalidItem();
        if (stats[2] < MinWarriorHp || stats[2] > MaxWarriorHp) revert InvalidItem();
        if (price < MinWarriorPrice || price > MaxWarriorPrice) revert InvalidItem();

        WarriorInfo storage warrior = warriorTypes[index];
        warrior.attackPower = stats[0];
        warrior.defPower = stats[1];
        warrior.hp = stats[2];
        warrior.price = price;

        emit WarriorEdited(index, stats, price);
    }

    /// @notice Halts every state-changing game action. Views stay readable.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }


  /*  ******************************************************************************
                                   Modifiers
    *******************************************************************************  */


    /// @notice Making sure caller is owner of pointed land in Lands contract.
    /// @dev Also hands the land its starter goods on the owner's first action, so a
    ///      freshly minted land is never stuck with an empty balance and no way to
    ///      earn one. Costs one warm SLOAD once the land has started.
    modifier onlyLandOwner(uint256 landTokenId) {
        if (LANDS.ownerOf(landTokenId) != msg.sender) {
            revert CallerIsNotOwner();
        }
        if (!landStarted[landTokenId]) {
            _startLand(landTokenId);
        }
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        if (LANDS.ownerOf(belongTo[tokenId]) != msg.sender) {
            revert CallerIsNotOwner(); 
        } 
        _;
    }

    /// @dev Was an O(n) walk of the land's buildings with a second SLOAD per entry
    ///      just to read each type. buildingsOfType keeps the same tally in one slot.
    modifier typeLimit (uint256 landId, uint256 typeIndex) {
        uint256 count = buildingsOfType[landId][typeIndex];
        if (count + 1 > MaxResourceBuildingsCapacity / 2) {
            revert MaxCapacity();
        }
        if (count + 1 > uint256(landData[landId].townhallLevel) + 2) {
            revert TownhallUpgradeRequired();
        }
        _;
    }

    modifier isWorkerReady (uint256 landTokenId){
     if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
        }
        _;
    }



    function _startLand(uint256 landTokenId) internal {
        landStarted[landTokenId] = true;
        LandIdData storage landProps = landData[landTokenId];
        landProps.goodsBalance[0] += StarterFood;
        landProps.goodsBalance[1] += StarterGold;
        totalExistedGood[0] += StarterFood;
        totalExistedGood[1] += StarterGold;
        emit LandStarted(landTokenId, [StarterFood, StarterGold]);
    }
    function getRemainedBuildTimestamp(uint256 landTokenId) view public returns (uint256 remainedTimestamp) {
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp ) {
            remainedTimestamp = (landData[landTokenId].latestBuildTimeStamp - block.timestamp)/ 1 minutes;
        }
    }
    /// @dev Lands.ownerOf reverts for a token that was never minted, so this both
    ///      catches the zero-owner case and surfaces the revert for unminted ids.
    /// @notice Warriors a land may garrison, from its training camp level.
    function _armyCapacity(uint256 landTokenId) internal view returns (uint256) {
        uint256 trainingCampLevel = landData[landTokenId].trainingCampLevel;
        return trainingCampLevel > 0 ? trainingCampLevel * BaseArmyCapacity : NoCampArmyCapacity;
    }
    /// @dev Uses ownerOfOrZero rather than ownerOf: in OpenZeppelin v5 `ownerOf`
    ///      reverts for an unminted token instead of returning zero, so the
    ///      `== address(0)` test here could never be reached and callers got an
    ///      ERC721NonexistentToken panic in place of InvalidLand.
    function _requireLandExists(uint256 landTokenId) internal view {
        if (LANDS.ownerOfOrZero(landTokenId) == address(0)) {
            // Wild parcels are attackable before anyone mints them; that is the
            // whole point of them.
            if (LANDS.landType(landTokenId) == LandTypeJungle) {
                return;
            }
            revert InvalidLand();
        }
    }
    function _spendGoods(uint256 landTokenId,
        uint256[2] memory amounts
        ) internal {
            // Read the balance straight from storage. getLandIdData() copied the whole
            // LandIdData struct — including the dynamic buildedResourceBuildings array —
            // into memory just to look at one number, on every write transaction.
            LandIdData storage landProps = landData[landTokenId];
            for (uint i = 0; i < 2; i++) {
                uint256 amount = amounts[i];
                if (landProps.goodsBalance[i] < amount) {
                    revert InsufficientBalance();
                }
                landProps.goodsBalance[i] -= amount;
                // Unconditional: goods spent on buildings are destroyed. The old
                // `if (totalExistedGood[i] >= amount)` guard hid the drift caused by
                // the other paths instead of surfacing it.
                totalExistedGood[i] -= amount;
            }
        emit GoodsConsumption( amounts,landTokenId);
    }
    function getLandIdData(uint256 landTokenId) public view returns(LandIdDataView memory) {
        LandIdData storage packed = landData[landTokenId];
        return LandIdDataView({
            goodsBalance: packed.goodsBalance,
            latestBuildTimeStamp: packed.latestBuildTimeStamp,
            buildedResourceBuildings: packed.buildedResourceBuildings,
            barracksLevel: packed.barracksLevel,
            wallLevel: packed.wallLevel,
            townhallLevel: packed.townhallLevel,
            trainingCampLevel: packed.trainingCampLevel
        });
    }
    /// @notice Wall defence bonus in tenths of a percent (500 = 50.0%).
    /// @dev Levels 1-10 add 5.0% each, levels 11-20 add 2.5% each, then it stops.
    ///      The result is held at WallBonusCap while walls cannot pass level 10.
    ///      The old expression was `wallLevel * 5 / 100`, which truncated to zero
    ///      for every level below 20 — walls cost goods and did nothing.
    function getWallBonus(uint256 wallLevel) pure public returns (uint256 bonusTenths) {
        if (wallLevel > WallBonusMaxLevel) {
            wallLevel = WallBonusMaxLevel;
        }
        if (wallLevel <= WallBonusTierBreak) {
            bonusTenths = wallLevel * WallBonusFirstTier;
        } else {
            bonusTenths = WallBonusTierBreak * WallBonusFirstTier
                + (wallLevel - WallBonusTierBreak) * WallBonusSecondTier;
        }
        if (bonusTenths > WallBonusCap) {
            bonusTenths = WallBonusCap;
        }
    }
    /// @dev A land that was never minted has no owner, and so no clan, rather
    ///      than reverting out of ownerOf and taking the caller down with it.
    function _clanLandOwner(uint256 landId) internal view override returns (address) {
        try LANDS.ownerOf(landId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    /// @dev Clan membership is what makes lands allies, so a member with no land
    ///      is a seat on the roster that shows nowhere on the map.
    function _clanHasLand(address account) internal view override returns (bool) {
        return LANDS.balanceOf(account) != 0;
    }
}


/**
 * @notice The game: land, buildings, goods, the pool, and clans.
 *
 * @dev War lives in `TownWar`, reached through the fallback below, because the
 *      two together are over the byte limit. Splitting was the only option —
 *      the optimizer at `runs = 1` with `via_ir` still left it 4.6KB over.
 */
contract Town is TownBase {
    /// @dev Appended after every inherited slot, and TownWar never reads it, so
    ///      the layouts stay identical everywhere that matters.
    address public warModule;

    error WarModuleNotSet();

    event WarModuleUpdated(address indexed module);

    /*  ******************************************************************************
                                    External & public functions 
    *******************************************************************************  */


    /// @notice Draws the one-off starter goods for a land. Any owner action does this
    ///         automatically; this exists so a new player can trigger it explicitly.
    function startLand(uint256 landTokenId) external whenNotPaused {
        if (LANDS.ownerOf(landTokenId) != msg.sender) {
            revert CallerIsNotOwner();
        }
        if (landStarted[landTokenId]) {
            revert LandAlreadyStarted();
        }
        _startLand(landTokenId);
    }

    function hasStarted(uint256 landTokenId) external view returns (bool) {
        return landStarted[landTokenId];
    }









    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        TransferHelper.safeTransferFrom(address(PLOT),msg.sender,address(this),amount);
        plotBalance[msg.sender] += amount;
        emit Deposit( msg.sender, amount);
    }






    /**
     * @notice Adds PLOT to one pool's reserve without minting and without
     *         touching the goods side.
     *
     * PLOT has no mint function, so the rewards players earn cannot be created
     * — they have to be moved into the pool they are paid out of. `seedPool` is
     * `poolSeeded`-gated and runs exactly once, and `deposit` credits
     * `plotBalance[msg.sender]`, which is PLOT the contract *owes the depositor*
     * rather than PLOT the pool can pay out. Neither does this.
     *
     * Note what it does to price: raising `plotReserve` alone raises
     * `plotReserve/goodsReserve`, so goods get dearer in PLOT terms and players
     * earn more per unit sold. That is the intent, and also why it is owner-only
     * and meant to be paced — `script/new/TopUpPool.s.sol` sizes each top-up
     * against how far the reserve has actually drained.
     *
     * Solvency still holds: the PLOT lands in the contract and in the reserve in
     * the same transaction, so `balanceOf(town) == Σ plotBalance + reserves` is
     * unchanged. SupplyInvariant covers it.
     */
    function addLiquidity(uint256 goodIndex, uint256 plotAmount) external onlyOwner nonReentrant {
        if (goodIndex > 1) {
            revert InvalidItem();
        }
        if (!poolSeeded) {
            revert PoolNotSeeded();
        }
        if (plotAmount == 0) {
            revert InsufficientLiquidity();
        }

        plotReserve[goodIndex] += plotAmount;
        TransferHelper.safeTransferFrom(
            address(PLOT), msg.sender, address(this), plotAmount
        );

        emit LiquidityAdded(goodIndex, plotAmount);
        emit PoolSync(goodIndex, plotReserve[goodIndex], goodsReserve[goodIndex]);
    }

    /*  ******************************************************************************
                                    Faucet — testnet only
        *******************************************************************************  */

    /// @notice Opens or closes the daily faucet. Off unless someone turns it on.
    /// @dev There is no stored "this is a testnet" flag — `seedTestLands` is an
    ///      initialize argument and is never kept — so this is the switch, and
    ///      leaving it false is what makes a mainnet deployment safe by default.
    function setFaucetEnabled(bool enabled) external onlyOwner {
        faucetEnabled = enabled;
        emit FaucetToggled(enabled);
    }

    /// @notice Puts PLOT aside for the faucet to hand out.
    /// @dev PLOT cannot be minted, so the faucet cannot conjure it either. Every
    ///      token it gives away is one the owner put here first. Without this the
    ///      faucet would credit plotBalance against nothing and break solvency.
    function fundFaucet(uint256 plotAmount) external onlyOwner nonReentrant {
        if (plotAmount == 0) {
            revert InsufficientLiquidity();
        }
        faucetReserve += plotAmount;
        TransferHelper.safeTransferFrom(
            address(PLOT), msg.sender, address(this), plotAmount
        );
        emit FaucetFunded(plotAmount);
    }

    /// @notice One claim a day: 1000 food and 1000 gold onto a land you own,
    ///         and 1000 PLOT into your in-game balance.
    ///
    /// @dev Rate-limited per address rather than per land. Keyed on the land as
    ///      well only because goods have to live somewhere; owning ten parcels
    ///      must not mean ten claims.
    ///
    ///      The goods are created — `totalExistedGood` moves with them, which is
    ///      what keeps the supply invariant true. The PLOT is not: it moves out
    ///      of `faucetReserve` and into `plotBalance`, both of which the solvency
    ///      invariant counts, so the contract never owes more than it holds.
    function faucet(uint256 landTokenId) external whenNotPaused onlyLandOwner(landTokenId) {
        if (!faucetEnabled) {
            revert FaucetClosed();
        }
        if (block.timestamp < faucetNextClaimAt[msg.sender]) {
            revert FaucetOnCooldown();
        }
        if (faucetReserve < FaucetPlot) {
            revert FaucetEmpty();
        }

        faucetNextClaimAt[msg.sender] = uint64(block.timestamp + FaucetCooldown);

        landData[landTokenId].goodsBalance[0] += FaucetGoods;
        landData[landTokenId].goodsBalance[1] += FaucetGoods;
        totalExistedGood[0] += FaucetGoods;
        totalExistedGood[1] += FaucetGoods;

        faucetReserve -= FaucetPlot;
        plotBalance[msg.sender] += FaucetPlot;

        uint256[2] memory goods = [FaucetGoods, FaucetGoods];
        emit GoodsProduction(goods, landTokenId);
        emit FaucetClaimed(msg.sender, landTokenId, goods, FaucetPlot);
    }

    function transferGoods(uint256 goodIndex, uint256 amount, uint256 fromId, uint256 toId) external whenNotPaused onlyLandOwner(fromId){
        if (goodIndex > 1) {
            revert InvalidItem();
        }
        if (fromId == toId) {
            revert SameLand();
        }
        _requireLandExists(toId);
        require(landData[fromId].goodsBalance[goodIndex] >= amount, "Insufficient balance");
        landData[fromId].goodsBalance[goodIndex] -= amount;
        uint256 delivered = amount * (100-TrnasferCostPercentage) / 100;
        landData[toId].goodsBalance[goodIndex] += delivered;
        // Only the shipping loss leaves the world; the delivered part is still held.
        totalExistedGood[goodIndex] -= (amount - delivered);
        uint256[2] memory amounts;
        amounts[goodIndex] = amount - delivered;
        emit GoodsConsumption(amounts, toId);
    }


    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        if (plotBalance[msg.sender] < amount) {
            revert InsufficientGoods();
        }
        plotBalance[msg.sender] -= amount;
        uint256 payout = amount * (100 - WithdrawalFee) / 100;
        uint256 fee = amount - payout;
        // The fee used to sit in the contract untracked and unreachable. Splitting it
        // into the two pools keeps the PLOT accounted for and deepens the reserves.
        if (fee > 0 && poolSeeded) {
            uint256 half = fee / 2;
            plotReserve[0] += half;
            plotReserve[1] += fee - half;
        }
        TransferHelper.safeTransfer(address(PLOT), msg.sender, payout);
        emit Withdraw( msg.sender, amount);
    }



    function buildResourceBuilding(uint256 landTokenId, uint8 buildingIndex) external whenNotPaused onlyLandOwner(landTokenId) typeLimit(landTokenId, buildingIndex) isWorkerReady(landTokenId){
        if (buildingIndex >= resourceBuildings.length ) {
            revert InvalidItem();
        }
        ResourceBuildingInfo memory selecteduilding = resourceBuildings[buildingIndex];
        _spendGoods(landTokenId, [
            selecteduilding.requiredFood,
            selecteduilding.requiredGold
        ]);
        belongTo[tokenIdCounter] = landTokenId;
        tokenIdStatus[tokenIdCounter] = ResourceBuildingStatus(1, uint64(block.timestamp), uint32(landTokenId), buildingIndex);
        landData[landTokenId].buildedResourceBuildings.push(tokenIdCounter);
        buildingsOfType[landTokenId][buildingIndex] += 1;
        tokenIdCounter ++;
        landData[landTokenId].latestBuildTimeStamp  = uint64(block.timestamp + BaseBuildTimestamp);
        emit Build(buildingIndex, tokenIdCounter-1, landTokenId);
    }


    function upgradeResourceBuilding(uint256 buildingTokenId, uint256 landTokenId) external whenNotPaused belongToCaller(buildingTokenId) isWorkerReady(landTokenId) {
        if (belongTo[buildingTokenId] != landTokenId ) {
            revert InvalidItem();
        }
        claimRevenue(buildingTokenId);
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        ResourceBuildingInfo memory selecteduilding = resourceBuildings[typeIndex];

        // _spendGoods takes [food, gold] — same order as buildResourceBuilding.
        _spendGoods(landTokenId, [
            selecteduilding.requiredFood * (2 ** currentLevel),
            selecteduilding.requiredGold * (2 ** currentLevel)
        ]);
        tokenIdStatus[buildingTokenId].level = uint32(currentLevel+1) ;
        landData[landTokenId].latestBuildTimeStamp  = uint64(block.timestamp + (BaseBuildTimestamp * (currentLevel+1)));
        emit Upgrade(buildingTokenId, currentLevel+1);
    }

    function buildBarracks(uint256 landTokenId) public whenNotPaused onlyLandOwner(landTokenId) isWorkerReady(landTokenId){
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.barracksLevel+1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods([BarracksFood, BarracksGold], landProps.barracksLevel));
        landProps.latestBuildTimeStamp  = uint64(block.timestamp + (BaseBuildTimestamp * (uint256(landProps.barracksLevel) + 1)));
        landProps.barracksLevel ++;
        emit UpgradeBarracks( landTokenId, landProps.barracksLevel );
    }
    function buildTownhall(uint256 landTokenId) public whenNotPaused onlyLandOwner(landTokenId) isWorkerReady(landTokenId){
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel >= MaxTownhallLevel) {
            revert TownhallMaxLevel();
        }
        _spendGoods(landTokenId,getRequiredGoods([TownhallFood, TownhallGold], landProps.townhallLevel));
        landProps.latestBuildTimeStamp  = uint64(block.timestamp + (BaseTownhallBuildTimestamp * (uint256(landProps.townhallLevel) + 1)));
        landProps.townhallLevel ++;
        emit UpgradeTownhall( landTokenId, landProps.townhallLevel );
    }

    function buildWalls(uint256 landTokenId) public whenNotPaused onlyLandOwner(landTokenId) isWorkerReady(landTokenId) {
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.wallLevel +1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods([WallFood, WallGold], landProps.wallLevel));
 
        landProps.latestBuildTimeStamp  = uint64(block.timestamp + (BaseBuildTimestamp * (uint256(landProps.wallLevel) + 1)));
        landProps.wallLevel ++;
        emit UpgradeWalls( landTokenId, landProps.wallLevel );
    }
    function buildTrainingCamp(uint256 landTokenId) public whenNotPaused onlyLandOwner(landTokenId) isWorkerReady(landTokenId) {
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.trainingCampLevel +1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods([TrainingCampFood, TrainingCampGold], landProps.trainingCampLevel));
 
        landProps.latestBuildTimeStamp  = uint64(block.timestamp + (BaseBuildTimestamp * (uint256(landProps.trainingCampLevel) + 1)));
        landProps.trainingCampLevel ++;
        emit UpgradeTrainingCamp( landTokenId, landProps.trainingCampLevel );
    }


    function finishNow(uint256 landTokenId) external whenNotPaused onlyLandOwner(landTokenId){
        uint256 finishCost = getFinishCost(landTokenId);
        if (finishCost == 0) {
            revert AlreadyFinished();
        }
        // finishCost is denominated in gold, which is goodsBalance[1]. Going through
        // _spendGoods keeps the balance check, the burn and the event in one place.
        _spendGoods(landTokenId, [uint256(0), finishCost]);
        landData[landTokenId].latestBuildTimeStamp = uint64(block.timestamp - 1 minutes);
    }




    /// @notice Pays out one building and advances its clock by the periods it consumed.
    /// @dev Single source of truth for both claim entry points — they used to be two
    ///      separate implementations of the same logic, which is how they drifted apart.
    ///      The clock advances by whole periods only, so the unfinished remainder of a
    ///      period carries over instead of being burned by an early claim.
    function _claim(uint256 buildingTokenId) internal returns (uint256 revenueAmount, uint256 goodIndex) {
        ResourceBuildingStatus storage buildingStatus = tokenIdStatus[buildingTokenId];
        goodIndex = resourceBuildings[buildingStatus.buildingTypeIndex].revTokenIndex;
        revenueAmount = getCurrentRevenue(buildingTokenId);

        uint256 elapsedPeriods = (block.timestamp - buildingStatus.latestActionTimestamp) / RevenuePeriod;
        if (elapsedPeriods > 0) {
            buildingStatus.latestActionTimestamp += uint64(elapsedPeriods * RevenuePeriod);
        }

        landData[buildingStatus.attachedLand].goodsBalance[goodIndex] += revenueAmount;
        totalExistedGood[goodIndex] += revenueAmount;
    }



    function claimRevenue(uint256 buildingTokenId) public whenNotPaused belongToCaller(buildingTokenId){
        (uint256 revenueAmount, uint256 goodIndex) = _claim(buildingTokenId);
        uint256[2] memory amounts;
        amounts[goodIndex] = revenueAmount;
        emit GoodsProduction(amounts , belongTo[buildingTokenId]);
    }

    function claimAll(uint256 landTokenId) public whenNotPaused onlyLandOwner(landTokenId){
        uint256[] memory landBuildings = landData[landTokenId].buildedResourceBuildings;
        uint256[2] memory amounts;
        // Iterate this land's buildings, not the global building-type list.
        uint256 buildingsLength = landBuildings.length;
        for (uint i = 0; i < buildingsLength; i++) {
            (uint256 revenueAmount, uint256 goodIndex) = _claim(landBuildings[i]);
            amounts[goodIndex] += revenueAmount;
        }
        emit GoodsProduction(amounts , landTokenId);
    }

    // function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) {

    //     require(LANDS.ownerOf(targetId) != address(0), "");
    //     (bool success, uint256 winRate) = _attack(warriorsAmounts, attackerId, targetId, landData[targetId].wallLevel);
    //     uint256 [2] memory lootAmounts;
    //     if (success) {
    //         lootAmounts = _loot(attackerId, targetId, winRate);
    //     }
    //     emit Attack(attackerId, targetId, success, lootAmounts);
    // }



    function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
        ResourceBuildingStatus storage buildingStatus = tokenIdStatus[buildingTokenId];
        uint256 period = block.timestamp - (buildingStatus.latestActionTimestamp);
        uint256 baseRev = buildingStatus.buildingTypeIndex == 0 ? BaseFoodRevenuePer3hours : BaseGoldRevenuePer3hours ;
        uint256 levelMultiplier = 2 ** (buildingStatus.level - 1);
        uint256 rev = (period / RevenuePeriod) * baseRev * levelMultiplier;
        // The cap grows with the same curve as production. It used to be linear
        // (BaseGoodCapacityOfBuilding * level), so from level 5 upward most of a
        // building's output was discarded and upgrading stopped paying off.
        uint256 cap = BaseGoodCapacityOfBuilding * levelMultiplier;
        if (rev > cap) {
            rev = cap;
        }
        return rev;
       
    }

      function getFinishCost(uint256 landTokenId) view public returns (uint256 requiredGold) {
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp) {
        uint256 remainedTimestamp = landData[landTokenId].latestBuildTimeStamp - block.timestamp;
        requiredGold = (remainedTimestamp / 1 minutes) * WorkerGoldPerMinute;
        } else {
            requiredGold = 0;
        }
   
    }






    function getStatus(uint256 tokenId) public view returns(ResourceBuildingStatusView memory){
        ResourceBuildingStatus storage packed = tokenIdStatus[tokenId];
        return ResourceBuildingStatusView({
            level: packed.level,
            latestActionTimestamp: packed.latestActionTimestamp,
            attachedLand: packed.attachedLand,
            buildingTypeIndex: packed.buildingTypeIndex
        });
    }







    /// @notice Total goods recorded as existing across the whole game.
    function getTotalExistedGood() external view returns (uint256[2] memory) {
        return totalExistedGood;
    }

    function getPlotBalance(address userAddress) external view returns(uint256) {
        return plotBalance[userAddress];
    }




    function getRequiredGoods(uint256[2] memory baseAmounts, uint256 currentLevel) pure public returns (uint256[2] memory) {
        uint256[2] memory requiredComs;
         for (uint i = 0; i < baseAmounts.length; i++) 
        {
           requiredComs[i] = baseAmounts[i] * ( 2 ** currentLevel );
        }
        return requiredComs ;
        
    }

 



    /*  ******************************************************************************
                                       Internal functions  
    *******************************************************************************  */











    /// @notice Points the war entry points at their implementation.
    function setWarModule(address module) external onlyOwner {
        if (module == address(0)) revert InvalidItem();
        warModule = module;
        emit WarModuleUpdated(module);
    }

    /**
     * @dev Every war selector lands here and is delegatecalled into TownWar, so
     *      it runs against this contract's storage and `msg.sender` survives.
     *      Callers cannot tell the difference: one address, one ABI.
     */
    fallback() external {
        address module = warModule;
        if (module == address(0)) revert WarModuleNotSet();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), module, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
    /**
     * @notice Found a clan, paid for out of `landTokenId`.
     * @dev The gold and the townhall requirement live here rather than in Clans
     *      because they are questions about land, which Clans cannot see.
     */
    function createClan(uint256 landTokenId, string calldata name)
        external
        whenNotPaused
        onlyLandOwner(landTokenId)
        returns (uint256)
    {
        if (landData[landTokenId].townhallLevel < ClanCreationTownhallLevel) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId, [uint256(0), ClanCreationGold]);
        return _createClan(name, msg.sender);
    }
}

/**
 * @notice The war half of Town: recruiting, dispatching, battle and the return.
 *
 * @dev Never called directly. Town delegatecalls into it, so every storage
 *      access here hits Town's storage — which is why it is built on the same
 *      TownBase rather than redeclaring the layout.
 */
contract TownWar is TownBase {

    // ---------------------------------------------------------------------
    // The goods pools
    //
    // These live here rather than in Town purely for room: Town's catch-all
    // fallback delegatecalls any unknown selector into this contract, so the
    // selectors and the storage they touch are unchanged and no caller can
    // tell the difference. Town was down to 165 bytes of EIP-170 margin.
    // ---------------------------------------------------------------------

    /// @notice Spend PLOT to draw goods out of that good's pool.
    function buyGood( uint256 landTokenId, uint256 goodIndex, uint256 amount, uint256 minGoodsOut) external whenNotPaused onlyLandOwner(landTokenId){
        if (goodIndex > 1) {
            revert InvalidItem();
        }
        if (!poolSeeded) {
            revert PoolNotSeeded();
        }
        if (plotBalance[msg.sender] < amount) {
            revert InsufficientBalance();
        }

        uint256 goodAmount = _getAmountOut(amount, plotReserve[goodIndex], goodsReserve[goodIndex]);
        if (goodAmount == 0) {
            revert InsufficientLiquidity();
        }
        if (goodAmount < minGoodsOut) {
            revert SlippageExceeded();
        }

        plotBalance[msg.sender] -= amount;
        // The whole input enters the reserve, fee included, so the pool deepens.
        plotReserve[goodIndex] += amount;
        goodsReserve[goodIndex] -= goodAmount;

        landData[landTokenId].goodsBalance[goodIndex] += goodAmount;
        totalExistedGood[goodIndex] += goodAmount;

        uint256[2] memory bought;
        bought[goodIndex] = goodAmount;
        emit GoodsProduction(bought, landTokenId);
        emit BuyGood(landTokenId, goodIndex, amount, goodAmount);
        emit PoolSync(goodIndex, plotReserve[goodIndex], goodsReserve[goodIndex]);
    }
    /// @notice Swap one good for the other. Routes through PLOT, so it is two pool
    ///         hops and pays the fee twice — exactly like any AMM router.
    function swapGoods(uint256 landTokenId, uint256 fromIndex, uint256 amountIn, uint256 minAmountOut) external whenNotPaused onlyLandOwner(landTokenId) {
        if (fromIndex > 1) {
            revert InvalidItem();
        }
        if (!poolSeeded) {
            revert PoolNotSeeded();
        }
        if (landData[landTokenId].goodsBalance[fromIndex] < amountIn) {
            revert InsufficientGoods();
        }
        uint256 toIndex = fromIndex == 0 ? 1 : 0;

        uint256 bmtMid = _getAmountOut(amountIn, goodsReserve[fromIndex], plotReserve[fromIndex]);
        uint256 amountOut = _getAmountOut(bmtMid, plotReserve[toIndex], goodsReserve[toIndex]);
        if (bmtMid == 0 || amountOut == 0) {
            revert InsufficientLiquidity();
        }
        if (amountOut < minAmountOut) {
            revert SlippageExceeded();
        }

        goodsReserve[fromIndex] += amountIn;
        plotReserve[fromIndex] -= bmtMid;
        plotReserve[toIndex] += bmtMid;
        goodsReserve[toIndex] -= amountOut;

        landData[landTokenId].goodsBalance[fromIndex] -= amountIn;
        landData[landTokenId].goodsBalance[toIndex] += amountOut;
        totalExistedGood[fromIndex] -= amountIn;
        totalExistedGood[toIndex] += amountOut;

        // Both halves of the swap are announced. Emitting only the consumption
        // made the log asymmetric with buyGood and sellGood, so anything
        // reconstructing balances from events undercounted every swap.
        uint256[2] memory consumed;
        consumed[fromIndex] = amountIn;
        emit GoodsConsumption(consumed, landTokenId);
        uint256[2] memory produced;
        produced[toIndex] = amountOut;
        emit GoodsProduction(produced, landTokenId);
        emit SwapGoods(landTokenId, fromIndex, amountIn, amountOut);
        emit PoolSync(fromIndex, plotReserve[fromIndex], goodsReserve[fromIndex]);
        emit PoolSync(toIndex, plotReserve[toIndex], goodsReserve[toIndex]);
    }
    /// @notice Sell goods into that good's pool for PLOT.
    /// @dev Proceeds come out of the pool's own PLOT reserve, so a sale can never pay
    ///      more PLOT than the pool holds. This is what makes plotBalance backed: the
    ///      old implementation credited PLOT that nothing had ever funded.
    function sellGood( uint256 landTokenId, uint256 goodIndex, uint256 amount, uint256 minPlotOut) external whenNotPaused onlyLandOwner(landTokenId) {
        if (goodIndex > 1) {
            revert InvalidItem();
        }
        if (!poolSeeded) {
            revert PoolNotSeeded();
        }
        if (landData[landTokenId].goodsBalance[goodIndex] < amount) {
            revert InsufficientGoods();
        }

        uint256 proceeds = _getAmountOut(amount, goodsReserve[goodIndex], plotReserve[goodIndex]);
        if (proceeds == 0) {
            revert InsufficientLiquidity();
        }
        if (proceeds < minPlotOut) {
            revert SlippageExceeded();
        }

        landData[landTokenId].goodsBalance[goodIndex] -= amount;
        totalExistedGood[goodIndex] -= amount;

        goodsReserve[goodIndex] += amount;
        plotReserve[goodIndex] -= proceeds;
        plotBalance[msg.sender] += proceeds;

        uint256[2] memory sold;
        sold[goodIndex] = amount;
        emit GoodsConsumption(sold, landTokenId);
        emit SellGood(landTokenId, goodIndex, amount, proceeds);
        emit PoolSync(goodIndex, plotReserve[goodIndex], goodsReserve[goodIndex]);
    }
    /// @notice Spot price of each good in PLOT, 1e18-scaled, straight off the reserves.
    /// @dev Replaces the old supply-ratio formula. That one derived a price from
    ///      totalExistedGood, which meant five unrelated code paths had to agree on
    ///      one counter for prices to be right. Reserves cannot disagree with
    ///      themselves.
    function getGoodsPrice() view public returns (uint256[2] memory prices) {
        for (uint i = 0; i < 2; i++) {
            prices[i] = goodsReserve[i] == 0
                ? 0
                : (plotReserve[i] * 1 ether) / goodsReserve[i];
        }
    }
    /// @notice Current pool reserves as (plot, goods) for each good index.
    function getReserves() external view returns (uint256[2] memory, uint256[2] memory) {
        return (plotReserve, goodsReserve);
    }
    /// @notice Quote for spending `bmtAmount` on a good, without executing.
    function quoteBuy(uint256 goodIndex, uint256 bmtAmount) external view returns (uint256) {
        return _getAmountOut(bmtAmount, plotReserve[goodIndex], goodsReserve[goodIndex]);
    }
    /// @notice Quote for selling `goodsAmount` of a good, without executing.
    function quoteSell(uint256 goodIndex, uint256 goodsAmount) external view returns (uint256) {
        return _getAmountOut(goodsAmount, goodsReserve[goodIndex], plotReserve[goodIndex]);
    }
    /// @notice Constant-product output, fee taken on the input (Uniswap V2 form).
    /// @dev Output is strictly less than reserveOut for any finite input, which is
    ///      what guarantees a pool can never be drained to zero.
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        internal pure returns (uint256)
    {
        if (amountIn == 0 || reserveIn == 0 || reserveOut == 0) {
            return 0;
        }
        uint256 amountInWithFee = amountIn * (BpsDenominator - SwapFeeBps);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * BpsDenominator + amountInWithFee;
        return numerator / denominator;
    }
    /// @notice True for a parcel nobody owns whose type is wild.
    /// @dev A jungle that has been unlocked and sold is an ordinary town from here
    ///      on: the owner check is what stops a bought parcel producing free goods.
    function isWildLand(uint256 landTokenId) public view returns (bool) {
        return LANDS.ownerOfOrZero(landTokenId) == address(0)
            && LANDS.landType(landTokenId) == LandTypeJungle;
    }

    /// @notice Tops a wild parcel back up from the time that has passed since it was
    ///         last stripped, then records the moment.
    /// @dev No keeper and no cron: the refill is computed on the way into a battle,
    ///      the same trick _claim uses for buildings. Goods created here are added to
    ///      totalExistedGood, because a wild parcel's balance counts on the other
    ///      side of the supply invariant just like any other land's.
    /**
     * @notice What a raider would actually find on a wild parcel right now.
     * @return goods Food and gold available to loot, after regrowth.
     * @return garrison Defenders standing, after regrowth.
     * @return raidableAt When msg.sender may attack this parcel again.
     *
     * @dev Regrowth only materialises inside a battle, so the stored balance of
     *      an untouched jungle reads as zero while it is in fact full. Anything
     *      showing a player what is out there has to apply the same arithmetic
     *      `_regenerateWild` does, which is what this mirrors — without it the
     *      UI would send armies at a parcel it believes is empty.
     */
    function previewWildLand(uint256 landTokenId)
        external
        view
        returns (uint256[2] memory goods, uint256 garrison, uint64 raidableAt)
    {
        if (!isWildLand(landTokenId)) {
            return (goods, 0, 0);
        }

        uint64 last = wildLastRegenAt[landTokenId];
        uint256 refillShare = last == 0
            ? WildGoodsPerType
            : ((block.timestamp - last) * WildGoodsPerType) / WildRegenPeriod;

        LandIdData storage landProps = landData[landTokenId];
        for (uint256 i = 0; i < 2; i++) {
            uint256 held = landProps.goodsBalance[i];
            uint256 total = held + refillShare;
            goods[i] = total > WildGoodsPerType ? WildGoodsPerType : total;
        }

        uint256 standing = landArmy[landTokenId][WildGarrisonType];
        uint256 grown = last == 0
            ? WildGarrisonSize
            : standing + ((block.timestamp - last) * WildGarrisonSize) / WildRegenPeriod;
        garrison = grown > WildGarrisonSize ? WildGarrisonSize : grown;

        raidableAt = wildRaidCooldown[landTokenId][msg.sender];
    }

    /// @notice The fixed shape of a wild parcel: full stock, full garrison, and
    ///         how long a full regrowth takes. Lets a client show what a jungle
    ///         is worth without hardcoding the contract's constants.
    function wildLandParameters()
        external
        pure
        returns (uint256 goodsPerType, uint256 garrisonSize, uint256 garrisonType, uint256 regenPeriod, uint256 raidCooldown)
    {
        return (WildGoodsPerType, WildGarrisonSize, WildGarrisonType, WildRegenPeriod, WildRaidCooldown);
    }

    function _regenerateWild(uint256 landTokenId) internal {
        if (!isWildLand(landTokenId)) {
            return;
        }

        uint64 last = wildLastRegenAt[landTokenId];
        // Never raided: it stands at full strength, so bank that as the baseline.
        uint256 refillShare = last == 0
            ? WildGoodsPerType
            : ((block.timestamp - last) * WildGoodsPerType) / WildRegenPeriod;

        LandIdData storage landProps = landData[landTokenId];
        uint256[2] memory restored;
        for (uint256 i = 0; i < 2; i++) {
            uint256 held = landProps.goodsBalance[i];
            if (held >= WildGoodsPerType) continue;
            uint256 room = WildGoodsPerType - held;
            uint256 added = refillShare > room ? room : refillShare;
            if (added == 0) continue;
            landProps.goodsBalance[i] += added;
            totalExistedGood[i] += added;
            restored[i] = added;
        }

        // The garrison comes back on the same clock.
        uint256 standing = landArmy[landTokenId][WildGarrisonType];
        uint256 garrisonAdded;
        if (standing < WildGarrisonSize) {
            uint256 gap = WildGarrisonSize - standing;
            garrisonAdded = last == 0
                ? gap
                : ((block.timestamp - last) * WildGarrisonSize) / WildRegenPeriod;
            if (garrisonAdded > gap) garrisonAdded = gap;
            if (garrisonAdded != 0) {
                landArmy[landTokenId][WildGarrisonType] = standing + garrisonAdded;
            }
        }

        wildLastRegenAt[landTokenId] = uint64(block.timestamp);
        // Wild parcels never draw a starter pack; they have their own supply.
        landStarted[landTokenId] = true;
        emit WildLandRegenerated(landTokenId, restored, garrisonAdded);
    }

    function dispatchArmy(uint256[] calldata warriorAmounts,uint256 from,  uint256 target) external whenNotPaused onlyLandOwner(from) {
        if (from == target) {
            revert SameLand();
        }
        _requireLandExists(target);
        // Checked again in war(): membership can change while an army is in
        // flight, and it is the arrival that does the damage.
        if (areAllies(from, target)) revert CannotAttackAlly();
        if (dispatchedArmies[from].length >= MaxDispatchedArmies) {
            revert TooManyDispatches();
        }
        uint256 typesLength = warriorTypes.length;
        require(warriorAmounts.length == typesLength, "Lengths does not match");
        if (isWildLand(target)) {
            if (block.timestamp < wildRaidCooldown[target][msg.sender]) {
                revert RaidTooSoon();
            }
            wildRaidCooldown[target][msg.sender] = uint64(block.timestamp + WildRaidCooldown);
        }

        (,uint256 remainingTime) =  Utils.calculateDistance(from, target, TravelSecondsPerUnit);
        // NOTE: a second `_spendGoods(from, [totalArmy, 0])` used to run here. It charged
        // the raw warrior count as wei of food and had no counterpart anywhere else in
        // the economy, so it was dropped. The dispatch cost below is the real one.
        uint256 totalArmyAmount;
        uint256 totalPower;
        uint256 totalHp;
        for (uint i = 0; i < typesLength;) {
            uint256 sentAmount = warriorAmounts[i];
            if (sentAmount > 0) {
                landArmy[from][i] -= sentAmount;
            }
            totalArmyAmount += sentAmount;
            totalPower += warriorTypes[i].attackPower * sentAmount;
            totalHp += warriorTypes[i].hp * sentAmount;
            unchecked { ++i; }
        }
        _spendGoods(from, [totalArmyAmount * DispatchCostPerWarrior,0]);
        dispatchedArmies[from].push(DispatchedArmy(warriorAmounts, totalArmyAmount, totalPower, totalHp, block.timestamp+remainingTime, target,[uint256(0),0], false, 100, block.timestamp));
        emit DispatchArmy(from, target, warriorAmounts, block.timestamp + remainingTime);
    }
    function retreat(uint256 landTokenId ,uint256 dispatchedArmyIndex) external whenNotPaused onlyLandOwner(landTokenId) {
        DispatchedArmy storage dArmy = dispatchedArmies[landTokenId][dispatchedArmyIndex];
        // No arrival requirement: an army that cannot turn back mid-march is not
        // retreating, it is just changing its mind after the fact.
        require(dArmy.isReturning == false, "Army is returning");

        // Cost is burned, not handed to the defender. Paying the target let two
        // co-operating accounts shuttle goods to each other for free, undercutting
        // the 5% that transferGoods charges for exactly that.
        _spendGoods(landTokenId, [uint256(0), RetreatCostPerWarrior * dArmy.totalArmyAmount]);

        // The march home is however far they already came, so turning back early is
        // cheap in time and turning back at the gates costs the full journey.
        (,uint256 fullTravel) = Utils.calculateDistance(landTokenId, dArmy.target, TravelSecondsPerUnit);
        uint256 travelled = block.timestamp - dArmy.departedAt;
        if (travelled > fullTravel) {
            travelled = fullTravel;
        }

        dArmy.isReturning = true;
        dArmy.remainedTime = block.timestamp + travelled;
        emit Retreat(landTokenId, dispatchedArmyIndex, dArmy.remainedTime);
    }
    function war(uint256 landTokenId ,uint256 dispatchedArmyIndex) external whenNotPaused onlyLandOwner(landTokenId) returns(bool, uint256, uint256){
        DispatchedArmy storage dArmy = dispatchedArmies[landTokenId][dispatchedArmyIndex];
        require(dArmy.isReturning == false, "Army is returning");
        require(dArmy.remainedTime <= block.timestamp , "Not arrived yet");
        _requireLandExists(dArmy.target);
        // Allied since the army set out: no battle. retreat() brings it home.
        if (areAllies(landTokenId, dArmy.target)) revert CannotAttackAlly();

        (bool success, uint256 attackerSurvivors, uint256 defenderSurvivors) =
            _resolveBattle(landTokenId, dArmy);

        emit Attack(landTokenId, dArmy.target, success, dArmy.lootedAmounts);
        return (success, attackerSurvivors, defenderSurvivors);
    }
    /// @dev Split out of `war` purely to keep the stack shallow enough to compile.
    function _resolveBattle(uint256 landTokenId, DispatchedArmy storage dArmy)
        internal
        returns (bool success, uint256 attackerSurvivors, uint256 defenderSurvivors)
    {
        uint256 target = dArmy.target;
        uint256 lootPercent;

        // A wild parcel refills on the way in, so the garrison the attacker meets
        // and the loot they can take are both current.
        _regenerateWild(target);

        {
            (,uint256 defenderPower, uint256 defenderHp,) = _getArmyInfo(target);
            defenderPower += defenderPower * getWallBonus(landData[target].wallLevel) / 1000;
            (success, attackerSurvivors, defenderSurvivors, lootPercent) =
                Utils.calculateWar(dArmy.totalPower, dArmy.totalHp, defenderPower, defenderHp);
        }

        _applyDefenderLosses(target, defenderSurvivors);

        dArmy.isReturning = true;
        dArmy.remainedArmybyPercent = attackerSurvivors;
        (,uint256 remainingTime) = Utils.calculateDistance(landTokenId, target, TravelSecondsPerUnit);
        dArmy.remainedTime = block.timestamp + remainingTime;

        if (success) {
            // Only survivors carry loot, and only up to what they can hold.
            uint256 survivingWarriors = (dArmy.totalArmyAmount * attackerSurvivors) / 100;
            dArmy.lootedAmounts = _removeDefenderGoods(
                target, lootPercent, survivingWarriors * BaseWarriorLootCapacity
            );
        }
    }
    /// @dev Reduces the garrison and reports what it actually cost, read back from
    ///      storage rather than recomputed, so the event can never disagree with it.
    function _applyDefenderLosses(uint256 target, uint256 survivorsPercent) internal {
        uint256[] memory before = _armyAsArray(target);
        _reduceBatchWarriorByPercent(survivorsPercent, target);

        uint256 typesLength = before.length;
        uint256[] memory losses = new uint256[](typesLength);
        for (uint i = 0; i < typesLength; i++) {
            losses[i] = before[i] - landArmy[target][i];
        }
        emit WarriorLosses(losses, target);
    }
    function joinDispatchedArmy(uint256 landTokenId, uint256 dispatchedArmyIndex) external whenNotPaused onlyLandOwner(landTokenId){
        DispatchedArmy[] storage armies = dispatchedArmies[landTokenId];
        DispatchedArmy storage dArmy = armies[dispatchedArmyIndex];
        require(dArmy.isReturning == true, "Army has not returned");
        require(dArmy.remainedTime <= block.timestamp, "Not home yet");
        require(dArmy.totalArmyAmount > 0, "Dispatched Army does not exist");

        // There has to be room at home. Dispatched warriors do not count against
        // the training camp while they are away, so without this check a player
        // could send an army out, recruit a full replacement, and then bring the
        // first one back to end up over capacity.
        uint256 returning;
        uint256 typesLength = warriorTypes.length;
        for (uint i = 0; i < typesLength; i++) {
            returning += (dArmy.amounts[i] * dArmy.remainedArmybyPercent) / 100;
        }
        (,,,uint256 currentArmy) = _getArmyInfo(landTokenId);
        if (currentArmy + returning > _armyCapacity(landTokenId)) {
            revert MaxCapacity();
        }

        // Survivors only, once. The old code called this AND then re-added the full
        // amounts in a second loop, duplicating between 100% and 200% of the army.
        _addEnteredBatchWarriorByPercent(dArmy.amounts, dArmy.remainedArmybyPercent, landTokenId);

        // Loot moves from transit into the land; the global counters already
        // included it while it was in transit, so they stay untouched here.
        uint256[2] memory loot = dArmy.lootedAmounts;
        LandIdData storage landProps = landData[landTokenId];
        landProps.goodsBalance[0] += loot[0];
        landProps.goodsBalance[1] += loot[1];

        emit ArmyReturned(landTokenId, dArmy.amounts, dArmy.remainedArmybyPercent, loot);

        // Real swap-and-pop. Assigning to the storage pointer only re-pointed a
        // local, so the consumed entry survived and could be claimed again while
        // the last entry was silently destroyed.
        uint256 lastIndex = armies.length - 1;
        if (dispatchedArmyIndex != lastIndex) {
            armies[dispatchedArmyIndex] = armies[lastIndex];
        }
        armies.pop();
    }
    /// @notice Stand warriors down, freeing garrison space.
    /// @dev Needed because nothing else ever reduces an army except losing a battle.
    ///      Without it, a player who recruits a full garrison while an army is away
    ///      can never bring that army home — joinDispatchedArmy would revert forever
    ///      and its loot would be stranded with it. Disbanding is also the only way
    ///      to replace cheap units with better ones once the camp is full.
    function disbandArmy(uint256 landTokenId, uint256[6] calldata amounts)
        external whenNotPaused onlyLandOwner(landTokenId)
    {
        uint256[] memory disbanded = new uint256[](6);
        uint256 total;
        for (uint i = 0; i < 6; i++) {
            uint256 amount = amounts[i];
            if (amount > 0) {
                // Reverts on its own if the land does not have that many.
                landArmy[landTokenId][i] -= amount;
                disbanded[i] = amount;
                total += amount;
            }
        }
        if (total == 0) {
            revert InsufficientArmy();
        }
        emit WarriorLosses(disbanded, landTokenId);
    }
    function recruit(uint256 landTokenId,uint256[6] calldata amounts) external whenNotPaused onlyLandOwner(landTokenId){
        uint256 barracksLevel = landData[landTokenId].barracksLevel;
        uint256 totalAmount;
        uint256 totalPrice;
        uint256 totalFood;

        // Phase 1 — price and validate. Nothing is written yet.
        for (uint i = 0; i < 6;) {
            uint256 orderedAmount = amounts[i];
            if (orderedAmount > 0) {
                if (barracksLevel < i + 1) {
                    revert BarracksLevelLowerThanWarrior();
                }
                totalAmount += orderedAmount;
                totalPrice += warriorTypes[i].price * orderedAmount;
                // Charge for the warriors of THIS type only. The old code multiplied
                // the running total, so untouched types were billed too.
                totalFood += BaseWarriorRequiredFood * orderedAmount * (i == 5 ? 2 : 1);
            }
            unchecked { ++i; }
        }

        // Phase 2 — capacity check against the garrison as it stands right now.
        // Dispatched armies deliberately do not count toward the cap; the room they
        // will need is checked when they come home instead.
        (,,,uint256 currentArmy) = _getArmyInfo(landTokenId);
        if (currentArmy + totalAmount > _armyCapacity(landTokenId)) {
            revert MaxCapacity();
        }

        // Phase 3 — commit.
        for (uint i = 0; i < 6;) {
            if (amounts[i] > 0) {
                _addWarrior(i, amounts[i], landTokenId);
            }
            unchecked { ++i; }
        }
        _spendGoods(landTokenId,[ totalFood, totalPrice]);

        uint256[] memory recruited = new uint256[](6);
        for (uint i = 0; i < 6;) {
            recruited[i] = amounts[i];
            unchecked { ++i; }
        }
        emit RecruitWarrior(recruited, landTokenId);
    }


















    /*  ******************************************************************************
                                        View functions  
    *******************************************************************************  */


    function getDispatchedArmies(uint256 landTokenId) view public returns (DispatchedArmy[] memory) {
        return dispatchedArmies[landTokenId] ;
    }
    function getRemainedDispatchTimestamp(uint256 landTokenId, uint256 dispatchIndex ) view public returns (uint256 remainedTimestamp) {
        uint256 time = dispatchedArmies[landTokenId][dispatchIndex].remainedTime;
        if (time > block.timestamp) {
            remainedTimestamp = (time - block.timestamp)/ 1 minutes;
        }
    }
    function getDispatchTime(uint256 from, uint256 to) pure public returns (uint256 estimatedTime) {
        (,uint256 time) = Utils.calculateDistance(from, to, TravelSecondsPerUnit);
       estimatedTime = time / 1 minutes ;
    }
    function _removeDefenderGoods(uint256 targetLandId, uint256 lootPercentage, uint256 maxCap) internal returns (uint256[2] memory lootAmounts) {
        for (uint i = 0; i < 2; i++) {
            uint256 lootAmount = landData[targetLandId].goodsBalance[i] * lootPercentage / 100;
            if (lootAmount > maxCap/2) {
                lootAmount = maxCap/2;
            }
            lootAmounts[i] = lootAmount;
            landData[targetLandId].goodsBalance[i] -= lootAmount;
        } 
    }
    function _armyAsArray(uint256 landTokenId) internal view returns (uint256[] memory amounts) {
        uint256 typesLength = warriorTypes.length;
        amounts = new uint256[](typesLength);
        for (uint i = 0; i < typesLength; i++) {
            amounts[i] = landArmy[landTokenId][i];
        }
    }
}
