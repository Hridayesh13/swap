// deploy/00_deploy_token1.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('Token1', {
      from: deployer,
      args: ["100000000"],
      log: true,
    });
  };
  module.exports.tags = ['Token1'];