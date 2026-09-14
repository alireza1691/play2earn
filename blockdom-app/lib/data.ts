import { DEFAULT_TESTNET, routeFor } from "./deployments";
export const links = [
  {
    name: "Home",
    hash: "#home",
    icon: "/svgs/icons/home.svg",
    darkIcon: "/svgs/icons/homeBlack.svg",
  },
  {
    name: "Get strated",
    hash: "#starter",
    icon: "/svgs/icons/starter.svg",
    darkIcon: "/svgs/icons/starterBlack.svg",
  },
  {
    name: "Roadmap",
    hash: "#roadmap",
    icon: "/svgs/icons/roadmap.svg",
    darkIcon: "/svgs/icons/roadmapBlack.svg",
  },
  {
    name: "F Questions",
    hash: "#questions",
    icon: "/svgs/icons/FAQ.svg",
    darkIcon: "/svgs/icons/FAQBlack.svg",
  },
] as const;

/**
 * Footer columns. These were Contact/Terms/Privacy/Support/About us/FAQ with an
 * empty route each and no anchor to click — placeholders for pages that do not
 * exist. They now point at the landing sections and game routes that do.
 */
export const footerRow1 = [
  {
    name: "Get started",
    route: "#starter",
  },
  {
    name: "Roadmap",
    route: "#roadmap",
  },
  {
    name: "FAQ",
    route: "#questions",
  },
];
// Footer links into the game. Built from DEFAULT_TESTNET rather than written
// out, so they follow the front door wherever it points.
export const footerRow2 = [
  { name: "Explore the map", route: routeFor(DEFAULT_TESTNET, "explore") },
  { name: "My land", route: routeFor(DEFAULT_TESTNET, "myLand") },
  { name: "Battle log", route: routeFor(DEFAULT_TESTNET, "battleLog") },
];

export const roadmapSteps = [
  {
    stepNum: 1,
    title: "Launch",
    description:
      "Launching the game on the testnet, lands presale on mainnet and engaging the community.",
    releaseTime: "Q1 2024",
  },
  {
    stepNum: 2,
    title: "Mainnet & Asset updates",
    description:
      "Launching the game on the mainnet and updating game assets for fairness and coherence based on statistics,. Expanding our community and attracting active users.",
    releaseTime: " Q2 2024",
  },
  {
    stepNum: 3,
    title: "Heroes & Partnerships",
    description:
      "Introducing 1000 exclusive heroes for users to mint, attach to their land, and include in their armies. Forming partnerships to expand the platform as a prominent gaming destination.",
    releaseTime: "Q3 2024",
  },
  {
    stepNum: 4,
    title: "Application & tournaments",
    description:
      "Launching both IOS & andriod applications, aditionally Planning tournaments to enhance excitement and provide diverse earning opportunities in the game.",
    releaseTime: "Q4 2024",
  },
  // {
  //   stepNum: 5,
  //   title: "Community",
  //   description: "Something else",
  //   releaseTime: " Q4 2024",
  // },
] as const;

/**
 * Landing page FAQ. Every answer describes behaviour that is actually in the
 * contracts (back-end/src/Town.sol and LandsV3.sol) — the numbers here are the
 * constants those contracts run on, so they need updating together.
 */
