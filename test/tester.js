const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const { impersonateFundErc20 } = require("../utils/utilities");

const {
  abi,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

const provider = waffle.provider;

describe("FlashSwap Contract", () => {
  let FLASHSWAP, BORROW_AMOUNT, FUND_AMOUNT, initialFundingHuman, txArbitrage;

  const DECIMALS = 6;

  const USDC_WHALE = "0x72a53cdbbcc1b9efa39c834a540550e23463aacb";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

  const BASE_TOKEN_ADDRESS = USDC;

  const tokenBase = new ethers.Contract(BASE_TOKEN_ADDRESS, abi, provider);

  beforeEach(async () => {
    // Get owner as a signer
    [owner] = await ethers.getSigners();

    //Ensure that the Whale has a balance of at least 1 ETH
    const whale_balance = await provider.getBalance(USDC_WHALE);
    console.log(ethers.utils.formatUnits(whale_balance.toString(), DECIMALS));
    expect(whale_balance).not.equal("0");

    // Deploy smart contract
    const FlashSwap = await ethers.getContractFactory("UniswapCrossFlash");
    FLASHSWAP = await FlashSwap.deploy();
    await FLASHSWAP.deployed();

    //Configure our Borrowing
    const borrowAmountHuman = "1";
    BORROW_AMOUNT = ethers.utils.parseUnits(borrowAmountHuman, DECIMALS);

    // Configure our Funding - FOR TESTING ONLY
    initialFundingHuman = "100";
    FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS);

    // Fund our Contract - FOR TESTING ONLY
    await impersonateFundErc20(
      tokenBase,
      USDC_WHALE,
      FLASHSWAP.address,
      initialFundingHuman,
      DECIMALS
    );
  });

  describe("Arbitrage Execution", () => {
    it("ensures the contract is funded", async () => {
      const flashSwapBalance = await FLASHSWAP.getBalanceOfToken(
        BASE_TOKEN_ADDRESS
      );
      const flashSwapBalanceHuman = ethers.utils.formatUnits(
        flashSwapBalance,
        DECIMALS
      );

      expect(Number(flashSwapBalanceHuman)).equal(Number(initialFundingHuman));
    });

    it("execute an arbitrage", async () => {
      txArbitrage = await FLASHSWAP.startArbitrage(
        BASE_TOKEN_ADDRESS,
        BORROW_AMOUNT
      );

      assert(txArbitrage);

      const contractBalanceUSDC = await FLASHSWAP.getBalanceOfToken(USDC);
      const formattedBalanceUSDC = Number(
        ethers.utils.formatUnits(contractBalanceUSDC, DECIMALS)
      );
      console.log("Balance of USDC: " + formattedBalanceUSDC);

      const contractBalanceLINK = await FLASHSWAP.getBalanceOfToken(LINK);
      const formattedBalanceLINK = Number(
        ethers.utils.formatUnits(contractBalanceLINK, DECIMALS)
      );
      console.log("Balance of LINK: " + formattedBalanceLINK);
    });

    it("provides GAS output", async () => {
      const txReciept = await provider.getTransactionReceipt(txArbitrage.hash);
      const effectiveGasPrice = txReciept.effectiveGasPrice;
      const txGasUsed = txReciept.gasUsed;
      const gasUsedETH = effectiveGasPrice * txGasUsed;
      console.log(
        "Total gas USD: " +
          ethers.utils.formatUnits(gasUsedETH.toString()) * 2900
      );
      expect(gasUsedETH).not.equal("0");
    });
  });
});
