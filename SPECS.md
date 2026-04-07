# Technical Specifications

This document outlines the core technical mechanics dictating the decentralized components of the Secure Document Workflow application.

## Smart Contract Functions (DocumentRegistry.sol)

The backbone of the application relies on state execution within an Ethereum Smart Contract. Roles are authenticated via standard public-key cryptography inherently provided by `msg.sender`.

### `registerDocument(string memory _ipfsHash, address _buyer, address _intermediary)`
- **Modifier/Access**: `public`
- **Purpose**: Initiates a new multi-signature workflow.
- **Mechanics**: 
  1. Checks if the given `_ipfsHash` already exists mapping. Reverts if `true` to avoid overwriting ongoing contracts.
  2. The `msg.sender` calling the function is automatically mapped to the `seller` property.
  3. The `_buyer` and `_intermediary` wallet addresses are permanently locked to the Document struct mapping.
  4. The Document `status` is initialized to `Status.SignedBySeller` (Status 1).
  5. Emits a `DocumentRegistered` event for localized indexing.

### `signDocument(string memory _ipfsHash)`
- **Modifier/Access**: `public`
- **Purpose**: Advances the state of an existing document workflow forward.
- **Mechanics**:
  1. Checks if `_ipfsHash` points to a registered document. 
  2. Ensures that `msg.sender` strictly matches either the `buyer` or `intermediary` address. Reverts if unauthorized.
  3. **Conditional Logic (Buyer)**: If `msg.sender` is the `buyer`, it runs a strict requirement (`require`) that the document is exactly at `Status.SignedBySeller` (Status 1). If successful, increments status to `Status.SignedByBuyer` (Status 2).
  4. **Conditional Logic (Intermediary)**: If `msg.sender` is the `intermediary`, it requires that the document is at `Status.SignedByBuyer` (Status 2). If successful, increments status to `Status.Completed` (Status 3).
  5. Reverts implicitly if any party tries to skip a state or re-sign completed documents.
  6. Emits a `DocumentSigned` event.

## Decentralized Storage / IPFS CID Structure

Rather than storing hefty byte-data directly on the Ethereum network—which would incur massive gas fees—the application leverages decentralized file hashing via Pinata's IPFS API.

- **Endpoint utilized**: `https://api.pinata.cloud/pinning/pinFileToIPFS`
- **Authentication**: JWT Bearer token configured heavily via local environment variables.
- **Process**: During the 'Register New' procedure, a JavaScript `FormData` buffer packages the selected local file and POSTs it directly to the IPFS Pinning Service.
- **CID Formulation**: Upon successful upload, Pinata responds with an `IpfsHash`. This string is an immutable Content Identifier (e.g., `Qm...` or `bafy...`). 
  - **Immutability Guarantee**: It corresponds strictly to the underlying contents of the file, not the file's name. A changed pixel generates a wholly different CID.
- **Registry Integration**: This 46+ character alphanumeric hash string is retrieved in the frontend (`cid = await uploadToIPFS(file)`) and injected as the very first argument `_ipfsHash` into the Smart Contract's `registerDocument` function, thus bonding the exact file state to the legal signatures.

This ensures zero risk of centralized DNS tampering and preserves the document seamlessly on IPFS peering nodes. All document retrievals occur client-side simply by establishing `https://gateway.pinata.cloud/ipfs/{cid}`.
