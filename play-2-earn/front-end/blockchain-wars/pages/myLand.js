import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ethers } from "ethers";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import Accordion from "react-bootstrap/Accordion";
import CloseButton from "react-bootstrap/CloseButton";
import { landsV2, townV2, BMTAddress, town } from "../Blockchain/Addresses";
import LandsV2 from "../Blockchain/LandsV2.json";
import TownV2 from "../Blockchain/TownV2.json";
import BMT from "../Blockchain/BMT.json";
import { useRouter } from "next/router";
import { useAddress, useSigner, useMetamask } from "@thirdweb-dev/react";
import { Sepolia, Linea, LineaTestnet } from "@thirdweb-dev/chains";
import { useSDK } from "@thirdweb-dev/react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import {
  buildingsImageSources,
  warriorsImageSources,
  commodityItems,
  barracksImg,
} from "../Images/ImagesSource";

const MyLand = ({
  provider,
  landImgUrl,
  ownedLands,
  landObj,
  existedWarriors,
}) => {
  // const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [enteredAmount, setEnteredAmount] = useState();
  const [selectedItem, setSelectedItem] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [buildings, setBuildings] = useState();
  const [selectedLand, setSelectedLand] = useState();
  const [ownedBuildings, setOwnedBuildings] = useState();
  const [isValidAmount, setIsValidAmount] = useState(false);
  // const [army, setArmy] = useState();
  const [barracksLevel, setBarracksLevel] = useState();
  const [inputValue, setInputValue] = useState(""); // State variable to store the input value
  const [requiredBarracksCommodities, setRequiredBarracksCommodities] =
    useState();
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState();
  const [workerBusyTime, setWorkerBusyTime] = useState();
  const [commodityIndex, setCommodityIndex] = useState();

  const sdk = useSDK();
  const router = useRouter();
  const address = useAddress();
  const signer = useSigner();
  const connectWithMetamask = useMetamask();

  const validChainId = Sepolia.chainId;

  const convertedCommodityAmount = (amount) => {
    return Number(ethers.utils.formatEther(amount));
  };
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
  const handleChangeChainId = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(validChainId) }],
      });
      // Chain ID change request successful
    } catch (error) {
      console.log(error);
      // Handle error
    }
  };
  const handleEnteredAmount = (amount) => {
    setEnteredAmount(amount)
      if (Number(amount) <= Number(balArray()[commodityIndex])) {
        setIsValidAmount(true)
        console.log("true");
      } else {
        setIsValidAmount(false)
        console.log("false");
      }
      console.log(Number(amount));
      console.log(Number(balArray[commodityIndex]));

  }
  const handleCommodityIndex = (seletedIndex) => {
    setCommodityIndex(seletedIndex)
    if (Number(enteredAmount) <= Number(balArray()[seletedIndex])) {
      setIsValidAmount(true)
      console.log("true");
    } else {
      setIsValidAmount(false)
      console.log("false");
    }

  }

  const handleClose = () => {
    setIsTransactionRejected(false);
    setError(undefined);
  };

  const handleOpenWindow = (item) => {
    // setIsLandSelected(true);
    setSelectedItem("something");
  };

  const handleCloseLandWindow = () => {
    // setIsLandSelected(false);
    setSelectedItem({});
  };
  const balArray = () => {
    return [
      selectedLand.stone,
      selectedLand.wood,
      selectedLand.iron,
      selectedLand.food,
      selectedLand.gold,
    ];
  };

  const approve = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        console.log(ethers.utils.parseEther(enteredAmount));
        const BMTInst = new ethers.Contract(BMTAddress, BMT.abi, signer);
        const balance = await BMTInst.balanceOf(address);
        console.log(balance.toString());
        console.log("Instance loaded");
        await BMTInst.approve(townV2, ethers.utils.parseEther(enteredAmount));
        console.log("Approved");
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  }
  const deposit = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        // console.log(ethers.utils.parseEther(enteredAmount));
        // const BMTInst = new ethers.Contract(BMTAddress, BMT.abi, signer);
        // const balance = await BMTInst.balanceOf(address);
        // console.log(balance.toString());
        // console.log("instance");
        // await BMTInst.approve(townV2, ethers.utils.parseEther(enteredAmount));
        // console.log("approved");
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        await TownInstance.deposit(
          selectedLand.coordinate,
          ethers.utils.parseEther(enteredAmount)
        );
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };
  const splitDeposit = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        // console.log(ethers.utils.parseEther(enteredAmount));
        // const BMTInst = new ethers.Contract(BMTAddress, BMT.abi, signer);
        // const balance = await BMTInst.balanceOf(address);
        // console.log(balance.toString());
        // console.log("instance");
        // await BMTInst.approve(townV2, ethers.utils.parseEther(enteredAmount));
        // console.log("approved");
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        console.log(TownInstance);
        await TownInstance.splitDeposit(
          selectedLand.coordinate,
          ethers.utils.parseEther(enteredAmount)
        );
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };
  const withdraw = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        // console.log(ethers.utils.parseEther(enteredAmount));
        // const BKTInst = new ethers.Contract(BKTAddress, BKT.abi, signer);
        // await BKTInst.approve(townV2, ethers.utils.parseEther(enteredAmount));
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        await TownInstance.withdraw(
          ethers.utils.parseEther(enteredAmount),
          selectedLand.coordinate,
          commodityIndex
        );
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };

  const mintBuilding = async (buildingIndex) => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        console.log("Minting building...");
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        console.log(TownInstance);
        console.log(selectedLand.coordinate, buildingIndex);
        await TownInstance.build(selectedLand.coordinate, buildingIndex);
        console.log("Confirming tx...");
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };
  const upgradeBarracks = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        await TownInstance.buildBarracks(selectedLand.coordinate);
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };
  const claimRev = async (buildingTokenId) => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        await TownInstance.claimRevenue(buildingTokenId);
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };

  const upgradeBuilding = async (buildingTokenId) => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId !== validChainId) {
      await handleChangeChainId();
    } else {
      try {
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        await TownInstance.upgrade(buildingTokenId, selectedLand.coordinate);
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    }
  };

  const recruit = async (typeIndex) => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId == validChainId) {
      try {
        console.log(typeIndex);
        console.log("Input value:", inputValue);
        console.log(signer);
        const TownInstance = new ethers.Contract(townV2, TownV2.abi, signer);
        const goldBal = await TownInstance.getAssetsBal(
          selectedLand.coordinate
        );
        console.log(goldBal.toString());
        await TownInstance.recruit(
          selectedLand.coordinate,
          typeIndex,
          inputValue
        );
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsTransactionRejected(true);
      }
    } else {
      await handleChangeChainId();
    }
  };

  useEffect(() => {

    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(true);
      }, 10000);
    }
    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(false);
        setVisibleConfirmation(false);
      }, 12000);
      return () => clearTimeout(timeout);
    }
    const fetchData = async () => {
      if (ownedLands !== undefined && ownedLands == 0) {
        setIsFetching(false);
      }
      if (signer && address && selectedLand !== undefined && provider) {
        console.log("Useeffect called");

        const townInstance = new ethers.Contract(townV2, TownV2.abi, provider);
        const landData = await townInstance.getLandIdData(
          selectedLand.coordinate
        );

        console.log(landData);
        const ownedBuildings_ = landData.buildedBuildings;
        const existedBuildings = await townInstance.getBuildings();
        console.log(existedBuildings);
        setBuildings(existedBuildings);
        // const existedWarriors = await townInstance.getWarriorTypes();
        // const landArmy = await townInstance.getArmy(selectedLand.coordinate);
        const barracksLvl = landData.barracksLevel;

        setBarracksLevel(barracksLvl); //// Replace and edit this
        console.log("Existed warriors:", existedWarriors);
        const requiredComs = await townInstance.getBarracksRequiredCommodities(
          selectedLand.coordinate
        );
        console.log("Required barracks coms:", requiredComs);
        setRequiredBarracksCommodities(requiredComs);
        // console.log("Current existed army:", landArmy);
        if (ownedBuildings_.length > 0) {
          const busyTime = await townInstance.getRemainedTimestamp(
            selectedLand.coordinate
          );
          console.log(
            "worker will be busy for",
            busyTime.toString(),
            "minutes"
          );
          setWorkerBusyTime(busyTime);

          let ownedBuildingsArray = [];
          for (let index = 0; index < ownedBuildings_.length; index++) {
            const status = await townInstance.getStatus(ownedBuildings_[index]);
            const revenue = await townInstance.getCurrentRevenue(
              ownedBuildings_[index]
            );
            ownedBuildingsArray.push({
              imageURL: buildingsImageSources[status.buildingTypeIndex],
              name: existedBuildings[status.buildingTypeIndex].buildingName,
              tokenId: ownedBuildings_[index],
              level: status.level,
              revenue: revenue,
            });
          }
          setOwnedBuildings(ownedBuildingsArray);
          console.log("Owned buildings");
          console.log(ownedBuildingsArray);
        } else {
          console.log("User still does not have any buildings");
          setOwnedBuildings([]);
        }
      }
    };
    fetchData();

  }, [
    provider,
    ownedLands,
    address,
    signer,
    selectedLand,
    visibleConfirmation,
    selectedLand,
  ]);

  return (
    <>
      <div className="scrollableScreen">
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
        {visibleConfirmation == true && (
          <>
            {confirmed == false ? (
              <div
                className="overlay"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="popUpConfirmation">
                  <h3 className="defaultH3">
                    Confirming...
                  </h3>

                  <Spinner
                    animation="border"
                    role="status"
 
                  ></Spinner>
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

        <Container>
          {Array.isArray(landObj) && landObj.length > 0 && landImgUrl ? (
            <>
              {selectedLand == undefined && (
                <Row>
                  <h2 className="defaultH2">Connected address lands:</h2>
                </Row>
              )}

              <Row>
                {selectedLand == undefined &&
                  landObj.map((land, key) => (
                    <React.Fragment key={land.coordinate + key}>
                      <Col
                        //  md={{ span: 3, offset: 0 }}
                        md="auto"
                      >
                        <div className="landCard">
                          <img src={landImgUrl}></img>
                          <div>
                            <h2 className="defaultH2">Land</h2>
                            <p>Coordinate: {land.coordinate}</p>
                            <button
                              className="sGreenButton"
                              style={{
                                // padding: "0.3rem",
                                // borderRadius: "0.5rem",
                                marginBottom: "1rem",
                                // width: "100px",
                              }}
                              onClick={() => setSelectedLand(land)}
                            >
                              Open
                            </button>
                            {/* <Button
                            style={{"marginBottom":"1rem"}}
                              variant="light"
                              onClick={() => setSelectedLand(land)}
                            >
                              Open
                            </Button> */}
                          </div>
                        </div>
                      </Col>
                    </React.Fragment>
                  ))}
              </Row>
            </>
          ) : (
            <>
              {address != undefined && isFetching ? (
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
              ) : (
                <Row>
                  <Col
                    md={{ span: 4, offset: 4 }}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <div style={{ display: "block", textAlign: "center" }}>
                      {address == undefined ? (
                        <h4 className="defaultH4">
                          Please{" "}
                          <span
                            style={{
                              textDecoration: "underLine",
                              color: "white",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                            onClick={() => handleConnectWithMetamask()}
                          >
                            connect
                          </span>{" "}
                          your wallet.
                        </h4>
                      ) : (
                        <>
                          <h4 className="defaultH4">Not land found.</h4>
                          <h4 className="defaultH4">
                            To participate in game you need a land.
                          </h4>
                          <h4 className="defaultH4">
                            <span
                              onClick={() => {
                                router.push("/map");
                              }}
                              style={{
                                textDecoration: "underLine",
                                cursor: "pointer",
                                color: "white",
                              }}
                            >
                              Explore
                            </span>{" "}
                            and mint your land.
                          </h4>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}
          {selectedLand !== undefined && (
            <>
              <Row>
                <Col>
                  <div className="myLandHeader">
                  <h2 className="defaultH2">Lands :</h2>
                    {
                  landObj.map((land, key) => (
                    <React.Fragment key={land.coordinate + key}>
                          <div className="myLandsContainer" >
                        
                            <p>Land {land.coordinate}</p>
          
                          </div>
       
              
                    </React.Fragment>
                  ))}
                    {/* <h4
                      className="textButton"
                      onClick={() => setSelectedLand()}
                    >
                      &lt; Back
                    </h4> */}
                    {/* <Button variant="outline-light">Attack</Button> */}
                    <div
                      className="attackRouteButton"
                      onClick={() => {
                        router.push("/attack");
                      }}
                    >
                      <h4

                      // style={{"padding":"0.5rem","border":"2px solid white","borderRadius":"0.4rem"}}
                      >
                        Attack
                      </h4>
                      <img src="War.png"></img>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "3rem", minHeight: "300px" }}>
                <Col className="transferCol" sm={3}>
                  <InputGroup className="mb-3" size="sm">
                    <Form.Control
                      placeholder="Enter amount..."
                      aria-label="Amount (to the nearest dollar)"
                      onChange={(e) => handleEnteredAmount(e.target.value)}
                    />
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                        className="selectDropdown"
                        style={{ minWidth: "80px" }}
                      >
                        {commodityIndex == undefined
                          ? "Select"
                          : commodityItems[commodityIndex].name}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {commodityItems.map((commodity, key) => (
                          <Dropdown.Item
                            href="#/action-1"
                            key={key}
                            onClick={() => handleCommodityIndex(key)}
                          >
                            <img
                              src={commodity.image}
                              className="dropdownTokenLogo"
                            ></img>
                            {commodity.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup>
                  {/* <button className="sGreenButton">Deposit</button> */}

                  {/* <button className="sGreenButton">Split deposit</button> */}
                  <Button
                    variant="success"
                    size="sm"
                    style={{ marginRight: "10px" }}
                    onClick={() => approve()}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    style={{ marginRight: "10px" }}
                    onClick={() => splitDeposit()}
                  >
                    Split deposit
                  </Button>

                  {commodityIndex !== undefined ? (
                    // <button className="sGreenButton">Withdraw</button>
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        style={{ marginRight: "10px" }}
                        onClick={() => deposit()}
                      >
                        Deposit
                      </Button>
                      {isValidAmount == true ? (                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => withdraw()}
                      >
                        Withdraw
                      </Button>) :(
                        <Button variant="success" size="sm" disabled>
                        Withdraw
                      </Button>
                      ) }

                    </>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        style={{ marginRight: "10px" }}
                        disabled
                      >
                        Deposit
                      </Button>
                      <Button variant="success" size="sm" disabled>
                        Withdraw
                      </Button>
                    </>
                  )}
                </Col>
                <Col className="BalTableCol" sm={3}>
                  <Table striped bordered hover size="sm">
                    <tbody>
                      <tr>
                        <td className="tableLine">
                          <img src="/Stone.png" />
                        </td>
                        <td className="tableLine">
                          {selectedLand.stone !== undefined
                            ? selectedLand.stone
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td className="tableLine">
                          <img src="/Wood.png" />
                        </td>
                        <td className="tableLine">
                          {selectedLand.wood !== undefined
                            ? selectedLand.wood
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td className="tableLine">
                          <img src="/Iron.png" />
                        </td>
                        <td className="tableLine">
                          {selectedLand.iron !== undefined
                            ? selectedLand.iron
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td className="tableLine">
                          <img src="/Food.png" />
                        </td>
                        <td className="tableLine">
                          {selectedLand.food !== undefined
                            ? selectedLand.food
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td className="tableLine">
                          <img src="/Gold.png" />
                        </td>
                        <td className="tableLine">
                          {selectedLand.gold !== undefined
                            ? selectedLand.gold
                            : "0"}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col className="BalTableCol" sm={3}>
                  {Array.isArray(existedWarriors) &&
                    existedWarriors.length > 0 &&
                    Array.isArray(selectedLand.armyBal) &&
                    selectedLand.armyBal.length > 0 && (
                      <Table striped bordered hover size="sm">
                        <tbody>
                          {existedWarriors.map((warrior, key) => (
                            <tr key={key}>
                              <td className="tableLine">{warrior.name}</td>
                              <td className="tableLine">
                                {selectedLand.armyBal[key].toString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  {existedWarriors == undefined &&
                    selectedLand.armyBal == undefined && (
                      <h5 className="defaultH5" style={{ textAlign: "center" }}>
                        {" "}
                        Loading army...
                      </h5>
                    )}
                </Col>
                <Col className="workerStatusBox" sm={3}>
                  {workerBusyTime > 0 && workerBusyTime != undefined ? (
                    <div className="timer">
                      <Spinner animation="grow" variant="success" />
                      <h4>Wroker is busy.</h4>
                      <h3>
                        {`${Math.floor(workerBusyTime / 60)} hours ${
                          workerBusyTime % 60
                        } minutes`}
                      </h3>
                    </div>
                  ) : (
                    <>
                      {workerBusyTime == undefined ? (
                        ""
                      ) : (
                        <h4>Worker is ready.</h4>
                      )}
                    </>
                  )}
                </Col>
                {/* <Col sm={3} className="warHistoryCol">
                  <h2>War history</h2>
                  <div className="warHistory">
                  <p>something</p>
                  </div>

                </Col> */}
              </Row>

              <Row style={{ marginTop: "1rem" }}>
                {/* <h3 className="defaultH4" style={{"textAlign":"center"}}> {workerBusyTime > 0 ? `Wroker will be free in ${workerBusyTime.toString()} minutes.` : "Worker is ready."}</h3> */}
                {Array.isArray(ownedBuildings) && ownedBuildings.length > 0 ? (
                  ownedBuildings.map((item, key) => (
                    <Col key={key} md={{ span: 6, offset: 0 }}>
                      <div className="listItemInfo">
                        <img src={item.imageURL}></img>
                        <div className="infoColumn">
                          <h2 className="defaultH2">{item.name}</h2>
                          <h4>
                            Revenue: {ethers.utils.formatEther(item.revenue)}
                          </h4>
                          <div>
                            <Button
                              variant="success"
                              style={{ marginBottom: "0.5rem" }}
                              onClick={() =>
                                claimRev(ownedBuildings[key].tokenId)
                              }
                              size="sm"
                            >
                              Earn
                            </Button>
                          </div>
                          <h4>level: {item.level.toString()}</h4>
                          <div>
                            {workerBusyTime !== undefined &&
                            workerBusyTime > 0 ? (
                              <Button
                                variant="success"
                                style={{}}
                                size="sm"
                                disabled
                              >
                                Upgrade
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                style={{}}
                                onClick={() =>
                                  upgradeBuilding(ownedBuildings[key].tokenId)
                                }
                                size="sm"
                              >
                                Upgrade
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))
                ) : (
                  <>
                    {ownedBuildings !== undefined &&
                    ownedBuildings.length == 0 ? (
                      <Col
                        md={{ span: 4, offset: 4 }}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <div
                          style={{
                            display: "block",
                            textAlign: "center",
                            height: "200px",
                            padding: "10%",
                          }}
                        >
                          <h4 className="defaultH4">
                            Not Building found for land.
                          </h4>
                          <h4 className="defaultH4">
                            Build your first building through the buildings list
                            below.
                          </h4>
                        </div>
                      </Col>
                    ) : (
                      <div
                        style={{
                          display: "block",
                          marginTop: "1%",
                          marginBottom: "1%",
                          height: "200px",
                          padding: "10%",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        <h4 className="defaultH4">Loading buildings...</h4>
                        <Spinner
                          animation="border"
                          role="status"
                          style={{ textAlign: "center", color: "white" }}
                        >
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    )}
                  </>
                )}
              </Row>
              <Row style={{ marginTop: "1rem" }}>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Buildings</Accordion.Header>
                    <Accordion.Body>
                      <div className="listItemColumn">
                        {Array.isArray(requiredBarracksCommodities) && (
                          <Col>
                            <div
                              className="listItemInfo"
                              style={{ backgroundColor: "transparent" }}
                            >
                              <img src={barracksImg}></img>
                              <div className="InfoColumn">
                                <div style={{ padding: "0.5rem" }}>
                                  <h2 className="defaultH2">
                                    Barracks{" "}
                                    {barracksLevel !== undefined &&
                                      ` (level: ${barracksLevel.toString()})`}
                                  </h2>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Stone.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {convertedCommodityAmount(
                                      requiredBarracksCommodities[0]
                                    )}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Wood.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {convertedCommodityAmount(
                                      requiredBarracksCommodities[1]
                                    )}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Iron.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {convertedCommodityAmount(
                                      requiredBarracksCommodities[2]
                                    )}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Food.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {convertedCommodityAmount(
                                      requiredBarracksCommodities[4]
                                    )}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Gold.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {convertedCommodityAmount(
                                      requiredBarracksCommodities[3]
                                    )}
                                  </p>
                                </div>
                     
                              </div>
                              <div className="InfoColumn">
                                {Number(selectedLand.stone) <=
                                  convertedCommodityAmount(
                                    requiredBarracksCommodities[0]
                                  ) ||
                                Number(selectedLand.wood) <=
                                  convertedCommodityAmount(
                                    requiredBarracksCommodities[1]
                                  ) ||
                                Number(selectedLand.iron) <=
                                  convertedCommodityAmount(
                                    requiredBarracksCommodities[2]
                                  ) ||
                   
                                Number(selectedLand.food) <=
                                  convertedCommodityAmount(
                                    requiredBarracksCommodities[4]
                                  ) ||
                                  Number(selectedLand.gold) <=
                                  convertedCommodityAmount(
                                    requiredBarracksCommodities[3]
                                  ) ||
                                workerBusyTime > 0 ? (
                                  <Button variant="success" disabled>
                                    Upgrade
                                  </Button>
                                ) : (
                                  // <button className="sGreenButton" onClick={() => upgradeBarracks(key)}>Build</button>
                                  <Button
                                    // size="sm"
                                    style={{ bottom: "0px" }}
                                    variant="success"
                                    onClick={() => upgradeBarracks()}
                                  >
                                    Upgrade
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Col>
                        )}
                        {Array.isArray(buildings) &&
                          buildings.map((item, key) => (
                            <Col key={key}>
                              <div className="listItemInfo">
                                <img src={buildingsImageSources[key]}></img>
                                <div className="InfoColumn">
                                  <div style={{ padding: "0.5rem" }}>
                                    <h2 className="defaultH2">
                                      {item.buildingName}
                                    </h2>
                                  </div>
                                  <div className="commodityBalance">
                                    <img
                                      src="/Stone.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredStone
                                      )}
                                    </p>
                                  </div>
                                  <div className="commodityBalance">
                                    <img
                                      src="/Wood.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredWood
                                      )}
                                    </p>
                                  </div>
                                  <div className="commodityBalance">
                                    <img
                                      src="/Iron.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredIron
                                      )}
                                    </p>
                                  </div>
                     
                                  <div className="commodityBalance">
                                    <img
                                      src="/Food.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredFood
                                      )}
                                    </p>
                                  </div>
                                  <div className="commodityBalance">
                                    <img
                                      src="/Gold.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredGold
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="InfoColumn">
                                  <p>Difficulty: 0%</p>
                                  {Number(selectedLand.stone) <=
                                    Number(
                                      ethers.utils.formatEther(
                                        item.requiredStone
                                      )
                                    ) ||
                                  Number(selectedLand.wood) <=
                                    Number(
                                      ethers.utils.formatEther(
                                        item.requiredWood
                                      )
                                    ) ||
                                  Number(selectedLand.iron) <=
                                    Number(
                                      ethers.utils.formatEther(
                                        item.requiredIron
                                      )
                                    ) ||
                                  Number(selectedLand.gold) <=
                                    Number(
                                      ethers.utils.formatEther(
                                        item.requiredGold
                                      )
                                    ) ||
                                  Number(selectedLand.food) <=
                                    Number(
                                      ethers.utils.formatEther(
                                        item.requiredFood
                                      )
                                    ) ||
                                  workerBusyTime > 0 ? (
                                    // <button className="sGreenButton" disabled>Build</button>
                                    <Button variant="success" disabled>
                                      Build
                                    </Button>
                                  ) : (
                                    // <button className="sGreenButton" onClick={() => mintBuilding(key)}>Build</button>
                                    <Button
                                      style={{ bottom: "0px" }}
                                      onClick={() => mintBuilding(key)}
                                      variant="success"
                                    >
                                      Build
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Col>
                          ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                  {/* <Accordion.Item eventKey="1" className="accordionBackground">
                    <Accordion.Header className="accordion">
                      Barracks{" "}
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="listItemColumn">


                        {Array.isArray(existedWarriors) &&
                          existedWarriors.map((item, key) => (
                            <Col key={key}>
                              <div className="listItemInfo">
                                <img
                                  className="warriorImage"
                                  src={warriorsImageSources[key]}
                                ></img>
                                <div className="InfoColumn">
                                  <div style={{ padding: "0.5rem" }}>
                                    <h2 className="defaultH2">{item.name}</h2>
                                  </div>
                                  <p>Attack power: {item.attackPower}</p>
                                  <p>Defence power: {item.defPower}</p>
                                  <p>HP: {item.hp}</p>
                                </div>
                                <div className="InfoColumn">
                                  <div className="commodityBalance">
                                    <p>
                                      Price:{" "}
                                      {ethers.utils.formatEther(item.price)}
                                    </p>
                                    <img
                                      src="/Gold.png"
                                      className="commodityLogo"
                                    ></img>
                                  </div>
                                  <InputGroup
                                    className="mb-3"
                                    size="sm"
                                    style={{ padding: "1rem" }}
                                  >
                                    {barracksLevel >= item.requiredLevel ? (
                                      <>
                                        <Form.Control
                                          placeholder="Enter amount..."
                                          aria-label="Amount (to the nearest dollar)"
                                          onChange={(e) =>
                                            setInputValue(e.target.value)
                                          }
                                        />
                                        <Button
                                          variant="success"
                                          onClick={() => recruit(key)}
                                        >
                                          Train
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Form.Control
                                          placeholder={`Requires barracks level ${item.requiredLevel.toString()}`}
                                          aria-label="Amount (to the nearest dollar)"
                                          disabled
                                        />
                                        <Button variant="success" disabled>
                                          Train
                                        </Button>
                                      </>
                                    )}
                                  </InputGroup>
                                </div>
                              </div>
                            </Col>
                          ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item> */}
                </Accordion>
              </Row>
              <Row style={{ marginTop: "3rem" }}>
                {Array.isArray(existedWarriors) &&
                  existedWarriors.map((warrior, key) => (
                    <Col className="warriorCard" key={key} sm={2}>
                      <img src={warriorsImageSources[key]} />
                      <div className="warriorInfoBox">
                        <div style={{ padding: "0.5rem" }}>
                          <h2>{warrior.name}</h2>
                        </div>
                        <p>Attack power: {warrior.attackPower}</p>
                        <p>Defence power: {warrior.defPower}</p>
                        <p>HP: {warrior.hp}</p>
                        <div>
                          <p>
                            Price:{" "}
                            <span>
                              {ethers.utils.formatEther(warrior.price)}{" "}
                              <img src="/Gold.png" className="commodityLogo" />
                            </span>
                          </p>
                        </div>
                        {barracksLevel >= warrior.requiredLevel ? (
                          <>
                            <InputGroup size="sm">
                              <Form.Control
                                placeholder="Enter amount..."
                                aria-label="Amount (to the nearest dollar)"
                                onChange={(e) => setInputValue(e.target.value)}
                              />
                              <Button
                                variant="outline-light"
                                onClick={() => recruit(key)}
                              >
                                Train
                              </Button>
                            </InputGroup>
                          </>
                        ) : (
                          <>
                            <InputGroup size="sm">
                              <Form.Control
                                placeholder={`Barracks level ${warrior.requiredLevel.toString()}`}
                                aria-label="Amount (to the nearest dollar)"
                                disabled
                              />
                              <Button variant="outline-light" disabled>
                                Train
                              </Button>
                            </InputGroup>
                          </>
                        )}
                      </div>
                    </Col>
                  ))}
              </Row>
            </>
          )}
        </Container>
      </div>
    </>
  );
};

export default MyLand;
