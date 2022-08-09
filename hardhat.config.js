require('@nomiclabs/hardhat-waffle');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.5" },
      { version: "0.6.6" },
      { version: "0.8.8" },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: "RINKEBY MAINNET URL on ALCHEMY",
      },
    },
    testnet: {
      url: "RINKEBY TESTNET URL on ALCHEMY",
      chainId: 4,
      accounts: ["REPLACE WITH YOUR PRIVATE KEY"],
    },
    mainnet: {
      url: "RINKEBY MAINNET URL on ALCHEMY",
      chainId: 56,
      accounts:["REPLACE WITH YOUR PRIVATE KEY"],
    },
  },
};
