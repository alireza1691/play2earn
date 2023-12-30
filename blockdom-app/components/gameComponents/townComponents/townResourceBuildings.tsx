"use client";
import { landItems } from "@/lib/data";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";

type ResourceBuildingObj = {
  tokenId: number;
  level: number;
  name: string;
  earnedAmount: number;
};

export default function TownResourceBuildings() {
  const { setSelectedItem, setSelectedResourceBuilding } =
    useSelectedBuildingContext();
  const { inViewLand, setFarms, setGoldMines, farms, goldMines } =
    useUserDataContext();
  const farm = landItems[3];
  const goldMine = landItems[2];
  const GoldMineAndFarm = () => {
    if (inViewLand) {
    }
  };

  useEffect(() => {
    const getResourcesBuildings = async () => {
      if (inViewLand != null) {
        let resBuildings = inViewLand.buildedResourceBuildings;
        if (resBuildings.length > 0) {
          let farmsArray: ResourceBuildingObj[] = [];
          let goldMinesArray: ResourceBuildingObj[] = [];
          for (let index = 0; index < resBuildings.length; index++) {
            const buildingStatus = await townPInst.getStatus(
              resBuildings[index]
            );
            const currentRevenue = await townPInst.getCurrentRevenue(
              resBuildings[index]
            );
            const obj = {
              tokenId: Number(resBuildings[index]),
              level: Number(buildingStatus.level),
              name: buildingStatus.buildingTypeIndex == 0 ? "Farm" : "GoldMine",
              earnedAmount: Number(currentRevenue),
            };

            if (buildingStatus.buildingTypeIndex == 0) {
              farmsArray.push(obj);
            } else {
              goldMinesArray.push(obj);
            }
          }
          setFarms(farmsArray);
          setGoldMines(goldMinesArray);
        }
      }
    };
    getResourcesBuildings();
  }, [inViewLand, farms, goldMines]);
  return (
    <>
      {farms && farms.length == 0 && (
        <Image
          className="z-10 cursor-pointer absolute top-[30rem] right-[10%]  w-[10%] h-auto"
          src={farm.imageUrl}
          width={580}
          height={480}
          alt="walls"
          onClick={() => {
            setSelectedItem(farm);
          }}
        />
      )}
      {farms && farms.length > 0 && (
        <>
          <div className="z-10 flex flex-col left-[60rem]   ml-auto absolute top-[10rem]">
            {farms.map((item, key) => (
              <React.Fragment key={key}>
                <Image
                  className="z-10 cursor-pointer   right-[20%]  w-[20%] h-auto"
                  src={farm.imageUrl}
                  width={580}
                  height={480}
                  alt="walls"
                  onClick={() => {
                    setSelectedItem(farm);
                    setSelectedResourceBuilding({
                      tokenId: item.tokenId,
                      level: item.level,
                      type: "Farm",
                      earnedAmount: item.earnedAmount,
                    });
                  }}
                />
                <Image
                  className="z-10 cursor-pointer  right-[20%]  w-[20%] h-auto opacity-40"
                  src={farm.imageUrl}
                  width={580}
                  height={480}
                  alt="walls"
                  onClick={() => {
                    setSelectedItem(farm);
                    setSelectedResourceBuilding({
                      tokenId: 0,
                      level: 0,
                      type: "Farm",
                      earnedAmount:0
                    });
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        </>
      )}

      <Image
        className=" cursor-pointer absolute top-[5rem] left-[20%]  w-[10%] h-auto"
        src={goldMine.imageUrl}
        width={580}
        height={480}
        alt="walls"
        onClick={() => {
          setSelectedItem(goldMine);
        }}
      />
    </>
  );
}
