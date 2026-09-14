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

/**
 * The span of coordinates a parcel covers, as the two corners a player reads
 * off the map.
 *
 * A parcel is the 10x10 block starting at its origin, so `{x: 100, y: 100}`
 * holds every land from 100-100 up to 109-109. The explore screen showed only
 * the origin, which named the parcel without saying how far it reached.
 *
 * Passing null gives the whole world, which is what the unzoomed map shows.
 */
export const parcelCoordRange = (
  parcel: { x: number; y: number } | null
): { from: string; to: string } =>
  parcel
    ? { from: `${parcel.x}-${parcel.y}`, to: `${parcel.x + 9}-${parcel.y + 9}` }
    : { from: "100-100", to: "199-199" };

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

/**
 * Rebuilds each battle from the events emitted around it.
 *
 * `Attack` carries the outcome and the loot but says nothing about who fought,
 * so the armies and the casualties come from the three events that bracket it:
 *
 *   DispatchArmy   who marched out, and at what
 *   WarriorLosses  what the defender lost, emitted inside war()
 *   ArmyReturned   what came home, and the share that survived
 *
 * None of these can be matched by position. Two armies sent from one land arrive
 * in distance order, not dispatch order, so the second one dispatched can be the
 * first one to fight; and they come home in whatever order the player collects
 * them. So each is matched on something it actually carries:
 *
 *   dispatch -> attack   by the (attacker, defender) pair, which both events index
 *   losses   -> attack   by defender, in the order that defender was attacked
 *   return   -> attack   by army composition, which identifies the trip
 */
