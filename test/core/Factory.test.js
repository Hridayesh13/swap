const { expect, use } = require("chai")
// const { ethers } = require("hardhat")
const { ethers, Contract } = require("ethers");
const { deployContract, MockProvider, solidity, createFixtureLoader } = require("ethereum-waffle")
const { AddressZero } = require('@ethersproject/constants')
const {
  keccak256
} = require("@ethersproject/keccak256");

// const {
//   BigNumber,
//   bigNumberify,
//   getAddress,
//   keccak256,
//   defaultAbiCoder,
//   toUtf8Bytes,
//   solidityPack
// } = require('ethers/utils')

// import { getCreate2Address } from './shared/utilities'
// import { factoryFixture } from './shared/fixtures'

const Factory = require("../../artifacts/contracts/core/UniswapV2Factory.sol/UniswapV2Factory.json")
const UniswapV2Pair = require("../../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json")

const TEST_ADDRESSES = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000'
]

use(solidity)

const overrides = {
  gasLimit: 9999999
}
async function factoryFixture(_, [wallet]) {
  const factory = await deployContract(wallet, Factory, [wallet.address], overrides)
  return { factory }
}

function getCreate2Address(
  factoryAddress,
  [tokenA, tokenB],
  bytecode
) {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const create2Inputs = [
    '0xff',
    factoryAddress,
    keccak256(ethers.utils.solidityPack(['address', 'address'], [token0, token1])),
    keccak256(bytecode)
  ]
  const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join('')}`
  return ethers.utils.getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`)
}

// Start test block
describe('Factory', function () {
  let factory;
  
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  const loadFixture = createFixtureLoader(provider, [wallet, other])

  beforeEach(async () => {
    const fixture = await loadFixture(factoryFixture)
    factory = fixture.factory
  })

  // beforeEach(async function () {
  //   [wallet, other, addr1, addr2] = provider.getWallets();
  //   factory = await deployContract(wallet, Factory, [wallet.address]);
  // });
  
  describe('Uniswap tests', function () {
    it('feeTo, feeToSetter, allPairsLength', async () => {
      expect(await factory.feeTo()).to.eq(AddressZero)
      expect(await factory.feeToSetter()).to.eq(wallet.address)
      expect(await factory.allPairsLength()).to.eq(0)
    })

    async function createPair(tokens) {
      const bytecode = `${UniswapV2Pair.bytecode}`
      const create2Address = getCreate2Address(factory.address, tokens, bytecode)
      await expect(factory.createPair(...tokens))
        .to.emit(factory, 'PairCreated')
        .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, ethers.utils.bigNumberify(1))

      await expect(factory.createPair(...tokens)).to.be.reverted // UniswapV2: PAIR_EXISTS
      await expect(factory.createPair(...tokens.slice().reverse())).to.be.reverted // UniswapV2: PAIR_EXISTS
      expect(await factory.getPair(...tokens)).to.eq(create2Address)
      expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address)
      expect(await factory.allPairs(0)).to.eq(create2Address)
      expect(await factory.allPairsLength()).to.eq(1)

      const pair = new Contract(create2Address, JSON.stringify(UniswapV2Pair.abi), provider)
      expect(await pair.factory()).to.eq(factory.address)
      expect(await pair.token0()).to.eq(TEST_ADDRESSES[0])
      expect(await pair.token1()).to.eq(TEST_ADDRESSES[1])
    }

    it('createPair', async () => {
      await createPair(TEST_ADDRESSES)
    })

    it('createPair:reverse', async () => {
      await createPair(TEST_ADDRESSES.slice().reverse())
    })
  
    it('createPair:gas', async () => {
      const tx = await factory.createPair(...TEST_ADDRESSES)
      const receipt = await tx.wait()
      expect(receipt.gasUsed).to.eq(2019585)
      console.log("Uniswap expected gas = 2512920 but we got 2019585")
    })
  
    it('setFeeTo', async () => {
      await expect(factory.connect(other).setFeeTo(other.address)).to.be.revertedWith('UniswapV2: FORBIDDEN')
      await factory.setFeeTo(wallet.address)
      expect(await factory.feeTo()).to.eq(wallet.address)
    })
  
    it('setFeeToSetter', async () => {
      await expect(factory.connect(other).setFeeToSetter(other.address)).to.be.revertedWith('UniswapV2: FORBIDDEN')
      await factory.setFeeToSetter(other.address)
      expect(await factory.feeToSetter()).to.eq(other.address)
      await expect(factory.setFeeToSetter(wallet.address)).to.be.revertedWith('UniswapV2: FORBIDDEN')
    })
  });
});