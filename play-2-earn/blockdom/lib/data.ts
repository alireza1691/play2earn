

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
      title: "Luanch",
      description: "Something",
      releaseTime: "Q4 2023",
    },
    {
      stepNum: 2,
      title: "Community",
      description: "Something else",
      releaseTime: " Q1 2024",
    },
    {
      stepNum: 3,
      title: "Community",
      description: "Something else",
      releaseTime: "Q2 2024",
    },
    {
      stepNum: 4,
      title: "Community",
      description: "Something else",
      releaseTime: "Q3 2024",
    },
    {
      stepNum: 5,
      title: "Community",
      description: "Something else",
      releaseTime: " Q4 2024",
    },
  ] as const;
  
  export const questions = [
    {
      title: "What is Blockdom?",
      answer:
        " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo, totam ducimus vel fuga consectetur incidunt?",
      light: "bg-gradient-to-bl",
      position:"top-[-3rem]"
    },
    {
      title: "What is Blockdom?",
      answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      light: "bg-gradient-to-l",
      position:"top-[-5rem]"
    },
    {
      title: "What is Blockdom?",
      answer:
        " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo",
      light: "bg-gradient-to-l",
      position:"top-[-13rem]"
    },
    {
      title: "What is Blockdom?",
      answer:
        " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet",
      light: "bg-gradient-to-tl",
      position:"top-[-15rem]"
    },
    {
      title: "What is Blockdom?",
      answer: " Lorem ipsum dolor, sit amet ",
      light: "bg-gradient-to-tl",
      position:"top-[-17rem]"
    },
  ];
  
  export const landItems = [
    { name: "Townhall", imageUrl: "/townItems/townhall.png" ,level:2},
    { name: "Barracks", imageUrl: "/testBarracks.svg" ,level:2},
    { name: "GoldMine", imageUrl: "/townItems/goldMine.png" ,level:2},
    { name: "Farm", imageUrl: "/townItems/farm.png" ,level:2},
    { name: "Wall", imageUrl: "/testWalls.svg" ,level:2},
    { name: "TrainingCamp", imageUrl: "/testEmptyBuilding.svg" ,level:2},
  ] as const;
  export const warriors = ["spearman","maceman","swordsman","archer","spearman","knight"]