export function getWarLogsFromEvents(events: ApiDataResultType) {
  const warLogArray: WarLogType[] = [];
  if (events.length === 0) return warLogArray;

  const iface = new ethers.utils.Interface(townABI);
  const attackSig = iface.getEventTopic("Attack");
  const dispatchSig = iface.getEventTopic("DispatchArmy");
  const lossesSig = iface.getEventTopic("WarriorLosses");
  const returnedSig = iface.getEventTopic("ArmyReturned");

  const asCounts = (values: ethers.BigNumber[]) => values.map((v) => Number(v));
  const sameArmy = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // Keyed queues, consumed in the order the chain emitted them.
  const dispatches = new Map<string, number[][]>();
  const losses = new Map<number, number[][]>();
  const returns = new Map<number, { amounts: number[]; survivingPercent: number }[]>();

  const push = <T,>(map: Map<string | number, T[]>, key: string | number, value: T) => {
    const queue = map.get(key as never);
    if (queue) queue.push(value);
    else map.set(key as never, [value]);
  };

  for (const event of events) {
    const topic = event.topics[0];
    try {
      if (topic === dispatchSig) {
        const [amounts] = ethers.utils.defaultAbiCoder.decode(
          ["uint256[]", "uint256"],
          event.data
        );
        const pair = `${parseInt(event.topics[1])}:${parseInt(event.topics[2])}`;
        push(dispatches as never, pair, asCounts(amounts));
      } else if (topic === lossesSig) {
        const [amounts] = ethers.utils.defaultAbiCoder.decode(["uint256[]"], event.data);
        push(losses as never, parseInt(event.topics[1]), asCounts(amounts));
      } else if (topic === returnedSig) {
        const [amounts, survivingPercent] = ethers.utils.defaultAbiCoder.decode(
          ["uint256[]", "uint256", "uint256[2]"],
          event.data
        );
        push(returns as never, parseInt(event.topics[1]), {
          amounts: asCounts(amounts),
          survivingPercent: Number(survivingPercent),
        });
      }
    } catch {
      // A log we cannot decode belongs to a different contract version; skipping
      // it costs one battle's detail rather than the whole page.
    }
  }

  for (const event of events) {
    if (event.topics[0] !== attackSig) continue;

    const attacker = parseInt(event.topics[1]);
    const defender = parseInt(event.topics[2]);
    const lootedAmount = ethers.utils.defaultAbiCoder.decode(
      ["uint256[2]"],
      event.data
    )[0];

    const attackerArmy = dispatches.get(`${attacker}:${defender}`)?.shift();
    const defenderLosses = losses.get(defender)?.shift();

    // The army that came home is the one that matches what was sent. Falling
    // back to the oldest unclaimed return keeps a battle readable when the
    // dispatch is older than the block range being scanned.
    const homeQueue = returns.get(attacker);
    let returned: { amounts: number[]; survivingPercent: number } | undefined;
    if (homeQueue) {
      const index = attackerArmy
        ? homeQueue.findIndex((entry) => sameArmy(entry.amounts, attackerArmy))
        : 0;
      if (index >= 0) returned = homeQueue.splice(index, 1)[0];
    }

    const army = attackerArmy ?? returned?.amounts;
    const survivingPercent = returned?.survivingPercent;
    const attackerLosses =
      army && survivingPercent !== undefined
        ? army.map((sent) => sent - Math.floor((sent * survivingPercent) / 100))
        : undefined;

    warLogArray.push({
      from: attacker,
      to: defender,
      success: parseInt(event.topics[3]) === 1,
      lootedAmounts: [
        Number(formatEther(lootedAmount[0])),
        Number(formatEther(lootedAmount[1])),
      ],
      attackerArmy: army,
      attackerLosses,
      defenderLosses,
      attackerSurvivingPercent: survivingPercent,
    });
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
/**
 * When each land was last attacked, in unix seconds.
 *
 * The map uses this for wild lands: their goods and garrison regrow linearly
 * over WildRegenPeriod, so the time since the last raid is how full one is, and
 * the marker draws that many fruit, nuggets and spears. It rides the Attack logs
 * the battle log already fetches — a per-land `wildLandState` call would be one
 * round trip per wild land, times nine parcels, on every map move.
 *
 * Only the topics and the log's own timestamp are read, so this costs one pass
 * over the same array and no decoding.
 */
export function getLastRaidsFromEvents(events: ApiDataResultType) {
  const lastRaid = new Map<number, number>();
  if (events.length === 0) return lastRaid;

  const attackSig = new ethers.utils.Interface(townABI).getEventTopic("Attack");

  for (const event of events) {
    if (event.topics[0] !== attackSig) continue;
    const defender = parseInt(event.topics[2]);
    // The explorer hands timestamps back as a hex string on some chains and a
    // decimal one on others; Number() reads both, parseInt only the second.
    const at = Number(event.timeStamp);
    if (!Number.isFinite(at)) continue;
    const seen = lastRaid.get(defender);
    if (seen === undefined || at > seen) lastRaid.set(defender, at);
  }

  return lastRaid;
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

/**
 * Town hall level per land, from the same Town log set the buildings come from
 * — no extra request and no per-land contract read, which is what makes it
 * affordable to draw nine parcels' worth of towns at their real size.
 *
 * buildTownhall() emits UpgradeTownhall(landTokenId indexed, currentLevel), so
 * the level is in the data word. The highest one wins rather than the last, so
 * logs arriving out of order cannot shrink a town.
 */
export function getTownhallLevelsFromEvents(events: ApiDataResultType) {
  const levels = new Map<number, number>();
  if (events.length === 0) return levels;

  const iface = new ethers.utils.Interface(townABI);
  const eventSig = iface.getEventTopic("UpgradeTownhall");

  for (const event of events) {
    if (event.topics[0] !== eventSig) continue;
    const land = parseInt(event.topics[1]);
    const level = Number(
      ethers.utils.defaultAbiCoder.decode(["uint256"], event.data)[0]
    );
    if (level > (levels.get(land) ?? 0)) levels.set(land, level);
  }
  return levels;
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

/**
 * Highest level any building has art for.
 *
 * The contract lets a town hall reach 10 (`MaxTownhallLevel`), and everything
 * else is gated one level under it, so levels 7 upward are reachable in play.
 * The art stops at 6, so without the clamp below a level-7 town hall asks for
 * a file that does not exist and renders as a broken image — in production
 * only, because a level that high needs a game further along than any local
 * test ever gets.
 *
 * Clamping shows the level-6 art for anything higher. A tall town hall looking
 * like a slightly shorter one is a cosmetic loss; a broken image is a bug.
 * Raise this when the art exists, not before — `scripts/checkAssets.mjs`
 * expands exactly this range and will fail the build if a file is missing.
 */
export const MAX_BUILDING_ART_LEVEL = 6;

const artLevel = (level: number) =>
  Math.max(0, Math.min(Number(level) || 0, MAX_BUILDING_ART_LEVEL));

export const farmImage = (level: number) => {
  return `/buildings/farmLv${artLevel(level)}.png`;
};
export const goldMineImage = (level: number) => {
  return `/buildings/goldMineLv${artLevel(level)}.png`;
};
export const townHallImage = (level: number) => {
  return `/buildings/townHallLv${artLevel(level)}.png`;
};
export const barracksImage = (level: number) => {
  return `/buildings/barracksLv${artLevel(level)}.png`;
};
export const trainingCampImage = (level: number) => {
  return `/buildings/armyCampLv${artLevel(level)}.png`;
};
export const wareHouseImage = (level: number) => {
  return `/buildings/wareHouseLv${artLevel(level)}.png`;
};
export const wallImage = (level: number) => {
  return `/buildings/walls/Full${artLevel(level)}.png`;
};
export const gateImage = (level: number) => {
  return `/buildings/walls/Gate${artLevel(level)}.png`;
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