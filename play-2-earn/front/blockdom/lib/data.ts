
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline'
import {  PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'

export const navDropdownItems = [
  { name: 'Documentation', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Contact', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Terms', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Support', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'About us', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]as const

export const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
  ] as const

export const links = [
    {
        name: "Home",
        hash: "#home",
        icon: "/icons/home.svg",
        darkIcon: "/icons/homeBlack.svg"
    },
    {
        name: "Get strated",
        hash: "#starter",
        icon: "/icons/starter.svg",
        darkIcon: "/icons/starterBlack.svg"
    },
    {
        name: "Roadmap",
        hash: "#roadmap",
        icon: "/icons/roadmap.svg",
        darkIcon: "/icons/roadmapBlack.svg"
    },
    {
        name: "F Questions",
        hash: "#questions",
        icon: "/icons/FAQ.svg",
        darkIcon: "/icons/FAQBlack.svg"
    },
] as const;

export const footerRow1 = [
  {
    name:"Contact",
    route: "",
  },
  {
    name:"Terms",
    route: "",
  },
  {
    name:"Privacy",
    route: "",
  },
]
export const footerRow2 = [
  {
    name:"Support",
    route: "",
  },
  {
    name:"About us",
    route: "",
  },
  {
    name:"FAQ",
    route: "",
  },
]

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
      releaseTime: "Q2 2024"
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
        answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo, totam ducimus vel fuga consectetur incidunt?",
        light: 'bg-gradient-to-bl'
    },
    {
        title: "What is Blockdom?",
        answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
        light: 'bg-gradient-to-l'
    },
    {
        title: "What is Blockdom?",
        answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet, maiores vero nulla nemo",
        light: 'bg-gradient-to-l'
    },
    {
        title: "What is Blockdom?",
        answer: " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam suscipit eos minus officiis dignissimos itaque harum minima quod, eius amet",
        light: 'bg-gradient-to-tl'
    },
    {
        title: "What is Blockdom?",
        answer: " Lorem ipsum dolor, sit amet ",
        light: 'bg-gradient-to-tl'
    },
  ] 