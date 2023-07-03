require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.17",
    paths: {
        artifacts: "./app/src/artifacts",
    },
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY],
        },
    },
};
