import React, { useState, useEffect } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { Navbar as MyNav } from 'react-bootstrap';
import { useRouter } from "next/router";
import NavDropdown from 'react-bootstrap/NavDropdown';


const Navbar = (
    // { admin, address, main }
    ) => {
  const [balance, setBalance] = useState();
  const [owner, setOwner] = useState();
  const router = useRouter();

//   useEffect(() => {
//     const fetchOnchainData = async () => {
//       try {
//         if (
//           address !== undefined &&
//           admin !== undefined &&
//           main !== undefined
//         ) {
//           const adminOwner = await admin.owner();
//           setOwner(adminOwner);
//           const balanceOfAccount = await main.balance(address);
//           setBalance(Number(balanceOfAccount));
//           console.log(Number(balanceOfAccount));
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchOnchainData();
//   }, [admin, address, main]);

  return (
      <MyNav expand="lg" data-bs-theme="dark" bg="transparent" style={{
        // "boxShadow":"0px 5px 10px #36143f",
        // "borderBottom":"0.15rem solid #36143f"
        }}>
      <Container fluid>
        <MyNav.Brand href="#" onClick={()=>{router.push('/')}}>Blockchain wars</MyNav.Brand>
        <MyNav.Toggle aria-controls="navbarScroll" />
        <MyNav.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
             {/* style={{"backgroundColor":"rgba(244, 105, 227, 0.3)","borderRadius":"0.5rem","color":"white"}}  */}
             <Nav.Link href="#action1" onClick={()=>{router.push('/bet')}}>Home</Nav.Link>
            <Nav.Link href="#action1" onClick={()=>{router.push('/bet')}}>Explore</Nav.Link>
            {/* <Nav.Link href="#action2" onClick={()=>{router.push('/dashboard')}}>Dashboard</Nav.Link>
            <NavDropdown title="More" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">...</NavDropdown.Item>
              <NavDropdown.Item href="#action4" onClick={()=>{router.push('/about')}}>
                About
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5" onClick={()=>{router.push('/terms')}}>
                Terms of use
              </NavDropdown.Item>
              <NavDropdown.Item href="#action5" onClick={()=>{router.push('/privacy_docs')}}>
                Privacy policy
              </NavDropdown.Item>
              <NavDropdown.Item href="#action5" onClick={()=>{router.push('/Contact')}}>
                Contact us
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#" onClick={()=>{router.push('/token')}}>
              Token
            </Nav.Link>  */}
          </Nav>
          <ConnectWallet
              auth={{ loginOptional: false }}
              theme="dark"
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
        </MyNav.Collapse>
      </Container>
    </MyNav>
  );
};

export default Navbar;