export const questions = [
  {
    title: "What is Plotwar?",
    answer:
      "Plotwar is an on-chain strategy game. You mint a plot of land as an NFT, build a town on it, produce food and gold, raise an army, and turn what you produce into PLOT — the game's token. Every move is a transaction: there is no Plotwar server holding your progress, and the client rebuilds what you see from the contracts themselves.",
    position: "top-[-3rem]",
  },
  {
    title: "How do I start?",
    answer:
      "Connect your wallet, open the map and pick an unclaimed plot. Minting it gives you the land NFT, and everything else — town hall, farms, gold mines, barracks, your army — attaches to that land. Start on the testnet, where lands cost test ETH and the in-game faucet hands you PLOT to experiment with.",
    position: "top-[-5rem]",
  },
  {
    title: "What exactly is a land?",
    answer:
      "An ERC-721 token. The world is a 100x100 grid, so there are 10,000 lands and no more. The token id is the plot's coordinates joined together — the land at x=101, y=101 is token 101101 — which means your position on the map is part of the asset itself, and distance to your neighbours is something the contracts can compute.",
    position: "top-[-13rem]",
  },
  {
    title: "How do I earn?",
    answer:
      "Farms produce food and gold mines produce gold, both accruing over time until you claim them. Goods pay for buildings and troops, swap into each other, or sell for PLOT. PLOT you earn sits in an in-game balance you can withdraw to your own wallet whenever you like.",
    position: "top-[-15rem]",
  },
  {
    title: "What is PLOT?",
    answer:
      "Plotwar Token, the ERC-20 the economy runs on: it buys goods and recruits warriors. Several actions burn part of it — swapping one good for another costs 5%, withdrawing to your wallet costs 10% — so the supply drains as the game is played instead of only ever growing. That is what keeps the rewards worth something over a long game.",
    position: "top-[-17rem]",
  },
  {
    title: "What can I build on my land?",
    answer:
      "A town hall, barracks, walls and a training camp, plus up to four farms and four gold mines. The town hall gates all of it: nothing else may pass its level, and how many farms or mines you can run is capped by it too. Every level costs food and gold and ties up your land's single worker — two hours for a first barracks, six for a first town hall, longer at each level after — so you build one thing at a time, or spend gold to finish it now.",
    position: "top-[-19rem]",
  },
  {
    title: "How does combat work?",
    answer:
      "Recruit warriors at your barracks — six types, each with its own attack, defence, hit points and food upkeep — then dispatch them at another player's land. They travel in real time based on the distance between the two plots, so an attack is visible before it lands. When the army arrives you resolve the battle: the defender's walls add to their defence, and a winning army loots food and gold up to what its surviving warriors can carry. You can also recall an army mid-march for a fee.",
    position: "top-[-21rem]",
  },
  {
    title: "Testnet or mainnet?",
    answer:
      "The testnet runs on Sepolia and is free — mint with test ETH and take PLOT from the in-game faucet. The mainnet runs on Polygon, where lands and PLOT carry real value. They are two separate worlds with separate contracts; the /testnet/ in the URL is what decides which one you are playing.",
    position: "top-[-23rem]",
  },
  {
    title: "Do I actually own my land?",
    answer:
      "Yes. The land is an ERC-721 in your wallet and PLOT is an ERC-20 in your wallet, both transferable without asking us. Your town's state lives in the Town contract keyed to your land's token id. There is no off-chain database that could be switched off and take your kingdom with it.",
    position: "top-[-25rem]",
  },
];

export const landItems = [
  { name: "Townhall"},
  { name: "Barracks" },
  { name: "GoldMine" },
  { name: "Farm"},
  { name: "Wall"},
  {
    name: "TrainingCamp",
    imageUrl: "/buildings/armyCampLv1.png",
  },
] as const;
/**
 * How each building is written in the interface.
 *
 * `landItems` carries the identifiers the contract calls are keyed on, which
 * are not what a player should read — "GoldMine" and "TrainingCamp" are code,
 * not words.
 */
export const buildingDisplayNames: Record<string, string> = {
  Townhall: "Town hall",
  Barracks: "Barracks",
  GoldMine: "Gold mine",
  Farm: "Farm",
  Wall: "Walls",
  TrainingCamp: "Training camp",
};

/** Same order as warriorsInfo. Index 4 used to repeat "spearman". */
export const warriors = [
  "maceman",
  "spearman",
  "swordsman",
  "archer",
  "shieldman",
  "knight",
];

export const defaultImageAddress = "/cards/LandCard.png";

/**
 * What each building costs at level 0, straight from the contracts.
 *
 * These were all 100/100 placeholders (and Farm 99), so every cost the build
 * window showed was wrong — a training camp upgrade was quoted at 100/100 and
 * actually charged 400 food and 100 gold. v3 and v4 carry identical figures,
 * so one table serves both:
 *
 *   Town.sol            TownhallFood/Gold, BarracksFood/Gold, WallFood/Gold,
 *                       TrainingCampFood/Gold
 *   resourceBuildings   Farm and Gold mine, pushed in the constructor
 */
export const baseBuildAmounts = {
  townHall: { food: 300, gold: 300 },
  barracks: { food: 150, gold: 200 },
  wall: { food: 50, gold: 175 },
  trainingCamp: { food: 200, gold: 50 },
  Farm: { food: 75, gold: 125 },
  goldMine: { food: 125, gold: 75 },
};

export type BuildCost = { food: number; gold: number };

