const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DocumentRegistryModule", (m) => {
  const registry = m.contract("DocumentRegistry");

  return { registry };
});
