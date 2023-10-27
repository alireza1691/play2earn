import React, { useState, useEffect } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { Button, Navbar as MyNav } from 'react-bootstrap';
import { useRouter } from "next/router";
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useAddress } from "@thirdweb-dev/react";
import { landsSepolia } from "../Blockchain/Addresses";
import axios from "axios";
import dotenv from "dotenv";
import Image from "next/image"
// dotenv.config();
require("dotenv").config();

const Navbar = (
    { setAddress}
    ) => {
  const [balance, setBalance] = useState();
  const [owner, setOwner] = useState();
  const router = useRouter();

  const apiKey = process.env.SEPOLIA_API_KEY;
  const address = useAddress();

  let previousResponse

  // const etherScanApiCall = async () => {
  //   if (previousResponse == undefined) {
  //     try {
  //       const response = await axios.get(
  //         `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&apikey=${apiKey}`
  //       );
  //       console.log("Fetched events");
  //       previousResponse = response;
  //       return response;
  //     } catch (error) {}
  //   } else {
  //     console.log("Response already exist");
  //     return previousResponse;
  //   }
  // };


  useEffect(() => {
    const fetchOnchainData = async () => {
      try {
        if (address !== undefined) {
          console.log(address);
          setAddress(address)
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchOnchainData();
  }, [address]);

  return (
      <MyNav expand="lg" data-bs-theme="dark" bg="transparent" style={{
        }}>
      <Container fluid 
      // style={{"position":"fixed","paddingTop":"3rem"}}
      >
        <MyNav.Brand href="#" onClick={()=>{router.push('/')}}><Image src="/BlockdomLogo.ico" width={60} height={60} alt="logo" priority={true} ></Image></MyNav.Brand>
        <MyNav.Toggle aria-controls="navbarScroll" />
        <MyNav.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
             {/* style={{"backgroundColor":"rgba(244, 105, 227, 0.3)","borderRadius":"0.5rem","color":"white"}}  */}
             
            <Nav.Link href="#action2" onClick={()=>{router.push('/map')}}>Explore</Nav.Link>
            <Nav.Link href="#action3" onClick={()=>{router.push('/myLand')}}>My land</Nav.Link>
            <Nav.Link href="#action4" onClick={()=>{router.push('/attack')}}>Attack</Nav.Link>
            <Nav.Link href="#action5" onClick={()=>{router.push('/documentation')}}>Documentation</Nav.Link>
            <Nav.Link href="#action6" onClick={()=>{router.push('/faucet')}} style={{"color":"lightgray"}} >Faucet</Nav.Link>

          </Nav>
          <ConnectWallet
              auth={{ loginOptional: false }}
              theme="dark"
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
              style={{"backgroundColor":"rgba(0, 0, 0, 0.4)","border":"none","color":"white"}}
              // onClick={connect}
            />
        </MyNav.Collapse>
      </Container>
    </MyNav>
  );
};

export default Navbar;
