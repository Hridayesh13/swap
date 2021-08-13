// const { ChainId, Token, WETH, Fetcher, 1 } = require('@uniswap/sdk')
// add "type": "module" in package.json for ES6 
// import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } from '@uniswap/sdk'

const USDC = new Token(
    ChainId.MAINNET,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6, 
    'USDC', 
    'USDC token'
)
const DAI = new Token(
    ChainId.MAINNET, 
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
    18,
    'DAI',
    'Dai Stablecoin'
)

// note that you may want/need to handle this async code differently,
// for example if top-level await is not an option

const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])

const route1 = new Route([pair], WETH[DAI.chainId])

const trade1 = new Trade(route1, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)

console.log("Direct execution price...")
console.log(trade1.executionPrice.toSignificant(6))
console.log(trade1.nextMidPrice.toSignificant(6))

const USDCWETHPair = await Fetcher.fetchPairData(USDC, WETH[ChainId.MAINNET])
const DAIUSDCPair = await Fetcher.fetchPairData(DAI, USDC)

const route2 = new Route([USDCWETHPair, DAIUSDCPair], WETH[ChainId.MAINNET])

const trade2 = new Trade(route2, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)

console.log("\nIndirect execution price...")
console.log(trade2.executionPrice.toSignificant(6))
console.log(trade2.nextMidPrice.toSignificant(6))

console.log(route2.midPrice.toSignificant(6)) // 202.081
console.log(route2.midPrice.invert().toSignificant(6)) // 0.00494851

const wethAddress = WETH[chainId].address;
console.log(wethAddress) // 202.081

/*
const slippageTolerance = new Percent('50', '10000');
const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
const path = [weth.address, dai.address];
const to = '';
const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
const value = trade.inputAmount.raw;

const provider = ethers.getDefaultProvider('mainnet', {
  infura: 'https://mainnet.infura.io/v3/ba14d1b3cfe5405088ee3c65ebd1d4db' 
});

const signer = new ethers.Wallet(PRIVATE_KEY);
const account = signer.connect(provider);
const uniswap = new ethers.Contract(
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
  account
);
const tx = await uniswap.sendExactETHForTokens(
  amountOutMin,
  path,
  to,
  deadline,
  { value, gasPrice: 20e9 }
);
console.log(`Transaction hash: ${tx.hash}`);

const receipt = await tx.wait();
console.log(`Transaction was mined in block ${receipt.blockNumber}`);
}

init();
*/