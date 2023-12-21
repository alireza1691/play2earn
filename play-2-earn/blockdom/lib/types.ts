
import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];
export type parcelsViewHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<SelectedLandType | null>>;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
  selectedParcel: selectedParcelType;
  isParcelSelected: boolean;
};
export type selectedParcelType = {
  x: number;
  y: number;
} ;
export type SelectedLandType = {
  coordinate: number,
  isMinted: boolean,
  owner: string
}
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
