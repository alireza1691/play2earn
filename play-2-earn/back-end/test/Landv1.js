// const {
//     time,
//     loadFixture,
//     mine,
//     mineUpTo,
//   } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//   const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
//   const { expect, util } = require("chai");
//   const chaiAsPromised = require("chai-as-promised");
//   const chai = require("chai");
//   chai.use(chaiAsPromised);
  
//   const { ethers } = require("hardhat");
  
//   describe("Lands", function () {
//     // We define a fixture to reuse the same setup in every test.
//     // We use loadFixture to run this setup once, snapshot that state,
//     // and reset Hardhat Network to that snapshot in every test.
//     async function deployLandsContract() {
//       // Contracts are deployed using the first signer/account by default
//       const [owner, otherAccount] = await ethers.getSigners();
  
//       const ERC20 = await ethers.getContractFactory("ERC20Commodity");
//       const stone = await ERC20.deploy("stone", "ST");
//       const stAdd = await stone.getAddress();
//       const wood = await ERC20.deploy("wood", "WD");
//       const wdAdd = await wood.getAddress();
//       const iron = await ERC20.deploy("iron", "IR");
//       const irAdd = await iron.getAddress();
//       const gold = await ERC20.deploy("gold", "GD");
//       const gdAdd = await gold.getAddress();
//       const food = await ERC20.deploy("food", "FD");
//       const fdAdd = await food.getAddress();
  
//       const Lands = await ethers.getContractFactory("Lands");
//       console.log("Deploying lands...");
//       const lands = await Lands.deploy(stAdd, wdAdd, irAdd, gdAdd, fdAdd, {});
//       console.log("Lands deployed!");

//       const Town = await ethers.getContractFactory("Town");
//       const town = await Town.deploy(lands.getAddress())

//       const Army = await ethers.getContractFactory("Army")
//       const army = await Army.deploy(lands.getAddress())

//       console.log("Town and army deployed!");
//       console.log("Adding Town and army addess as authorized item in lands...");
//       await lands.addItem(town.getAddress());
//       await lands.addItem(army.getAddress());
//       console.log("Depositing in lands...");
//       await lands.testDeposit(100100);
//       await lands.connect(otherAccount).testDeposit(101101)
//       console.log("Deposited");
//       const bal = await lands.getAssetsBal(100100);
  
//       console.log(
//         "Deposited. Balances: wood ",
//         ethers.formatEther(bal[1]),
//         " iron ",
//         ethers.formatEther(bal[2]),
//         " food ",
//         ethers.formatEther(bal[4])
//       );
  
//       console.log("Minting a land...");
//       await lands.mintLand(100, 100,{value: ethers.parseEther("0.2")});
//       await lands.connect(otherAccount).mintLand(101, 101,{value: ethers.parseEther("0.2")});
//       console.log("Minted");

//       console.log("Building a Stone mine...");
//       await town.build(100100, 0);
//       console.log("Builded");
//       console.log("Getting token uri...");
//       const uri = await town.tokenURI(1);
//       console.log(uri);
  
  
//       const bal2 = await lands.getAssetsBal(100100);
//       console.log(
//         "Balances after build: wood ",
//         ethers.formatEther(bal2[1]),
//         " iron ",
//         ethers.formatEther(bal2[2]),
//         " food ",
//         ethers.formatEther(bal2[4])
//       );
  
//       console.log("Mining 10000 blocks in order to waiting for stone mine revenue...");
//       await mine(100000000, 1);

   

//       return {
//         lands,
//         owner,
//         otherAccount,
//         town,
//         wdAdd,
//         irAdd,
//         stAdd,
//         fdAdd,
//         gdAdd,
//         army
//       };
//     }
  
//     // async function simulteMint() {
//     //     const { mainC, caseC, admin } = await loadFixture(deployGeneratorAndCase);
//     // }
  
