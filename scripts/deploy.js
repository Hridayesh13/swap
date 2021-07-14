// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");


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

    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(deployer.address);
    
    const Token1 = await ethers.getContractFactory("Token1");
    const token1 = await Token1.deploy();
    
    const Token2 = await ethers.getContractFactory("Token2");
    const token2 = await Token2.deploy();
    
    await factory.createPair(token1.address, token2.address);

    console.log("Account balance after deploy:", (await deployer.getBalance()).toString());

    const Router = await ethers.getContractFactory('UniswapV2Router02');
    const WETH = await ethers.getContractFactory('WETH');

    let weth;
    const FACTORY_ADDRESS = factory.address;

    // if(_network === 'mainnet') {
    //     weth = await WETH.at('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    // } else {
        weth = await WETH.deploy();
    // }

    const r02 = await Router.deploy(FACTORY_ADDRESS, weth.address);
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
