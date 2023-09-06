const {
    time,
    loadFixture,
    mine,
    mineUpTo,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect, util } = require("chai");
  const chaiAsPromised = require("chai-as-promised");
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
  
      const ERC20 = await ethers.getContractFactory("Commodity");
      const stone = await ERC20.deploy("stone", "ST");
      const stAdd = await stone.getAddress();
      const wood = await ERC20.deploy("wood", "WD");
      const wdAdd = await wood.getAddress();
      const iron = await ERC20.deploy("iron", "IR");
      const irAdd = await iron.getAddress();
      const gold = await ERC20.deploy("gold", "GD");
      const gdAdd = await gold.getAddress();
      const food = await ERC20.deploy("food", "FD");
      const fdAdd = await food.getAddress();
  
      const Lands = await ethers.getContractFactory("LandsV1");
      console.log("Deploying lands...");
      const lands = await Lands.deploy(stAdd, wdAdd, irAdd, gdAdd, fdAdd, {});
      console.log("Lands deployed!");
      console.log("Attaching lands address into commodities...");
      console.log("Attached!");
      const Buildings = await ethers.getContractFactory("Building");
    //   await lands.deployItem("Stone Mine","STM",[0,ethers.parseEther("200"),ethers.parseEther("150"),0,ethers.parseEther("20")])
    //   console.log("Deploying building...");
    //   const buildingAddress = lands.getItems()
      const buildings = await Buildings.deploy(lands.getAddress())
    //   const stoneMine = await StoneMine.deploy(
    //     lands.getAddress(),
    //     stAdd,
    //     wdAdd,
    //     irAdd,
    //     gdAdd,
    //     fdAdd,
    //     {}
    //   );
      console.log("Building (stone mine) deployed!");
      console.log("Adding Building addess ass authorized item in lands...");
      await lands.addItem(buildings.getAddress());
      console.log("Depositing in lands...");
      await lands.testDeposit(100100);
      const woodbal1 = await lands.getAssetBal(100100, 1);
      const ironbal1 = await lands.getAssetBal(100100, 2);
      const foodbal1 = await lands.getAssetBal(100100, 4);
  
      console.log(
        "Deposited. Balances: wood ",
        ethers.formatEther(woodbal1),
        " iron ",
        ethers.formatEther(ironbal1),
        " food ",
        ethers.formatEther(foodbal1)
      );
  
      console.log("Minting a land...");
      await lands.mintLand(100, 100);
      console.log("Minted");
      console.log("Add stone mine to buildings as admin");
      await buildings.addNewBuilding([
        0,
        ethers.parseEther("200"),
        ethers.parseEther("150"),
        0,
        ethers.parseEther("25"),
        ethers.parseEther("8"),
        ethers.parseEther("80")
      ],
      "Url",
      "Stone mine"
      )
      console.log("Building a Stone mine...");
      await buildings.build(100100, 0);
      console.log("Builded");
      console.log("Getting token uri...");
      const uri = await buildings.tokenURI(1);
      console.log(uri);
  
  
      const woodbal2 = await lands.getAssetBal(100100, 1);
      const ironbal2 = await lands.getAssetBal(100100, 2);
      const foodbal2 = await lands.getAssetBal(100100, 4);
  
      console.log(
        "Balances after build: wood ",
        ethers.formatEther(woodbal2),
        " iron ",
        ethers.formatEther(ironbal2),
        " food ",
        ethers.formatEther(foodbal2)
      );
  
      console.log("Mining 10000 blocks in order to waiting for stone mine revenue...");
      await mine(100000000, 1);
   
    //   const Army = await ethers.getContractFactory("Army");
    //   const army = await Army.deploy();
    //   console.log( await army.test());
  
      // console.log(await army.calculate([1,2,3],[11,10,10],[1,2,3],[8,11,8],));
  
      return {
        lands,
        owner,
        otherAccount,
        buildings,
        wdAdd,
        irAdd,
        stAdd,
        fdAdd,
        gdAdd,
      };
    }
  
    // async function simulteMint() {
    //     const { mainC, caseC, admin } = await loadFixture(deployGeneratorAndCase);
    // }
  
    describe("Deployment", function () {
      it("Should check if token id", async function () {
        const { lands, owner } = await loadFixture(deployLandsContract);
        const ownerOfMintedLand = await lands.ownerOf(100100);
        expect(ownerOfMintedLand).to.equal(await owner.getAddress());
      });
      it("Should upgrade the building", async function () {
        const { lands, buildings } = await loadFixture(deployLandsContract);
        const uriBeforeUpgrade = await buildings.tokenURI(1);
        const statusBeforeUpgrade = await buildings.getStatus(1)
        await expect(buildings.upgrade(1, 100100)).to.be.revertedWith("Sorry, revenue should claim before action")
        await buildings.claimRevenue(1)
        await buildings.upgrade(1, 100100);
        const statusAfterUpgrade = await buildings.getStatus(1)
        const uriAfterUpgrade = await buildings.tokenURI(1);
        expect(statusBeforeUpgrade.level).to.equal(1);
        expect(statusAfterUpgrade.level).to.equal(2);
        expect(uriBeforeUpgrade == uriAfterUpgrade).to.equal(false);
      });
      it("Should claim revenue and check balances", async function () {
        const { lands,buildings ,wdAdd} = await loadFixture(deployLandsContract);
        const balBeforeClaiming = await lands.getAssetBal(100100,0)
        // console.log(ethers.formatEther(balBeforeClaiming));
        // console.log("Currnet rev:");
        // console.log(await buildings.getCurrentRevenue(1));
        await buildings.claimRevenue(1)
        const balAfterClaiming = await lands.getAssetBal(100100,0)
        console.log(ethers.formatEther(balAfterClaiming));
        expect(balBeforeClaiming + ethers.parseEther("80")).to.equal(balAfterClaiming);
      });
  
  
    });
  
    describe("Mint ticket", function () {});
  });
  