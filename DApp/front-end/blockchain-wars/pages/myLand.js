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
import {
  landsSepolia,
  townSepolia,
  armySepolia,
} from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import Town from "../Blockchain/Town.json";
import Army from "../Blockchain/Army.json";
import { useRouter } from "next/router";
import { useAddress, useSigner, useMetamask } from "@thirdweb-dev/react";

const lands = ({ provider, landImgUrl, ownedLands, landObj }) => {
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [buildings, setBuildings] = useState();
  const [selectedLand, setSelectedLand] = useState();
  const [ownedBuildings, setOwnedBuildings] = useState();
  const [existedWarriors, setExistedWarriors] = useState();
  const [army, setArmy] = useState();
  const [barracksLevel, setBarracksLevel] = useState();
  const [inputValue, setInputValue] = useState(""); // State variable to store the input value
  const [requiredBarracksCommodities, setRequiredBarracksCommodities] =
    useState();
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const router = useRouter();
  const address = useAddress();
  const signer = useSigner();
  const connectWithMetamask = useMetamask();

  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const handleOpenWindow = (item) => {
    setIsLandSelected(true);
    setSelectedItem("something");
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedItem({});
  };

  const mintBuilding = async (buildingIndex) => {
    try {
      const TownInstance = new ethers.Contract(townSepolia, Town.abi, signer);
      await TownInstance.build(selectedLand.coordinate, buildingIndex);
      setVisibleConfirmation(true);
    } catch (error) {
      console.log(error);
    }
  };
  const upgradeBarracks = async () => {
    try {
      const army = new ethers.Contract(armySepolia, Army.abi, signer);
      await army.buildBarracks(selectedLand.coordinate);
      setVisibleConfirmation(true);
    } catch (error) {
      setIsTransactionRejected(true);
    }
  };
  const claimRev = async (buildingTokenId) => {
    try {
      const TownInstance = new ethers.Contract(townSepolia, Town.abi, signer);
      await TownInstance.claimRevenue(buildingTokenId);
      setVisibleConfirmation(true);
    } catch (error) {
      setIsTransactionRejected(true);
    }
  };

  const upgradeBuilding = async (buildingTokenId) => {
    try {
      const TownInstance = new ethers.Contract(townSepolia, Town.abi, signer);
      await TownInstance.upgrade(buildingTokenId, selectedLand.coordinate);
      setVisibleConfirmation(true);
    } catch (error) {
      setIsTransactionRejected(true);
    }
  };

  const recruit = async (typeIndex) => {
    try {
      console.log(typeIndex);
      console.log("Input value:", inputValue);
      const lands = new ethers.Contract(landsSepolia, Lands.abi, signer);
      const goldBal = await lands.getAssetsBal(selectedLand.coordinate);
      console.log(goldBal.toString());
      const army = new ethers.Contract(armySepolia, Army.abi, signer);
      await army.recruit(selectedLand.coordinate, typeIndex, inputValue);
      setVisibleConfirmation(true);
    } catch (error) {
      console.log(error);
      setIsTransactionRejected(true);
    }
  };

  useEffect(() => {
    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(true);
        // setVisibleConfirmation(false);
      }, 6000);
      // return () => clearTimeout(timeout)
    }
    if (visibleConfirmation) {
      const timeout = setTimeout(() => {
        setConfirmed(false);
        setVisibleConfirmation(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }
    const fetchData = async () => {
      if (ownedLands !== undefined && ownedLands == 0) {
        setIsFetching(false);
      }
      if (signer && address && selectedLand !== undefined && provider) {
        console.log("Useeffect called");

        const town = new ethers.Contract(townSepolia, Town.abi, provider);
        const army = new ethers.Contract(armySepolia, Army.abi, provider);
        const ownedBuildings = await town.landBuildings(
          selectedLand.coordinate
        );
        const existedBuildings = await town.getBuildings();
        setBuildings(existedBuildings);
        const existedWarriors = await army.getTypes();
        const landArmy = await army.getArmy(selectedLand.coordinate);
        const level = await army.getLevel(selectedLand.coordinate);
        const requiredComs = await army.getRequiredCommodities();
        setExistedWarriors(existedWarriors);
        setArmy(landArmy);
        console.log("Army:",landArmy);
        setBarracksLevel(level);
        setRequiredBarracksCommodities(requiredComs);
        console.log("Existed warriors:", existedWarriors);
        console.log("Current existed army:", landArmy);
        let ownedBuildingsArray = [];
        for (let index = 0; index < ownedBuildings.length; index++) {
          const status = await town.getStatus(ownedBuildings[index]);
          const revenue = await town.getCurrentRevenue(ownedBuildings[index]);
          ownedBuildingsArray.push({
            imageURL: existedBuildings[index].imageURL,
            name: existedBuildings[index].buildingName,
            tokenId: ownedBuildings[index],
            level: status.level,
            revenue: revenue,
          });
        }
        setOwnedBuildings(ownedBuildingsArray);
        console.log("Owned buildings");
        console.log(ownedBuildingsArray);
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
  ]);

  return (
    <>
      <div className="scrollableScreen">
        {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionRejectWindow">
              <p>Transaction Rejected</p>
              <p>Please try again or contact support.</p>
              <button onClick={handleClose}>Close</button>
            </div>
          </div>
        )}
        {visibleConfirmation == true ? (
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
                  <h4 style={{"color":"black"}} className="defaultH4">Confirming...</h4>

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
                  <h4 style={{"color":"black"}} className="defaultH4">Confirmed.</h4>
                  <h4 style={{"color":"black"}} className="defaultH4">Please refresh the page.</h4>
                </>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {isLandSelected && (
          <div className="overlay">
            <div className="selectedLandWindow">
              <Card className="defaultCard">
                <Card.Img
                  variant="top"
                  src={buildings[0].imageURL}
                  className="cardImg"
                />
                <Card.Body>
                  <Card.Title>{buildings[0].biuldingName}</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleCloseLandWindow()}
                  >
                    Open
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
        <Container>
          {Array.isArray(landObj) && landObj.length > 0 && landImgUrl ? (
            <>
              <Row>
                {selectedLand == undefined &&
                  landObj.map((land, key) => (
                    <React.Fragment key={land.coordinate + key}>
                      <Col md={{ span: 6, offset: 0 }}>
                        <div className="listItemInfo">
                          <img src={landImgUrl}></img>
                          <div className="listItemColumn">
                            <h2 className="defaultH2">Land</h2>
                            <p>Token ID: {land.coordinate}</p>
                            <p>Level: 1</p>
                            <Button
                              variant="primary"
                              onClick={() => setSelectedLand(land)}
                            >
                              Open
                            </Button>
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
                      <h4 className="defaultH4">Not land found.</h4>
                      <h4 className="defaultH4">
                        To participate in game you need a land.
                      </h4>
                      <h4 className="defaultH4">
                        <span
                          onClick={() => {
                            router.push("/lands");
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
                      <h4 className="defaultH4" style={{ marginTop: "2rem" }}>
                        If you have any land, connect your wallet.
                      </h4>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}
          {selectedLand !== undefined && (
            <>
              <Row>
                <Col md={{ span: 12, offset: 0 }}>
                  <div className="myLandColumn">
                    <h4
                      className="clickableH4"
                      onClick={() => setSelectedLand()}
                    >
                      Back to lands
                    </h4>
                    <div className="balanceHeader">
                      <div className="commodityBalance">
                        <img src="/Stone.png"></img>
                        <h6>
                          {selectedLand.stone !== undefined
                            ? selectedLand.stone
                            : "0"}
                        </h6>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Wood.png"></img>
                        <h6>
                          {selectedLand.wood !== undefined
                            ? selectedLand.wood
                            : "0"}
                        </h6>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Iron.png"></img>
                        <h6>
                          {selectedLand.iron !== undefined
                            ? selectedLand.iron
                            : "0"}
                        </h6>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Gold.png"></img>
                        <h6>
                          {selectedLand.gold !== undefined
                            ? selectedLand.gold
                            : "0"}
                        </h6>
                      </div>
                      <div className="commodityBalance">
                        <img src="/Food.png"></img>
                        <h6>
                          {selectedLand.food !== undefined
                            ? selectedLand.food
                            : "0"}
                        </h6>
                      </div>
                    </div>

                    <div className="myLandBox">
                      <div className="landBoxColumn">
                        <InputGroup className="mb-3" size="sm">
                          <Form.Control
                            placeholder="Enter amount..."
                            aria-label="Amount (to the nearest dollar)"
                            style={{ width: "50%" }}
                          />
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="success"
                              id="dropdown-basic"
                              className="selectDropdown"
                            >
                              Select
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item href="#/action-1">
                                <img
                                  src="/Stone.png"
                                  className="dropdownTokenLogo"
                                ></img>
                                Stone
                              </Dropdown.Item>
                              <Dropdown.Item href="#/action-2">
                                <img
                                  src="/Wood.png"
                                  className="dropdownTokenLogo"
                                ></img>
                                Wood
                              </Dropdown.Item>
                              <Dropdown.Item href="#/action-3">
                                <img
                                  src="/Iron.png"
                                  className="dropdownTokenLogo"
                                ></img>
                                Iron
                              </Dropdown.Item>
                              <Dropdown.Item href="#/action-4">
                                <img
                                  src="/Gold.png"
                                  className="dropdownTokenLogo"
                                ></img>
                                Gold
                              </Dropdown.Item>
                              <Dropdown.Item href="#/action-5">
                                <img
                                  src="/Food.png"
                                  className="dropdownTokenLogo"
                                ></img>
                                Food
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </InputGroup>
                        <Button
                          variant="outline-light"
                          size="sm"
                          style={{ marginRight: "10px" }}
                        >
                          Deposit
                        </Button>
                        <Button variant="outline-light" size="sm">
                          Withdraw
                        </Button>
                      </div>
                      <div className="landBoxColumn">
                        {Array.isArray(existedWarriors) && existedWarriors.length >0 && Array.isArray(army) && army.length > 0 &&
                        existedWarriors.map((warrior, key) => (
                          <h5 className="defaultH5" key={key}> {warrior.name} : {army[0][key].toString()}</h5>
                        ))}
                        {existedWarriors == undefined && army == undefined && 
                        <h5 className="defaultH5"> Loading army...</h5>
                        }
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "1rem" }}>
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
                              variant="outline-light"
                              style={{ marginBottom: "0.5rem" }}
                              onClick={() =>
                                claimRev(ownedBuildings[key].tokenId)
                              }
                              size="sm"
                            >
                              Claim
                            </Button>
                          </div>
                          <h4>level: {item.level.toString()}</h4>
                          <div>
                            <Button
                              variant="outline-light"
                              style={{}}
                              onClick={() =>
                                upgradeBuilding(ownedBuildings[key].tokenId)
                              }
                              size="sm"
                            >
                              Upgrade
                            </Button>
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
                  <Accordion.Item eventKey="0" className="accordionBackground">
                    <Accordion.Header className="accordion">
                      Buildings
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="listItemColumn">
                        {Array.isArray(buildings) &&
                          buildings.map((item, key) => (
                            <Col key={key}>
                              <div className="listItemInfo">
                                <img src={item.imageURL}></img>
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
                                      src="/Gold.png"
                                      className="commodityLogo"
                                    ></img>
                                    <p>
                                      {ethers.utils.formatEther(
                                        item.requiredGold
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
                                    ) ? (
                                    <Button disabled>Build</Button>
                                  ) : (
                                    <Button
                                      style={{ bottom: "0px" }}
                                      onClick={() => mintBuilding(key)}
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
                  <Accordion.Item eventKey="1" className="accordionBackground">
                    <Accordion.Header className="accordion">
                      Barracks{" "}
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="listItemColumn">
                        {Array.isArray(requiredBarracksCommodities) && (
                          <Col>
                            <div
                              className="listItemInfo"
                              style={{ backgroundColor: "transparent" }}
                            >
                              <img src={"Barracks.png"}></img>
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
                                    {Number(
                                      ethers.utils.formatEther(
                                        requiredBarracksCommodities[0]
                                      )
                                    ) *
                                      (Number(barracksLevel) + 1)}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Wood.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {Number(
                                      ethers.utils.formatEther(
                                        requiredBarracksCommodities[1]
                                      )
                                    ) *
                                      (Number(barracksLevel) + 1)}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Iron.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {Number(
                                      ethers.utils.formatEther(
                                        requiredBarracksCommodities[2]
                                      )
                                    ) *
                                      (Number(barracksLevel) + 1)}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Gold.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {Number(
                                      ethers.utils.formatEther(
                                        requiredBarracksCommodities[3]
                                      )
                                    ) *
                                      (Number(barracksLevel) + 1)}
                                  </p>
                                </div>
                                <div className="commodityBalance">
                                  <img
                                    src="/Food.png"
                                    className="commodityLogo"
                                  ></img>
                                  <p>
                                    {Number(
                                      ethers.utils.formatEther(
                                        requiredBarracksCommodities[4]
                                      )
                                    ) *
                                      (Number(barracksLevel) + 1)}
                                  </p>
                                </div>
                              </div>
                              <div className="InfoColumn">
                                {Number(selectedLand.stone) <=
                                  Number(
                                    ethers.utils.formatEther(
                                      requiredBarracksCommodities[0]
                                    ) *
                                      (Number(barracksLevel) + 1)
                                  ) ||
                                Number(selectedLand.wood) <=
                                  Number(
                                    ethers.utils.formatEther(
                                      requiredBarracksCommodities[1]
                                    ) *
                                      (Number(barracksLevel) + 1)
                                  ) ||
                                Number(selectedLand.iron) <=
                                  Number(
                                    ethers.utils.formatEther(
                                      requiredBarracksCommodities[2]
                                    ) *
                                      (Number(barracksLevel) + 1)
                                  ) ||
                                Number(selectedLand.gold) <=
                                  Number(
                                    ethers.utils.formatEther(
                                      requiredBarracksCommodities[3]
                                    ) *
                                      (Number(barracksLevel) + 1)
                                  ) ||
                                Number(selectedLand.food) <=
                                  Number(
                                    ethers.utils.formatEther(
                                      requiredBarracksCommodities[4]
                                    ) *
                                      (Number(barracksLevel) + 1)
                                  ) ? (
                                  <Button disabled>Upgrade</Button>
                                ) : (
                                  <Button
                                    style={{ bottom: "0px" }}
                                    onClick={() => upgradeBarracks()}
                                  >
                                    Upgrade
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Col>
                        )}

                        {Array.isArray(existedWarriors) &&
                          existedWarriors.map((item, key) => (
                            <Col key={key}>
                              <div className="listItemInfo">
                                <img
                                  className="warriorImage"
                                  src={item.imageURL}
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
                                        <Button onClick={() => recruit(key)}>
                                          Build
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Form.Control
                                          placeholder={`Requires barracks level ${item.requiredLevel.toString()}`}
                                          aria-label="Amount (to the nearest dollar)"
                                          disabled
                                        />
                                        <Button disabled>Build</Button>
                                      </>
                                    )}
                                  </InputGroup>
                                </div>
                              </div>
                            </Col>
                          ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Row>
            </>
          )}
          <Row>
            <Col></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
