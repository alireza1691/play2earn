import { BigNumber, BigNumberish, Contract, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { townABI } from "./instances";
import {
  ApiDataResultType,
  MintedLand,
  MintedResourceBuildingType,
  selectedParcelType,
  WarLogType,
} from "./types";

export const inViewParcels = (
  selectedParcel: selectedParcelType
): selectedParcelType[] => {
  let parcelsArray = [];

  parcelsArray[0] = {
    ...selectedParcel,
    x: selectedParcel.x - 10,
    y: selectedParcel.y + 10,
  };
  parcelsArray[1] = { ...selectedParcel, y: selectedParcel.y + 10 };
  parcelsArray[2] = {
    ...selectedParcel,
    x: selectedParcel.x + 10,
    y: selectedParcel.y + 10,
  };
  parcelsArray[3] = { ...selectedParcel, x: selectedParcel.x - 10 };
  parcelsArray[4] = selectedParcel;
  parcelsArray[5] = { ...selectedParcel, x: selectedParcel.x + 10 };
  parcelsArray[6] = {
    ...selectedParcel,
    x: selectedParcel.x - 10,
    y: selectedParcel.y - 10,
  };
  parcelsArray[7] = { ...selectedParcel, y: selectedParcel.y - 10 };
  parcelsArray[8] = {
    ...selectedParcel,
    x: selectedParcel.x + 10,
    y: selectedParcel.y - 10,
  };

  return parcelsArray;
};

export const parcelLands = (xFrom: number, yFrom: number) => {
  let items = [];
  for (let y = yFrom + 9; y > yFrom - 1; y--) {
    for (let x = xFrom; x < xFrom + 10; x++) {
      items.push(Number(x.toString() + y.toString()));
    }
  }
  return items;
};

export const allLands = () => {
  let parcelLandsArray = [];
  for (let y = 9; y > -1; y--) {
    for (let x = 0; x < 10; x++) {
      const item = parcelLands((x + 10) * 10, (y + 10) * 10);
      parcelLandsArray.push(item);
    }
  }
  return parcelLandsArray;
};

export const getParcelStartIndexes = () => {
  let indexes: selectedParcelType[] = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const item = { x: (x + 10) * 10, y: (y + 10) * 10 };
      indexes.push(item);
    }
  }
  return indexes;
};

export const separatedCoordinate = (coordinate: string) => {
  const middleIndex = Math.floor(coordinate.length / 2);
  const result =
    coordinate.slice(0, middleIndex) + " - " + coordinate.slice(middleIndex);
  return result;
};

export const coordinatesObject = (coordinates: number) => {
  const xCoordinate = Math.floor(coordinates / 1000); // 123
  const yCoordinate = coordinates % 1000;
  return { x: xCoordinate, y: yCoordinate - 9 };
};

export const landObjectFromTokenId = (coordinates: number) => {
  const xCoordinate = Math.floor(coordinates / 1000); // 123
  const yCoordinate = coordinates % 1000;
  return { x: xCoordinate, y: yCoordinate };
};

