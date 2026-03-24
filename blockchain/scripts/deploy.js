import hre from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...");

  // In Hardhat 3, we wait for the HRE to be fully ready
  const Registry = await hre.ethers.getContractFactory("DocumentRegistry");
  
  console.log("Deploying contract...");
  const registry = await Registry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\n**********************************************");
  console.log(`✅ SUCCESS: DocumentRegistry live at: ${address}`);
  console.log("**********************************************\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});