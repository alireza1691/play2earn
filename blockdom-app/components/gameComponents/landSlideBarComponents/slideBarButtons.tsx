import { useMapContext } from "@/context/map-context";
import { isWildLand, landTypesSupported } from "@/lib/landTypes";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { landsRead, landsSInst } from "@/lib/instances";
import { useSigner } from "@thirdweb-dev/react";
import { BigNumberish, Transaction } from "ethers";
import { Sepolia } from "@thirdweb-dev/chains";
import React, { useEffect, useState } from "react";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { usePathname, useRouter } from "next/navigation";
import { useLandClans } from "../mapComponents/useLandClans";
import { routeFor, useDeployment, isRewrite } from "@/lib/deployments";

export default function SlideBarButtons() {
  const { selectedLand } = useMapContext();
  const { ownedLands, setInViewLand, setChosenLand, setIsUserDataLoading } =
    useUserDataContext();
  const { mint } = useBlockchainUtilsContext();

  const router = useRouter();

  const [priceFormatEther, setPriceFromatEther] = useState<BigNumberish | null>(
    null
  );

  const pathname = usePathname();
  const isTestnet = pathname.includes("/testnet/");
  const deployment = useDeployment();
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const { relationTo } = useLandClans();

  // The contract reverts with CannotAttackAlly on both dispatch and arrival, so
  // offering the button to a clan member would only produce a failed
  // transaction. Allies get told why instead.
  const isAlly =
    !!selectedLand?.owner && relationTo(selectedLand.owner) === "ally";

  const isOwned = () => {
    if (ownedLands && selectedLand) {
      if (
        ownedLands.some(
          (item) => item.tokenId == selectedLand.coordinate.toString()
        )
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  // A wild parcel is unowned but not for sale: minting one reverts, so the
  // panel offers a raid instead of a price. v3 has no land types, so nothing
  // there is ever wild.
  const wild =
    landTypesSupported(deployment) &&
    selectedLand != null &&
    !selectedLand.isMinted &&
    isWildLand(Number(selectedLand.coordinate), undefined);

  useEffect(() => {
    const getData = async () => {
      if (selectedLand?.isMinted == false) {
        const inst = landsRead(deployment);

        const price = await inst.getPrice();
        setPriceFromatEther(price);
      }
    };
    getData();
  }, [selectedLand]);

  return (
    <div className="w-full mt-auto flex flex-col py-3 flex-shrink">
      {" "}
      <div className="w-full ">
        {" "}
        {wild && (
          <h3 className="py-2 px-5 bg-[#0D0F12]/85 rounded-[4px] text-[color:var(--pw-accent)] !w-full text-center">
            Wild land — raid it for goods, it is not for sale
          </h3>
        )}
        {selectedLand && !selectedLand.isMinted && !wild && (
          <h3 className="py-2 px-5 bg-[#0D0F12]/85 rounded-[4px] text-[color:var(--pw-accent)] !w-full text-center">
            Price:{" "}
            {formatEther(
              priceFormatEther ? priceFormatEther : parseEther("0.002")
            )}{" "}
            ETH
          </h3>
        )}
      </div>
      <div className=" flex flex-col md:flex-row  w-full gap-2">
        <>
          {selectedLand && !selectedLand.isMinted && !wild && priceFormatEther && (
            <button
              onClick={() => mint(selectedLand, priceFormatEther)}
              className="greenButton !w-full mt-2"
            >
              Mint
            </button>
          )}
          {selectedLand && !selectedLand.isMinted && !wild && !priceFormatEther && (
            <button disabled className="greenButton !w-full mt-2">
              Mint
            </button>
          )}
          {selectedLand && selectedLand.isMinted && !isOwned() && (
            <>
              <button
                onClick={() => {
                  setChosenLand({
                    tokenId: selectedLand.coordinate.toString(),
                    owner: selectedLand.owner,
                  }),
                    setIsUserDataLoading(true),
                    router.push(routeFor(deployment, `land/${selectedLand.coordinate.toString()}`));
                }}
                className="outlineGreenButton !w-full md:!w-[50%]"
              >
                Visit land
              </button>
              {/* {ownedLands && ownedLands?.length > 0 ? (
          <button className="outlineGreenButton !w-full md:!w-[50%]"disabled >
            Send help
          </button>
           ):(<button className="outlineGreenButton !w-full md:!w-[50%]" disabled>
           Send help
         </button>)} */}
            </>
          )}
          {selectedLand && selectedLand.isMinted && !isOwned() && (
            <>
              {isAlly ? (
                <button
                  disabled
                  title="You cannot attack a member of your own clan"
                  className="outlineGreenButton !w-full md:!w-[50%]"
                >
                  Clan member
                </button>
              ) : ownedLands && ownedLands?.length > 0 ? (
                <button
                  onClick={() => {
                    setSelectedWindowComponent("attack");
                  }}
                  className="redButton z-30 !w-full md:!w-[50%]"
                >
                  Attack
                </button>
              ) : (
                <button disabled className=" redButton !w-full md:!w-[50%]">
                  Attack
                </button>
              )}
            </>
          )}

          {selectedLand && selectedLand.isMinted && isOwned() && (
            <>
              {ownedLands && ownedLands?.length > 0 ? (
                <button
                  className="outlineGreenButton !w-full md:!w-[50%]"
                  disabled
                >
                  Send help
                </button>
              ) : (
                <button
                  className="outlineGreenButton !w-full md:!w-[50%]"
                  disabled
                >
                  Send help
                </button>
              )}
            </>
          )}
          {selectedLand && selectedLand.isMinted && isOwned() && (
            <button className="greenButton !w-full md:!w-[50%]"      onClick={() => {
              setChosenLand({
                tokenId: selectedLand.coordinate.toString(),
                owner: selectedLand.owner,
              }),
                setIsUserDataLoading(true),
                router.push(routeFor(deployment, "myLand"))
                
            }}>
              Visit land
            </button>
          )}
        </>
      </div>
    </div>
  );
}
