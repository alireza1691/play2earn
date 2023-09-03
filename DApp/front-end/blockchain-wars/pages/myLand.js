import React, { useState } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// import styles from "./../styles/Home.module.css"
// import Image from "next/image";
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';


const lands = () => {
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [landItems, setLandItems] = useState([])

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

  return (
    <>
      <div className="scrollableScreen">
        {isTransactionRejected && (
          <div className="overlay">
            <div className="transactionRejectedWindow">
              <p>Transaction Rejected</p>
              <p>Please try again or contact support.</p>
              <button onClick={handleClose}>Close</button>
            </div>
          </div>
        )}
        {isLandSelected && (
          <div className="overlay">
            <div className="selectedLandWindow">
              <h4>Land</h4>
              <p>Coordinate</p>
              <p>Owner:</p>
              <p>Level:</p>
              <button onClick={handleCloseLandWindow}>Close</button>
            </div>
          </div>
        )}
        <Container>
          <Row>
            {/* <Col md={{ span: 4, offset: 0 }}>
              <div className="itemCard">
                <div className="cardImage">
                  <img src="/asset_land.png"></img>
                </div>
              </div>
            </Col> */}
            <Col md={{ span: 4, offset: 0 }}>
              <Card style={{ width: "18rem" }} className="card">
                <Card.Img variant="top" src="/asset_land.png" className="cardImg"/>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button variant="primary" onClick={() => handleOpenWindow(selectedItem)}>Go somewhere</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default lands;
