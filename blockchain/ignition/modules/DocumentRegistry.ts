import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DocumentRegistryModule", (m) => {
  // This looks for "DocumentRegistry.sol"
  const registry = m.contract("DocumentRegistry");

  return { registry };
});