import React, { useState, useEffect } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { Col, Navbar as MyNav, Row } from 'react-bootstrap';
import { useRouter } from "next/router";
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useAddress } from "@thirdweb-dev/react";
import { landsSepolia } from "../Blockchain/Addresses";
import axios from "axios";
import dotenv from "dotenv";
// dotenv.config();
require("dotenv").config();

const Navbar = (
    { connect, landsInstance, setAddress, setLandsApiResponse }
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
    <Container>
        <Row style={{"marginBottom":"10rem"}}>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            
            </Col>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            </Col>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            </Col>
        </Row>
    </Container>
  );
};

export default Navbar;
