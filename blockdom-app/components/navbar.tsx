"use client";
import { ConnectWallet, useAddress, useChainId } from "@thirdweb-dev/react";
import React, { useEffect, useRef, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useTheme } from "@/context/theme-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import PlotwarMark from "@/svg/plotwarMark";
import NavDropdownMobileScreen from "./navDropdownMobileScreen";
import NavbarLandingItems from "./navbarLandingItems";
import NavbarGameItems from "./navbarGameItems";
import { getOwnedBuildings, getOwnedLands, zeroAddress } from "@/lib/utils";
import { townFromLocation } from "@/lib/urlState";
import { useApiData } from "@/context/api-data-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townRead } from "@/lib/instances";
import { InViewLandType, landDataResType } from "@/lib/types";
import BackIcon from "@/svg/backIcon";
import { useMapContext } from "@/context/map-context";
import BalanceContainer from "./gameComponents/balanceContainer";

import ChainIdButton from "./chainIdButton";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useDeployment, isRewrite } from "@/lib/deployments";
import DeploymentSwitch from "./deploymentSwitch";
import { readPlotBalance } from "@/lib/plotBalance";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [isTestnet,setIsTestnet] = useState()
  const {
    mintedLands,
    buildedResourceBuildings,

    loading,
  } = useApiData();
  const {
    setOwnedLands,
    setInViewLand,
    setBuildedResBuildings,
    chosenLand,
    setChosenLand,
    isUserDataLoading,
    setIsUserDataLoading,
    setPlotBalance,
    landRefresh,
    refreshLand,
  } = useUserDataContext();
  const { setSelectedParcel, setSelectedLand, selectedParcel } =
    useMapContext();
  const address = useAddress();
  const chainId = useChainId();

  const { theme, toggleTheme } = useTheme();

  const currentRoute = usePathname();

  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();
  const town = townRead(deployment);

  // The land whose data is currently in `inViewLand`. Kept in a ref rather than
  // read off `inViewLand` so the loader below does not depend on the state it
  // writes — that dependency made it re-run after every load, and it also let
  // blockchain-utils-context's optimistic setInViewLand kick off a refetch.
  // Keyed by deployment *and* token id, not the id alone. Switching v4 to v5
  // keeps the same land — 104104 is 104104 either way — so an id-only key made
  // the loader see nothing new and skip the fetch, leaving the previous
  // deployment's buildings and balances on screen under the new version.
  const loadedTokenId = useRef<string | null>(null);
  // The land a request is already out for, and a sequence number so a slow
  // response for a land the user has since left cannot overwrite a newer one.
  const inFlightTokenId = useRef<string | null>(null);
  const requestId = useRef(0);
  // The highest refresh id this loader has acted on, so a bumped id reads as a
  // new request without anyone having to reset a flag afterwards.
  const servedRefresh = useRef(0);

  /** What the loader is actually keyed on: which chain, and which land on it. */
  const landKey = (tokenId: number | null) =>
    tokenId == null ? null : `${deployment}:${tokenId}`;

  // Chosen land as a plain number: "Visit land" hands us a fresh object for the
  // land already on screen, and keying on the object meant that re-render was
  // the only thing the loader saw.
  const chosenTokenId = chosenLand ? Number(chosenLand.tokenId) : null;

  // Which lands the connected wallet owns, and a default selection.
  useEffect(() => {
    // A town named in the URL — /land/<id>, or ?town= on the my-land screens —
    // is an explicit choice: a refresh, or a link to someone else's town. It
    // outranks everything below, so that neither the default nor the wallet's
    // asynchronous reconnect can swallow it on the way in.
    const wanted = townFromLocation();

    if (!address) {
      setOwnedLands(null);
      // A town named in the URL is still worth showing. Reading a land is a
      // view call — it needs an RPC, not a signer — so a shared link opens the
      // town for someone who has not connected, and connecting is only asked
      // for when there is something to sign.
      if (wanted === null) {
        setChosenLand(null);
        loadedTokenId.current = null;
        setInViewLand(null);
        setIsUserDataLoading(false);
        return;
      }
      setChosenLand((current) => {
        if (current && Number(current.tokenId) === wanted) return current;
        const owner = mintedLands?.find(
          (land) => Number(land.tokenId) === wanted
        )?.owner;
        return { tokenId: String(wanted), owner: owner ?? zeroAddress };
      });
      return;
    }
    if (!mintedLands) return;

    const owned = getOwnedLands(mintedLands, address);
    setOwnedLands(owned);
    // Keep the current selection if the wallet still owns it. Replacing it with
    // an equal-but-new object on every log refetch restarted the loader.
    setChosenLand((current) => {
      if (current && Number(current.tokenId) === wanted) return current;
      if (wanted !== null) {
        const owner = mintedLands.find(
          (land) => Number(land.tokenId) === wanted
        )?.owner;
        return { tokenId: String(wanted), owner: owner ?? zeroAddress };
      }
      return current && owned.some((land) => land.tokenId === current.tokenId)
        ? current
        : owned[0] ?? null;
    });
  }, [mintedLands, address]);

  /**
   * Loads the selected land's on-chain data.
   *
   * The three reads used to be awaited one after another, so opening a land
   * cost three full round trips to Infura before the spinner could clear —
   * plus a fourth for the PLOT balance, which the old effect re-ran on every
   * pass. None of them depend on each other.
   *
   * The spinner also used to hang for good when the chosen land was already
   * the one in view: "Visit land" set isUserDataLoading, but the only branch
   * that cleared it required chosenLand and inViewLand to differ. That is the
   * common case — a wallet with one land visiting that land.
   */
  useEffect(() => {
    // Land data is only read on the Sepolia deployments; v3-mainnet has no Town
    // to ask. This used to test isTestnet, which is false on /v4/ routes, so the
    // whole fetch was skipped there and the balance bar stayed empty.
    if (deployment === "v3-mainnet") {
      loadedTokenId.current = null;
      setInViewLand(null);
      setIsUserDataLoading(false);
      return;
    }
    if (chosenTokenId == null) {
      // Nothing selected: no wallet and no town in the URL, or a wallet with no
      // land. Either way there is nothing to wait for. The wallet itself is no
      // longer a requirement — getLandIdData is a view call.
      if (address && !mintedLands) return;
      setIsUserDataLoading(false);
      return;
    }

    const requested = landRefresh.id !== servedRefresh.current;

    if (!requested) {
      // A request for it is already out, so let it finish and clear the
      // spinner. The effect re-runs on its own setIsUserDataLoading, so
      // without this check every load fired twice. Checked before the one
      // below so a refresh of the land already on screen still shows as busy.
      if (inFlightTokenId.current === landKey(chosenTokenId)) return;
      // Already showing this land on this deployment — clear a spinner a caller
      // turned on for it.
      if (loadedTokenId.current === landKey(chosenTokenId)) {
        if (isUserDataLoading) setIsUserDataLoading(false);
        return;
      }
    }

    // Marked served here rather than after the reads, so the re-render this
    // causes takes the branch above instead of starting a second request.
    if (requested) servedRefresh.current = landRefresh.id;

    // An explicit refresh says whether it blocks; anything reaching this point
    // without one is a first load or a land switch, which has nothing on
    // screen yet and so always blocks.
    const blocking = requested ? landRefresh.blocking : true;

    const id = ++requestId.current;
    inFlightTokenId.current = landKey(chosenTokenId);
    if (blocking) setIsUserDataLoading(true);

    (async () => {
      try {
        const [landData, remainedBuildTime, army] = await Promise.all([
          town.getLandIdData(chosenTokenId) as Promise<landDataResType>,
          town.getRemainedBuildTimestamp(chosenTokenId),
          town.getArmy(chosenTokenId),
        ]);
        // Superseded by a newer land while this was in flight.
        if (requestId.current !== id) return;

        const land: InViewLandType = {
          tokenId: chosenTokenId,
          townhallLvl: landData.townhallLevel,
          wallLvl: landData.wallLevel,
          barracksLvl: landData.barracksLevel,
          trainingCampLvl: landData.trainingCampLevel,
          goodsBalance: [landData.goodsBalance[0], landData.goodsBalance[1]],
          buildedResourceBuildings: landData.buildedResourceBuildings,
          remainedBuildTime,
          army,
        };
        loadedTokenId.current = landKey(chosenTokenId);
        setInViewLand(land);
      } catch (error) {
        // Leave loadedTokenId alone so the next trigger retries this land.
        console.log("We have a trouble with getting inViewLand", error);
      } finally {
        if (requestId.current === id) {
          inFlightTokenId.current = null;
          // Unconditional for a blocking load: a failed read must not leave
          // the game behind a spinner with no way out.
          if (blocking) setIsUserDataLoading(false);
        }
      }
    })();
  }, [
    chosenTokenId,
    deployment,
    town,
    address,
    chainId,
    landRefresh,
    isUserDataLoading,
    mintedLands,
  ]);

  // Resource buildings come from the event log, not from a call, so they are
  // kept off the critical path above — they used to be skipped entirely when
  // the logs happened to arrive after the land data.
  useEffect(() => {
    if (!buildedResourceBuildings || chosenTokenId == null) return;
    setBuildedResBuildings(
      getOwnedBuildings(buildedResourceBuildings, chosenTokenId)
    );
  }, [buildedResourceBuildings, chosenTokenId]);

  // The wallet's PLOT balance is per address, not per land; the old effect
  // refetched it on every one of its passes.
  useEffect(() => {
    if (!address) {
      setPlotBalance(null);
      return;
    }
    let cancelled = false;
    // The method was renamed with the token, and the contract deployed behind
    // the v4 addresses has not caught up — see lib/plotBalance.ts.
    readPlotBalance(deployment, address)
      .then((balance) => !cancelled && setPlotBalance(balance as unknown as number))
      .catch((error: unknown) => {
        console.log("PLOT balance failed", error);
        // Otherwise the pill sits on the previous land's figure, or on nothing.
        if (!cancelled) setPlotBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [address, chainId, landRefresh.id, deployment]);

  // The landing page renders its own navbar (components/indexPage/plotwarLanding.tsx),
  // which already carries the brand, the same game links and Connect Wallet.
  // Returning after the hooks above keeps the land/PLOT loaders running.
  if (currentRoute === "/") return null;

  return (
    <>
      {/*
        Same bar as the landing header: .pwNav* classes in globals.css are the
        one place its colours live, so the two cannot drift apart.
      */}
      <header className=" z-50 relative">
        <div className="pwNavBar fixed w-full h-[4rem] top-0 z-100"></div>
        <nav
          className="fixed mx-auto top-0 flex   items-center justify-between px-4  lg:px-8 h-[4rem] w-screen z-100 "
          aria-label="Global"
        >
          <div className="flex  flex-row items-center gap-4  ">
            <Link href="/" className="flex flex-row items-center gap-3 cursor-pointer">
              <PlotwarMark size={30} />
              <span className="pwNavBrand hidden sm:block !text-[19px]">Plotwar</span>
            </Link>

            <div className="hidden md:flex">
              {" "}
              <ChainIdButton />
            </div>

            {/*
              Four tabs, on every screen including the landing page — the v4
              and v5 routes had no link anywhere and could only be reached by
              typing the URL. `shrink-0` so it is not squeezed out of the
              header on a narrow phone.
            */}
            <div className="shrink-0">
              <DeploymentSwitch />
            </div>
          </div>

          {currentRoute == "myLand" && <BalanceContainer />}

          <div className=" ml-3 md:ml-5 flex md:hidden   ">
            <button
              className=" -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#F4F4F1] right-0 w-fit mr-2"
              onClick={() => {
                mobileMenuOpen === false
                  ? setMobileMenuOpen(true)
                  : setMobileMenuOpen(false);
              }}
            >
              <FaBars className=" h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {currentRoute === "/" ? <NavbarLandingItems /> : <NavbarGameItems />}

          <div className=" !hidden md:!flex   justify-center items-center gap-3">
            <ConnectWallet
              className=" !bg-[#0D0F12]/60 !p-3 "
              modalSize="wide"
              theme="dark"
              welcomeScreen={{
                title: "Plotwar",
                subtitle: "Decentralized P2E game",
                img: {
                  src: "/plotwarMark.svg",
                  width: 120,
                  height: 120,
                },
              }}
            />
          </div>
        </nav>
        <div className="md:hidden">
          {/* <div className="fixed inset-0 z-30" /> */}
          {mobileMenuOpen && (
            <NavDropdownMobileScreen setMobileMenuOpen={setMobileMenuOpen} />
          )}
        </div>
      </header>
    </>
  );
}