/**
 * The cost of taking a building from `currentLevel` to the next one.
 *
 * Mirrors Town.getRequiredGoods: `base * 2 ** currentLevel`. The build window
 * used to print the base figure whatever the level, so the quote was only ever
 * right for a building that had not been built yet.
 */
export const requiredGoods = (
  base: BuildCost,
  currentLevel: number
): BuildCost => ({
  food: base.food * 2 ** currentLevel,
  gold: base.gold * 2 ** currentLevel,
});

/** Town.BaseGoodCapacityOfBuilding — what a level 1 building holds. */
export const baseBuildingCapacity = 40;

/**
 * Goods a farm or gold mine can hold before it stops producing.
 *
 * `Town.getCurrentRevenue` clamps what has accrued to this figure, so anything
 * a full building would have produced is simply never created — which is the
 * whole reason the town screen badges one.
 *
 * v4 doubles the cap with each level, matching production (`cap = base *
 * 2 ** (level - 1)`). v3 scales it linearly (`base * level`), so from level 5
 * up most of a v3 building's output was thrown away; the two deployments have
 * to be quoted differently.
 */
export const buildingCapacity = (level: number, v4: boolean): number => {
  if (level < 1) return 0;
  return v4
    ? baseBuildingCapacity * 2 ** (level - 1)
    : baseBuildingCapacity * level;
};

/**
 * The six warrior types, **in the order the contract stores them**.
 *
 * Every call keys off the index: `recruit` takes six amounts positionally,
 * `getArmy` returns six counts, and `dispatchArmy` sends six. This list had
 * Spearman and Maceman the other way round and their two prices swapped
 * between them, so picking "Spearman" in the barracks recruited Macemen, and
 * the army you owned was labelled wrong wherever it was shown. Knight's attack
 * was 80 here and 90 on chain.
 *
 * Source: the warriorTypes.push calls in Town.sol's constructor.
 * Food is BaseWarriorRequiredFood (3), doubled for the Knight.
 */
export const warriorsInfo = [
  {
    name: "Maceman",
    attPw: 45,
    defPw: 30,
    hp: 70,
    price: 7,
    foodCost: 3,
    image: "/warriors/Maceman.png",
  },
  {
    name: "Spearman",
    attPw: 20,
    defPw: 60,
    hp: 70,
    price: 8,
    foodCost: 3,
    image: "/warriors/Spearman.png",
  },
  {
    name: "Swordsman",
    attPw: 60,
    defPw: 70,
    hp: 90,
    price: 15,
    foodCost: 3,
    image: "/warriors/Swordsman.png",
  },
  {
    name: "Archer",
    attPw: 50,
    defPw: 50,
    hp: 70,
    price: 10,
    foodCost: 3,
    image: "/warriors/Archer.png",
  },
  {
    name: "Shieldman",
    attPw: 45,
    defPw: 80,
    hp: 110,
    price: 22,
    foodCost: 3,
    image: "/warriors/Shieldman.png",
  },
  {
    name: "Knight",
    attPw: 90,
    defPw: 60,
    hp: 100,
    price: 30,
    foodCost: 6,
    image: "/warriors/Knight.png",
  },
];

/**
 * How many warriors a land may keep standing.
 *
 * Town.sol gates recruit on `trainingCampLevel * BaseArmyCapacity`, falling
 * back to 10 for a land with no camp at all. v3 and v4 agree. The barracks
 * modal used to derive this from the *barracks* level and raise it to a power,
 * which produced a limit the contract had never heard of.
 */
export const armyCapacity = (trainingCampLevel: number): number =>
  trainingCampLevel > 0 ? trainingCampLevel * baseTrainingCampCapacity : 10;

export const baseTrainingCampCapacity = 50;

export const battleLogTabs = ["Ongoing", "Attacks", "Defenses"] as const;

export const townHallUnlocks = [
  ["Spearman", "+ Gold mine", "+ Farm", "+ Upgrade level"],
  ["Maceman", "+ Gold mine", "+ Farm", "+ Upgrade level"],
  ["Swordsman", "+ Gold mine", "+ Farm", "+ Upgrade level"],
  ["Archer", "+ Gold mine", "+ Farm", "+ Upgrade level"],
  ["Shieldman", "+ Gold mine", "+ Farm", "+ Upgrade level"],
  ["Knight", "+ Gold mine", "+ Farm", "+ Upgrade level"],
];
