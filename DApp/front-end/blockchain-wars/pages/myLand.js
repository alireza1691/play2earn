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
import { landsSepolia, townSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import Town from "../Blockchain/Town.json";
import { useRouter } from "next/router";
import { useAddress, useSigner, useMetamask } from "@thirdweb-dev/react";

const lands = ({ provider, landImgUrl, ownedLands, landObj }) => {
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [isLandOpened, setIsLandOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [landItems, setLandItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [buildings, setBuildings] = useState();
  const [selectedLand, setSelectedLand] = useState()
  const [ownerBuildings, setOwnedBuildings] = useState()
  // const [stoneBal, setStoneBal] = useState()
  // const [woodBal, setWoodBal] = useState([])
  // const [ironBal, setIronBal] = useState([])
  // const [goldBal, setGoldBal] = useState([])
  // const [foodBal, setFoodBal] = useState([])
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
    if (!signer) {
      connectWithMetamask
    }
    try {
      const TownInstance = new ethers.Contract(
        townSepolia,
        Town.abi,
        signer
      );
      await TownInstance.build(selectedLand.coordinate, buildingIndex)
    } catch (error) {  
      console.log(error);
    }

  }

  useEffect(() => {
    const fetchData = async () => {
      if (signer && address && selectedLand) {
        const town = new ethers.Contract(townSepolia, Town.abi, signer);
        const ownedBuildings = await town.landBuildings(selectedLand.coordinate)
        const existedBuildings = await town.getBuildings();
        
        let ownedBuildingsArray = []
        for (let index = 0; index < ownedBuildings.length; index++) {
          const element = await town.getStatus(ownedBuildings[index])
          ownedBuildingsArray.push({imageURL: existedBuildings[index].imageURL, name: existedBuildings[index].buildingName, tokenId: selectedLand.coordinate})
        }
        setOwnedBuildings(ownedBuildingsArray)
        console.log("Owned buildings");
        console.log(ownedBuildingsArray);
      }
      // console.log(provider);
      if (provider && landObj.length > 0 && ownedLands) {
        console.log(landObj);
        const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
        if (ownedLands == 0) {
          setIsFetching(false);
        }
        if (ownedLands > 0 && landObj.length > 0) {
          setIsFetching(false);
        }

        const TownInstance = new ethers.Contract(
          townSepolia,
          Town.abi,
          provider
        );
        const existedBuildings = await TownInstance.getBuildings();
        console.log(existedBuildings);
        setBuildings(existedBuildings);
      }
    };
    fetchData();
  }, [provider, landObj, ownedLands, address, signer,selectedLand]);

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
        {isLandSelected && (
          <div className="overlay">
            <div className="selectedLandWindow">
              <Card className="card">
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
              {/* <h4>Land</h4>
              <p>Coordinate</p>
              <p>Owner:</p>
              <p>Level:</p>
              <Button variant="primary" onClick={handleCloseLandWindow}>
                Close
              </Button> */}
            </div>
          </div>
        )}
        <Container>
          {Array.isArray(landObj) && landObj.length > 0 && landImgUrl ? (
            <>
                                <Row>
              {selectedLand == undefined && landObj.map((land, key) => (
        
                  <React.Fragment key={land.coordinate + land.id + key}>

                      <Col md={{ span: 3, offset: 0 }} >
                        <Card className="card">
                          <Card.Img
                            variant="top"
                            src={landImgUrl}
                            className="cardImg"
                          />
                          <Card.Body>
                            <Card.Title>{land.coordinate}</Card.Title>
                            <Card.Text>
                             Desxription of the land
                            </Card.Text>
                            <Button
                              variant="primary"
                              onClick={() => setSelectedLand(land)}
                              size="sm"
                            >
                              Open land
                            </Button>
                          </Card.Body>
                        </Card>
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
                    <Card className="card">
                      <Card.Body>
                        <Card.Title>Not land found.</Card.Title>
                        <Card.Text>
                          To participate in game you need a land.
                        </Card.Text>
                        <Card.Text>Explore and mint your land.</Card.Text>
                        <Card.Text>
                          If you have any land connect owner wallet.
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => {
                            router.push("/lands");
                          }}
                        >
                          Explore
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
          { selectedLand !== undefined &&
          <>
                        <Row>
              <Col md={{ span: 12, offset: 0 }}>
                <div className="myLandColumn">
                  <div className="balanceHeader">
                    <div className="commodityBalance">
                    <img src="/Stone.png"></img>
                    <h6>{selectedLand.stone !== undefined ? selectedLand.stone : "0"}</h6>
                    </div>
                    <div className="commodityBalance">
                    <img src="/Wood.png"></img>
                    <h6>{selectedLand.wood !== undefined ? selectedLand.wood : "0"}</h6>
                    </div>
                    <div className="commodityBalance">
                    <img src="/Iron.png"></img>
                    <h6>{selectedLand.iron !== undefined ? selectedLand.iron : "0"}</h6>
                    </div>
                    <div className="commodityBalance">
                    <img src="/Gold.png"></img>
                    <h6>{selectedLand.gold !== undefined ? selectedLand.gold : "0"}</h6>
                    </div>
                    <div className="commodityBalance">
                    <img src="/Food.png"></img>
                    <h6>{selectedLand.food !== undefined ? selectedLand.food : "0"}</h6>
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
                      <p> Some text</p>
                    </div>
                  </div>
                </div>
              </Col>
              {/* <Col md={{ span: 4, offset: 0 }} >
                <div className="myLandColumn">
                  <div className="balanceHeader">
                  <h6>Barracks level: 0</h6>
                  </div>
                  <div className="myLandBox">

                  </div>

                </div>
              </Col> */}
              </Row>
              <Row>
                { Array.isArray(buildings) && buildings.map((item, key) => (
                              <Card className="buildingCard"  key={key}>
                              <Card.Img
                                variant="top"
                                src={item.imageURL}
                                className="cardImg"
                                height={200}
                                width={100}
                              />
                              <Card.Body>
                                <Card.Title>{item.biuldingName}</Card.Title>
                                <Card.Text>
                                  Add description
                                </Card.Text>
                                <Button
                                  variant="primary"
                                  onClick={() => mintBuilding()}
                                >
                                  Open
                                </Button>
                              </Card.Body>
                            </Card>
                ))
                }
  
            </Row>
            <Row>
            <div className="buildingsColumn">
            { Array.isArray(buildings) && buildings.map((item, key) => (
                  <div className="buildingInfo" key={key}>
                    <img src={item.imageURL}></img>
                    <div className="InfoColumn">
                      <div style={{"padding":"0.5rem"}}>
                      <h4 className="defaultH2">{item.buildingName}</h4>
                      </div>
                      <div className="commodityBalance" >
                        <img
                          src="/Stone.png"
                          className="commodityLogo"
                        ></img>
                        <p>{ethers.utils.formatEther(item.requiredStone)}</p>
                      </div>
                      <div className="commodityBalance">
                        <img
                          src="/Wood.png"
                          className="commodityLogo"
                        ></img>
                        <p>{ethers.utils.formatEther(item.requiredWood)}</p>
                      </div>
                      <div className="commodityBalance">
                        <img
                          src="/Iron.png"
                          className="commodityLogo"
                        ></img>
                        <p>{ethers.utils.formatEther(item.requiredIron)}</p>
                      </div>
                      <div className="commodityBalance">
                        <img
                          src="/Gold.png"
                          className="commodityLogo"
                        ></img>
                        <p>{ethers.utils.formatEther(item.requiredGold)}</p>
                      </div>
                      <div className="commodityBalance">
                        <img
                          src="/Food.png"
                          className="commodityLogo"
                        ></img>
                        <p>{ethers.utils.formatEther(item.requiredFood)}</p>
                      </div>
                    </div>
                    <div className="InfoColumn">
                    <p>Difficulty: 0% {Number(selectedLand.stone)} va {Number(item.requiredStone)}</p>
                      { Number(selectedLand.stone)  <= Number(ethers.utils.formatEther(item.requiredStone)) ||
                      Number(selectedLand.wood)  <= Number(ethers.utils.formatEther(item.requiredWood)) ||
                      Number(selectedLand.iron)  <= Number(ethers.utils.formatEther(item.requiredIron)) ||
                      Number(selectedLand.gold)  <= Number(ethers.utils.formatEther(item.requiredGold)) ||
                      Number(selectedLand.food)  <= Number(ethers.utils.formatEther(item.requiredFood)) ? (
                        <Button disabled >Build</Button>

                      ) : (
                        <Button style={{"bottom":"0px"}} onClick={()=>mintBuilding(key)} >Build</Button>

                      )

                      }
                    </div>
                  </div>
                ))
                }
                    </div>
            </Row>
            </>
          }
          <Row>
            <Col></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
