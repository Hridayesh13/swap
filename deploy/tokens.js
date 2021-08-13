const {
    bigNumberify,
} = require('ethers/utils')

function expandTo18Decimals(n) {
    return bigNumberify(n).mul(bigNumberify(10).pow(18))
}

// const { ethers } = require("hardhat");

// function expandTo18Decimals(n) {
//     return ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(18))
// }

const TOTAL_SUPPLY = expandTo18Decimals(10000000)

// deploy/00_deploy_token1.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('Token1', {
      from: deployer,
      args: [TOTAL_SUPPLY],
      log: true,
    });
    await deploy('Token2', {
      from: deployer,
      args: [TOTAL_SUPPLY],
      log: true,
    });
    await deploy('Token3', {
      from: deployer,
      args: [TOTAL_SUPPLY],
      log: true,
    });
    // await deploy('ERC20', {
    //     from: deployer,
    //     args: [TOTAL_SUPPLY],
    //     log: true,
    //   });
  };
  module.exports.tags = [
      'tokens'
    // , 'ERC20'
];