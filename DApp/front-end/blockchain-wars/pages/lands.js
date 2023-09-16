import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import { landsSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import { ethers } from "ethers";
import { useSigner, useConnect, useMetamask, useWalletConnect, metamaskWallet, useAddress } from "@thirdweb-dev/react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import CloseButton from "react-bootstrap/CloseButton";

const metamaskConfig = metamaskWallet();

const lands = ({ provider,  landImgUrl, mintedLands, dataLoad }) => {
  const [viewLands, setViewLands] = useState([]);
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  const [closePopUp, setClosePopUp] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);

  const connectWithMetamask = useMetamask();

  const landPrice = ethers.utils.parseEther("0.02")

  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const handleOpenLandWindow = (land) => {
    setIsLandSelected(true);
    setSelectedLand(land);
    console.log(land);
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedLand({});
  };

  const handleClosePopUp = () => {
    setClosePopUp(true);
    dataLoad();
  };

  const mintLand = async () => {
    try {
        const lands = new ethers.Contract(landsSepolia, Lands.abi, signer);
        await lands.mintLand(selectedLand.x, selectedLand.y,{value:landPrice})
        setVisibleConfirmation(true)
    } catch (error) {
        setIsLandSelected(false)
        setIsTransactionRejected(true)
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
    for (let y = yStartingPoint; y < yStartingPoint + 10; y++) {
      for (let x = xStartingPoint; x < xStartingPoint + 10; x++) {
        const tokenId = x.toString() + y.toString();
        let img = "/emptyLandImg.png";
        let owner;
        for (let index = 0; index < mintedLands.length; index++) {
          if (tokenId == mintedLands[index].tokenId) {
            img = "/mintedLand.png";
            owner = mintedLands[index].owner;
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
        };
        counter++;
        lands.push(land);
      }
    }
    console.log(lands.length);
    setViewLands(lands);
    console.log("view set");
  }
  // fillLands(100,100)
  useEffect(() => {
    if (visibleConfirmation) {
        const timeout = setTimeout(() => {
            setVisibleConfirmation(false);
        }, 5000);
        return () => clearTimeout(timeout)
    }
    const fetchData = async () => {
      const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
    };
    fetchData();
  }, [address, visibleConfirmation]);

  return (
    <>
      <div className="scrollableScreen">
        {visibleConfirmation == true ?(
        <div className="popUpConfirmation">
            {/* <Card
              style={{
                padding: "0.5rem",
                width: "15rem",
                backgroundColor: "white",
                boxShadow: "0px 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.5)",
              }}
              className="card"
            >
              <Card.Body style={{"textAlign":"justify"}}>
                <Card.Text style={{ fontSize: "0.9rem",textAlign:"center"}}>
                  Transaction submitted
                </Card.Text>
                <Card.Text style={{ fontSize: "0.9rem",textAlign:"center"}}>
                  To update map you may need to refresh the page
                </Card.Text>
                <div style={{ display: "flex", justifyContent: "center"}}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClosePopUp}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </Card.Body>
            </Card> */}
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
                      fontFamily: "verdana",
                      fontSize: "0.9rem",
                      color: "black",
                    }}
                  >
                    Confirming...
                  </h2>
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ textAlign: "center", color: "rgb(73, 90, 246)" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
        </div>):("")
        }
        {!address && closePopUp == false && (
          <div className="overlay">
            <Card
              style={{
                padding: "0.5rem",
                width: "15rem",
                backgroundColor: "white",
                boxShadow: "0px 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.5)",
              }}
              className="card"
            >
              <Card.Body style={{"textAlign":"justify"}}>
                <Card.Text style={{ fontSize: "0.9rem",textAlign:"center"}}>
                  If you have any land we recommend to connect your wallet
                </Card.Text>
                <div style={{ display: "flex", justifyContent: "center"}}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClosePopUp}
                    size="sm"
                  >
                    Close
                  </Button>
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
                    style={{"cursor":"pointer"}}
                  >
                    Close
                  </Button>

              {/* <button onClick={handleClose}>Close</button> */}
            </div>
          </div>
        )}
        {isLandSelected && selectedLand && (
          <div className="overlay">
            <Card
              style={{
                width: "18rem",
                backgroundColor: "white",
                boxShadow: "0px 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.5)",
              }}
              className="card"
            >
              {landImgUrl !== undefined ? (
                <Card.Img
                  variant="top"
                  // src="/asset_land.png"
                  src={landImgUrl}
                  className="cardImg"
                />
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
                  <h2 style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                    Fetching...
                  </h2>
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ textAlign: "center" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
              <Card.Body>
                <Card.Title>Land {selectedLand.coordinate}</Card.Title>
                {selectedLand.isMinted ? (
                  <Card.Text>Owner: {selectedLand.owner}</Card.Text>
                ) : (
                    <>
                  <Card.Text>Land is available to mint</Card.Text>
                  <Card.Text>Price : 0.3 ETH</Card.Text>
                  <Button variant="primary" onClick={signer ? mintLand : connectWithMetamask} style={{"marginRight":"20px"}}>
                  Mint
                </Button>
                </>
                )}

                {/* <Card.Title>Card Title</Card.Title> */}
                {/* <Card.Text>Land</Card.Text> */}
                {/* <Card.Text>Coordinate:{selectedLand.coordinate}</Card.Text>
                {selectedLand.owner !== undefined && (
                  <Card.Text>Owner: {selectedLand.owner}</Card.Text>
                )} */}
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCloseLandWindow}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
                {/* <Button variant="outline-secondary" size="sm" onClick={handleCloseLandWindow}>
                  Close
                </Button> */}
              </Card.Body>
            </Card>
          </div>
        )}
        <Container>
          <Row>
            <Col>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {viewLands.length > 0 ? (
                  <h4 className="clickableH4" onClick={() => setViewLands([])}>
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
              {viewLands.length > 0 ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="landGrid" >
                      {viewLands.map((land) => (
                        <OverlayTrigger
                        
                        key={land.id}
                        // placement={land.id}
                        overlay={
                          <Tooltip id={`tooltip-${land.id}`}>
                        <strong >{land.coordinate}</strong>.
                          </Tooltip>
                        }
                      >
                        <div
                          className="item"
                          style={{"backgroundColor":"darkgreen"}}
                          key={land.id}
                          onClick={() => handleOpenLandWindow(land)}
                        >
                          <img className="landImg" src={land.image}></img>
                        </div>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
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
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
