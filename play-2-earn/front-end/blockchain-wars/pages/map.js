import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import { townV2, landsV2 } from "../Blockchain/Addresses";
import LandsV2 from "../Blockchain/LandsV2.json";
import TownV2 from "../Blockchain/TownV2.json";
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
import { Sepolia, Linea, LineaTestnet } from "@thirdweb-dev/chains";
import { useRouter } from "next/router";
import { useSDK } from "@thirdweb-dev/react";
import Toast from "react-bootstrap/Toast";

const metamaskConfig = metamaskWallet();

const Map = ({ provider, landImgUrl, mintedLands, dataLoad, setTarget }) => {
  const [viewLands, setViewLands] = useState();
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  // const [closePopUp, setClosePopUp] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [landPrice, setLandPrice] = useState();
  const [landBal, setLandBal] = useState();
  const [error, setError] = useState();

  const connectWithMetamask = useMetamask();

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

  const validChainId = Sepolia.chainId;

  const router = useRouter();
  const sdk = useSDK();
  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const handleClose = () => {
    setIsTransactionRejected(false);
    setError(undefined);
  };
  const handleAttack = () => {
    setTarget(selectedLand.tokenId);
    router.push("/attack");
  };

  const handleOpenLandWindow = async (land) => {
    setIsLandSelected(true);
    // const army = new ethers.Contract(armySepolia, Army.abi, signer)
    // const armyBalanec = await army.getArmy()
    if (land.isMinted == true && land.isYours == false) {
      console.log("land already minted");
      const townInst = new ethers.Contract(townV2, TownV2.abi, provider);
      const landBalance = await townInst.getAssetsBal(land.tokenId);
      const balObj = {
        stoneBal: ethers.utils.formatEther(landBalance[0]),
        woodBal: ethers.utils.formatEther(landBalance[1]),
        ironBal: ethers.utils.formatEther(landBalance[2]),
        foodBal: ethers.utils.formatEther(landBalance[3]),
        goldBal: ethers.utils.formatEther(landBalance[4]),
      };
      setLandBal(balObj);
      console.log(balObj);
    }
    setSelectedLand(land);
    console.log(land);
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedLand({});
    setLandBal();
  };

  // const handleClosePopUp = () => {
  //   setClosePopUp(true);
  //   dataLoad();
  // };

  const mintLand = async () => {
    const chainId = await sdk.wallet.getChainId();
    if (chainId == validChainId) {
      try {
        const landsInst = new ethers.Contract(landsV2, LandsV2.abi, signer);
        await landsInst.mintLand(selectedLand.x, selectedLand.y, {
          value: landPrice,
        });
        handleCloseLandWindow();
        setVisibleConfirmation(true);
      } catch (error) {
        setError(error);
        setIsLandSelected(false);
        setIsTransactionRejected(true);
      }
    } else {
      handleConnectWithMetamask();
    }
  };

  const views = () => {
    let counter = 0;
    let view = [];
    // for (let view = 0; view < 100; view++) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const item = {
          id: counter,
          //   id: counter,
          x: x,
          xStartingPoint: 100 + x * 10,
          y: y,
          yStartingPoint: 100 + y * 10,
          color: "green",
        };
        counter++;
        view.push(item);
      }
    }

    // }
    return view;
  };
  function fillLands(xStartingPoint, yStartingPoint) {
    let lands = [];
    let counter = 0;
    console.log(address);
    for (let y = yStartingPoint; y < yStartingPoint + 10; y++) {
      for (let x = xStartingPoint; x < xStartingPoint + 10; x++) {
        const tokenId = x.toString() + y.toString();
        let img = "/emptyLandImg.png";
        let owner;
        let isYours = false;
        for (let index = 0; index < mintedLands.length; index++) {
          if (tokenId == mintedLands[index].tokenId) {
            // img = "/mintedLand.png";
            owner = mintedLands[index].owner;
            address
              ? (isYours = owner == address.toLocaleLowerCase() ? true : false)
              : (isYours = false);
            img = isYours ? "/myLand.png" : "/mintedLand.png";
          }
        }
        const land = {
          id: counter,
          x: x,
          y: y,
          color: "green",
          coordinate: x.toString() + "," + Number(y),
          tokenId: tokenId,
          isMinted: owner == undefined ? false : true,
          image: img,
          owner: owner,
          tokenId: Number(x.toString() + Number(y)),
          isYours: isYours,
        };
        counter++;
        lands.push(land);
      }
    }
    setViewLands(lands);
  }
  // fillLands(100,100)
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
      const landsInst = new ethers.Contract(landsV2, LandsV2.abi, provider);
      const price = await landsInst.getPrice();
      setLandPrice(price);
    };
    fetchData();
  }, [address, visibleConfirmation, mintedLands, viewLands]);

  return (
    <>
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

 
        {isLandSelected && selectedLand && landImgUrl !== undefined && (
          <div className="overlay">
            <Card
              style={{
                width: "18rem",
                // backgroundColor: "white",
                boxShadow: "0px 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.5)",
              }}
              className="card"
            >
              <Card.Img
                variant="top"
                // src="/asset_land.png"
                src={landImgUrl}
                className="cardImg"
              />
              <Card.Body>
                <Card.Title>Land {selectedLand.coordinate}</Card.Title>
                {selectedLand.isMinted ? (
                  <>
                    <Card.Text>
                      {" "}
                      {selectedLand.isYours == true
                        ? "Your land"
                        : `Owner: ${selectedLand.owner}`}{" "}
                    </Card.Text>
                    {selectedLand.isYours == true && (
                      <Card.Text>
                        {" "}
                        Go into your{" "}
                        <span
                          onClick={() => {
                            router.push("/myLand");
                          }}
                          style={{
                            fontWeight: "bolder",
                            textDecoration: "underLine",
                            cursor: "pointer",
                          }}
                        >
                          land
                        </span>
                      </Card.Text>
                    )}
                    {landBal !== undefined && (
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
                          <img src="/Food.png"></img>
                          <h6>{landBal.foodBal}</h6>
                        </div>
                        <div className="commodityBalance">
                          <img src="/Gold.png"></img>
                          <h6>{landBal.goldBal}</h6>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Card.Text>Land is available to mint </Card.Text>
                    <Card.Text>
                      Price : {ethers.utils.formatEther(landPrice)}
                    </Card.Text>
                  </>
                )}
                <div style={{ display: "flex", width: "100%" }}>
                  {selectedLand.isYours == false &&
                    selectedLand.isMinted == true && (
                      <Button
                        style={{ marginRight: "auto" }}
                        variant="outline-primary"
                        onClick={handleAttack}
                        size="sm"
                      >
                        Attack
                      </Button>
                    )}
                  {selectedLand.isMinted == false && (
                    <Button
                      variant="primary"
                      onClick={
                        signer ? mintLand : () => handleConnectWithMetamask()
                      }
                      style={{ marginRight: "20px" }}
                    >
                      Mint
                    </Button>
                  )}

                  {/* </div>
                <div style={{ display: "flex", justifyContent: "end" }}> */}
                  <Button
                    style={{ marginLeft: "auto" }}
                    variant="outline-secondary"
                    onClick={handleCloseLandWindow}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
        <Container>
          <Row>
            <Col>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {Array.isArray(viewLands) && viewLands.length > 0 ? (
                  <h4
                    className="textButton"
                    onClick={() => setViewLands(undefined)}
                    // style={{"border":"2px solid white","padding":"0.2rem","borderRadius":"0.4rem"}}
                  >
                    Back
                  </h4>
                ) : (
                  <h3 className="h3Text">Choose parcel</h3>
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              {viewLands == undefined &&
              Array.isArray(mintedLands) &&
              mintedLands.length >= 0 ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="viewGrid">
                      {views().map((view) => (
                        <div
                          className="item"
                          key={view.id}
                          onClick={() =>
                            fillLands(view.xStartingPoint, view.yStartingPoint)
                          }
                        >
                          <p className="defaultP">
                            {view.xStartingPoint} {view.yStartingPoint}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {Array.isArray(mintedLands) &&
                  mintedLands.length >= 0 &&
                  Array.isArray(viewLands) &&
                  viewLands.length > 0 ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div className="landGrid">
                        {viewLands.map((land) => (
                          <OverlayTrigger
                            key={land.id}
                            overlay={
                              <Tooltip
                                id={`tooltip-${land.id}`}
                                className="custom-tooltip"
                              >
                                <div>
                                  <p
                                    style={{
                                      // color: "#042032",
                                      fontFamily: "monospace",
                                      fontSize: "0.8rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {land.coordinate}
                                  </p>
                                </div>
                              </Tooltip>
                            }
                          >
                            <div
                              className="item"
                              style={{ backgroundColor: "darkgreen" }}
                              key={land.id}
                              onClick={() => handleOpenLandWindow(land)}
                            >
                              <img className="landImg" src={land.image}></img>
                            </div>
                          </OverlayTrigger>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
          
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
                    </>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Map;
