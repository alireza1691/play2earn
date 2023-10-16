 const {network, ethers} = require("hardhat")
 const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
 const { verify } = require("../utils/verify")
 module.exports = async ({}) => {
    console.log("Deploying....");
    const { deploy, log } = deployments
    const { deployer } = await ethers.getSigners()
    console.log(deployer);
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    const token = await deploy("BKT", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log("Token deployed");
    const lands = await deploy("LandsV2", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log("Lands deployed");
    let args = [token.address, lands.address]
    const town = await deploy("TownV2", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log("Town deployed");
    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("Verifying...")
    //     await verify(token.address, [])
    //     await verify(lands.address, [])
    //     await verify(town.address, args)
    // }
    // log("----------------------------------------------------")
 }
 module.exports.tags = ["all", "token", "lands", "town"]