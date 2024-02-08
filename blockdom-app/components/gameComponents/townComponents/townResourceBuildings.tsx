"use client";
import { landItems } from "@/lib/data";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import { formatEther } from "ethers/lib/utils";
import { farmImage, goldMineImage } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
  const currentRoute = usePathname()
  const isMyland = currentRoute.includes("myLand")


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
              tokenId: buildedResBuildings.goldMines[index].tokenId,
              level: buildedResBuildings.goldMines[index].level,
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
      <div className="z-10 flex flex-col left-[25rem]  gap-4   absolute top-[30rem] xl:left-[40rem] ">
        {farms && farms.length == 0 && (
          <div className=" relative">
          <Image
            className="z-10 cursor-pointer  w-[7rem] h-auto"
            src={farmImage(0)}
            width={580}
            height={480}
            alt="farm"
            onClick={() => {isMyland &&
              setSelectedItem(farm);
              setSelectedResourceBuilding({
                tokenId: 0,
                level: 0,
                type: "Farm",
                earnedAmount: 0,
              });
            }}
          />
          <Image
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
        </div>
        )}
        {farms && farms.length > 0 && (
          <>
            {farms.map((item, key) => (
              <div key={key} className="relative">
                <Image
                  className="z-10 cursor-pointer   w-[7rem] h-auto"
                  src={farmImage(item.level)}
                  width={580}
                  height={480}
                  alt="farm"
                  onClick={() => {isMyland &&
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
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
              </div>
            ))}
            <div className=" relative">
            <Image
              className="z-10 cursor-pointer   w-[7rem] h-auto "
              src={farmImage(0)}
              width={580}
              height={480}
              alt="farm"
              onClick={() => { isMyland &&
                setSelectedItem(farm);
                setSelectedResourceBuilding({
                  tokenId: 0,
                  level: 0,
                  type: "Farm",
                  earnedAmount: 0,
                });
              }}
            />
                        <Image
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
            </div>
          </>
        )}
      </div>
      <div className="z-10 flex flex-col left-[87rem] ml-auto gap-4 absolute  xl:left-[110rem] top-[30rem]">
        {goldMines && goldMines.length == 0 && (
          <div className=" relative">
          <Image
            className=" cursor-pointer  w-[7rem] h-auto "
            src={goldMineImage(0)}
            width={580}
            height={480}
            alt="goldmine"
            onClick={() => { isMyland &&
              setSelectedItem(goldMine);
              setSelectedResourceBuilding({
                tokenId: 0,
                level: 0,
                type: "GoldMine",
                earnedAmount: 0,
              });
            }}
          />
                       <Image
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
            </div>
      
        )}

        {goldMines && goldMines.length > 0 && (
          <>
            {goldMines.map((item, key) => (
              <div key={key} className="relative">
                <Image
                  className=" cursor-pointer  w-[7rem] h-auto"
                  src={goldMineImage(item.level)}
                  width={580}
                  height={480}
                  alt="goldmine"
                  onClick={() => { isMyland &&
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
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
            </div>
  
            ))}
            <div className=" relative">
            <Image
              className=" cursor-pointer w-[7rem] h-auto gap-20"
              src={goldMineImage(0)}
              width={580}
              height={480}
              alt="goldmine"
              onClick={() => {
                isMyland &&
                setSelectedItem(goldMine);
                setSelectedResourceBuilding({
                  tokenId: 0,
                  level: 0,
                  type: "GoldMine",
                  earnedAmount: 0,
                });
              }}
            />
                         <Image
          className="-z-10 cursor-pointer -translate-x-6 -translate-y-[4.5rem]  absolute   w-[10rem] h-auto"
          src={"/buildings/shadow.png"}
          width={580}
          height={480}
          alt="shadow"
          quality={10}
        />
            </div>
          </>
        )}
      </div>
    </>
  );
}
