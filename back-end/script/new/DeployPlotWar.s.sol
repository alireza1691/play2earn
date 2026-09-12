// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {Lands} from "../../src/new/LandsV3.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";
import {DeployConfig} from "./DeployConfig.sol";

/**
 * @notice Deploys the whole game, in dependency order, on any supported chain.
 *
 * Both game contracts sit behind UUPS proxies, and the pool has to be funded
 * before anyone can trade — hence the fixed order below.
 *
 * @dev **On `deployer` vs `address(this)`.** Everything here used to be owned by
 *      `address(this)` during setup. That works in a test, where the script
 *      contract really is the caller, but not under `--broadcast`: Foundry sends
 *      the calls as the EOA while `address(this)` stays the script contract, so
 *      `seedPool` reverted with OwnableUnauthorizedAccount and no deployment
 *      could complete. `deployer` is now passed in and must be whoever the
 *      internal calls will actually come from — the broadcaster in `run`, the
 *      script contract in tests.
 *
 * Usage
 *   Sepolia:
 *     forge script script/new/DeployPlotWar.s.sol:DeployPlotWar \
 *       --rpc-url sepolia --account <keystore> --broadcast --verify
 *
 *   Base mainnet (TREASURY is required there):
 *     TREASURY=0x... forge script script/new/DeployPlotWar.s.sol:DeployPlotWar \
 *       --rpc-url base --account <keystore> --broadcast --verify --slow
 *
 * Env
 *   TREASURY     final owner and holder of the unpooled supply.
 *                Optional on testnets (defaults to the deployer), REQUIRED on
 *                production chains.
 *   LAND_PRICE   overrides the per-network default, in wei.
 *   POOL_PLOT     overrides the per-network default.
 *   POOL_GOODS   overrides the per-network default.
 */
contract DeployPlotWar is Script {
    using DeployConfig for uint256;

    struct Deployment {
        PLOT plot;
        Lands lands;
        Town town;
        address landsImplementation;
        address townImplementation;
        address warModule;
    }

    error TreasuryRequiredOnProduction();
    error RefusingToSeedTestLandsOnProduction();

    function run() public returns (Deployment memory deployment) {
        DeployConfig.NetworkConfig memory config = DeployConfig.forChain(block.chainid);

        // Foundry sets run()'s msg.sender to the broadcaster, and pranks every
        // call made after startBroadcast as that same address. So it — not this
        // contract — is what owns things while the game is wired up.
        address deployer = msg.sender;
        address treasury = vm.envOr("TREASURY", address(0));

        if (config.isProduction && treasury == address(0)) {
            // Defaulting the treasury to a hot deploy key is fine on a testnet
            // and not fine on a chain holding real value.
            revert TreasuryRequiredOnProduction();
        }
        if (treasury == address(0)) treasury = deployer;

        config.landPrice = vm.envOr("LAND_PRICE", config.landPrice);
        config.poolPlot = vm.envOr("POOL_PLOT", config.poolPlot);
        config.poolGoods = vm.envOr("POOL_GOODS", config.poolGoods);

        console2.log("network           ", config.name);
        console2.log("chain id          ", block.chainid);
        console2.log("deployer          ", deployer);
        console2.log("treasury          ", treasury);

        vm.startBroadcast();
        deployment = deploy(deployer, treasury, config);
        vm.stopBroadcast();

        _report(deployment, config, treasury);
    }

    /**
     * @param deployer Effective sender of the calls this function makes. Holds
     *        the supply and owns both contracts until the handover at the end.
     * @param treasury Who ends up owning everything.
     * @dev Separate from `run` so tests drive the identical sequence without a
     *      broadcast context.
     */
    function deploy(
        address deployer,
        address treasury,
        DeployConfig.NetworkConfig memory config
    ) public returns (Deployment memory deployment) {
        if (config.isProduction && config.seedTestLands) {
            revert RefusingToSeedTestLandsOnProduction();
        }

        // 1. Token. The whole supply is minted once, to the deployer, and never
        //    again.
        PLOT plot = new PLOT(deployer);

        // 2. Lands, behind its proxy. The implementation stays uninitialised.
        Lands landsImplementation = new Lands();
        Lands lands = Lands(payable(address(new LandsProxy(
            address(landsImplementation),
            abi.encodeCall(Lands.initialize, (config.landPrice, deployer))
        ))));

        // 3. Town, behind its proxy.
        // War lives in its own contract: Town plus war is over the 24576-byte
        // limit, so Town delegatecalls into this one. See Town.setWarModule.
        TownWar warModule = new TownWar();
        Town townImplementation = new Town();
        Town town = Town(address(new LandsProxy(
            address(townImplementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), config.seedTestLands, deployer)
            )
        )));

        // 4. Point the war entry points at their implementation. Until this
        //    runs, dispatchArmy and friends revert with WarModuleNotSet.
        town.setWarModule(address(warModule));

        // 5. Fund both pools. Until this runs, buying and selling goods revert.
        //    seedPool is onlyOwner, which is why the handover comes after it.
        uint256[2] memory plotSide = [config.poolPlot, config.poolPlot];
        uint256[2] memory goodsSide = [config.poolGoods, config.poolGoods];
        plot.approve(address(town), config.poolPlot * 2);
        town.seedPool(plotSide, goodsSide);

        // 6. Hand everything over. The deploy key keeps no authority and no
        //    supply — it can be a throwaway.
        town.transferOwnership(treasury);
        lands.transferOwnership(treasury);
        if (treasury != deployer) {
            plot.transfer(treasury, plot.balanceOf(deployer));
        }

        deployment = Deployment({
            plot: plot,
            lands: lands,
            town: town,
            landsImplementation: address(landsImplementation),
            townImplementation: address(townImplementation),
            warModule: address(warModule)
        });
    }

    /// @dev The frontend needs the *proxy* addresses; printing the
    ///      implementations alongside them is only for block explorers.
    function _report(
        Deployment memory deployment,
        DeployConfig.NetworkConfig memory config,
        address treasury
    ) internal {
        console2.log("");
        console2.log("--- addresses for lib/blockchainData.ts ---");
        console2.log("token   (PLOT)     ", address(deployment.plot));
        console2.log("lands   (proxy)   ", address(deployment.lands));
        console2.log("town    (proxy)   ", address(deployment.town));
        console2.log("");
        console2.log("--- implementations, for verification only ---");
        console2.log("lands impl        ", deployment.landsImplementation);
        console2.log("town impl         ", deployment.townImplementation);
        console2.log("war module        ", deployment.warModule);
        console2.log("");
        console2.log("seeded test lands ", config.seedTestLands);

        string memory json = "deployment";
        vm.serializeUint(json, "chainId", block.chainid);
        vm.serializeAddress(json, "token", address(deployment.plot));
        vm.serializeAddress(json, "lands", address(deployment.lands));
        vm.serializeAddress(json, "town", address(deployment.town));
        vm.serializeAddress(json, "landsImplementation", deployment.landsImplementation);
        vm.serializeAddress(json, "townImplementation", deployment.townImplementation);
        vm.serializeAddress(json, "warModule", deployment.warModule);
        string memory out = vm.serializeAddress(json, "treasury", treasury);

        string memory path = string.concat("deployments/", config.name, ".json");
        vm.writeJson(out, path);
        console2.log("written to        ", path);
    }
}
