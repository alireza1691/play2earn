import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { Col, Container, Row, Carousel } from "react-bootstrap";

import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  return (
    <div
      className="scrollableScreen"
      // style={{"backgroundImage":"url('/townBackground.jpg')","backgroundSize":"cover","backgroundPosition":"center","backgroundColor":"rgba(0, 0, 0, 0.1)","opacity":"20%"}}
    >
      <Container>
        <Row>
          <Col className="indexPageHeader">
            <h2>Blockdom</h2>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <div className="mainPageTextContainer">
              <h1>
                Presale is <span style={{ color: "greenyellow" }}>live</span>
              </h1>

              <button
                className="greenButton"
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  router.push("/map");
                }}
              >
                Explore in lands &#10140;
              </button>
              <h5 style={{ marginTop: "3rem" }}>
                Lands are limited and only
                <span style={{ color: "greenyellow" }}> 10,000</span> land exist
              </h5>
              <h5>
                Mint your land in presale with{" "}
                <span style={{ color: "greenyellow" }}> 50% </span> of the price
              </h5>
              {/* <h5 >Presale is live until the <span style={{"color":"greenyellow"}}> 1/1/2024 </span></h5> */}
            </div>

            {/* <div className="nftBox"   style={{"padding":"1rem","marginTop":"5rem"}}>
        <img src="/asset_Land.png" height={200}/>
      </div> */}
          </Col>
          <Col sm={6}>
            <div className="parcelBox">
              <img src="/kingdomParcel/kingdom18.png" />
            </div>
          </Col>
        </Row>
        <Row style={{ marginTop: "20rem" }}>
          <Col>
            <div className="mainPageTextContainer" style={{ marginTop: "1%" }}>
              <h3>Don't miss the chance to earn from the exciting game</h3>
              {/* <h2>Based on digitall assets</h2> */}
              {/* <h5>Game contains ERC20 and ERC721 tokens which are standard tradable tokens</h5> */}
              {/* <h5>All assets are token that means anything in game is tradable has value.</h5> */}
            </div>
          </Col>
        </Row>
        {/* <Row>
        <Col className="mainPageCard">         
     
              <img src="kingdomParcel/kingdom10.png"  />
            </Col>
            <Col className="mainPageCard">
            <img
                src="/Warriors/AchaemenidSpearman.png"
              />
            </Col>
            <Col  className="mainPageCard"></Col>
            <Col  className="mainPageCard"></Col>
            </Row > */}

        <Row style={{ marginTop: "20rem" }}>
          <Col sm={4}>
            <div>
              <div className="mainPageTextContainer">
                <h2>Mint your land</h2>
                <h5>
                  Participating in game requires a land to build your town.
                  <br></br>Each land is a NFT and there are only 10000 lands.
                  <br></br>Visit{" "}
                  <span
                    onClick={() => {
                      router.push("/map");
                    }}
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "1.3rem",
                      color: "yellowgreen",
                    }}
                  >
                    lands
                  </span>{" "}
                  from map.
                </h5>
              </div>
            </div>
          </Col>
          <Col sm={4}></Col>
          <Col sm={4}>
            <div className="parcelBox">
              <img src="/mint-nft2.png" />
            </div>
            {/* <img  src="/dollar.png" height={100}/> */}
          </Col>
        </Row>
        <Row style={{ marginTop: "20rem" }}>
          <Col sm={4}>
            <div className="parcelBox">
              <img src="/kingdomParcel/kingdom7.png" />
            </div>
          </Col>
          <Col sm={4}></Col>
          <Col sm={4} style={{ marginTop: "3rem" }}>
            <div className="mainPageTextContainer">
              <h2>Build your town</h2>
              <h5>
                Build buildings, army and the other game assets on your land.
              </h5>
              <h5>
                Go to your{" "}
                <span
                  onClick={() => {
                    router.push("/documentation");
                  }}
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "1.3rem",
                    color: "yellowgreen",
                  }}
                >
                  {" "}
                  land
                </span>{" "}
                if you have
              </h5>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: "20rem" }}>
          <Col sm={4}>
            <div>
              <div className="mainPageTextContainer">
                <h2>Earn and enjoy the game</h2>
                <h5>
                  -Earn money by selling goods<br></br>To earn goods users can
                  build relevant building of goods. Also users can loot the
                  other players.
                </h5>
                <h5>
                  -Earn money by tournaments<br></br>Top players of the
                  tournaments will earn rewards.
                </h5>
              </div>
            </div>
          </Col>
          <Col sm={4}></Col>
          <Col sm={4}>
            <div className="parcelBox">
              <img src="/earn3.png" />
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: "20rem" }}>
          <div className="mainPageTextContainer">
            <h1>Why Blockdom?</h1>
          </div>
        </Row>
        <Row style={{ marginTop: "5rem" }}>
          <Col >
            <div className="infoRow">
            <div className="infoRowImg">
              <img
                src="/tokenomics/tokenomics4.jpeg"
                style={{ opacity: "0.9" }}
              />
            </div>
            <div className="mainPageTextContainer">
              {" "}
              <h4>Deflationary tokenomics</h4>
              <h5>
                The main advantage of our platform among the other P2E (play to
                earn) applications is Tokenomics.
                <br></br>
                It is the same obstacle that almost all P2E applications
                struggle with. Since the token of P2E applications has not any
                tempting usage, all users tend to sell their earned tokens.
                thereby becoming supply much bigger than demand. We considered
                innovative tokenomics that will solve this problem.
              </h5>
            </div>
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
        {/* <Row style={{ marginTop: "20rem" }}>
          <Col></Col>
          <Col md={{ span: 6, offset: 6 }}></Col>
        </Row> */}
      </Container>
    </div>
  );
}
