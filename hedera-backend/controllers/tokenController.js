const SDK = require('@hashgraph/sdk');
const initializeClient = require('../utils/hederaClient');

// Add debug logging
console.log('DEBUG: initializeClient type:', typeof initializeClient);

let clientInstance;

// --- CRITICAL FIX HELPER FUNCTION ---
/**
 * Generates a Hedera Timestamp object slightly in the past (5 seconds)
 * to account for potential network clock skew, which causes the
 * INVALID_TRANSACTION_START error.
 * @returns {SDK.Timestamp} A Timestamp object used for creating a custom Transaction ID.
 */
function getPastTimestamp() {
    // Get current time in milliseconds, subtract 5000ms (5s), and convert to seconds.
    const nowInSeconds = Math.floor((Date.now() - 5000) / 1000);
    // Convert the seconds back into the Hedera Timestamp object
    return new SDK.Timestamp(nowInSeconds, 0); 
}
// ------------------------------------

// Cache and reuse one Hedera client instance (using the singleton promise export)
async function getClient() {
    if (!clientInstance) {
        // initializeClient is a promise (the result of the function call in hederaClient.js)
        console.log('🔄 Initializing Hedera client...');
        clientInstance = await initializeClient; 
        console.log('✅ Client initialized successfully');
    }
    return clientInstance;
}

/**
 * Create a new NFT token collection
 */
const createToken = async (req, res) => {
    console.log('📥 Received create-token request:', req.body);
    
    try {
        console.log('Step 1: Getting client...');
        const client = await getClient();
        console.log('Step 2: Client obtained, operatorAccountId:', client.operatorAccountId?.toString());
        
        const { name, symbol } = req.body;

        // ⭐ FIX: Generate a custom TransactionId using the time slightly in the past
        const customTxId = SDK.TransactionId.generate(client.operatorAccountId, getPastTimestamp());

        console.log('Step 3: Creating TokenCreateTransaction...');
        const tx = new SDK.TokenCreateTransaction()
            .setTokenName(name || 'NFT Receipt Collection')
            .setTokenSymbol(symbol || 'NFTREC')
            .setTreasuryAccountId(client.operatorAccountId)
            .setSupplyKey(client.operatorPublicKey)
            .setInitialSupply(0)
            .setDecimals(0)
            .setTokenType(SDK.TokenType.NonFungibleUnique)
            .setSupplyType(SDK.TokenSupplyType.Infinite)
            .setMaxTransactionFee(new SDK.Hbar(30))
            
            // Apply the custom ID before freezing
            .setTransactionId(customTxId) 
            // FIX: Using new SDK.Duration(180) for extended validity
            .setTransactionValidDuration(new SDK.Duration(180)); 

        console.log('Step 4: Freezing transaction...');
        const frozenTx = await tx.freezeWith(client);
        
        console.log('Step 5: Signing transaction...');
        const signTx = await frozenTx.sign(client.operatorPrivateKey);
        
        console.log('Step 6: Executing transaction...');
        const txResponse = await signTx.execute(client);
        
        console.log('Step 7: Getting receipt...');
        const receipt = await txResponse.getReceipt(client);

        const tokenId = receipt.tokenId.toString();
        console.log(`✅ Token created successfully: ${tokenId}`);

        res.json({
            success: true,
            tokenId,
            message: `NFT Collection ${tokenId} created successfully.`,
        });
    } catch (err) {
        console.error('❌ ERROR DETAILS:');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        
        // Send error response
        res.status(500).json({ 
            success: false, 
            error: err.message,
            errorType: err.name
        });
    }
};

/**
 * Mint a new NFT with metadata
 */
const mintToken = async (req, res) => {
    console.log('📥 Received mint-token request:', req.body);
    
    try {
        const client = await getClient();
        const { tokenId, metadataUri } = req.body;

        if (!tokenId) {
            return res.status(400).json({ success: false, error: 'Token ID is required.' });
        }
        
        // ⭐ FIX: Generate a custom TransactionId using the time slightly in the past
        const customTxId = SDK.TransactionId.generate(client.operatorAccountId, getPastTimestamp());

        const metadata = Buffer.from(metadataUri || `ipfs://metadata/${Date.now()}`);

        const mintTx = new SDK.TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([metadata])
            .setMaxTransactionFee(new SDK.Hbar(30))
            
            // Apply the custom ID before freezing
            .setTransactionId(customTxId)
            // Use new SDK.Duration(180) for robustness
            .setTransactionValidDuration(new SDK.Duration(180));

        const frozenTx = await mintTx.freezeWith(client);
        const signTx = await frozenTx.sign(client.operatorPrivateKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        const serialNumber = receipt.serials[0].low;
        console.log(`✅ NFT minted: Token ${tokenId} Serial ${serialNumber}`);

        res.json({
            success: true,
            tokenId,
            serialNumber,
            metadataUri,
            message: `NFT minted successfully. Serial: ${serialNumber}`,
        });
    } catch (err) {
        console.error('❌ Error minting token:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Transfer NFT to a recipient
 */
const transferToken = async (req, res) => {
    console.log('📥 Received transfer-token request:', req.body);
    
    try {
        const client = await getClient();
        const { tokenId, recipient, serialNumber } = req.body;

        if (!tokenId || !recipient || !serialNumber) {
            return res
                .status(400)
                .json({ success: false, error: 'tokenId, recipient, and serialNumber are required.' });
        }
        
        // ⭐ FIX: Generate a custom TransactionId using the time slightly in the past
        const customTxId = SDK.TransactionId.generate(client.operatorAccountId, getPastTimestamp());

        const transferTx = new SDK.TransferTransaction()
            .addNftTransfer(
                SDK.NftId.fromString(`${tokenId}@${serialNumber}`),
                client.operatorAccountId,
                SDK.AccountId.fromString(recipient)
            )
            .setMaxTransactionFee(new SDK.Hbar(30))
            
            // Apply the custom ID before freezing
            .setTransactionId(customTxId)
            // Use new SDK.Duration(180) for robustness
            .setTransactionValidDuration(new SDK.Duration(180));

        const frozenTx = await transferTx.freezeWith(client);
        const signTx = await frozenTx.sign(client.operatorPrivateKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        console.log(`✅ NFT transferred: Serial ${serialNumber} to ${recipient}`);

        res.json({
            success: true,
            status: receipt.status.toString(),
            message: `NFT Serial #${serialNumber} transferred to ${recipient}.`,
        });
    } catch (err) {
        console.error('❌ Error transferring token:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createToken, mintToken, transferToken };