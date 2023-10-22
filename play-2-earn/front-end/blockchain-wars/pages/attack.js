import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import { townV2, landsV2 } from "../Blockchain/Addresses";
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
import Image from "next/image";

const metamaskConfig = metamaskWallet();

const Attack = ({
  provider,
  mintedLands,
  landObj,
  target,
  setTarget,
  existedWarriors,
}) => {
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState();
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [armyAmounts, setArmyAmounts] = useState();
  const [enteredAmounts, setEnteredAmounts] = useState([0, 0, 0]);
  const [totalEnteredAmount, setTotalEnteredAmount] = useState(0);
  const [disabler, setDisabler] = useState(false);
  const [targetObj, setTargetObj] = useState();
  const [error, setError] = useState();
  const [errorStatus, setErrorStatus] = useState();
  const [targetArmy, setTargetArmy] = useState();

  const connectWithMetamask = useMetamask();
  const router = useRouter();
  const sdk = useSDK();
  const validChainId = Sepolia.chainId;
  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  // const warriorsImageSources = [
  //   "Warriors/AchaemenidSpearman.png",
  //   "Warriors/PersianAncientWarrior.png",
  //   "Warriors/PersianArcher.png",
  // ];
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
    setError(undefined);
  };
  const handlSelectLand = async (land) => {
    setSelectedLand(land);
    setArmyAmounts(land.armyBal);
  };
  const handleArmyAmount = (index, amount) => {
    const updatedArray = [...enteredAmounts];
    updatedArray[index] = Number(amount);

    let totalAmount = 0;
    setEnteredAmounts(updatedArray);
    console.log(updatedArray);
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

  const checkTarget = async () => {
    setErrorStatus();
    setTargetArmy();
    // const chainId = await sdk.wallet.getChainId();
    // if (chainId == validChainId) {
    try {
      const landsInst = new ethers.Contract(landsV2, LandsV2.abi, provider);
      const tokenIdOwner = await landsInst.ownerOf(target);
      if (tokenIdOwner == address) {
        setErrorStatus("Target land is yours !!!");
      } else {
        const townInst = new ethers.Contract(townV2, TownV2.abi, provider);
        const targetArmy = await townInst.getArmy(target);
        setTargetArmy(targetArmy);
        console.log("Target army:", targetArmy);
        const bal = await townInst.getAssetsBal(target);
        const obj = {
          stoneBal: ethers.utils.formatEther(bal[0]),
          woodBal: ethers.utils.formatEther(bal[1]),
          ironBal: ethers.utils.formatEther(bal[2]),
          foodBal: ethers.utils.formatEther(bal[3]),
          goldBal: ethers.utils.formatEther(bal[4]),
        };
        console.log(bal);
        setTargetObj(obj);
      }
    } catch (error) {
      if (error.errorArgs[0] == "ERC721: invalid token ID") {
        setErrorStatus("Land is not minted.");
        console.log("Land is not minted.");
      } else {
        console.log(error.errorArgs);
        setIsTransactionRejected(true);
        setError(error);
      }

      // console.log(error.errorArgs);
    }
    // } else {
    //   console.log("Wrong network. Sending request to change network");
    //   await handleConnectWithMetamask();
    // }
  };

  const submitAttack = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId == validChainId && signer !== undefined) {
      try {
        console.log("Attacking...");
        console.log(enteredAmounts);
        const townInst = new Contract(townV2, TownV2.abi, signer);
        await townInst.attack(enteredAmounts, selectedLand.coordinate, target);
        setVisibleConfirmation(true);
      } catch (error) {
        console.log(error);
        setError(error);
        setIsTransactionRejected(true);
      }
    } else {
      await handleConnectWithMetamask();
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
      // const townInst = new ethers.Contract(
      //   townV2,
      //   TownV2.abi,
      //   provider
      // );
      // const warriorTypes = await townInst.getWarriorTypes();
      // setWarriorTypes(warriorTypes);
    };
    fetchData();
  }, [address, visibleConfirmation, target]);

  return (
    <div>
      <div className="scrollableScreen">
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
                </div>
              </div>
            )}
          </>
        )}

        {/* style={{"backgroundImage":"url(/War4.png)","backgroundSize":"cover","width":"100vw","height":"100vh","borderRadius":"2rem"}} */}
        <Container>
          {/* <Row className="warHeader"><img src="/War4.png"></img></Row> */}
          <Row>
            <Col className="attackBoxColumn">
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
              {Array.isArray(existedWarriors) && existedWarriors.length >= 0 ? (
                existedWarriors.map((warrior, key) => (
                  <div key={key} style={{ display: "flex" }}>
                    {/* <h4 className="defaultH5">{warrior.name}</h4> */}
                    {selectedLand !== undefined &&
                    Array.isArray(armyAmounts) &&
                    armyAmounts.length >= 0 &&
                    armyAmounts[key] > 0 ? (
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
                        <h4
                          className="defaultH4"
                          style={{
                            fontFamily: "monospace",
                            padding: "0.5rem",
                          }}
                        >
                          {armyAmounts[key].toString()} {warrior.name}
                        </h4>
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
                    // height: "200px",
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
                // Number(armyAmounts) >= totalEnteredAmount &&
                targetObj !== undefined ? (
                  <Button
                    variant="outline-light"
                    style={{ marginLeft: "auto" }}
                    onClick={submitAttack}
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
            </Col>
            <Col md={{ span: 1, offset: 0 }}>
              <img className="warImg" src="/War.png"></img>
            </Col>
            <Col className="attackBoxColumn">
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
              <Button
                variant="outline-light"
                style={{ marginLeft: "auto" }}
                onClick={checkTarget}
              >
                Check availibility
              </Button>
              {targetObj !== undefined && (
                <>
                  <div>
                    <h2 className="defaultH2">Land balance:</h2>
                    <div style={{ marginTop: "1rem" }}>
                      <div className="commodityBalance">
                        <img src="/Stone.png"></img>
                        <h5 style={{ padding: "0.3rem" }} className="defaultH5">
                          {parseFloat(targetObj.stoneBal)}
                        </h5>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Wood.png"></img>
                        <h5 style={{ padding: "0.3rem" }} className="defaultH5">
                          {parseFloat(targetObj.woodBal)}
                        </h5>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Iron.png"></img>
                        <h5 style={{ padding: "0.3rem" }} className="defaultH5">
                          {parseFloat(targetObj.ironBal)}
                        </h5>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Food.png"></img>
                        <h5 style={{ padding: "0.3rem" }} className="defaultH5">
                          {parseFloat(targetObj.foodBal)}
                        </h5>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Gold.png"></img>
                        <h5 style={{ padding: "0.3rem" }} className="defaultH5">
                          {parseFloat(targetObj.goldBal)}
                        </h5>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {errorStatus !== undefined && (
                <h4 style={{ marginTop: "2.5rem" }} className="defaultH4">
                  {errorStatus}
                </h4>
              )}
            </Col>
          </Row>
          <Row style={{ marginTop: "2rem" }}>
            <h2 className="defaultH2" style={{ marginBottom: "2rem" }}>
              Target army:
            </h2>
            {warriorsImageSources.map((warrior, key) => (
              <Col key={key} sm={3} className="warriorCol">
                {/* <Image src={warrior} height={200} width={200}></Image> */}
                <Image src={warrior} height={200} width={200} />
                {Array.isArray(existedWarriors) && Array.isArray(targetArmy) ? (
                  <h3>
                    <span>{targetArmy[key].toString()}</span>
                    {existedWarriors[key].name}
                  </h3>
                ) : (
                  <h3>Enter target</h3>
                )}
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Attack;
