import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { Col, Container, Row } from "react-bootstrap";
import Carousel from "react-bootstrap/Carousel";
import { useRouter } from "next/router";
export default function Home() {

  const router = useRouter()
  return (

    <div
      className="scrollableScreen"
      // style={{"backgroundImage":"url('/townBackground.jpg')","backgroundSize":"cover","backgroundPosition":"center","backgroundColor":"rgba(0, 0, 0, 0.1)","opacity":"20%"}}
    >
      <Container>
        <Row>
          <Col className="indexPageHeader">
            <h2>Blockchains wars</h2>
            {/* <Carousel>
      <Carousel.Item>
        <img src="/asset_land.png" height={300} width={360}></img>
        <Carousel.Caption>
          <h3>Mint your land</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src="/asset_land.png" height={300} width={360}></img>
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src="/asset_land.png" height={300} width={360}></img>
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  */}
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="mainPageTextContainer">
               <h1>Presale is <span style={{"color":"greenyellow"}}>live</span></h1>
              {/*<h5
              >
                Build your kingdom &#8680; Enjoy the game &#8680; Earn money
              </h5>
              <h5
                style={{
                  marginTop: "1rem",
                }}
              >
                To build your kingdom you need a land.
              </h5> */}
              <button className="greenButton" style={{ marginTop: "1rem" }} onClick={()=>{router.push('/map')}}>
                Explore in lands &#10140;
              </button>
              <h5 style={{"marginTop":"3rem"}}>Lands are limited and only<span style={{"color":"greenyellow"}}> 10,000</span> land exist</h5>
              <h5 >Mint your land in presale with <span style={{"color":"greenyellow"}}> 50% </span> of the price</h5>
              {/* <h5 >Presale is live until the <span style={{"color":"greenyellow"}}> 1/1/2024 </span></h5> */}
            </div>

            {/* <div className="nftBox"   style={{"padding":"1rem","marginTop":"5rem"}}>
        <img src="/asset_Land.png" height={200}/>
      </div> */}
          </Col>
          <Col >
          <div
              className="parcelBox"
            >
              <img src="/kingdomParcel/kingdom18.png" />
            </div>
            {/* <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/Warriors/AchaemenidSpearman.png"
                height={600}
                style={{ textAlign: "center" }}
              />
            </div> */}
          </Col>
        </Row>
        <Row style={{"marginTop":"10rem"}}>
          <Col className="stepCol">
            <h3>1</h3>
          <h2>Mint your land</h2>
          <p></p>
          </Col>
          <Col className="stepCol">
          <h3>2</h3>
          <h2>Build your kingdom</h2>
          <p></p>
          </Col>
          <Col className="stepCol">
          <h3>3</h3>
          <h2>Earn money</h2>
          <p></p>
          </Col>
          {/* <Col className="stepCol">
          <h3>4</h3>
          <h2>Enjoy the game</h2>
          <p></p>
          </Col> */}
        </Row>
        <Row style={{"marginTop":"20rem"}}>
          <Col>
          <div>
          <div className="mainPageTextContainer" >
              <h2>How to earn money?</h2>
              <h5>Earn money by selling goods.<br></br>To earn goods users can build relevant building of goods. Also users can loot the other players.</h5>
            </div>
          </div>
          </Col>
          <Col>

          </Col>
          <Col>
          {/* <img  src="/dollar.png" height={100}/> */}
          </Col>
        </Row>
                <Row style={{"marginTop":"30rem"}}>
          <Col >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/Warriors/AchaemenidSpearman.png"
                height={600}
                style={{ textAlign: "center" }}
              />
            </div>
          </Col>
          <Col>

            <div className="mainPageTextContainer" style={{"marginTop":"25%"}}>
              <h2>Based on digitall assets</h2>
              <h5>Game contains ERC20 and ERC721 tokens which are standard tradable tokens</h5>
              {/* <h5>All assets are token that means anything in game is tradable has value.</h5> */}
            </div>
          </Col>
          <Col></Col>
        </Row>
        <Row style={{"marginTop":"30rem"}}>
        <Col></Col>
        <Col></Col>
        <Col>
            <div className="mainPageTextContainer">
              <h2>Innovative tokenomics</h2>
              <h5>The common problem that all P2E applications struggle with is tokenomics. Since the token of these applications has not tempting usage, all users want to sell them and supply will become much bigger than demand. We considered innovative tokenomics that will solve this problem.</h5>
              <h5>Look at tokenomcis through the <span onClick={() => {router.push("/docs")}} style={{"textDecoration":"underline", cursor:"pointer",fontSize:"1.1rem"}}> documentation</span>.</h5>
            </div>
          </Col>

        </Row>


        <Row>
          <h3
            style={{
              color: "white",
              marginTop: "20rem",
              fontFamily: "courier",
            }}
          >
            Roadmap &#10164;
          </h3>
        </Row>
        <Row style={{}}>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2023-Q3</h4>
            <h4>
              - Launching game on testnet<br></br>- Attracting community
            </h4>
          </Col>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2023-Q4</h4>
            <h4>
              - Land presale on mainnet<br></br>- Marketing
            </h4>
          </Col>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2024-Q1</h4>
            <h4>
              - Launching game on mainnet <br></br>- Partnerships
            </h4>
          </Col>
        </Row>
        <Row>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2024-Q2 </h4>
            <h4>
              - Updating game assets<br></br>- Tournaments{" "}
            </h4>
          </Col>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2024-Q3</h4>
            <h4>
              - ERC721 Heroes<br></br>- Community challenges
            </h4>
          </Col>
          <Col className="textBox">
            <h4 style={{ textAlign: "center" }}>2024-Q4</h4>
            <h4>
              - Land presale on mainnet<br></br>- Marketing
            </h4>
          </Col>
        </Row>
        <Row style={{ marginTop: "20rem" }}>
          <Col></Col>
          <Col md={{ span: 6, offset: 6 }}></Col>
        </Row>
      </Container>
    </div>
  );
}
