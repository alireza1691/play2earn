import { ethers } from "ethers";
import { landsV2, townV2, BMTAddress, faucet } from "../Blockchain/Addresses";
import TownV2 from "../Blockchain/TownV2.json";
import LandsV2 from "../Blockchain/LandsV2.json";
import axios from "axios";
import { TownABI } from "../Blockchain";

const apiKey = "7XZM1XPQTW8WHHCW7KUY8BPUUSKPHPSE6T";
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
);

export async function apiCall() {
  try {
    const APIresponse = await axios.get(
      `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsV2}&apikey=${apiKey}`
    );

    const events = APIresponse.data.result;
    console.log("Fetched events :", events );
    return events;
  } catch (error) {
    console.log(error);
  }
}
export async function getMintedLandsFromEvents(events) {
  let mintedLands = [];
  for (let index = 0; index < events.length; index++) {
    if (events[index].topics !== undefined) {
      const topics = events[index].topics;
      if (
        Array.isArray(topics) &&
        topics.length === 4 &&
        topics[1] ==
          "0x0000000000000000000000000000000000000000000000000000000000000000" &&
        100 <= parseInt(topics[3], 16) <= 200
      ) {
        let ownerAddress = topics[2].replace("000000000000000000000000", "");
        mintedLands.push({
          tokenId: parseInt(topics[3], 16).toString(),
          owner: ownerAddress,
        });
      }
    }
  }
  console.log("Here are all minted lands:", mintedLands);
  return mintedLands;
}

export async function getConnectedAddressLands(events, address) {
  let landsObjects = [];
  for (let index = 0; index < events.length; index++) {
    const townInst = new ethers.Contract(townV2, TownABI, provider);
    const topics = events[index].topics;
    if (
      Array.isArray(topics) &&
      topics.length === 4 &&
      topics[2] == convertAddress(address.toLowerCase())
    ) {
      const commoditiesBalance = await townInst.getAssetsBal(
        parseInt(topics[3], 16)
      );
      const armyBal = await townInst.getArmy(parseInt(topics[3], 16));
      const landInfo = {
        armyBal,
        stone: ethers.utils.formatEther(commoditiesBalance[0].toString()),
        wood: ethers.utils.formatEther(commoditiesBalance[1].toString()),
        iron: ethers.utils.formatEther(commoditiesBalance[2].toString()),
        food: ethers.utils.formatEther(commoditiesBalance[3].toString()),
        gold: ethers.utils.formatEther(commoditiesBalance[4].toString()),
        coordinate: parseInt(topics[3], 16),
      };
      console.log(landInfo);
      landsObjects.push(landInfo);
    }
  }
  console.log("Connected address lands:", landsObjects);
  return landsObjects;
}
export async function fetchLandsData(address) {
  const landsInst = new ethers.Contract(landsV2, LandsV2.abi, provider);
  const townInst = new ethers.Contract(townV2, TownV2.abi, provider);
  const landBalance = await landsInst.balanceOf(address);
  let landsObjects = [];
  let mintedLands = [];
  try {
    const APIresponse = await axios.get(
      `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsV2}&apikey=${apiKey}`
    );
    // return APIresponse
    console.log("Fetched events");
    console.log(APIresponse);
    const events = APIresponse.data.result;
    for (let index = 0; index < events.length; index++) {
      const topics = events[index].topics;
      // console.log(topics);
      if (
        landBalance > 0 &&
        Array.isArray(topics) &&
        topics.length === 4 &&
        topics[2] == convertAddress(address.toLowerCase())
      ) {
        const commoditiesBalance = await townInst.getAssetsBal(
          parseInt(topics[3], 16)
        );
        const armyBal = await townInst.getArmy(parseInt(topics[3], 16));
        const landInfo = {
          armyBal,
          stone: ethers.utils.formatEther(commoditiesBalance[0].toString()),
          wood: ethers.utils.formatEther(commoditiesBalance[1].toString()),
          iron: ethers.utils.formatEther(commoditiesBalance[2].toString()),
          food: ethers.utils.formatEther(commoditiesBalance[3].toString()),
          gold: ethers.utils.formatEther(commoditiesBalance[4].toString()),
          coordinate: parseInt(topics[3], 16),
        };
        console.log(landInfo);
        landsObjects.push(landInfo);
      }
    }
    console.log("Fetched and sorted data!");
  } catch (error) {
    console.error("Error fetching contract events:", error);
  }
  return landsObjects, mintedLands;
}

export async function getWarriorTypes() {
  const townInst = new ethers.Contract(townV2, TownABI, provider);
  const existedWarriors = await townInst.getWarriorTypes()
  console.log("Here is warrior types:", existedWarriors);
  return existedWarriors
}

export async function fetchTownsData(params) {}

const convertAddress = (input) => {
  if (input.length > 3) {
    const prefix = input.substring(0, 2);
    const suffix = input.substring(2);
    const zeros = "000000000000000000000000";
    return prefix + zeros + suffix;
  }
};

