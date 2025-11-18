const SDK = require("@hashgraph/sdk"); // Import the entire SDK object

// client is a promise exported from hederaClient.js, so we must await it inside the functions
const clientPromise = require('../utils/hederaClient');

let tokenId;
let clientInstance; // Cache the resolved client

// Helper to get and cache the client instance
async function getClient() {
    // Wait for the client promise to resolve the first time, then cache the instance
    if (!clientInstance) {
        clientInstance = await clientPromise;
    }
    return clientInstance;
}

/**
 * Creates a new Non-Fungible Unique (NFT) Token Collection.
 */
const createToken = async (req, res) => {
    try {
        const client = await getClient();
        const { name, symbol } = req.body;
        
        // 1. Create a Non-Fungible Unique (NFT) Token
        const tokenTx = await new SDK.TokenCreateTransaction()
            .setTokenName(name || "NFT Receipt Collection")
            .setTokenSymbol(symbol || "NFTREC")
            .setTreasuryAccountId(client.operatorAccountId)
            .setSupplyKey(client.operatorPublicKey) // The operator's public key is the Supply Key (needed for minting)
            .setInitialSupply(0) // NFTs must start with 0 supply
            .setDecimals(0) // NFTs must have 0 decimals
            .setTokenType(SDK.TokenType.NonFungibleUnique) // CRITICAL: Sets it as an NFT
            .setSupplyType(SDK.TokenSupplyType.Infinite) // Updated to use SDK.TokenSupplyType
            .setMaxTransactionFee(new SDK.Hbar(30)) // Updated to use SDK.Hbar
            // FIX: Removed SDK.Duration constructor, setting duration directly using seconds (180s = 3 mins)
            .setTransactionValidDuration(180) 
            .freezeWith(client);

        const signTx = await tokenTx.sign(client.operatorPrivateKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        tokenId = receipt.tokenId;

        res.json({ 
            success: true, 
            tokenId: tokenId.toString(),
            message: `NFT Collection ${tokenId.toString()} created successfully.`
        });
    } catch (err) {
        console.error("Error creating token:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Mints a new NFT with specific metadata (the receipt proof).
 */
const mintToken = async (req, res) => {
    try {
        const client = await getClient();
        if (!tokenId) {
            return res.status(400).json({ success: false, error: "Token ID not set. Create a token first." });
        }

        const { metadataUri } = req.body;
        
        // 2. Mint a single NFT using metadata, not amount
        const metadata = Buffer.from(metadataUri || `ipfs://metadata/${Date.now()}`);

        const mintTx = await new SDK.TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([metadata]) // NFTs use metadata (Buffer or byte array)
            .setMaxTransactionFee(new SDK.Hbar(30)) // Updated to use SDK.Hbar
            // FIX: Removed SDK.Duration constructor, setting duration directly using seconds
            .setTransactionValidDuration(180) 
            .freezeWith(client);

        const signTx = await mintTx.sign(client.operatorPrivateKey); // Must sign with the Supply Key
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        // The serial number is the unique ID of the NFT
        const serialNumber = receipt.serials[0].low;

        res.json({ 
            success: true, 
            tokenId: tokenId.toString(),
            serialNumber: serialNumber,
            metadataUri: metadataUri,
            message: `NFT Receipt minted successfully. Serial: ${serialNumber}`
        });
    } catch (err) {
        console.error("Error minting token:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Transfers a specific NFT serial number to a recipient account.
 */
const transferToken = async (req, res) => {
    try {
        const client = await getClient();
        if (!tokenId) {
            return res.status(400).json({ success: false, error: "Token ID not set." });
        }
        
        const { recipient, serialNumber } = req.body;
        
        if (!serialNumber) {
             return res.status(400).json({ success: false, error: "NFT serial number is required for transfer." });
        }
        
        // 3. Transfer the specific NFT serial number from Treasury (operator) to recipient
        const transferTx = await new SDK.TransferTransaction()
            .addNftTransfer( // CRITICAL: Use addNftTransfer for NFTs
                tokenId, 
                serialNumber, 
                client.operatorAccountId, // Sender (Treasury/Operator)
                SDK.AccountId.fromString(recipient) // Updated to use SDK.AccountId
            )
            .setMaxTransactionFee(new SDK.Hbar(30)) // Updated to use SDK.Hbar
            // FIX: Removed SDK.Duration constructor, setting duration directly using seconds
            .setTransactionValidDuration(180) 
            .freezeWith(client);

        const signTx = await transferTx.sign(client.operatorPrivateKey); // Treasury/Sender must sign
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        res.json({ 
            success: true, 
            status: receipt.status.toString(),
            message: `NFT Serial #${serialNumber} transferred to ${recipient}.`
        });
    } catch (err) {
        console.error("Error transferring token:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- EXPORT DEFINITIONS MUST BE LAST ---
// Export all functions as an object, ensuring they are defined above this line.
module.exports = {
    createToken,
    mintToken,
    transferToken
};