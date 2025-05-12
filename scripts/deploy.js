const hre = require("hardhat");

async function main() {
  console.log("Deploying NoteVerification contract...");

  const NoteVerification = await hre.ethers.getContractFactory("NoteVerification");
  const noteVerification = await NoteVerification.deploy();

  await noteVerification.deployed();

  console.log("NoteVerification deployed to:", noteVerification.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 