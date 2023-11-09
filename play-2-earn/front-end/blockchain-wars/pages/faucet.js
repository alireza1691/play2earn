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
  faucet
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
import { abi } from "../Blockchain/Faucet.json";
import {fetchLandsData} from "../utils"

const metamaskConfig = metamaskWallet();

const Faucet = () => {


  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState();

  // const {APIresponse} = fetchLandsData()
  const connectWithMetamask = useMetamask();
  const router = useRouter();
  const sdk = useSDK();
  const validChainId = Sepolia.chainId;
  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const handleConnectWithMetamask = async () => {
    try {
      await connectWithMetamask({
        chainId: validChainId,
      });
      // Connection successful
    } catch (error) {
      console.log("Error connecting with MetaMask:", error);
      // Handle the error gracefully without showing it on the screen
    }
  };


  const faucetReq = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId == validChainId && signer != undefined) {
      try {
        const faucetInst = new ethers.Contract(faucet, abi, signer)
        await faucetInst.faucetReq()
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error)
        setIsTransactionRejected(true);
      }
    } else {
      handleConnectWithMetamask()
    }

  }



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
  }, [address, visibleConfirmation]);

  return (
    <div>
      <div className="scrollableScreen" >
      {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionResultWindow">
              <h4>Transaction Rejected or failed</h4>
              <div className="errorContainer">
                {error !== undefined && <p>{error.message}</p>}
              </div>
              <p>Please try again or contact support.</p>
              <Button variant="outline-dark" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
        {visibleConfirmation == true && (
          <>
            {confirmed == false ? (
              <div
                className="overlay"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="popUpConfirmation">
                  <h3 className="defaultH3">Confirming...</h3>

                  <Spinner animation="border" role="status"></Spinner>
                </div>
              </div>
            ) : (
              <div className="overlay">
                <div className="transactionResultWindow">
                  <h4>Confirmed &#x2713;</h4>
                  <p>
                    To update your account you may need to refresh the page.
                  </p>
                  <Button variant="outline-dark" onClick={() => handleClose()}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Container >
            <Row style={{"marginTop":"10rem"}}>
                <Col>
                <div className="faucetBox">
                    <h2>Testnet BMT</h2>
                    <p>BDT is Blockdom token which is convertible to the game goods</p>
                    <p style={{"marginBottom":"0px"}}>100 BMT/day</p>
                    <Button style={{"marginBottom":"1rem"}} variant="success" onClick={()=> faucetReq()}>Claim</Button>
                    <p>To cover transactions fee and paying land price you need ETH.<br></br> Claim SEPOLIA ETH from <span  onClick={()=>{window.open('https://sepoliafaucet.com/')}} style={{"textDecoration":"underline","color":"yellowgreen","cursor":"pointer"}}> Alchemy</span> .</p>
                </div>
                </Col>
            </Row>
        </Container>
      </div>
    </div>
  );
};

export default Faucet;
