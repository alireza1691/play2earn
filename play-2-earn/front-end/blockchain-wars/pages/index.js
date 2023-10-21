import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { Col, Container, Row, Carousel } from "react-bootstrap";
// import { Image } from "next/image";
import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  return (
    <div className="scrollableScreen">
      <Container>
        <Row className="mainRow" style={{ marginBottom: "5rem" }}>
          <Col className="indexPageHeader">
            <h2>Blockdom</h2>
          </Col>
        </Row>
        <Row className="mainRow">
          <Col sm={6}>
            <div className="mainPageTextContainer">
              <h1>
                Pre-sale is <span style={{ color: "greenyellow" }}>live</span>
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
            </div>
          </Col>
          <Col sm={6}>
            <div className="parcelBox">
              <Image
                src="/kingdomParcel/kingdom18.png"
                width={500}
                height={800}
                layout="responsive"
                objectFit="contain"
                loading="lazy"
              />
            </div>
          </Col>
        </Row>
        <Row className="mainRow">
          <Col>
            <div className="mainPageTextContainer" style={{ marginTop: "1%" }}>
              <h3>Do not miss the chance to earn from the exciting game</h3>
            </div>
          </Col>
        </Row>

        <Row className="mainRow">
          <Col sm={4}>
            <div>
              <div className="mainPageTextContainer">
                <h2>Mint your land</h2>
                <h5>
                  Participating in the game requires land to build your town.
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
            <div className="imgBox">
              <Image
                src="/mint-nft2.png"
                width={500}
                height={800}
                layout="responsive"
                objectFit="contain"
                loading="lazy"
              />
            </div>
          </Col>
        </Row>
        <Row className="mainRow">
          <Col sm={4}>
            <div className="imgBox">
              <Image
                src="/kingdomParcel/kingdomCard.png"
                width={500}
                height={800}
                layout="responsive"
                objectFit="contain"
                loading="lazy"
              />
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

        <Row className="mainRow">
          <Col sm={4}>
            <div>
              <div className="mainPageTextContainer">
                <h2>Earn & enjoy the game</h2>
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
            <div className="imgBox">
              <Image src="/earn.png" 
                          width={500}
                          height={800}
                          layout="responsive"
                          objectFit="contain"
                          loading="lazy"
              />
            </div>
          </Col>
        </Row>

        <Row className="mainRow">
          <Col>
            <div className="warriorsContainer">
              <Image src="/warrior/swordsman.png" className="manImg"             width={500}
                height={800}
                layout="responsive"
                objectFit="contain" />
                 loading="lazy"
              {/* <img src="warrior/archerWoman6.png" className="womanImg"/> */}
            </div>
          </Col>

          <Col sm={4}>
            <div className="textCard">
              {/* <img
                src="/tokenomics/tokenomics4.jpeg"
                style={{ opacity: "0.9" }}
              />
            */}
              <div className="mainPageTextContainer">
                {" "}
                <h4>Deflationary Tokenomics</h4>
                <h5>
                  The main advantage of Blockdom among the other P2E (play to
                  earn) applications is Tokenomics.
                  <br></br>
                  <br></br>
                  It is the same obstacle that almost all P2E applications
                  struggle with. Since the token of the P2E applications has not
                  any tempting usage, all users tend to sell their earned
                  tokens. thereby becoming supply much bigger than demand.
                  <br></br>
                  <br></br> We considered innovative tokenomics that will solve
                  this problem. To read more about the tokenomics go to the{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "yellowgreen",
                      cursor: "pointer",
                    }}
                  >
                    Docs
                  </span>
                </h5>
              </div>
            </div>
          </Col>

          <Col>
            <div className="warriorsContainer">
              <Image src="/warrior/swordsman2.png" className="manImg"      width={500}
                height={800}
                layout="responsive"
                objectFit="contain"/>
                 loading="lazy"
              {/* <img src="warrior/archerWoman3.png" className="womanImg" /> */}
            </div>
          </Col>
        </Row>
        {/* <Row className="mainRow">
 
        </Row> */}
        <Row className="mainRow">
          <Col sm={12}>
            {" "}
            <h3
              style={{
                color: "white",
                fontFamily: "courier",
              }}
            >
              Roadmap &#10164;
            </h3>
          </Col>
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2023-Q3</h4>
              <h4>
                - Launching game on testnet<br></br>- Attracting community
              </h4>
            </div>
          </Col>
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2023-Q4</h4>
              <h4>
                - Land presale on mainnet<br></br>- Marketing
              </h4>
            </div>
          </Col>
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2024-Q1</h4>
              <h4>
                - Launching game on mainnet <br></br>- Partnerships
              </h4>
            </div>
          </Col>
          {/* </Row>
        <Row className="mainRow"> */}
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2024-Q2 </h4>
              <h4>
                - Updating game assets<br></br>- Tournaments{" "}
              </h4>
            </div>
          </Col>
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2024-Q3</h4>
              <h4>
                - ERC721 Heroes<br></br>- Community challenges
              </h4>
            </div>
          </Col>
          <Col sm={4}>
            <div className="textBox">
              <h4 style={{ textAlign: "center" }}>2024-Q4</h4>
              <h4>
                - Land presale on mainnet<br></br>- Marketing
              </h4>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
