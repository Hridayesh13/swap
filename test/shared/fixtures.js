const { Wallet, Contract } = require('ethers')
const { deployContract } = require('ethereum-waffle')

const { expandTo18Decimals } = require('./utilities')

const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')

const ERC20 = require('../../artifacts/contracts/core/test/ERC20.sol/ERC20.json')
// const ERC20 = require('../../artifacts/contracts/core/Token1.sol/Token1.json')

const WETH9 = require('../../artifacts/contracts/periphery/test/WETH9.sol/WETH9.json')
// const UniswapV1Exchange = require('../../build/UniswapV1Exchange.json')
// const UniswapV1Factory = require('../../build/UniswapV1Factory.json')
// const UniswapV2Router01 = require('../../build/UniswapV2Router01.json')
// const UniswapV2Migrator = require('../../build/UniswapV2Migrator.json')
const UniswapV2Router02 = require('../../artifacts/contracts/periphery/UniswapV2Router02.sol/UniswapV2Router02.json')
// const RouterEventEmitter = require('../../build/RouterEventEmitter.json')
const UniswapV2Pair = require("../../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json")
const Factory = require("../../artifacts/contracts/core/UniswapV2Factory.sol/UniswapV2Factory.json")

const overrides = {
  gasLimit: 9999999
}

async function v2Fixture(provider, [wallet]) {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const WETH = await deployContract(wallet, WETH9)
  const WETHPartner = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])

  // deploy V1
  // const factoryV1 = await deployContract(wallet, UniswapV1Factory, [])
  // await factoryV1.initializeFactory((await deployContract(wallet, UniswapV1Exchange, [])).address)

  // deploy V2
  const factoryV2 = await deployContract(wallet, UniswapV2Factory, [wallet.address])

  // deploy routers
  // const router01 = await deployContract(wallet, UniswapV2Router01, [factoryV2.address, WETH.address], overrides)
  const router02 = await deployContract(wallet, UniswapV2Router02, [factoryV2.address, WETH.address], overrides)

  // // event emitter for testing
  // const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // // deploy migrator
  // const migrator = await deployContract(wallet, UniswapV2Migrator, [factoryV1.address, router01.address], overrides)

  // initialize V1
  // await factoryV1.createExchange(WETHPartner.address, overrides)
  // const WETHExchangeV1Address = await factoryV1.getExchange(WETHPartner.address)
  // const WETHExchangeV1 = new Contract(WETHExchangeV1Address, JSON.stringify(UniswapV1Exchange.abi), provider).connect(
  //   wallet
  // )

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IUniswapV2Pair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IUniswapV2Pair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    // factoryV1,
    factoryV2,
    // router01,
    router02,
    router: router02, // the default router, 01 had a minor bug
    // routerEventEmitter,
    // migrator,
    // WETHExchangeV1,
    pair,
    WETHPair
  }
}

async function factoryFixture(_, [wallet]) {
  const factory = await deployContract(wallet, Factory, [wallet.address], overrides)
  return { factory }
}

async function pairFixture(provider, [wallet]){
  const { factory } = await factoryFixture(provider, [wallet])

  const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)
  const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)

  await factory.createPair(tokenA.address, tokenB.address, overrides)
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(UniswapV2Pair.abi), provider).connect(wallet)

  const token0Address = (await pair.token0()).address
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  return { factory, token0, token1, pair }
}


module.exports = { v2Fixture, factoryFixture, pairFixture}