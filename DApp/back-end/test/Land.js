
const {
    time,
    loadFixture,
    mine,
    mineUpTo,
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
      const ERC20 = await ethers.getContractFactory("ERC20Goods");
      const stone = await ERC20.deploy("stone","ST")
      const stAdd = await stone.getAddress()
      const wood = await ERC20.deploy("wood","WD")
      const wdAdd = await wood.getAddress()
      const iron = await ERC20.deploy("iron","IR")
      const irAdd = await iron.getAddress()
      const gold = await ERC20.deploy("gold","GD")
      const gdAdd = await gold.getAddress()
      const food = await ERC20.deploy("food","FD")
      const fdAdd = await food.getAddress()
  
      const Lands = await ethers.getContractFactory("Lands");
      console.log("Deploying lands...");
      const lands = await Lands.deploy(stAdd,wdAdd,irAdd,gdAdd,fdAdd,{ });
      console.log("Deployed! minting a land...");
      await lands.mintLand(100,100)
      console.log("Minted");
      const Building = await ethers.getContractFactory("Building");
      console.log("Deploying building...");
      const building = await Building.deploy( lands.getAddress(),stAdd,wdAdd,irAdd,gdAdd,fdAdd,{})
      await lands.addItem(building.getAddress())
      await lands.deposit(100100)
      console.log("Deployed! minting a Stone mine...");
      await building.build(100100)
      console.log("Builded");
      const uri = await building.tokenURI(1)
      console.log(uri);
      // await mine(10000,1)
      
      const upgrade = await building.upgrade(1)
      // const i = await building.test_()
      // console.log(i);
      const uriAfterUpgrade = await building.tokenURI(1)
      console.log(uriAfterUpgrade);

      await mineUpTo(1000)
  
 

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
        const ownerOfMintedLand = await lands.ownerOf(100100);
        expect(ownerOfMintedLand).to.equal(await owner.getAddress());
      });
    });

    describe("Mint ticket", function () {
        
  
      });

  
  
  });
  