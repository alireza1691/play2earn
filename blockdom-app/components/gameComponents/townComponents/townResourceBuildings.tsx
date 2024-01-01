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
  const { inViewLand, setFarms, setGoldMines, farms, goldMines,buildedResBuildings } =
    useUserDataContext();
  const farm = landItems[3];
  const goldMine = landItems[2];
  const GoldMineAndFarm = () => {
    if (inViewLand) {
    }
  };

  useEffect(() => {
    const getResourcesBuildings = async () => {
      if (inViewLand != null && buildedResBuildings) {
        let farmsArray: ResourceBuildingObj[] = [];
        let goldMinesArray: ResourceBuildingObj[] = [];
        if (buildedResBuildings.farms.length > 0) { 
          for (let index = 0; index < buildedResBuildings.farms.length; index++) {
            const currentRevenue = await townPInst.getCurrentRevenue(
              buildedResBuildings.farms[index].tokenId
            );
            const obj = {
              tokenId: buildedResBuildings.farms[index].tokenId,
              level: buildedResBuildings.farms[index].level,
              name: "Farm" ,
              earnedAmount: Number(formatEther(currentRevenue)),
            };
            farmsArray.push(obj)
          }
          setFarms(farmsArray)
          console.log("Farms:",farmsArray);
          
        }
        if (buildedResBuildings.goldMines.length > 0) { 
          for (let index = 0; index < buildedResBuildings.goldMines.length; index++) {
            const currentRevenue = await townPInst.getCurrentRevenue(
              buildedResBuildings.goldMines[index].tokenId
            );
            const obj = {
              tokenId: buildedResBuildings.farms[index].tokenId,
              level: buildedResBuildings.farms[index].level,
              name: "GoldMine" ,
              earnedAmount: Number(formatEther(currentRevenue)),
            };
            farmsArray.push(obj)
          }
          setGoldMines(goldMinesArray)
          console.log("Gold mines:",farmsArray);
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
