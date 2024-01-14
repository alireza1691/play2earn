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

export const footerRow1 = [
  {
    name: "Contact",
    route: "",
  },
  {
    name: "Terms",
    route: "",
  },
  {
    name: "Privacy",
    route: "",
  },
];
export const footerRow2 = [
  {
    name: "Support",
    route: "",
  },
  {
    name: "About us",
    route: "",
  },
  {
    name: "FAQ",
    route: "",
  },
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
    title: "Mainnet & Community",
    description:
      "Launching the game on the mainnet. Expanding our community and attracting active users.",
    releaseTime: " Q2 2024",
  },
  {
    stepNum: 3,
    title: "Assets updates & Partnerships",
    description:
      "Updating game assets for fairness and coherence based on statistics, and forming partnerships to expand the platform as a prominent gaming destination.",
    releaseTime: "Q3 2024",
  },
  {
    stepNum: 4,
    title: "Heroes & Tournoments",
    description:
      "Introducing 1000 exclusive heroes for users to mint, attach to their land, and include in their armies. Additionally, planning tournaments to enhance excitement and provide diverse earning opportunities in the game.",
    releaseTime: "Q4 2024",
  },
  // {
  //   stepNum: 5,
  //   title: "Community",
  //   description: "Something else",
  //   releaseTime: " Q4 2024",
  // },
] as const;

export const questions = [
  {
    title: "What is Blockdom?",
    answer:
      " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo, totam ducimus vel fuga consectetur incidunt?",
    light: "bg-gradient-to-bl",
    position: "top-[-3rem]",
  },
  {
    title: "What is Blockdom?",
    answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
    light: "bg-gradient-to-l",
    position: "top-[-5rem]",
  },
  {
    title: "What is Blockdom?",
    answer:
      " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo",
    light: "bg-gradient-to-l",
    position: "top-[-13rem]",
  },
  {
    title: "What is Blockdom?",
    answer:
      " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet",
    light: "bg-gradient-to-tl",
    position: "top-[-15rem]",
  },
  {
    title: "What is Blockdom?",
    answer: " Lorem ipsum dolor, sit amet ",
    light: "bg-gradient-to-tl",
    position: "top-[-17rem]",
  },
];

export const landItems = [
  { name: "Townhall", imageUrl: "/buildings/townhallLv1.png"},
  { name: "Barracks", imageUrl: "/buildings/barracksLv1.png"},
  { name: "GoldMine", imageUrl: "/buildings/goldMineLv0.png" },
  { name: "Farm", imageUrl: "/buildings/farmLv0.png"},
  { name: "Wall", imageUrl: "/testWalls.svg" },
  {
    name: "TrainingCamp",
    imageUrl: "/buildings/trainingCampLv1.png",
    level: 2,
  },
] as const;
export const warriors = [
  "spearman",
  "maceman",
  "swordsman",
  "archer",
  "spearman",
  "knight",
];

export const defaultImageAddress = "/cards/LandCard.png";

export const baseBuildAmounts = {
  townHall: { gold: 100, food: 100 },
  barracks: { gold: 100, food: 100 },
  wall: { gold: 100, food: 100 },
  trainingCamp: { gold: 100, food: 100 },
  goldMine: { gold: 100, food: 100 },
  Farm: { gold: 99, food: 100 },
};

export const warriorsInfo = [
  { name: "Spearman", attPw: 20, defPw: 60, hp: 70, price: 7, foodCost: 3,image: "/warriors/Spearman.png" },
  { name: "Maceman", attPw: 45, defPw: 30, hp: 70, price: 8, foodCost: 3,image: "/warriors/Maceman.png"  },
  { name: "Swordsman", attPw: 60, defPw: 70, hp: 90, price: 15, foodCost: 3,image: "/warriors/Swordsman.png"  },
  { name: "Archer", attPw: 50, defPw: 50, hp: 70, price: 10, foodCost: 3,image: "/warriors/Archer.png"  },
  { name: "Shieldman", attPw: 45, defPw: 80, hp: 110, price: 22, foodCost: 3,image: "/warriors/Shieldman.png"  },
  { name: "Knight", attPw: 80, defPw: 60, hp: 100, price: 30, foodCost: 6,image: "/warriors/Knight.png"  },
];


export const baseTrainingCampCapacity = 50

export const battleLogTabs = [ "Ongoing", "Attacks", "Defenses"] as const;