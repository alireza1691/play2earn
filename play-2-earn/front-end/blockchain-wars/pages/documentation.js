import React from 'react'
import { Col, Container, Row} from 'react-bootstrap'
import { useState } from 'react'
// import Container from 'react-bootstrap'
// import Row from 'react-bootstrap'

const documentation = () => {

  const [compIndex, setCompIndex] = useState(0)


  return (
    <div>
    {/* <Container>
      <Row> */}
      <Row className='documentation'>
        <Col sm={3} className="sidebar" >
            <h2>Documentation:</h2>
            <h3 onClick={()=>setCompIndex(0)}>What is Blockdom?</h3>
            <h3 onClick={()=>setCompIndex(1)} >How to play?</h3>
            <h3 onClick={()=>setCompIndex(2)}>How to earn?</h3>
            <h3 onClick={()=>setCompIndex(3)}>Blockdom advantages</h3>
            <h3 onClick={()=>setCompIndex(4)}>Items</h3>
            <h3 onClick={()=>setCompIndex(5)}>Tokenomics</h3>
            <h3 onClick={()=>setCompIndex(6)}>Contracts</h3>
        </Col>
        <Col sm={9} className="sidebarContent" >
          {compIndex == 0 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}
          {compIndex == 1 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}
          {compIndex == 2 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}
          {compIndex == 3 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}
          {compIndex == 4 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}
          {compIndex == 5 && (
            <>
            <h4>title</h4>
                        <h5>example text</h5>
                        </>
          )}

        </Col>
        </Row>
      {/* </Row>
    </Container> */}
    </div>
  )
}

export default documentation
