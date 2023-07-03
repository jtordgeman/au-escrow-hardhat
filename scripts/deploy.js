const contractName = "Escrow";

async function main() {
    const Escrow = await hre.ethers.getContractFactory(contractName);
    const escrow = await Escrow.deploy();
    console.log(`${contractName} deployed to address: ${escrow.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