export function getMintedLandsFromEvents(events: ApiDataResultType) {
  let mintedLands = [];
  if (events?.length > 1) {
    for (let index = 0; index < events.length; index++) {
      const topics = events[index].topics;

      if (
        Array.isArray(topics) &&
        topics.length === 4 &&
        topics[1] ==
          "0x0000000000000000000000000000000000000000000000000000000000000000" &&
        100100 <= parseInt(topics[3], 16) &&
        parseInt(topics[3], 16) <= 199199
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

export function getWarLogsFromEvents(events: ApiDataResultType) {
  let warLogArray: WarLogType[] = [];
  if (events.length > 0) {
    const iface = new ethers.utils.Interface(townABI);
    const eventSig = iface.getEventTopic("Attack");
    for (let index = 0; index < events.length; index++) {
      if (events[index].topics[0] == eventSig) {
        const log = events[index].topics;
      
        const lootedAmount = ethers.utils.defaultAbiCoder.decode(
          ["uint256[2]"],
          events[index].data
        )[0];

        const logObj = {
          from: parseInt(log[1]),
          to: parseInt(log[2]),
          success: parseInt(log[3]) == 1,
          lootedAmounts: [
            Number(formatEther(lootedAmount[0])),
            Number(formatEther(lootedAmount[1])),
          ],
        };
        warLogArray.push(logObj);
      }
    }
  }

  return warLogArray;
}

export function filterLandLogs(logs:WarLogType[], landTokenId: number) {
  let attackLogs: WarLogType[] = []
  let defenseLogs: WarLogType[] = []
  for (let index = 0; index < logs.length; index++) {
    if (logs[index].from == landTokenId) {
      attackLogs.push(logs[index])
    }
    if (logs[index].to == landTokenId) {
      defenseLogs.push(logs[index])
    }
  }
  return {attackLogs, defenseLogs}
}
export function getResBuildingsFromEvents(events: ApiDataResultType) {
  let mintedBuildings: MintedResourceBuildingType[] = [];
  if (events.length > 0) {
    const iface = new ethers.utils.Interface(townABI);
    const eventSig = iface.getEventTopic("Build");
    const upgradeEventSignature = iface.getEventTopic("Upgrade");
    const upgradedBuildings = getUpgradeEvents(events, upgradeEventSignature);

    for (let index = 0; index < events.length; index++) {
      if (eventSig === events[index].topics[0]) {
        const buildingTypeIndex = ethers.utils.defaultAbiCoder.decode(
          ["uint256"],
          events[index].data
        )[0];

        const upgradedEventsOfThisBuilding = upgradedBuildings.filter(
          (tokenId) => tokenId === parseInt(events[index].topics[2])
        );
        const mintedBuilding = {
          land: parseInt(events[index].topics[2]),
          tokenId: parseInt(events[index].topics[1]),
          type: Number(buildingTypeIndex),
          level: upgradedEventsOfThisBuilding.length + 1,
        }; /// ***** Repalce type here
        mintedBuildings.push(mintedBuilding);
      }
    }
  }

  return mintedBuildings;
}

function getUpgradeEvents(events: ApiDataResultType, signature: string) {
  let upgradedBuildingsByTokenId: number[] = [];
  if (events.length > 0) {
    for (let index = 0; index < events.length; index++) {
      if (events[index].topics[0] == signature) {
        upgradedBuildingsByTokenId.push(parseInt(events[index].topics[1]));
      }
    }
  }
  return upgradedBuildingsByTokenId;
}

export function getOwnedBuildings(
  mintedBuildings: MintedResourceBuildingType[],
  inViewLand: number
) {
  const ownedLands = mintedBuildings.filter(
    (token) => token.land === inViewLand
  );
  const farms = ownedLands.filter((token) => token.type === 0);
  const goldMines = ownedLands.filter((token) => token.type === 1);
  return { farms: farms, goldMines: goldMines };
}

export function getOwnedLands(
  mintedLands: MintedLand[],
  connectedAddress: string
) {
  const ownedLands = mintedLands.filter(
    (token) => token.owner.toUpperCase() === connectedAddress.toUpperCase()
  );
  return ownedLands;
}

export const formattedNumber = (number: BigNumberish) => {
  const numberAsString = formatEther(number);
  const numebrAsNumber = Number(numberAsString);
  const fixedNumber = numebrAsNumber.toFixed(1);
  return fixedNumber;
};

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const farmImage = (level: number) => {
  return `/buildings/farmLv${level}.png`;
};
export const goldMineImage = (level: number) => {
  return `/buildings/goldMineLv${level}.png`;
};
export const townHallImage = (level: number) => {
  return `/buildings/townHallLv${level}.png`;
};
export const barracksImage = (level: number) => {
  return `/buildings/barracksLv${level}.png`;
};
export const trainingCampImage = (level: number) => {
  return `/buildings/armyCampLv${level}.png`;
};
export const marketImage = (level: number) => {
  return `/buildings/marketLv${level}.png`;
};
export const wareHouseImage = (level: number) => {
  return `/buildings/wareHouseLv${level}.png`;
};
export const wallImage = (level: number) => {
  return `/buildings/walls/Full${level}.png`;
};
export const gateImage = (level: number) => {
  return `/buildings/walls/Gate${level}.png`;
};


export function shortenAddress(address: string) {
  const firstFour = address.slice(0, 4);
  const lastFour = address.slice(-4);
  return `${firstFour}...${lastFour}`;
}


export const getOwnerFromEvents = (tokenId: number, lands:MintedLand[]): string => {
  let isPresent: boolean;
  let ownerAddress: string = zeroAddress;
  if (!lands) {
    isPresent = false;
  } else {
    isPresent = lands.some(
      (item) => item.tokenId === tokenId.toString()
    );
    if (isPresent) {
      const land = lands.find(
        (item) => item.tokenId === tokenId.toString()
      );
      ownerAddress = land?.owner ?? ownerAddress;
    }
  }
  return ownerAddress;
};

export const tokenIdAsString = (tokenIdAsNumber:number ) => {
  const middleIndex = Math.ceil(tokenIdAsNumber.toString().length / 2);
  const formattedString = tokenIdAsNumber.toString().slice(0, middleIndex) + " " + tokenIdAsNumber.toString().slice(middleIndex);
  return formattedString
}