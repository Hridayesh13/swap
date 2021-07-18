const { expect, use } = require("chai")
const { ethers, Contract } = require("ethers")
const { deployContract, MockProvider, solidity } = require("ethereum-waffle")
const { MaxUint256 } = require('@ethersproject/constants')

const Token1 = require("../../artifacts/contracts/core/Token1.sol/Token1.json")

use(solidity)

function expandTo18Decimals(n) {
  return ethers.utils.bigNumberify(n).mul(ethers.utils.bigNumberify(10).pow(18))
}

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)
// const TOTAL_SUPPLY = 10000
// const TEST_AMOUNT = 10

// Start test block
describe('Token1 (Openzeppelin)', function () {
  let token;

  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  });

  beforeEach(async function () {
    [wallet, other, addr1, addr2] = provider.getWallets();
    token = await deployContract(wallet, Token1, [TOTAL_SUPPLY]);
  });

  describe('Uniswap tests', function () {
    it('name, symbol, decimals, totalSupply, balanceOf', async () => {
      const name = await token.name()
      expect(name).to.eq('Token 1')
      expect(await token.symbol()).to.eq('TK1')
      expect(await token.decimals()).to.eq(18)
      // expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
      // console.log(await token.totalSupply())
      expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
    })

    it('approve', async () => {
      await expect(token.approve(other.address, TEST_AMOUNT))
        .to.emit(token, 'Approval')
        .withArgs(wallet.address, other.address, TEST_AMOUNT)
      expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
    })

    it('transfer', async () => {
      await expect(token.transfer(other.address, TEST_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(wallet.address, other.address, TEST_AMOUNT)
      expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
      expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
    })

    it('transfer:fail', async () => {
      await expect(token.transfer(other.address, TOTAL_SUPPLY.add(1))).to.be.reverted // ds-math-sub-underflow
      await expect(token.connect(other).transfer(wallet.address, 1)).to.be.reverted // ds-math-sub-underflow
    })

    it('transferFrom', async () => {
      await token.approve(other.address, TEST_AMOUNT)
      await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(wallet.address, other.address, TEST_AMOUNT)
      expect(await token.allowance(wallet.address, other.address)).to.eq(0)
      expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
      expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
    })

    it('transferFrom:max', async () => {
      await token.approve(other.address, MaxUint256)
      // console.log((await token.allowance(wallet.address, other.address)).toString())
      await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(wallet.address, other.address, TEST_AMOUNT)
      // console.log((await token.allowance(wallet.address, other.address)).toString())
      console.log("Here allowance remains decreases, i.e. MaxUint256 - Test_amount")
      expect(await token.allowance(wallet.address, other.address)).to.eq(MaxUint256.sub(TEST_AMOUNT))
      expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
      expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
    })
  });

  describe('MyTests', function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(wallet.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(wallet.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        token.connect(addr1).transfer(wallet.address, 1)
      ).to.be.reverted;

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(wallet.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(wallet.address);

      // Transfer 100 tokens from owner to addr1.
      await token.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await token.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await token.balanceOf(wallet.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
  
});