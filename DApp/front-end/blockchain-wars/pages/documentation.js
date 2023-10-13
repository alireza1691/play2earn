import React from 'react'
import { Col, Container, Row} from 'react-bootstrap'
// import Container from 'react-bootstrap'
// import Row from 'react-bootstrap'

const documentation = () => {
  return (
    <div>
    {/* <Container>
      <Row> */}
      <Row className='documentation'>
        <Col sm={2} className="sidebar" >
            <h2>Documentation:</h2>
            <h3>What is Blockdom?</h3>
            <h3>How to play?</h3>
            <h3>How to earn?</h3>
            <h3>Blockdom advantages</h3>
            <h3>Items</h3>
            <h3>Tokenomics</h3>
            <h3>Contracts</h3>
        </Col>
        <Col sm={10} className="sidebarContent" >
            <h4>example text</h4>
        </Col>
        </Row>
      {/* </Row>
    </Container> */}
    </div>
  )
}

export default documentation
