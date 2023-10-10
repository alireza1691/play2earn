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
    <Container className="footer">
        <Row >
            <Col sm={3}>
            <p >About us</p>
            </Col>
            <Col sm={3}>
            <p >FAQ</p>
            </Col>
            <Col sm={3}>
            <p >Privacy policy</p>
            </Col>
            <Col sm={3}>
            <p >Terms of use</p>
            </Col>
        </Row>
        <Row >
          <h4>© 2023 Blockchain wars foundation. All rights reserved.</h4>
        </Row>
    </Container>
  );
};

export default Navbar;
