# Secure Document Workflow
 
## Project Overview

Secure Document Workflow is a decentralized application (dApp) designed to facilitate a transparent, unforgeable, and role-based environment for document management and signing. By leveraging Ethereum smart contracts and decentralized storage mechanisms, it ensures that critical legal and business documents are immutable, easily auditable, and securely retained. 

This platform redefines the notary and intermediary processes. Instead of relying on vulnerable paper trails or centralized databases that can be tampered with, the system securely hosts encrypted documents on an IPFS-backed network. All signing interactions are transparently recorded on-chain, proving the chronological timeline of execution for a Buyer, Seller, and an Intermediary (e.g., a Law Firm).

## Key Features

- **Multi-Signature Logic**: Cryptographically enforces sequential, multi-party authorization (Seller -> Buyer -> Law Firm), preventing out-of-order execution and ensuring compliance.
- **Decentralized Storage (IPFS)**: Integrates directly with Pinata IPFS. Original files are pinned and distributed across nodes, avoiding single points of failure.
- **Role-Based Notary Dashboard**: Provides distinct views, indicators, and actions dynamically based on the connected Ethereum wallet's role in a specific document.
- **Real-Time Validations**: React-based dashboard reflecting live smart contract states mapping directly from the blockchain via Ethers.js.

## Architecture

Our application is built upon a full-stack Web3 architecture connecting a modern React client with an Ethereum-compatible local testing network.

- **Frontend**: Built with **React.js** (create-react-app), heavily utilizing **TailwindCSS** for UI and styling, and **Lucide React** for dynamic iconography. **Ethers.js** is used as the Web3 provider linking standard browser wallets (like MetaMask) to the network.
- **Backend/Smart Contracts**: Authored in **Solidity** (^0.8.20), verified, and tested within the **Hardhat** development environment. 
- **Decentralized Storage**: **Pinata (IPFS)** is heavily utilized directly from the React client to pin confidential documents and obtain secure Content Identifiers (CIDs) before initiating on-chain transactions.

## Setup Guide

To run this project locally, ensure you have **Node.js**, **npm**, and **MetaMask** installed.

### 1. Clone & Install Dependencies
First, install the required packages for both the smart contract and frontend environments.
```bash
# Install Blockchain dependencies
cd blockchain
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Inside the `frontend` folder, create a `.env` file detailing your Pinata JWT for IPFS uploads:
```env
REACT_APP_PINATA_JWT="your_pinata_jwt_token_here"
```

### 3. Start Local Blockchain & Deploy
Spin up your local Hardhat node and deploy the Document Registry contract.

```bash
# Terminal 1: Start the Local Network
cd blockchain
npx hardhat node

# Terminal 2: Deploy the Smart Contract
cd blockchain
npx hardhat ignition deploy ./ignition/modules/DocumentRegistry.js --network localhost
```
*(Make sure to update the `CONTRACT_ADDRESS` inside `frontend/src/blockchain/contractAddress.js` with your newly deployed contract address!)*

### 4. Run the Client Application
Finally, boot up the React dashboard.
```bash
# Terminal 3: Start the Frontend React App
cd frontend
npm start
```
Connect your MetaMask widget to the Localhost:8545 network, import one of the Hardhat private wallets, and you are ready to begin registering and signing documents.
