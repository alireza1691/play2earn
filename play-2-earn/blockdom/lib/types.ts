
import { links } from "./data";

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
