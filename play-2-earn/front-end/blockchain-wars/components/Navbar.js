import React, { useState, useEffect } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Button, Navbar as MyNav } from "react-bootstrap";
import { useRouter } from "next/router";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useAddress } from "@thirdweb-dev/react";
import { landsSepolia } from "../Blockchain/Addresses";
import axios from "axios";
import dotenv from "dotenv";
import Image from "next/image";
import { ethers } from "ethers";
import { landsV2, LandsABI, townV2, TownABI } from "../Blockchain/index";
import {
  apiCall,
  getMintedLandsFromEvents,
  getConnectedAddressLands,
  getTypes,
} from "../utils";
// dotenv.config();
require("dotenv").config();

export default function Navbar({
  setExistedWarriors,
  setMintedLands,
  setOwnedLands,
  setLandObj,
  provider,
}) {
  const [balance, setBalance] = useState();
  const [owner, setOwner] = useState();
  const [fetchedEvents, setFetchedEvents] = useState([]);
  const router = useRouter();

  const apiKey = process.env.SEPOLIA_API_KEY;
  const address = useAddress();
  let a = 1;
  let events = [];
  const fetchEvents = async () => {
    // if (visibleConfirmation) {
    //   const timeout = setTimeout(() => {
    //     // setConfirmed(false);
    //     // setVisibleConfirmation(false);
    //   }, 12000);
    //   return () => clearTimeout(timeout);
    // }


    if (fetchEvents.length == 0) {
      try {
        events = await apiCall();
        setFetchedEvents(events);
        const mintedLands = await getMintedLandsFromEvents(events);
        setMintedLands(mintedLands);
        const existedWarriors = await getTypes();
        setExistedWarriors(existedWarriors);

      } catch (error) {
        console.log(error);
      }
    }
  };
  async function getData() {
    const landsInst = new ethers.Contract(landsV2, LandsABI, provider);
    // const townInst = new ethers.Contract(townV2, TownV2.abi, provider);
    const landBalance = await landsInst.balanceOf(address);
    console.log(address);
    setOwnedLands(landBalance);
    console.log(`owned lands:${landBalance.toString()}`);
    if (landBalance > 0) {
      const currentAddressLands = await getConnectedAddressLands(
        events,
        address
      );
      setLandObj(currentAddressLands);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents();
    return () => controller.abort()
    console.log(events);
    if (address != undefined && events.length > 0) {
      getData();
    }

  }, [address]);

  return (
    <MyNav expand="lg" data-bs-theme="dark" bg="transparent" style={{}}>
      <Container
        fluid
        // style={{"position":"fixed","paddingTop":"3rem"}}
      >
        <MyNav.Brand
          href="#"
          onClick={() => {
            router.push("/");
          }}
        >
          <Image
            src="/BlockdomLogo.ico"
            width={60}
            height={60}
            alt="logo"
            priority={true}
          ></Image>
        </MyNav.Brand>
        <MyNav.Toggle aria-controls="navbarScroll" />
        <MyNav.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            {/* style={{"backgroundColor":"rgba(244, 105, 227, 0.3)","borderRadius":"0.5rem","color":"white"}}  */}

            <Nav.Link
              href="#action2"
              onClick={() => {
                router.push("/map");
              }}
            >
              Explore
            </Nav.Link>
            <Nav.Link
              href="#action3"
              onClick={() => {
                router.push("/myLand");
              }}
            >
              My land
            </Nav.Link>
            <Nav.Link
              href="#action4"
              onClick={() => {
                router.push("/attack");
              }}
            >
              Attack
            </Nav.Link>
            <Nav.Link
              href="#action5"
              onClick={() => {
                router.push("/documentation");
              }}
            >
              Documentation
            </Nav.Link>
            <Nav.Link
              href="#action6"
              onClick={() => {
                router.push("/faucet");
              }}
              style={{ color: "lightgray" }}
            >
              Faucet
            </Nav.Link>
          </Nav>
          <ConnectWallet
            auth={{ loginOptional: false }}
            theme="dark"
            dropdownPosition={{
              side: "bottom",
              align: "center",
            }}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "none",
              color: "white",
            }}
            // onClick={connect}
          />
        </MyNav.Collapse>
      </Container>
    </MyNav>
  );
}
