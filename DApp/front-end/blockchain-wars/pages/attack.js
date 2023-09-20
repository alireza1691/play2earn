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
  barracks,
} from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import Barracks from "../Blockchain/Barracks.json";
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
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const metamaskConfig = metamaskWallet();

const attack = ({ provider, mintedLands, dataLoad, landObj }) => {
  const [isTransactionRejected, setIsTransactionRejected] = useState(false);
  const [selectedLand, setSelectedLand] = useState({});
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [warriorTypes, setWarriorTypes] = useState();

  const connectWithMetamask = useMetamask();
  const router = useRouter();

  const connect = useConnect();
  const signer = useSigner();
  const address = useAddress();

  const weaponsArray = ["/weapon/Spear.png","/weapon/Sword.png","/weapon/Archery.png"]
  const handleClose = () => {
    setIsTransactionRejected(false);
  };

  const attack = async () => {
    try {
      setVisibleConfirmation(true);
    } catch (error) {
      setIsTransactionRejected(true);
    }
  };

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
      const barracksInst = new Contract(barracks, Barracks.abi, provider);
      const warriorTypes = await barracksInst.getTypes();
      setWarriorTypes(warriorTypes)
      console.log(warriorTypes);
    };
    fetchData();
  }, [address, visibleConfirmation]);

  return (
    <>
      <div className="scrollableScreen">
        {visibleConfirmation == true && (
          <>
            {confirmed == false ? (
              <div
                className="overlay"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="popUpConfirmation">
                  <h4 style={{ color: "white" }} className="defaultH4">
                    Confirming...
                  </h4>

                  <Spinner
                    animation="border"
                    role="status"
                    style={{ color: "white" }}
                  >
                    <span
                      style={{ color: "white" }}
                      className="visually-hidden"
                    >
                      Loading...
                    </span>
                  </Spinner>
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

        <Container>
          <Row>
            <div className="attackContainder">
              <div className="selectArmyColumn">
                {/* <InputGroup className="mb-3"
             style={{"width":"50%"}}
            > */}
            <h4 className="defaultH4">Land:</h4>
            <DropdownButton id="dropdown-basic-button" title="Dropdown button">
      {/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
      <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
      <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
   
            {/* <Form.Select size="sm" aria-label="Default select example" style={{"width":"50%"}} placeholder="Select land"> */}
            <option>Select land</option>
            {Array.isArray(landObj) && landObj.length > 0 && (
              landObj.map((land, key) => (
                <Dropdown.Item href="#/action-3" key={key} value={land[key]} onClick={() => setSelectedLand(land[key])}>{land.coordinate}</Dropdown.Item>
                // <option key={key} value={land[key]} onClick={() => setSelectedLand(land[key])}>{land.coordinate}</option>
              ))
            )}
      </DropdownButton>
    {/* </Form.Select> */}
                <h4 className="defaultH4" style={{"marginTop":"15px"}}>Army:</h4>
                {Array.isArray(warriorTypes) && warriorTypes.length >= 0
                  ? warriorTypes.map((warrior, key) => (
                      <div key={key} style={{"display":"flex"}}>
                        {/* <h4 className="defaultH5">{warrior.name}</h4> */}
                        <Form.Control
                          size="sm"
                          style={{ width: "50%" ,marginBottom:"0.5rem"}}
                          placeholder={`Enter the ${warrior.name} amount`}
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                      </div>
                    ))
                  : ""}

                {/* </InputGroup> */}
              </div>
              <div className="targetInfo"></div>
            </div>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default attack;
