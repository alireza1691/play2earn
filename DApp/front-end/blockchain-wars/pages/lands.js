import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";
import { landsSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/LandsV1.json";
import { ethers } from "ethers";

const lands = ({ provider, address, landImgUrl, mintedLands, dataLoad }) => {
  const [viewLands, setViewLands] = useState([]);
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  const [closePopUp, setClosePopUp] = useState(false);

  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const handleOpenLandWindow = (land) => {
    setIsLandSelected(true);
    setSelectedLand(land);
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedLand({});
  };

  const handleClosePopUp = () => {
    setClosePopUp(true);
    dataLoad();
  };

  const views = () => {
    let counter = 0;
    let view = [];
    // for (let view = 0; view < 100; view++) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const item = {
          id: counter,
          id: counter,
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
    console.log("change view called");
    let lands = [];
    let counter = 0;
    for (let y = yStartingPoint; y < yStartingPoint + 10; y++) {
      for (let x = xStartingPoint; x < xStartingPoint + 10; x++) {
        const tokenId = x.toString() + y.toString();
        const isMinted = false;
        let img = "/emptyLandImg.png";
        let owner
        for (let index = 0; index < mintedLands.length; index++) {
          if (tokenId == mintedLands[index].tokenId) {
            isMinted == true;
            img = "/mintedLand.png";
            owner = mintedLands[index].owner
          }
        }
        const land = {
          id: counter,
          x: x,
          y: y,
          color: "green",
          coordinate: x.toString() + "," + Number(y),
          tokenId: tokenId,
          isMinted: isMinted,
          image: img,
          owner: owner
        };
        console.log(land);
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
    const fetchData = async () => {
      console.log("Lands route");
      const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
      //   const imgURL = await lands.URI();
      //   setLandImgUrl(imgURL);
      //   console.log(imgURL);
    };
    fetchData();
  }, [address]);

  return (
    <>
      <div className="scrollableScreen">
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
                 <Card.Body>
              <Card.Text style={{"fontSize":"0.9rem"}}>
                If you have any land we recommend to connect your wallet
              </Card.Text>
              <div style={{"display":"flex","justifyContent":"end"}}>
              <Button variant="outline-secondary" onClick={handleClosePopUp} size="sm">
                Close
              </Button>
              </div>
              </Card.Body>
            </Card>
          </div>
        )}
        {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionRejectedWindow">
              <p>Transaction Rejected</p>
              <p>Please try again or contact support.</p>
              <button onClick={handleClose}>Close</button>
            </div>
          </div>
        )}
        {isLandSelected && selectedLand &&(
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
                <Card.Title>Card Title</Card.Title>
                <Card.Text>Land</Card.Text>
                <Card.Text>Coordinate:{selectedLand.coordinate}</Card.Text>
                {selectedLand.owner !== undefined && <Card.Text>Owner: {selectedLand.owner}</Card.Text> }
                
                <Button variant="primary" onClick={handleCloseLandWindow}>
                  Close
                </Button>
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
                    <div className="landGrid">
                      {viewLands.map((land) => (
                        <div
                          className="item"
                          key={land.id}
                          onClick={() => handleOpenLandWindow(land)}
                        >
                          {/* <p style={{ color: "black", fontSize: "0.6rem" }}>
                  {land.coordinate}
                </p> */}
                          <img className="landImg" src={land.image}></img>
                        </div>
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
                        ></div>
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
