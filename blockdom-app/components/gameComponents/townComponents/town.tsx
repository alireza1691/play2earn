"use client";
import { useUserDataContext } from "@/context/user-data-context";
import { landItems } from "@/lib/data";
import { Sepolia } from "@thirdweb-dev/chains";
import {
  metamaskWallet,
  useAddress,
  useChainId,
  useConnect,
} from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import TownBarracks from "./townBarracks";
import TownHall from "./townHall";
import TownResourceBuildings from "./townResourceBuildings";
import TownTrainingCamp from "./townTrainingCamp";
import TownWalls from "./townWalls";
import TownHeader from "./townHeader";
import { routeFor, useDeployment } from "@/lib/deployments";

export default function Town() {
  const { ownedLands, inViewLand, isUserDataLoading } = useUserDataContext();
  const deployment = useDeployment();
  const address = useAddress();
  const connect = useConnect();
  const router = useRouter();
  const chainId = useChainId();
  const validChainId = Sepolia.chainId;
  const metamaskConfig = metamaskWallet();

  const handleConnect = async () => {
    try {
      await connect(metamaskConfig, { chainId: validChainId });
      // Connection successful
    } catch (error) {
      console.log("Error connecting with MetaMask:", error);
      // Handle the error gracefully without showing it on the screen
    }
  };

  const townHall = landItems[0];
  // const walls = landItems[4]
  return (
    <section>
      {address || inViewLand ? (
        <>
          {/*
            Gated on there being a town to draw, not on the viewer owning one.
            This used to test `ownedLands.length > 0`, which meant a wallet with
            no land of its own got "You have not any land" on /land/<id> — the
            one route whose whole purpose is looking at somebody else's town.
            What can be *done* here is the contract's business; every write is
            onlyLandOwner already.
          */}
          {inViewLand ? (
            <>
              {" "}
              <TownHeader />
              <TownHall />
              <TownBarracks />
              <TownWalls />
              <TownTrainingCamp />
              <TownResourceBuildings />
            </>
          ) : (
            <>
              {" "}
              {/* Nothing loaded yet is not the same as nothing to load. */}
              {isUserDataLoading || !address ? null : (
              <div className=" fixed z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem]  left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 txStateBg flex flex-col">
                <h3 className="px-[10%]  mt-6 text-center !text-white font-semibold text-[18px]">
                  {ownedLands && ownedLands.length > 0
                    ? "That town could not be loaded."
                    : "You have not any land."}
                </h3>{" "}
                <h3 className="px-[10%]  mt-4 text-center !text-white ">
                  {" "}
                  <br></br>
                  <br></br>{" "}
                  <a
                    onClick={() => router.push(routeFor(deployment, "explore"))}
                    className=" cursor-pointer blueText underline !font-bold !text-[18px] hover:brightness-110"
                  >
                    Explore
                  </a>{" "}
                  the map and mint your land.
                </h3>{" "}
              </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {" "}
          <div className=" fixed z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem]  left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 txStateBg flex flex-col">
            <h3 className="px-[10%]  mt-6 text-center !text-white font-semibold text-[18px]">
              Wallet is not connected.
            </h3>{" "}
            <h3 className="px-[10%]  mt-4 text-center !text-white ">
              {" "}
              <br></br>
              <br></br> Please{" "}
              <a
                onClick={() => handleConnect()}
                className="  cursor-pointer blueText underline !font-bold !text-[18px] hover:brightness-110"
              >
                connect
              </a>{" "}
              your wallet.
            </h3>{" "}
          </div>
        </>
      )}
    </section>
  );
}
