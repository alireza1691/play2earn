import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import {
  townV2,
  landsV2,
} from "../Blockchain/Addresses";
import TownV2 from "../Blockchain/TownV2.json";
import LandsV2 from "../Blockchain/LandsV2.json";
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
import { useRouter } from "next/router";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useSDK } from "@thirdweb-dev/react";
import { Sepolia, Linea, LineaTestnet } from "@thirdweb-dev/chains";
import { warriorsImageSources, commodityItems } from "../Images/ImagesSource";


const metamaskConfig = metamaskWallet();

const attack = ({ provider, mintedLands, landObj, target, setTarget ,  existedWarriors}) => {
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState();


  const connectWithMetamask = useMetamask();
  const router = useRouter();
  const sdk = useSDK();
  const validChainId = Sepolia.chainId;
  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();



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
  }, [address, visibleConfirmation, target]);

  return (
    <div>
      <div className="scrollableScreen" >
        {visibleConfirmation == true && (
          <>
            {confirmed == false ? (
              <div
                className="overlay"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="popUpConfirmation">
                  <h4 style={{ color: "black" }} className="defaultH4">
                    Confirming...
                  </h4>

                  <Spinner
                    animation="border"
                    role="status"
                    style={{ color: "black" }}
                  >
                  </Spinner>
                </div>
              </div>
            ) : (
              <div className="overlay">
                <div className="transactionResultWindow">
                  <h4>Confirmed &#x2713;</h4>
                  <p>
                    To update your account you may need to refresh the page.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionResultWindow">
              <div className="closeButtonContainer">
                <CloseButton
                  className="closeButton"
                  onClick={handleClose}
                ></CloseButton>
              </div>
              <h4>Transaction Rejected or failed</h4>
              <div className="errorContainer">
                {error !== undefined && <p>{error.message}</p>}
              </div>
              <p>Please try again or contact support.</p>
            </div>
          </div>
        )}
        <Container >
            <Row>
                <Col>
                <div className="faucetBox"></div>
                </Col>
            </Row>
        </Container>
      </div>
    </div>
  );
};

export default attack;
