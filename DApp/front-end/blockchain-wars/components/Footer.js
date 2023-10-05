import React, { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import { Col, Navbar as MyNav, Row } from 'react-bootstrap';
import { useRouter } from "next/router";

// dotenv.config();
require("dotenv").config();

const Navbar = (
    { }
    ) => {


  useEffect(() => {
    const fetchOnchainData = async () => {

    };

    fetchOnchainData();
  }, []);

  return (
    <Container>
        <Row style={{"marginBottom":"10rem"}}>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            
            </Col>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            </Col>
            <Col>
            <p style={{"color":"white"}}>add something to footer</p>
            </Col>
        </Row>
    </Container>
  );
};

export default Navbar;
