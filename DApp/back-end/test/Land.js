
const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect, util } = require("chai");
  const chaiAsPromised = require('chai-as-promised');
  const chai = require("chai");
  chai.use(chaiAsPromised);

const { ethers } = require("hardhat");
  
  describe("Lands", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployLandsContract() {

      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
    //   const contractFactory = await this.env.ethers.getContractFactory("Lands", {
    //     libraries: {
    //       ExampleLib: "0x...",
    //     },
    //   });
  
      const Lands = await ethers.getContractFactory("Lands");
      const lands = await Lands.deploy( { });
      await lands.mintLand(10,10)

      return { lands , owner, otherAccount};
    }
    // async function simulteMint() {
    //     const { mainC, caseC, admin } = await loadFixture(deployGeneratorAndCase);

    //     const accounts = await ethers.getSigners();
    //     for (let index = 0; index < 5; index++) {
    //         const inst = await mainC.connect(accounts[index])
    //         await inst.deposit({value: ethers.parseEther("10")})
    //         await (await caseC.connect(accounts[index])).mintTicket(ethers.parseEther("0.1"),0)
    //     }
    //     for (let index = 5; index < 10; index++) {
    //         const inst = mainC.connect(accounts[index])
    //         await inst.deposit({value: ethers.parseEther("10")})
    //         await (await caseC.connect(accounts[index])).mintTicket(ethers.parseEther("0.12"),1)
    //     }
    //     for (let index = 10; index < 15; index++) {
    //         const inst = mainC.connect(accounts[index])
    //         await inst.deposit({value: ethers.parseEther("10")})
    //         await (await caseC.connect(accounts[index])).mintTicket(ethers.parseEther("0.15"),2)
    //     }
    //     await admin.pause(caseC.getAddress())
    //     await admin.attachAnswerOfCase(caseC.getAddress(),1)
    // }

  
    describe("Deployment", function () {
      it("Should check if token id", async function () {
        const { lands, owner } = await loadFixture(deployLandsContract);
        const ownerOfMintedLand = await lands.ownerOf(1010);
        expect(ownerOfMintedLand).to.equal(owner.getAddress());
      });
    });

    describe("Mint ticket", function () {
        
  
      });

  
  
  });
  