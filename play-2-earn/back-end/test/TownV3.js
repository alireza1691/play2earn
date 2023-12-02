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
  
      const ERC20 = await ethers.getContractFactory("BMT");
      const BMTToken = await ERC20.deploy();
      const landsInstance = await ethers.getContractFactory("LandsV2");
      console.log("Deploying lands...");
      const lands = await landsInstance.deploy({});
      console.log("Lands deployed!");
      const townInstance = await ethers.getContractFactory("TownV3");
      const town = await townInstance.deploy(BMTToken.getAddress(), lands.getAddress())
      console.log("Town and Land are deployed!");
   
      console.log("Minting a land...");
      await BMTToken.transfer(otherAccount, ethers.parseEther("500000"))
      await lands.mintLand(101,101, {value: ethers.parseEther("0.02")})
      await lands.connect(otherAccount).mintLand(109,109, {value: ethers.parseEther("0.02")})

      console.log("Minted");
      console.log("Depositing in lands...");
      await BMTToken.approve(town.getAddress(), ethers.parseEther("500000"))
      await town.deposit( ethers.parseEther("500000"));
      console.log("Deposited!");
      await town.buyGood(101101,0,ethers.parseEther("200000"))
      await town.buyGood(101101,1,ethers.parseEther("200000"))
      console.log("Bought food and gold!");
      await BMTToken.connect(otherAccount).approve(town.getAddress(), ethers.parseEther("500000"))
      await town.connect(otherAccount).deposit( ethers.parseEther("500000"));
      await town.connect(otherAccount).buyGood(109109,0,ethers.parseEther("200000"))
      await town.connect(otherAccount).buyGood(109109,1,ethers.parseEther("200000"))
      console.log("Bought food and gold for second account!");

      const bal = await town.getGoodsBal(101101);
  
      console.log(
        "Deposited. Balances: food ",
        ethers.formatEther(bal[0]),
        " gold ",
        ethers.formatEther(bal[1])
      );
  

    //   await lands.mintLand(100, 100,{value: ethers.parseEther("0.2")});
    //   await lands.connect(otherAccount).mintLand(101, 101,{value: ethers.parseEther("0.2")});


      console.log("Building a farm...");
      await town.build(101101, 0);
      console.log("Builded");
      const land101101data = await town.getLandIdData(101101);
      console.log(land101101data);
  
  
      const bal2 = await town.getGoodsBal(109109);
      console.log(
        "Balances after build: food ",
        ethers.formatEther(bal2[0]),
        " gold ",
        ethers.formatEther(bal2[1])
      );
  
      console.log("Mining 10000 blocks in order to waiting for stone mine revenue...");
      await mine(100000000, 1);

   

      return {
        lands,
        owner,
        otherAccount,
        town,
      };
    }
  
    // async function simulteMint() {
    //     const { mainC, caseC, admin } = await loadFixture(deployGeneratorAndCase);
    // }
  
    describe("Deployment", function () {
      it("Should check if token id exists", async function () {
        const { lands, owner } = await loadFixture(deployLandsContract);
        console.log("checking owner");
        const ownerOfMintedLand = await lands.ownerOf(101101);
        expect(ownerOfMintedLand).to.equal(await owner.getAddress());
      });
      it("Building other construction ignoring last build timestamp should revert. ", async function () {
        const { town} = await loadFixture(deployLandsContract);
         expect( town.build(101101, 1)).to.be.rejectedWith("WorkerIsBusy")
      });
      it("Should upgrade the building", async function () {
        const {  town } = await loadFixture(deployLandsContract);
        // const dataBeforeUpgrade = await town.getLandIdData(1);
        const statusBeforeUpgrade = await town.getStatus(1)
        await town.claimRevenue(1)
        await town.upgrade(1, 101101);
        const statusAfterUpgrade = await town.getStatus(1)
        expect(statusBeforeUpgrade.level).to.equal(1);
        expect(statusAfterUpgrade.level).to.equal(2);
      });
      it("Should claim revenue and check balances", async function () {
        const { town} = await loadFixture(deployLandsContract);
        const balBeforeClaiming = await town.getGoodsBal(101101)
        await town.claimRevenue(1)
        const balAfterClaiming = await town.getGoodsBal(101101)
        console.log(ethers.formatEther(balAfterClaiming[0]));
        expect(balBeforeClaiming[0] + ethers.parseEther("80")).to.equal(balAfterClaiming[0]);
      });
      it("After upgrade it should use some goods (balance should decrease).", async function () {
        const { town} = await loadFixture(deployLandsContract);
        const balBeforeClaiming = await town.getGoodsBal(101101)
        await town.upgrade(1, 101101);
        const balAfterClaiming = await town.getGoodsBal(101101)
        expect(balAfterClaiming[0]).to.below(balBeforeClaiming[0]);
      });
      it("In order to prevent cheating in the amount claiming revenue, it should claim revenue before upgrade automatically.", async function () {
        const { town} = await loadFixture(deployLandsContract);
        const balBeforeClaiming = await town.getGoodsBal(101101)
        await town.upgrade(1, 101101);
        const balAfterClaiming = await town.getGoodsBal(101101)
        expect(balBeforeClaiming[0]).to.below(balAfterClaiming[0]+ ethers.parseEther("250"));
      });

      it("Tests ability of upgrading barracks", async function () {
        const { town} = await loadFixture(deployLandsContract);
        const dataBeforeUpgrade = await town.getLandIdData(101101)
        await town.buildBarracks(101101)
        const dataAfterUpgrade = await town.getLandIdData(101101)
        expect(dataBeforeUpgrade.barracksLevel).to.below(dataAfterUpgrade.barracksLevel)

      })
      it("Should revert if user try to recruit warrior higher than barracks level", async function () {
        const { town} = await loadFixture(deployLandsContract);
        await expect(town.recruit(101101, 2, 10)).to.be.rejectedWith("BarracksLevelLowerThanWarrior")

      })
      it("Should revert if user try to recruit invalid warrior index", async function () {
        const { town} = await loadFixture(deployLandsContract);
        await expect(town.recruit(101101, 3, 10)).to.be.rejectedWith("InvalidItem")

      })
      it("Should create warrior if user try to recruit valid unlocked warrior ", async function () {
        const { town} = await loadFixture(deployLandsContract);
        const armyBeforeRecruit = await town.getArmyInfo(101101)
        await town.buildBarracks(101101)
        await town.recruit(101101, 0, 10)
        const armyAfterRecruit = await town.getArmyInfo(101101)

        expect(armyBeforeRecruit[3]).to.equal(0)
        expect(armyAfterRecruit[3]).to.equal(10)
        
      })

      it("Test barracks and attack", async function () {
        const { town, otherAccount, lands} = await loadFixture(deployLandsContract);
        // Building barracks for both accounts
        await town.buildBarracks(101101)
        // await town.buildBarracks(101101)
        // await town.buildBarracks(101101)
        await town.connect(otherAccount).buildBarracks(109109)
        console.log("Upgdaring level of barracks");

        // Upgrading up to level 3

        await town.recruit(101101, 0, 10)
        await town.recruit(101101, 1, 15)

        await town.connect(otherAccount).recruit(109109, 0, 10)
        console.log("recruited!");

  
        // If target is a land that has not been minted
        // await expect(town.attack([10,0,0],101101,102102)).to.be.rejectedWith(`ERC721NonexistentToken(${102102})`)
        await town.dispatchArmy([10,1,0],101101,109109)
        console.log("dispathced!");

        const dispatchedArmies = await town.getDispatchedArmies(101101)
        console.log(dispatchedArmies);
        const dispatchTime = await town.getRemainedDispatchTimestamp(101101,0)
        expect(dispatchTime).to.greaterThan(0)
        console.log("here is remained time:", dispatchTime);
        // If enter warrior amount bigger than number of warriors
        // await expect(town.attack([11,0,0],101101,109109)).to.be.revertedWith("Insufficient army")
        const balanceOfAttackerBeforeWar = await town.getGoodsBal(101101)
        const balanceOfDefenderBeforeWar = await town.getGoodsBal(109109)

        // const armyOfAttackerBeforeAttack = await town.getArmyInfo(101101)[3]
        const armyOfdefenderBeforeAttack = (await town.getArmyInfo(109109))[3]
        // console.log("Army of attacker before:", armyOfAttackerBeforeAttack);
        console.log("Army of defender before war:", armyOfdefenderBeforeAttack);

        // await town.attack([0,15,0],101101,109109)
        await town.war(101101,0)
        const dispatchedArmyAfterWar = await town.getDispatchedArmies(101101)
        console.log("Dispatch after war:",dispatchedArmyAfterWar );

        const balanceOfAttackerAfterWar = await town.getGoodsBal(101101)
        const balanceOfDefenderAfterWar = await town.getGoodsBal(109109)

        console.log("Balance of attacker before war:",balanceOfAttackerBeforeWar);
        console.log("Balance of attacker after war:",balanceOfAttackerAfterWar);
        console.log("Balance of defender before war:",balanceOfDefenderBeforeWar);
        console.log("Balance of defender after war:",balanceOfDefenderAfterWar);


        const armyOfAttackerAfterAttack = await town.getArmyInfo(101101)[3]
        const armyOfdefenderAfterAttack = await town.getArmyInfo(109109)[3]
        console.log("Army of attacker after:", armyOfAttackerAfterAttack);
        console.log("Army of defender after:", armyOfdefenderAfterAttack);


        expect(balanceOfAttackerBeforeWar[0] < balanceOfAttackerAfterWar[0] &&
          balanceOfAttackerBeforeWar[2] < balanceOfAttackerAfterWar[2] &&
          balanceOfDefenderBeforeWar[1] > balanceOfDefenderAfterWar[1] &&
          balanceOfDefenderBeforeWar[3] > balanceOfDefenderAfterWar[3] 
          ).to.be.equal(true)
        // const remainedArmyOfAtatcker = await town.getArmy(101101)
        // const remainedArmyOfDefender = await town.getArmy(109109)
        // expect(remainedArmyOfAtatcker[1]).to.be.below(15)
        // expect(remainedArmyOfDefender[0]).to.be.below(10)
      });
      
  
  
    });
  
  });
  