import { townV2, landsV2, BMTAddress, faucet } from "./Addresses";
import TownV2 from "./TownV2.json";
import LandsV2 from "./LandsV2.json";
import Faucet from "./Faucet.json";
import BMT from "./BMT.json";

const TownABI = TownV2.abi
const LandsABI = LandsV2.abi
const FaucetABI = Faucet.abi
const BMTABI = BMT.abi

export {
  townV2,
  landsV2,
  BMTAddress,
  faucet,
  TownABI,
  LandsABI,
  FaucetABI,
  BMTABI,
};