//     describe("Deployment", function () {
//       it("Should check if token id", async function () {
//         const { lands, owner } = await loadFixture(deployLandsContract);
//         const ownerOfMintedLand = await lands.ownerOf(100100);
//         expect(ownerOfMintedLand).to.equal(await owner.getAddress());
//       });
//       it("Should upgrade the building", async function () {
//         const { lands, town } = await loadFixture(deployLandsContract);
//         const uriBeforeUpgrade = await town.tokenURI(1);
//         const statusBeforeUpgrade = await town.getStatus(1)
//         await expect(town.upgrade(1, 100100)).to.be.revertedWith("Sorry, revenue should claim before action")
//         await town.claimRevenue(1)
//         await town.upgrade(1, 100100);
//         const statusAfterUpgrade = await town.getStatus(1)
//         const uriAfterUpgrade = await town.tokenURI(1);
//         expect(statusBeforeUpgrade.level).to.equal(1);
//         expect(statusAfterUpgrade.level).to.equal(2);
//         // expect(uriBeforeUpgrade == uriAfterUpgrade).to.equal(false);
//       });
//       it("Should claim revenue and check balances", async function () {
//         const { lands,town ,wdAdd} = await loadFixture(deployLandsContract);
//         const balBeforeClaiming = await lands.getAssetsBal(100100)
//         // console.log(ethers.formatEther(balBeforeClaiming));
//         // console.log("Currnet rev:");
//         // console.log(await buildings.getCurrentRevenue(1));
//         await town.claimRevenue(1)
//         const balAfterClaiming = await lands.getAssetsBal(100100)
//         console.log(ethers.formatEther(balAfterClaiming[0]));
//         expect(balBeforeClaiming[0] + ethers.parseEther("80")).to.equal(balAfterClaiming[0]);
//       });

//       it("Test barracks and attack", async function () {
//         const { army, otherAccount, lands} = await loadFixture(deployLandsContract);
//         // User should not build warrior if barracks level = 0
//         await expect(army.buildWarrior(100100, 0, 10)).to.be.revertedWith("Upgrade barracks needed")
//         // Building barracks for both accounts
//         await army.buildBarracks(100100)
//         await army.connect(otherAccount).buildBarracks(101101)
//         // Should revert if user tries to build warrior with type that requires higher barracks level.
//         await expect(army.buildWarrior(100100, 3, 10)).to.be.revertedWith("Type is not valid")
//         // Upgrading up to level 3
//         await army.buildBarracks(100100)
//         await army.buildBarracks(100100)

//         await army.buildWarrior(100100, 0, 10)
//         const armyBal = await army.getArmy(100100)
//         expect(armyBal[0]).to.be.equal(10)
//         // Building some warrior type 3 and some type 1 for account 2
//         await army.buildWarrior(100100, 1, 15)
//         await army.connect(otherAccount).buildWarrior(101101, 0, 10)
//         // If target is a land that has not been minted
//         await expect(army.attack([10,0,0],100100,102102)).to.be.revertedWith("ERC721: invalid token ID")
//         // If enter warrior amount bigger than number of warriors
//         await expect(army.attack([11,0,0],100100,101101)).to.be.revertedWith("Insufficient army")
//         const balanceOfAttackerBeforeWar = await lands.getAssetsBal(100100)
//         const balanceOfDefenderBeforeWar = await lands.getAssetsBal(101101)
//         await army.attack([0,15,0],100100,101101)
//         const balanceOfAttackerAfterWar = await lands.getAssetsBal(100100)
//         const balanceOfDefenderAfterWar = await lands.getAssetsBal(101101)
//         console.log("Balance of attacker before war:",balanceOfAttackerBeforeWar);
//         console.log("Balance of attacker after war:",balanceOfAttackerAfterWar);
//         expect(balanceOfAttackerBeforeWar[0] < balanceOfAttackerAfterWar[0] &&
//           balanceOfAttackerBeforeWar[2] < balanceOfAttackerAfterWar[2] &&
//           balanceOfDefenderBeforeWar[1] > balanceOfDefenderAfterWar[1] &&
//           balanceOfDefenderBeforeWar[3] > balanceOfDefenderAfterWar[3] 
//           ).to.be.equal(true)
//         const remainedArmyOfAtatcker = await army.getArmy(100100)
//         const remainedArmyOfDefender = await army.getArmy(101101)
//         expect(remainedArmyOfAtatcker[1]).to.be.below(15)
//         expect(remainedArmyOfDefender[0]).to.be.below(10)


//       });
      
  
  
//     });
  
//     describe("Mint ticket", function () {});
//   });
  