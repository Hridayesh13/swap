// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
/*

 _______ _________ _______  _______
(  ____ \\__   __/(  ___  )(  ____ )
| (    \/   ) (   | (   ) || (    )|
| (_____    | |   | |   | || (____)|
(_____  )   | |   | |   | ||  _____)
      ) |   | |   | |   | || (
/\____) |   | |   | (___) || )
\_______)   )_(   (_______)|/

This deploy script is no longer in use, but is left for reference purposes!

our project now uses hardhat-deploy to manage deployments, see the /deploy folder
And learn more here: https://www.npmjs.com/package/hardhat-deploy

*/
const hre = require("hardhat");
const { WETH } = require("@uniswap/sdk");

// const {
//     bigNumberify,
// } = require('ethers/utils')

function expandTo18Decimals(n) {
    return ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(18))
}

const TOTAL_SUPPLY = expandTo18Decimals(10000)

async function main() {
  
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log(
        "to network:",
        network.name
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    // const Token1 = await ethers.getContractFactory("Token1");
    // const token1 = await Token1.deploy();
    
    // const Token2 = await ethers.getContractFactory("Token2");
    // const token2 = await Token2.deploy();

    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(deployer.address);
    console.log("Factory at :", factory.address)
    // await factory.createPair(token1.address, token2.address);

    // console.log("Account balance after deploy:", (await deployer.getBalance()).toString());

    const Router = await ethers.getContractFactory('UniswapV2Router02');
    const WETH9 = await ethers.getContractFactory('WETH');
    const weth = await WETH9.deploy();
    console.log("WETH at :", weth.address)

    // let weth;
    // let wethAddress;
    const FACTORY_ADDRESS = factory.address;

    // if (chainId === "31337") {
    //     wethAddress = (await deployments.get("WETH9Mock")).address;
    // } else if (chainId in WETH) {
    //     wethAddress = WETH[chainId].address;
    // } else {
    //     throw Error("No WETH!");
    // }

    // if(_network === 'mainnet') {
    //     weth = await WETH9.at('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    // } else if (_network === 'ropsten') {
        // weth = await WETH9.at(WETH[3].address);
        // console.log("WETH at : ", WETH[3].address)
    // } else {
    //     weth = await WETH9.deploy();
    // }

    const r02 = await Router.deploy(FACTORY_ADDRESS, weth.address);
    console.log("Router at :", r02.address)
    console.log("Account balance after deploy:", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
