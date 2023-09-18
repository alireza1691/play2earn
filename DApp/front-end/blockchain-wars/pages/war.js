import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import {
  landsSepolia,
  armySepolia,
  townSepolia,
} from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import Army from "../Blockchain/Army.json";
import Town from "../Blockchain/Town.json";
import { Contract, ethers } from "ethers";
import {
  useSigner,
  useConnect,
  useMetamask,
  useWalletConnect,
  metamaskWallet,
  useAddress,
} from "@thirdweb-dev/react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CloseButton from "react-bootstrap/CloseButton";
import { Sepolia, Linea } from "@thirdweb-dev/chains";
import { useRouter } from "next/router";

const metamaskConfig = metamaskWallet();

const lands = ({ provider, landImgUrl, mintedLands, dataLoad }) => {
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);


  const connectWithMetamask = useMetamask();
  const router = useRouter();

  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const attack = async () => {
    try {

      setVisibleConfirmation(true);
    } catch (error) {
      setIsTransactionRejected(true);
    }
  };



  useEffect(() => {
    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(true);
      }, 6000);
    }
    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(false);
        setVisibleConfirmation(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }
    const fetchData = async () => {

    };
    fetchData();
  }, [address, visibleConfirmation, mintedLands]);

  return (
    <>
      <div className="scrollableScreen">
        {visibleConfirmation == true && (
          <div className="popUpConfirmation">
            <div
              style={{
                display: "block",
                marginTop: "1%",
                height: "200px",
                paddingTop: "15%",
                width: "100%",
                textAlign: "center",
              }}
            >
              {confirmed == false ? (
                <>
                  <h4 style={{ color: "black" }} className="defaultH4">
                    Confirming...
                  </h4>

                  <Spinner
                    animation="border"
                    role="status"
                    style={{ textAlign: "center", color: "rgb(73, 90, 246)" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>
                  <h4 style={{ color: "black" }} className="defaultH4">
                    Confirmed.
                  </h4>
                  <h4 style={{ color: "black" }} className="defaultH4">
                    Please refresh the page.
                  </h4>
                </>
              )}
            </div>
          </div>
        )}
        
        {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionRejectWindow">
              <p>Transaction rejected or failed</p>
              <p>Please try again or contact support.</p>
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                size="sm"
                style={{ cursor: "pointer" }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
       
           
        <Container>
          <Row>
            
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
