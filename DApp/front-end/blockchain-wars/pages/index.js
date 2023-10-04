import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { Col, Container, Row } from "react-bootstrap";
import Carousel from "react-bootstrap/Carousel";
export default function Home() {
  return (
    // <main className={styles.main}>
    //   <div className={styles.container}>
    //     <div className={styles.header}>
    //       <h1 className={styles.title}>
    //         Welcome to{" "}
    //         <span className={styles.gradientText0}>
    //           <a
    //             href="https://thirdweb.com/"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             thirdweb.
    //           </a>
    //         </span>
    //       </h1>

    //       <p className={styles.description}>
    //         Get started by configuring your desired network in{" "}
    //         <code className={styles.code}>src/index.js</code>, then modify the{" "}
    //         <code className={styles.code}>src/App.js</code> file!
    //       </p>

    //       <div className={styles.connect}>
    //         <ConnectWallet
    //           dropdownPosition={{
    //             side: "bottom",
    //             align: "center",
    //           }}
    //         />
    //       </div>
    //     </div>

    //     <div className={styles.grid}>
    //       <a
    //         href="https://portal.thirdweb.com/"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           src="/images/portal-preview.png"
    //           alt="Placeholder preview of starter"
    //           width={300}
    //           height={200}
    //         />
    //         <div className={styles.cardText}>
    //           <h2 className={styles.gradientText1}>Portal ➜</h2>
    //           <p>
    //             Guides, references, and resources that will help you build with
    //             thirdweb.
    //           </p>
    //         </div>
    //       </a>

    //       <a
    //         href="https://thirdweb.com/dashboard"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           src="/images/dashboard-preview.png"
    //           alt="Placeholder preview of starter"
    //           width={300}
    //           height={200}
    //         />
    //         <div className={styles.cardText}>
    //           <h2 className={styles.gradientText2}>Dashboard ➜</h2>
    //           <p>
    //             Deploy, configure, and manage your smart contracts from the
    //             dashboard.
    //           </p>
    //         </div>
    //       </a>

    //       <a
    //         href="https://thirdweb.com/templates"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           src="/images/templates-preview.png"
    //           alt="Placeholder preview of templates"
    //           width={300}
    //           height={200}
    //         />
    //         <div className={styles.cardText}>
    //           <h2 className={styles.gradientText3}>Templates ➜</h2>
    //           <p>
    //             Discover and clone template projects showcasing thirdweb
    //             features.
    //           </p>
    //         </div>
    //       </a>
    //     </div>
    //   </div>
    // </main>
    <div
      className="scrollableScreen"
      // style={{"backgroundImage":"url('/townBackground.jpg')","backgroundSize":"cover","backgroundPosition":"center","backgroundColor":"rgba(0, 0, 0, 0.1)","opacity":"20%"}}
    >
      <Container>
        <Row>
          <Col className="indexPageHeader">
            <h2>Blockchains's kingdom</h2>
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
              <h2>Play & Earn</h2>
              <h5
              >
                Build your kingdom &#8680; Enjoy the game &#8680; Earn money
              </h5>
              <h5
                style={{
                  marginTop: "1rem",
                }}
              >
                To build your kingdom you need a land.
              </h5>
              <button className="greenButton" style={{ marginTop: "3rem" }}>
                Explore in lands &#10140;
              </button>
            </div>

            {/* <div className="nftBox"   style={{"padding":"1rem","marginTop":"5rem"}}>
        <img src="/asset_Land.png" height={200}/>
      </div> */}
          </Col>
          <Col>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/Warriors/AchaemenidSpearman.png"
                height={600}
                style={{ textAlign: "center" }}
              />
            </div>
          </Col>
        </Row>
        <Row style={{"marginTop":"20rem"}}>
          <Col>
          <div>
          <div className="mainPageTextContainer" >
              <h2>How to earn money?</h2>
              <h5>Earn money by selling goods.<br></br>To earn goods users can build its relevant building of goods. Also users can loot other players.</h5>
            </div>
          </div>
          </Col>
          <Col><img className="townImage" src="/CastleUpView.png" height={300}/></Col>
        </Row>
                <Row style={{"marginTop":"20rem"}}>
          <Col >
          <div
              className="nftBox"
              // style={{ padding: "1rem", marginTop: "5rem" }}
            >
              <img src="/asset_Land.png" height={200} />
              {/* <img src="/Castle3.png" height={200} /> */}
            </div>
          </Col>
          <Col>
            <div className="mainPageTextContainer">
              <h2>Based on digitall assets.</h2>
              <h5>All assets are token that means anything in game has value.</h5>
              <h5>Earn money by selling goods.<br></br>To earn goods you can build its relevant building. Also users can loot other players.</h5>
            </div>
          </Col>
        </Row>
        <Row style={{"marginTop":"20rem"}}>
        <Col>
            <div className="mainPageTextContainer">
              <h2>Innovative tokenomics</h2>
              <h5>The common problem that all P2E applications struggle with is tokenomics. Since the token of these applications has not tempting usage, all users want to sell them and supply will become much bigger than demand. We considered innovative tokenomics that will solve this problem.</h5>
              <h5>Look at tokenomcis through the <span style={{"textDecoration":"underline"}}> documentation</span>.</h5>
            </div>
          </Col>
          <Col>
            <img className="townImage" src="/CastleUpView.png" height={300}/>
          </Col>

        </Row>


        <Row>
          <h3
            style={{
              color: "white",
              marginTop: "10rem",
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
