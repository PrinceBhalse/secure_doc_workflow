import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  // Direct connection without the fancy "handshake" that is crashing
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Manually define the signer using the FIRST private key from your node output
  // (The one starting with 0xac09...)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("🚀 Deploying with Wallet:", wallet.address);

  const artifact = await hre.artifacts.readArtifact("DocumentRegistry");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const registry = await factory.deploy();
  await registry.waitForDeployment();

  console.log("✅ SUCCESS! Address:", await registry.getAddress());
}

main().catch((error) => {
  console.error("❌ Failed:", error);
});