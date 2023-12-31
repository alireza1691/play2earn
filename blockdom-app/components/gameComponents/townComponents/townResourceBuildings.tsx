"use client";
import { landItems } from "@/lib/data";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import { formatEther } from "ethers/lib/utils";

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
              earnedAmount: Number(formatEther(currentRevenue)),
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
       <div className="z-10 flex flex-col left-[60rem]   ml-auto absolute top-[10rem]">
      {farms && farms.length == 0 && (
        <Image
          className="z-10 cursor-pointer   w-[20%] h-auto"
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
              earnedAmount: 0,
            });
          }}
        />
      )}
      {farms && farms.length > 0 && (
        <>
       
            {farms.map((item, key) => (
              <React.Fragment key={key}>
                <Image
                  className="z-10 cursor-pointer   w-[20%] h-auto"
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
                  className="z-10 cursor-pointer    w-[20%] h-auto opacity-40"
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
                      earnedAmount: 0,
                    });
                  }}
                />
              </React.Fragment>
            ))}
      
        </>
      )}
          </div>
          <div className="z-10 flex flex-row left-[12.5rem]   ml-auto absolute top-[5rem]">
      {goldMines && goldMines.length == 0 && (
        <Image
          className=" cursor-pointer   w-[20%] h-auto"
          src={goldMine.imageUrl}
          width={580}
          height={480}
          alt="walls"
          onClick={() => {
            setSelectedItem(goldMine);
            setSelectedResourceBuilding({
              tokenId: 0,
              level: 0,
              type: "GoldMine",
              earnedAmount: 0,
            });
          }}
        />
      )}

      {goldMines && goldMines.length > 0 && (
      <>
          {goldMines.map((item, key) => (
            <React.Fragment key={key}>
              <Image
                className=" cursor-pointer    w-[20%] h-auto"
                src={goldMine.imageUrl}
                width={580}
                height={480}
                alt="walls"
                onClick={() => {
                  setSelectedItem(goldMine);
                  setSelectedResourceBuilding({
                    tokenId: item.tokenId,
                    level: item.level,
                    type: "GoldMine",
                    earnedAmount: item.earnedAmount,
                  });
                }}
              />
              <Image
                className=" cursor-pointer  w-[20%] h-auto"
                src={goldMine.imageUrl}
                width={580}
                height={480}
                alt="walls"
                onClick={() => {
                  setSelectedItem(goldMine);
                  setSelectedResourceBuilding({
                    tokenId: 0,
                    level: 0,
                    type: "GoldMine",
                    earnedAmount: 0,
                  });
                }}
              />
            </React.Fragment>
          ))}
      </>
      )}
      </div>
    </>
    
  );
}
