import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
// import Container from 'react-bootstrap'
// import Row from 'react-bootstrap'

const documentation = () => {
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
                each user, the amount of cash available in the game increases
                and makes the assets of other users more valuable. Also, by
                spending money to build assets such as buildings and armies, the
                user may increase this trend in the long term.
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
                There are different types of buildings, each
                of which extracts a type of goods for you, which includes stone,
                wood, iron, gold, and food. Each of these buildings may require
                some of each of these goods to be built. Also, the buildings can
                be upgraded, and by upgrading, more goods will be extracted for
                you.
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

              <h4>Earning</h4>
              <h5>
                The goods that are extracted from these buildings can be
                converted into BNT tokens and users can earn money by selling
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
                can loot some of the defender's goods.<br></br> This feature not
                only increases the excitement and enjoyment of the game but also
                makes inactive users or inappropriate users cannot earn money
                from the game.<br></br>
                <br></br>We consider this as an advantage of the game because if
                all users make a profit, the supply of BMT will increase and in
                the long run the price will decrease.<br></br><br></br> In summary, we can say
                that this game is enjoyable and profitable for active users
                without worrying about the price of BMT falling and reducing
                their income.
              </h5>
            </>
          )}
          {compIndex == 1 && (
            <>
              <h4>Tokenomics</h4>
              <h5>
                Since almost all play-to-earn applications face the problem of
                token supply disproportionate to demand, we have given great
                importance to this issue and have considered (anticipated)
                different Tokenemies.<br></br> In general, we can say that it is
                an application where all users can easily earn money.
                Undoubtedly, the supply of the unconventional token will have a
                problem with the demand, and the price of the token will always
                decrease.<br></br> <br></br>
                So we have designed the game in such a way that only active
                users can count on long-term income from the game.<br></br>
                In the following cases, we have mentioned demand or token
                burning:<br></br> <br></br>
                Building Construction<br></br>
                Building upgrade<br></br>
                Fast completion of build and upgrade<br></br>
                Transfer fee<br></br>
                Withdraw fee<br></br>
                Creating warriors<br></br>
                Wars damage <br></br>
                <br></br> <br></br>
                Another thing about the total value of the token market is that
                with the addition of each user, new buildings will be built and
                upgraded, for which commodity is consumed (tokens are burned),
                which means that the total market value is always increasing. It
                is also a kind of token burning as warriors are built and
                killed.
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

export default documentation;
