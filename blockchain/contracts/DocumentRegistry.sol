// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
    enum Status { Pending, SignedBySeller, SignedByBuyer, Completed }

    struct Document {
        string ipfsHash;      // The encrypted file location
        address seller;
        address buyer;
        address intermediary; // The Law Firm
        Status status;
        bool exists;
    }

    mapping(string => Document) public documents;
    event DocumentRegistered(string ipfsHash, address seller, address buyer);
    event DocumentSigned(string ipfsHash, address signer, Status newStatus);

    // 1. Seller registers the document and signs first
    function registerDocument(string memory _ipfsHash, address _buyer, address _intermediary) public {
        require(!documents[_ipfsHash].exists, "Document already exists");
        
        documents[_ipfsHash] = Document({
            ipfsHash: _ipfsHash,
            seller: msg.sender,
            buyer: _buyer,
            intermediary: _intermediary,
            status: Status.SignedBySeller,
            exists: true
        });

        emit DocumentRegistered(_ipfsHash, msg.sender, _buyer);
    }

    // 2. Buyer/Intermediary Signs
    function signDocument(string memory _ipfsHash) public {
        Document storage doc = documents[_ipfsHash];
        require(doc.exists, "Document not found");
        require(msg.sender == doc.buyer || msg.sender == doc.intermediary, "Unauthorized");

        if (msg.sender == doc.buyer) {
            require(doc.status == Status.SignedBySeller, "Not ready for buyer signature");
            doc.status = Status.SignedByBuyer;
        } else if (msg.sender == doc.intermediary) {
            require(doc.status == Status.SignedByBuyer, "Not ready for intermediary signature");
            doc.status = Status.Completed;
        }

        emit DocumentSigned(_ipfsHash, msg.sender, doc.status);
    }

    function getStatus(string memory _ipfsHash) public view returns (Status) {
        return documents[_ipfsHash].status;
    }
}