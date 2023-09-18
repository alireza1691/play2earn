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
  const [viewLands, setViewLands] = useState();
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  const [closePopUp, setClosePopUp] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [landPrice, setLandPrice] = useState();
  const [landBal, setLandBal] = useState()

  const connectWithMetamask = useMetamask();
  const router = useRouter();

  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const handleOpenLandWindow = async (land) => {
    setIsLandSelected(true);
    // const army = new ethers.Contract(armySepolia, Army.abi, signer)
    // const armyBalanec = await army.getArmy()
    if (land.isMinted == true && land.isYours == false) {
      const landInst = new ethers.Contract(landsSepolia, Lands.abi, provider);
      const landBalance = await landInst.getAssetsBal(land.tokenId);
      const balObj = {stoneBal : ethers.utils.formatEther(landBalance[0]),
      woodBal : ethers.utils.formatEther(landBalance[1]),
      ironBal : ethers.utils.formatEther(landBalance[2]),
      goldBal : ethers.utils.formatEther(landBalance[3]),
      foodBal : ethers.utils.formatEther(landBalance[4])}
      setLandBal(balObj)
      console.log(balObj);
    }
    setSelectedLand(land);
    console.log(land);
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedLand({});
    setLandBal()
  };

  const handleClosePopUp = () => {
    setClosePopUp(true);
    dataLoad();
  };

  const mintLand = async () => {
    try {
      const lands = new ethers.Contract(landsSepolia, Lands.abi, signer);
      await lands.mintLand(selectedLand.x, selectedLand.y, {
        value: landPrice,
      });
      setVisibleConfirmation(true);
    } catch (error) {
      setIsLandSelected(false);
      setIsTransactionRejected(true);
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
            isYours = owner == address.toLocaleLowerCase() ? true : false;
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
    console.log(lands);
    setViewLands(lands);
    console.log("view set");
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
      const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
      const price = await lands.getPrice();
      setLandPrice(price);
    };
    fetchData();
  }, [address, visibleConfirmation, mintedLands, viewLands]);

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
        {!address && closePopUp == false && (
          <div className="overlay">
            <Card
              style={{
                padding: "0.5rem",
                width: "15rem",
                backgroundColor: "rgba(255,255,255,0.9)",
                boxShadow: "0px 0.1rem 1rem 0.01rem rgba(0, 0, 0, 0.2)",
              }}
              className="card"
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "end",
                }}
              >
                <CloseButton onClick={handleClosePopUp}></CloseButton>
              </div>
              <Card.Body style={{ textAlign: "justify" }}>
                <Card.Text
                  style={{
                    fontSize: "0.9rem",
                    textAlign: "center",
                    fontFamily: "verdana",
                  }}
                >
                  If you have any land we recommend to{" "}
                  <span
                    style={{
                      textDecoration: "underLine",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      connectWithMetamask({
                        chainId: Sepolia.chainId,
                      })
                    }
                  >
                    Connect
                  </span>{" "}
                  your wallet
                </Card.Text>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {/* <Button
                    variant="outline-secondary"
                    onClick={handleClosePopUp}
                    size="sm"
                  >
                    Connect
                  </Button> */}
                </div>
              </Card.Body>
            </Card>
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

              {/* <button onClick={handleClose}>Close</button> */}
            </div>
          </div>
        )}
        {isLandSelected && selectedLand && landImgUrl !== undefined && (
          <div className="overlay">
            <Card
              style={{
                width: "18rem",
                backgroundColor: "white",
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
                          <img src="/Gold.png"></img>
                          <h6>{landBal.goldBal}</h6>
                        </div>
                        <div className="commodityBalance">
                          <img src="/Food.png"></img>
                          <h6>{landBal.foodBal}</h6>
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
                        onClick={handleCloseLandWindow}
                        size="sm"
                      >
                        Attack
                      </Button>
                    )}
                  {selectedLand.isMinted == false && (
                    <Button
                      variant="primary"
                      onClick={
                        signer
                          ? mintLand
                          : () =>
                              connectWithMetamask({
                                chainId: Sepolia.chainId,
                              })
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
                    className="clickableH4"
                    onClick={() => setViewLands(undefined)}
                  >
                    Back
                  </h4>
                ) : (
                  <h3 className="h3Text">Choose a parcel</h3>
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              {viewLands == undefined && mintedLands.length > 0 ? (
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
                  mintedLands.length > 0 &&
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
                                      color: "#042032",
                                      fontFamily: "sans-serif",
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
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
