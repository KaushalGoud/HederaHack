// utils/hederaClient.js
require('dotenv').config();
const { Client, PrivateKey, Mnemonic, AccountId } = require('@hashgraph/sdk');

const operatorIdStr = process.env.OPERATOR_ID;
const operatorKeyStr = process.env.OPERATOR_KEY;
const network = process.env.HEDERA_NETWORK || 'testnet';

// --- Validation ---
console.log('DEBUG: OPERATOR_ID read:', operatorIdStr ? 'Found' : 'Missing');
console.log('DEBUG: OPERATOR_KEY length:', operatorKeyStr ? operatorKeyStr.length : 'Missing');

if (!operatorIdStr || !operatorKeyStr) {
    throw new Error('Environment variables OPERATOR_ID and OPERATOR_KEY must be present');
}

try {
    AccountId.fromString(operatorIdStr);
} catch {
    throw new Error(`Invalid OPERATOR_ID format: ${operatorIdStr}`);
}

// --- Initialization Function ---
async function initializeClient() {
    let privateKey;

    try {
        if (typeof operatorKeyStr !== 'string' || operatorKeyStr.trim().length === 0) {
            throw new Error('OPERATOR_KEY is empty or invalid. Please check your .env file.');
        }

        // Mnemonic-based derivation
        if (operatorKeyStr.includes(' ')) {
            console.log('🔑 Detected mnemonic phrase, deriving private key...');
            const cleanMnemonic = operatorKeyStr.replace(/["']/g, '').trim();
            const mnemonic = await Mnemonic.fromString(cleanMnemonic);
            privateKey = await mnemonic.toStandardEd25519PrivateKey();
            console.log('✅ Private key derived successfully from mnemonic');
        } else {
            // Direct private key
            console.log('🔑 Using direct private key...');
            privateKey = PrivateKey.fromString(operatorKeyStr);
            console.log('✅ Private key loaded successfully');
        }

        // Create client for selected network
        const client =
            network === 'mainnet'
                ? Client.forMainnet()
                : network === 'previewnet'
                ? Client.forPreviewnet()
                : Client.forTestnet();

        // Set operator
        const operatorId = AccountId.fromString(operatorIdStr);
        client.setOperator(operatorId, privateKey);

        // ✅ Attach keys manually for controller usage
        client.operatorPrivateKey = privateKey;
        client.operatorPublicKey = privateKey.publicKey;
        client.operatorAccountId = operatorId;

        console.log('✅ Hedera client initialized successfully');
        console.log('🌐 Network:', network);
        console.log('📋 Account ID:', operatorId.toString());

        return client;
    } catch (error) {
        console.error('❌ Error initializing Hedera client:', error.message);
        throw error;
    }
}

// ⭐ FIX: Export the initialization function itself.
module.exports = initializeClient;