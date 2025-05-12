require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337
    },
    torusTestnet: {
      url: "https://rpc.testnet.toruschain.com/",
      chainId: 8194,
      accounts: ["33569103dbbb728cd93750d37ea1410d4c319c31d310617c859d55cfd6f363b0"]
    }
  }
};
