const hre = require("hardhat");

async function main() {
  // Set the initial balance as needed
  const initBalance = 1;

  // Get the Assessment contract factory
  const Assessment = await hre.ethers.getContractFactory("Assessment");

  // Deploy the Assessment contract with the initial balance
  const assessment = await Assessment.deploy(initBalance);
  await assessment.deployed();

  // Display information about the deployed contract
  console.log(`Assessment contract deployed to: ${assessment.address}`);
  console.log(`Initial balance of the contract: ${initBalance} eth`);
}

// Run the deployment script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
