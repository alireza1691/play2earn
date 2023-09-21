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
  barracks,
  lands,
} from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import Barracks from "../Blockchain/Barracks.json";
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
import { useRouter } from "next/router";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useSDK } from "@thirdweb-dev/react";
import { Sepolia, Linea, LineaTestnet } from "@thirdweb-dev/chains";

const metamaskConfig = metamaskWallet();

const attack = ({ provider, mintedLands, landObj, target, setTarget }) => {
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState();
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [warriorTypes, setWarriorTypes] = useState();
  const [armyAmounts, setArmyAmounts] = useState();
  const [enteredAmounts, setEnteredAmounts] = useState([]);
  const [totalEnteredAmount, setTotalEnteredAmount] = useState(0);
  const [disabler, setDisabler] = useState(false);
  const [targetObj, setTargetObj] = useState();

  const connectWithMetamask = useMetamask();
  const router = useRouter();
  const sdk = useSDK();
  const validChainId = Sepolia.chainId;
  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const weaponsArray = [
    "/weapon/Spear.png",
    "/weapon/Sword.png",
    "/weapon/Archery.png",
  ];

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

  const handleClose = () => {
    setIsTransactionRejected(false);
  };
  const handlSelectLand = async (land) => {
    setSelectedLand(land);
    const barracksInst = new Contract(barracks, Barracks.abi, provider);
    const userArmy = await barracksInst.getArmy(land.coordinate);
    setArmyAmounts(userArmy);
    console.log(userArmy);
  };
  const handleArmyAmount = (index, amount) => {
    const updatedArray = [...enteredAmounts];
    updatedArray[index] = Number(amount);
    console.log(updatedArray);

    let totalAmount = 0;
    setEnteredAmounts(updatedArray);
    let balLimit = false;
    for (let i = 0; i < updatedArray.length; i++) {
      const bal = Number(armyAmounts[0][i]);
      let element = updatedArray[i];
      if (element == undefined) {
        element = 0;
      }
      if (updatedArray[i] > bal) {
        balLimit = true;
      }
      totalAmount += element;
    }
    console.log(totalAmount);
    setTotalEnteredAmount(totalAmount);
    setDisabler(balLimit);
  };

  const checkTarget = async () =>{
    const chainId = await sdk.wallet.getChainId();
    if (chainId == validChainId) {
      const landsInst = new ethers.Contract(lands, Lands.abi, provider)
      const tokenIdOwner = await landsInst.ownerOf(target)
      console.log(tokenIdOwner);
      // const bal = await landsInst.getAssetsBal(target)
    } else {
      await handleConnectWithMetamask();
    }
  }

  const attack = async () => {
    try {
      // const barracksInst = new Contract(barracks, Barracks.abi, provider);
      // await barracksInst.attack()
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
      const barracksInst = new ethers.Contract(barracks, Barracks.abi, provider);
      const warriorTypes = await barracksInst.getTypes();
      setWarriorTypes(warriorTypes);
      console.log(target);
    };
    fetchData();
  }, [address, visibleConfirmation, target]);

  return (
    <>
      <div className="scrollableScreen">
        {visibleConfirmation == true && (
          <>
            {confirmed == false ? (
              <div
                className="overlay"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="popUpConfirmation">
                  <h4 style={{ color: "white" }} className="defaultH4">
                    Confirming...
                  </h4>

                  <Spinner
                    animation="border"
                    role="status"
                    style={{ color: "white" }}
                  >
                    <span
                      style={{ color: "white" }}
                      className="visually-hidden"
                    >
                      Loading...
                    </span>
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

        <Container>
          <Row>
            <div className="attackContainder">
              <div className="selectArmyColumn">
                <h4 className="defaultH4">Land:</h4>
                <DropdownButton
                  id="dropdown-basic-button"
                  title={
                    selectedLand !== undefined
                      ? `Land ${selectedLand.coordinate}`
                      : "Select your land"
                  }
                  variant="light"
                >
                  {Array.isArray(landObj) && landObj.length > 0 ? (
                    landObj.map((land, key) => (
                      <Dropdown.Item
                        href="#/action-3"
                        key={key}
                        value={land[key]}
                        onClick={() => handlSelectLand(land)}
                        style={{ fontFamily: "verdana", fontSize: "0.8rem" }}
                      >
                        Land {land.coordinate}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item
                      style={{ fontFamily: "verdana", fontSize: "0.8rem" }}
                      href="#/action-3"
                      disabled
                    >
                      Loading lands...
                    </Dropdown.Item>
                  )}
                </DropdownButton>
                <h4 className="defaultH4" style={{ marginTop: "15px" }}>
                  Army:
                </h4>
                {Array.isArray(warriorTypes) && warriorTypes.length >= 0 ? (
                  warriorTypes.map((warrior, key) => (
                    <div key={key} style={{ display: "flex" }}>
                      {/* <h4 className="defaultH5">{warrior.name}</h4> */}
                      {selectedLand !== undefined &&
                      Array.isArray(armyAmounts) &&
                      armyAmounts.length >= 0 &&
                      armyAmounts[0][key] > 0 ? (
                        <>
                          <Form.Control
                            size="sm"
                            style={{ width: "50%", marginBottom: "0.5rem" }}
                            placeholder={`Enter the ${warrior.name} amount`}
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            onChange={(e) =>
                              handleArmyAmount(key, e.target.value)
                            }
                          />
                          <h5
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.9rem",
                              color: "white",
                              padding: "0.5rem",
                            }}
                          >
                            {armyAmounts[0][key].toString()} {warrior.name}
                          </h5>
                        </>
                      ) : (
                        <Form.Control
                          size="sm"
                          style={{
                            width: "50%",
                            marginBottom: "0.5rem",
                            backgroundColor: "silver",
                          }}
                          placeholder={`You have not any ${warrior.name}.`}
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          disabled
                        />
                      )}
                    </div>
                  ))
                ) : (
                  // Loading...
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
                    <h2
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        color: "white",
                      }}
                    >
                      Loading...
                    </h2>
                    <Spinner
                      animation="border"
                      role="status"
                      style={{ textAlign: "center", color: "white" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}
                <div style={{ display: "flex", width: "100%" }}>
                  {armyAmounts !== undefined &&
                  Number(armyAmounts[1]) >= totalEnteredAmount ? (
                    <Button
                      variant="outline-light"
                      style={{ marginLeft: "auto" }}
                    >
                      Attack
                    </Button>
                  ) : (
                    <Button
                      variant="outline-light"
                      style={{ marginLeft: "auto" }}
                      disabled
                    >
                      Attack
                    </Button>
                  )}
                </div>
              </div>
              <div className="targetInfo">
                <h4 className="defaultH4">Target:</h4>
                <Form.Control
                  size="sm"
                  style={{ width: "50%", marginBottom: "0.5rem" }}
                  placeholder={`Enter coodtinate (token ID) of the target`}
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                  onChange={(e) => setTarget(e.target.value)}
                  value={target}
                />
                <Button variant="outline-light" style={{ marginLeft: "auto" }} onClick={checkTarget}>
                  Check availibility
                </Button>
                {targetObj !== undefined && (
                  <div>
                    <div className="commodityBalance">
                      <img src="/Stone.png"></img>
                      <h6>{landBal.stoneBal}</h6>
                    </div>
                    <div className="commodityBalance">
                      <img src="/Wood.png"></img>
                      <h6>{landBal.woodBal}</h6>
                    </div>
                    <div className="commodityBalance">
                      <img src="/Iron.png"></img>
                      <h6>{landBal.ironBal}</h6>
                    </div>
                    <div className="commodityBalance">
                      <img src="/Gold.png"></img>
                      <h6>{landBal.goldBal}</h6>
                    </div>
                    <div className="commodityBalance">
                      <img src="/Food.png"></img>
                      <h6>{landBal.foodBal}</h6>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default attack;
