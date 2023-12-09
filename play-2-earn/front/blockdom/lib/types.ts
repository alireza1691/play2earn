import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];
export type parcelsViewHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
  selectedParcel: selectedParcelType;
  setSelectedParcel: React.Dispatch<React.SetStateAction<selectedParcelType>>;
};
export type selectedParcelType = {
  x: number;
  y: number;
};
