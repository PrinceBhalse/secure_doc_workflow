import CryptoJS from 'crypto-js';

/**
 * 1. Hybrid Encryption: AES-256 for File + RSA for Key
 * This is the "Gold Standard" for your project.
 */
export const encryptDocument = async (fileBuffer, rsaPublicKey) => {
    // A. Generate a random AES key (The "Session Key")
    const aesKey = CryptoJS.lib.WordArray.random(32).toString();

    // B. Encrypt the File Buffer using AES
    const encryptedFile = CryptoJS.AES.encrypt(
        CryptoJS.lib.WordArray.create(fileBuffer), 
        aesKey
    ).toString();

    // C. Encrypt the AES Key with the Recipient's RSA Public Key
    // Note: In a real app, you'd use a library like 'jsencrypt'
    // For your demo, we'll return the AES key and File for now
    return {
        encryptedFile,
        aesKey, // This gets encrypted via RSA in the next step
        fileHash: CryptoJS.SHA256(encryptedFile).toString() // This goes to Blockchain
    };
};