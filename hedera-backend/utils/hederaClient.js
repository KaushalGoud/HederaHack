require('dotenv').config();
const { Client, PrivateKey, Mnemonic } = require('@hashgraph/sdk');

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

// --- DEBUG LOGGING ---
console.log('DEBUG: OPERATOR_ID read:', operatorId ? 'Found' : 'Missing');
console.log('DEBUG: OPERATOR_KEY length:', operatorKey ? operatorKey.length : 'Missing');
// ----------------------------------------------------------------------

if (!operatorId || !operatorKey) {
    throw new Error('Environment variables OPERATOR_ID and OPERATOR_KEY must be present');
}

async function initializeClient() {
    let privateKey;

    try {
        if (typeof operatorKey !== 'string' || operatorKey.trim().length === 0) {
            throw new Error("OPERATOR_KEY is empty or invalid. Please check your .env file.");
        }
        
        // Key Derivation Logic (Supports Mnemonic or Direct Key)
        if (operatorKey.includes(' ')) {
            console.log('🔑 Detected mnemonic phrase, deriving private key...');
            
            const cleanMnemonic = operatorKey.replace(/["']/g, '').trim();
            const mnemonic = await Mnemonic.fromString(cleanMnemonic);
            privateKey = await mnemonic.toStandardEd25519PrivateKey("", 0);
            
            console.log('✅ Private key derived successfully from mnemonic');
        } else {
            console.log('🔑 Using direct private key...');
            
            try {
                privateKey = PrivateKey.fromString(operatorKey);
            } catch (e) {
                throw new Error("Invalid Private Key format detected. Check OPERATOR_KEY: " + e.message);
            }

            console.log('✅ Private key loaded successfully');
        }

        if (!privateKey || !privateKey.publicKey) {
             throw new Error("Private key was not initialized correctly, likely due to a malformed key.");
        }

        // Create and configure Hedera client
        const client = Client.forTestnet();
        client.setOperator(operatorId, privateKey);

        // --- CRITICAL FIX: Explicitly attach the private key for external signing ---
        client.operatorPrivateKey = privateKey;
        // Also attach public key for use as Supply Key in NFT creation
        client.operatorPublicKey = privateKey.publicKey;

        console.log('✅ Hedera client initialized successfully');
        console.log('📋 Account ID:', operatorId);

        return client;
    } catch (error) {
        console.error('❌ Error initializing Hedera client:', error.message);
        throw error;
    }
}

// Export the client initialization as a promise
module.exports = initializeClient();