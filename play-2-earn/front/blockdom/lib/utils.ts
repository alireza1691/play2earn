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
  for (let x = xFrom; x < xFrom + 10; x++) {
    for (let y = yFrom; y < yFrom + 10; y++) {
      items.push(Number(x.toString() + y.toString()));
    }
  }
  return items;
};

export const separatedCoordinate = (coordinate: string) => {
  const middleIndex = Math.floor(coordinate.length / 2);
  const result =
    coordinate.slice(0, middleIndex) + " - " + coordinate.slice(middleIndex);
  return result;
};
