import React, { useState, useEffect } from "react";
import LandsComponent from "../components/LandsComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// import styles from "./../styles/Home.module.css"
// import Image from "next/image";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";

import Accordion from "react-bootstrap/Accordion";

const lands = ({infuraProvider, address}) => {
  const [isLandSelected, setIsLandSelected] = useState(false);
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [landItems, setLandItems] = useState([]);


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

  useEffect(() => {
    const fetchData = async () => {
      // const lands = new ethers.Contract(
      //   landsSepolia,
      //   Lands.abi,
      //   infuraProvider
      // );
      // const imgURL = await lands.URI();
      // setLandImgUrl(imgURL);
      // console.log(imgURL);
    };
    fetchData();
  }, [infuraProvider, address]);


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
              <Button variant="primary" onClick={handleCloseLandWindow}>
                Close
              </Button>
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
              <Card className="card">
                <Card.Img
                  variant="top"
                  src="/asset_land.png"
                  className="cardImg"
                />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenWindow(selectedItem)}
                  >
                    Go somewhere
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={{ span: 8, offset: 0 }}>
              <div className="myLandColumn">
                <div className="balanceHeader">
                  <img src="/Stone.png"></img>
                  <h6>Stone:</h6>
                  <img src="/Wood.png"></img>
                  <h6>Wood:</h6>
                  <img src="/Iron.png"></img>
                  <h6>Iron:</h6>
                  <img src="/Gold.png"></img>
                  <h6>Gold:</h6>
                  <img src="/Food.png"></img>
                  <h6>Food:</h6>
                </div>

                <div className="myLandBox">
                  <div className="landBoxColumn">
                    <InputGroup className="mb-3" size="sm">
                      <Form.Control placeholder="Enter amount..." aria-label="Amount (to the nearest dollar)" style={{"width":"50%"}}/>
                      <Dropdown >
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="selectDropdown">
                          Select
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item href="#/action-1">
                          <img src="/Stone.png" className="dropdownTokenLogo"></img>
                            Stone
                          </Dropdown.Item>
                          <Dropdown.Item href="#/action-2">
                          <img src="/Wood.png" className="dropdownTokenLogo"></img>
                            Wood
                          </Dropdown.Item>
                          <Dropdown.Item href="#/action-3">
                          <img src="/Iron.png" className="dropdownTokenLogo"></img>
                            Iron
                          </Dropdown.Item>
                          <Dropdown.Item href="#/action-4">
                          <img src="/Gold.png" className="dropdownTokenLogo"></img>
                            Gold
                          </Dropdown.Item>
                          <Dropdown.Item href="#/action-5">
                          <img src="/Food.png" className="dropdownTokenLogo"></img>
                            Food
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </InputGroup>
                    <Button variant="outline-light" size="sm" style={{"marginRight":"10px"}}>Deposit</Button>
                    <Button variant="outline-light" size="sm">Withdraw</Button>
                  </div>
                  <div className="landBoxColumn">
                    <p> Some text</p>
                  </div>
                </div>
              </div>
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
