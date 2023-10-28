import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import Table from "react-bootstrap/Table";

// import Container from 'react-bootstrap'
// import Row from 'react-bootstrap'

const Docs = () => {
  const [compIndex, setCompIndex] = useState(0);

  return (
    <div>
      {/* <Container>
      <Row> */}
      <Row className="documentation">
        <Col sm={3} className="sidebar">
          <h2>Documentation:</h2>
          <h3 onClick={() => setCompIndex(0)}>What is Blockdom?</h3>
          <h3 onClick={() => setCompIndex(1)}>Tokenomics</h3>
          {/* <h3 onClick={() => setCompIndex(2)}>How to earn?</h3>
          <h3 onClick={() => setCompIndex(3)}>Blockdom advantages</h3>
          <h3 onClick={() => setCompIndex(4)}>Items</h3>
          <h3 onClick={() => setCompIndex(5)}>Tokenomics</h3> */}
          <h3 onClick={() => setCompIndex(5)}>Contracts</h3>
        </Col>
        <Col sm={9} className="sidebarContent">
          {compIndex == 0 && (
            <>
              <h4>What is Blockdom?</h4>
              <h5>
                Blockdom is a play-to-earn strategic game on Blockchain. This
                game is based on digital assets from the attack of ERC721, and
                ERC20 tokens, some of which can be used in the game and some of
                which can be used and bought and sold, and the income of users
                depends on these assets.<br></br>
                <br></br>
                The important feature of this game is that with the entry of
                each user, the amount of liquidity and the value of the game
                increases and makes the assets of other users more valuable.
                Also, by spending money to build assets such as buildings and
                armies, the user may increase this trend in the long term.
              </h5>

              <h4>Land</h4>
              <h5>
                How to play? The requirement to participate in the game is a
                piece of land where you can build your city. This land is an NFT
                and tradable. After choosing and buying the desired land, you
                can start building buildings.
              </h5>
              <h4>Buildings</h4>
              <h5>
                There are different types of buildings, each of which extracts a
                type of goods for you, which includes stone, wood, iron, gold,
                and food. Each of these buildings may require some of each of
                these goods to be built. Also, the buildings can be upgraded,
                and by upgrading, more goods will be extracted for you.
                <br></br>
                <br></br>Another thing about constructing buildings is that
                depending on the level of the building, a certain amount of time
                will be spent on this operation (being built) whether for
                building or upgrading, and you cannot build or upgrade anything
                else during this period.
                <br></br>
                <br></br>Users can construct the building immediately by paying
                the cost (goods). This is one of our solutions to maintain the
                value of the token BMT, which we will discuss more in the
                Tokenamies section.
              </h5>
              <h5>Buildings of V1:</h5>

          
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="tableLine2">#</th>
                    <th className="tableLine2">Building</th>
                    <th className="tableLine2">Extracted goods</th>
                    <th className="tableLine2">Extracted amount (level 1)</th>
                  </tr>
                </thead>
                <tbody >
                  <tr>
                    <td className="tableLine2">1</td>
                    <td className="tableLine2">Stone mine</td>
                    <td className="tableLine2">Stone</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">2</td>
                    <td className="tableLine2">Wood lumber</td>
                    <td className="tableLine2">Wood</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">3</td>
                    <td className="tableLine2">Iron mine</td>
                    <td className="tableLine2">Iron</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">4</td>
                    <td className="tableLine2">Farm</td>
                    <td className="tableLine2">Food</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">5</td>
                    <td className="tableLine2">Gold mine</td>
                    <td className="tableLine2">Gold</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                </tbody>
              </Table>
              <h4>Earning</h4>
              <h5>
                The goods that are extracted from these buildings can be
                converted into BMT tokens and users can earn money by selling
                them.<br></br> Also, users can use the extracted goods to
                upgrade new buildings or build an army, which can increase their
                income during the game.
              </h5>
              <h4>Army</h4>
              <h5>
                To build an army, users must upgrade their barracks. A new
                warrior type will be added with the garrison upgrade, allowing
                users to build a more diverse and powerful army.<br></br>
                <br></br> By building an army, users can attack another user and
                in case of victory, according to the result of this war, they
                can loot some of the defender&apos;s goods.<br></br> This
                feature not only increases the excitement and enjoyment of the
                game but also makes inactive users or inappropriate users cannot
                earn money from the game.<br></br>
                <br></br>We consider this as an advantage of the game because if
                all users make a profit, the supply of BMT will increase and in
                the long run the price will decrease.<br></br>
                <br></br> In summary, we can say that this game is enjoyable and
                profitable for active users without worrying about the price of
                BMT falling and reducing their income.
                <br></br>
                <br></br>
                We have defined 3 types of warriors and more warriors will add in updates Here is current warriors:
              </h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="tableLine2">#</th>
                    <th className="tableLine2">Warrior</th>
                    <th className="tableLine2">Attack power</th>
                    <th className="tableLine2">Defence power</th>
                    <th className="tableLine2">Hit point (HP)</th>
                  </tr>
                </thead>
                <tbody >
                  <tr>
                    <td className="tableLine2">1</td>
                    <td className="tableLine2">Spearman</td>
                    <td className="tableLine2">60</td>
                    <td className="tableLine2">90</td>
                    <td className="tableLine2">140</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">2</td>
                    <td className="tableLine2">Swordsman</td>
                    <td className="tableLine2">90</td>
                    <td className="tableLine2">70</td>
                    <td className="tableLine2">200</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">3</td>
                    <td className="tableLine2">Archer</td>
                    <td className="tableLine2">40</td>
                    <td className="tableLine2">60</td>
                    <td className="tableLine2">80</td>
                  </tr>
                  {/* <tr>
                    <td className="tableLine2">4</td>
                    <td className="tableLine2">Farm</td>
                    <td className="tableLine2">Food</td>
                    <td className="tableLine2">8 per day</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">5</td>
                    <td className="tableLine2">Gold mine</td>
                    <td className="tableLine2">Gold</td>
                    <td className="tableLine2">8 per day</td>
                  </tr> */}
                </tbody>
              </Table>
            </>
          )}
          {compIndex == 1 && (
            <>
              <h4>Tokenomics</h4>
              <h5>
                BMT is token of blockdom that is convertable to goods of the game and users need BMT that can build their kingdom, also they will earn money by BMT from the game. Goods are earnable from relevant building or looting other users.<br></br>
                Max supply of the BMT is 1,000,000,000. To keep supply of the token close to max supply we have considered soulutions that we mentioned below.
              <br></br> <br></br>
                Since almost all play-to-earn applications face the problem of
                token supply disproportionate to demand, we have given great
                importance to this issue and have anticipated
                different Tokenemies.<br></br> In general, we can say that the application where all users can easily earn money,
                Undoubtedly, the supply of the unconventional token will have a
                problem with the demand, and the price of the token will always
                decrease.<br></br> <br></br>
                So we have designed the game in such a way that active
                users can count on long-term income from the game.<br></br>
                In the following cases, we have mentioned actions that require goods:<br></br> <br></br>
                <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="tableLine2">#</th>
                    {/* <th className="tableLine2">Action</th>
                    <th className="tableLine2">Burning</th> */}
                    <th className="tableLine2">Usages</th>
                  </tr>
                </thead>
                <tbody >
                  <tr>
                    <td className="tableLine2">1</td>
                    <td className="tableLine2">Build</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">2</td>
                    <td className="tableLine2">Upgrade</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">3</td>
                    <td className="tableLine2">Army training</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">4</td>
                    <td className="tableLine2">War</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">5</td>
                    <td className="tableLine2">Transfer</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">6</td>
                    <td className="tableLine2">Finish building operation</td>
                  </tr>
                  <tr>
                    <td className="tableLine2">7</td>
                    <td className="tableLine2">Finish training operation</td>
                  </tr>
                </tbody>
              </Table>
   
                <br></br> <br></br>
                Another thing about the total value of the token market is that
                with the addition of each user, new buildings will be built and
                upgraded, for which commodity is consumed (tokens are burned),
                which means that the total market value is always increasing. It
                is also a kind of token burning as warriors are built and
                killed.
                <br></br> <br></br>
                If the supply of BMT increases compared to the demand due to high extraction of goods, there are some incentives that will encourage users to spend more goods in the game, thereby balancing demand and supply. Another solution is reduing buildings daily extraction temporarily until supply and demand are matched.
                <br></br>At first glance it may looks unfair for users that earned goods decrease. But this solution will keep the price of BMT and in the end, it benefits the user.
              </h5>

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
              <h4>Contracts</h4>
              <h5>Contracts info will add here soon.</h5>
            </>
          )}
        </Col>
      </Row>
      {/* </Row>
    </Container> */}
    </div>
  );
};

export default Docs;
