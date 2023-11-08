
import { ethers } from '@/node_modules/ethers/lib.commonjs/index';
import { LandsABI, TownABI, landsV2, townV2 } from '@/blockchain/index';
import axios from "@/node_modules/axios/index"

const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
  );

export async function fetchEvents(params:type) {
    const landsInst = new ethers.Contract(landsV2, LandsABI, provider);
    const townInst = new ethers.Contract(townV2, TownABI, provider)
    let landsObjects = []
    let mintedLands = []
    try {
        const APIresponse = await axios.get(
          `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsV2}&apikey=${apiKey}`
        );
        return APIresponse
        // console.log("Fetched events");
        // console.log(response);
        // const events = response.data.result;
        // for (let index = 0; index < events.length; index++) {
        //   const topics = events[index].topics;
        //   // console.log(topics);
        //   if ( landBalance > 0 &&
        //     Array.isArray(topics) &&
        //     topics.length === 4 &&
        //     topics[2] == convertAddress(address.toLowerCase())
        //   ) {

        //     const commoditiesBalance = await townInst.getAssetsBal(
        //       parseInt(topics[3], 16)
        //     );
        //     const armyBal = await townInst.getArmy(parseInt(topics[3], 16))
        //     const landInfo = {armyBal,
        //       stone: ethers.utils.formatEther(
        //         commoditiesBalance[0].toString()
        //       ),
        //       wood: ethers.utils.formatEther(
        //         commoditiesBalance[1].toString()
        //       ),
        //       iron: ethers.utils.formatEther(
        //         commoditiesBalance[2].toString()
        //       ),
        //       food: ethers.utils.formatEther(
        //         commoditiesBalance[3].toString()
        //       ),
        //       gold: ethers.utils.formatEther(
        //         commoditiesBalance[4].toString()
        //       ),
        //       coordinate: parseInt(topics[3], 16),
        //     };
        //     console.log(landInfo);
        //     landsObjects.push(landInfo);
        //   }
        //   if (
        //     Array.isArray(topics) &&
        //     topics.length === 4 &&
        //     topics[1] ==
        //       "0x0000000000000000000000000000000000000000000000000000000000000000" &&
        //     100 <= parseInt(topics[3], 16) <= 200
        //   ) {
        //     let ownerAddress = topics[2].replace(
        //       "000000000000000000000000",
        //       ""
        //     );
        //     mintedLands.push({
        //       tokenId: parseInt(topics[3], 16).toString(),
        //       owner: ownerAddress,
        //     });
        //   }
        // }
        // console.log("Fetched and sorted data!");
        
      } catch (error) {
        console.error("Error fetching contract events:", error);
      }
    //   return landsObjects, mintedLands
} 