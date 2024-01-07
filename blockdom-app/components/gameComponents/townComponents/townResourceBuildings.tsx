"use client";
import { landItems } from "@/lib/data";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import { formatEther } from "ethers/lib/utils";
import { farmImage, goldMineImage } from "@/lib/utils";

type ResourceBuildingObj = {
  tokenId: number;
  level: number;
  name: string;
  earnedAmount: number;
};

export default function TownResourceBuildings() {
  const { setSelectedItem, setSelectedResourceBuilding } =
    useSelectedBuildingContext();
  const {
    inViewLand,
    setFarms,
    setGoldMines,
    farms,
    goldMines,
    buildedResBuildings,
  } = useUserDataContext();
  const farm = landItems[3];
  const goldMine = landItems[2];


  useEffect(() => {
    const getResourcesBuildings = async () => {
      if (inViewLand != null && buildedResBuildings) {
        let farmsArray: ResourceBuildingObj[] = [];
        let goldMinesArray: ResourceBuildingObj[] = [];
        if (buildedResBuildings.farms.length > 0) {
          console.log("buildedResBuildings",buildedResBuildings);
          
          for (
            let index = 0;
            index < buildedResBuildings.farms.length;
            index++
          ) {
            const currentRevenue = await townPInst.getCurrentRevenue(
              buildedResBuildings.farms[index].tokenId
            );
            const obj = {
              tokenId: buildedResBuildings.farms[index].tokenId,
              level: buildedResBuildings.farms[index].level,
              name: "Farm",
              earnedAmount: Number(formatEther(currentRevenue)),
            };
            farmsArray.push(obj);
          }
          setFarms(farmsArray);
          console.log("Farms:", farmsArray);
        } else {
          setFarms([]);
        }
        if (buildedResBuildings.goldMines.length > 0) {
          for (
            let index = 0;
            index < buildedResBuildings.goldMines.length;
            index++
          ) {
            const currentRevenue = await townPInst.getCurrentRevenue(
              buildedResBuildings.goldMines[index].tokenId
            );
            const obj = {
              tokenId: buildedResBuildings.farms[index].tokenId,
              level: buildedResBuildings.farms[index].level,
              name: "GoldMine",
              earnedAmount: Number(formatEther(currentRevenue)),
            };
            goldMinesArray.push(obj);
          }
          setGoldMines(goldMinesArray);
          console.log("Gold mines:", goldMinesArray);
        } else {
          setGoldMines([]);
        }
      }
    };
    getResourcesBuildings();
  }, [inViewLand, buildedResBuildings]);
  return (
    <>
      <div className="z-10 flex flex-col left-[10rem]  gap-10   absolute top-[20rem]">
        {farms && farms.length == 0 && (
          <Image
            className="z-10 cursor-pointer opacity-40  w-[10rem] h-auto"
            src={farmImage(0)}
            width={580}
            height={480}
            alt="farm"
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
                  className="z-10 cursor-pointer   w-[10rem] h-auto"
                  src={farmImage(item.level)}
                  width={580}
                  height={480}
                  alt="farm"
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
              </React.Fragment>
            ))}
            <Image
              className="z-10 cursor-pointer   w-[10rem] h-auto opacity-40"
              src={farmImage(0)}
              width={580}
              height={480}
              alt="farm"
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
          </>
        )}
      </div>
      <div className="z-10 flex flex-row left-[30rem] ml-auto gap-10 absolute top-[10rem]">
        {goldMines && goldMines.length == 0 && (
          <Image
            className=" cursor-pointer  w-[10rem] h-auto opacity-40"
            src={goldMineImage(0)}
            width={580}
            height={480}
            alt="goldmine"
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
                  className=" cursor-pointer  w-[10rem] h-auto"
                  src={goldMineImage(item.level)}
                  width={580}
                  height={480}
                  alt="goldmine"
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
              </React.Fragment>
            ))}
            <Image
              className=" cursor-pointer w-[10rem] h-auto opacity-40 gap-20"
              src={goldMineImage(0)}
              width={580}
              height={480}
              alt="goldmine"
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
          </>
        )}
      </div>
    </>
  );
}
