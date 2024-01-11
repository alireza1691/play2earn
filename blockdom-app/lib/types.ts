

import { BigNumber, BigNumberish } from "ethers";
import { links } from "./data";

export type selectedParcelType = {
  x: number;
  y: number;
};

export type SectionName = (typeof links)[number]["name"];
// export type parcelsViewHookProps = {
//   setSelectedLand: React.Dispatch<React.SetStateAction<SelectedLandType | null>>;
//   setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
//   selectedParcel: SelectedParcelType;
//   isParcelSelected: boolean;
// };
export type SelectedParcelType = {
  x: number;
  y: number;
} | null ;
export type SelectedLandType = {
  coordinate: number,
  isMinted: boolean,
  owner: string
} | null
export type ApiDataResultType ={
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  timeStamp: string;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}[];


export type MintedLand = {
  tokenId: string,
  owner: string,
}

export type APICallData = {
  message: string,
  result: ApiDataResultType,
  status: string
}

// export type InViewLandType = {
//   tokenId : number,
//   townhallLvl : number,
//   barracksLvl : number,
//   wallLvl : number,
//   trainingCampLvl : number,
//   buildedResourceBuildings: BigNumber[],
//   goodsBalance: number[]
// }
export type InViewLandType = {
  tokenId : number,
  townhallLvl : BigNumberish,
  barracksLvl : BigNumberish,
  wallLvl : BigNumberish,
  trainingCampLvl : BigNumberish,
  buildedResourceBuildings: BigNumberish[],
  goodsBalance: [BigNumberish,BigNumberish]
  remainedBuildTime: BigNumberish
  army: BigNumberish[]
}
export type landDataResType = {
barracksLevel:BigNumberish,
buildedResourceBuildings:BigNumberish[],
goodsBalance:[BigNumberish, BigNumberish],
latestBuildTimeStamp: BigNumberish,
townhallLevel: BigNumberish,
trainingCampLevel:BigNumberish,
wallLevel:BigNumberish
}

export type MintedResourceBuildingType = {
  type: number,
  tokenId: number,
  land: number,
  level: number
}

export type ArmyType = {
  attackPower: number,
  defensePower:number,
  hp: number,
  requiredGold: number,
  requiredFood:number,
}

export type DispatchedArmy = {
  amounts: BigNumber[];
  remainedTime: BigNumber;
  target: BigNumber;
  lootedAmounts: [BigNumber, BigNumber];
  isReturning: boolean;
  remainedArmybyPercent: BigNumber;
};
