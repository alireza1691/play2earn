import TownV2 from "./TownV2.json"
import LandsV2 from "./LandsV2.json"
import Faucet from "./Faucet.json"
import BMT from "./BMT.json"
import { townV2, landsV2, faucet, BMTAddress } from "./Addresses"

const TownABI = TownV2.abi
const LandsABI = LandsV2.abi
const FaucetABI = Faucet.abi
const BMTABI = BMT.abi

export {
    TownABI, LandsABI, FaucetABI, BMTABI, townV2, landsV2, faucet, BMTAddress 
}