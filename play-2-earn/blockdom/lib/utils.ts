import { useMemo } from "react";

type selectedParcelType = {
  x: number;
  y: number;
};
export const inViewParcels = (
  selectedParcel: selectedParcelType
): selectedParcelType[] => {
  let parcelsArray = [];

  parcelsArray[0] = {
    ...selectedParcel,
    x: selectedParcel.x - 10,
    y: selectedParcel.y - 10,
  };
  parcelsArray[1] = { ...selectedParcel, y: selectedParcel.y - 10 };
  parcelsArray[2] = {
    ...selectedParcel,
    x: selectedParcel.x + 10,
    y: selectedParcel.y - 10,
  };
  parcelsArray[3] = { ...selectedParcel, x: selectedParcel.x - 10 };
  parcelsArray[4] = selectedParcel;
  parcelsArray[5] = { ...selectedParcel, x: selectedParcel.x + 10 };
  parcelsArray[6] = {
    ...selectedParcel,
    x: selectedParcel.x - 10,
    y: selectedParcel.y + 10,
  };
  parcelsArray[7] = { ...selectedParcel, y: selectedParcel.y + 10 };
  parcelsArray[8] = {
    ...selectedParcel,
    x: selectedParcel.x + 10,
    y: selectedParcel.y + 10,
  };

  return parcelsArray;
};

export const parcelLands = (xFrom: number, yFrom: number) => {
  let items = [];
  for (let y = yFrom+9; y > yFrom-1 ; y--) {
    for (let x = xFrom; x < xFrom + 10; x++) {
      items.push(Number(x.toString() + y.toString()));
    }
  }
  return items;
};



export const allLands = () => {

  let parcelLandsArray= []
  for (let y = 9; y > -1; y--) {
  for (let x = 0; x < 10; x++) {
  
      const item = parcelLands((x+10)*10 , (y+10)*10)
      parcelLandsArray.push(item)
    }
  }
  return parcelLandsArray
}

export const getParcelStartIndexes = ()=> {
  let indexes: selectedParcelType[] = []
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const item = {x:(x+10)*10 , y:(y+10)*10}
      indexes.push(item)
    }
  }
  return indexes
}

export const separatedCoordinate = (coordinate: string) => {
  const middleIndex = Math.floor(coordinate.length / 2);
  const result =
    coordinate.slice(0, middleIndex) + " - " + coordinate.slice(middleIndex);
  return result;
};

export const coordinatesObject = (coordinates:number) => {
const xCoordinate = Math.floor(coordinates / 1000); // 123
const yCoordinate = coordinates % 1000;
return {x: xCoordinate,y: yCoordinate-9}
}
