import React, { useState } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import { Card } from "react-bootstrap";

const lands = () => {
  const [viewLands, setViewLands] = useState([]);
  const [isLandSelected, setIsLandSelected] = useState(false)
  const [isTransactionRejected, setIsTransactionRejected] = useState(false)
  const [selectedLand, setSelectedLand] = useState({})

  const handleClose = () => {
    setIsTransactionRejected(false);
  };


  const handleOpenLandWindow = (landCoordinate) => {
    setIsLandSelected(true);
    setSelectedLand({coordinate: landCoordinate})
  };

  const handleCloseLandWindow = () => {
    setIsLandSelected(false);
    setSelectedLand({})
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
          xStartingPoint: x * 10 ,
          y: y,
          yStartingPoint: y * 10 ,
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
   

    
        const land = {
          id: counter,
          x: x,
          y: y,
          color: "green",
          coordinate: x.toString() +","+ Number(y),
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

  return (
    <>
    <div className="scrollableScreen">
    {isTransactionRejected && <div className="overlay">
          <div className="transactionRejectedWindow">
            <p>Transaction Rejected</p>
            <p>Please try again or contact support.</p>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>}
        {isLandSelected && 
            <div className="overlay">
                {/* <div className="selectedLandWindow">
                <h4>Land</h4>
                <p>Coordinate:{selectedLand.coordinate}</p>
                <p>Owner:</p>
                <p>Level:</p>
                <button onClick={handleCloseLandWindow}>Close</button>
                </div> */}
                <Card style={{ width: "18rem" ,backgroundColor:"white",boxShadow:"0px 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.5)"}} className="card">
                <Card.Img variant="top" src="/asset_land.png" className="cardImg" />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>Land</Card.Text>
                  <Card.Text>Coordinate:{selectedLand.coordinate}</Card.Text>
                  <Card.Text>Owner:</Card.Text>
                  <Button variant="primary" onClick={handleCloseLandWindow}>Close</Button>
                </Card.Body>
              </Card>
            </div>}
    <Container>
        <Row>
            <Col>
            <div style={{"display":"flex","justifyContent":"center"}}>
                {viewLands.length > 0 ? (
                    <h4 className="clickableH4" onClick={() => setViewLands([])}>Back</h4>
                ):(
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
              <div className="item" key={land.id} onClick={()=> handleOpenLandWindow(land.coordinate)}>
                {/* <p style={{ color: "black", fontSize: "0.6rem" }}>
                  {land.coordinate}
                </p> */}
                <img className="landImg" src="/emptyLandImg.png">

                </img>
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
