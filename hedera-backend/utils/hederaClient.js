require('dotenv').config();
const { Client, PrivateKey, Mnemonic } = require('@hashgraph/sdk');

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

if (!operatorId || !operatorKey) {
  throw new Error('Environment variables OPERATOR_ID and OPERATOR_KEY must be present');
}

async function initializeClient() {
  let privateKey;

  try {
    // Check if OPERATOR_KEY is a mnemonic phrase (contains spaces)
    if (operatorKey.includes(' ')) {
      console.log('🔑 Detected mnemonic phrase, deriving private key...');
      
      // Remove any quotes if present
      const cleanMnemonic = operatorKey.replace(/["']/g, '').trim();
      
      // Create mnemonic object
      const mnemonic = await Mnemonic.fromString(cleanMnemonic);
      
      // Derive the private key (index 0 for the first account)
      privateKey = await mnemonic.toStandardEd25519PrivateKey("", 0);
      
      console.log('✅ Private key derived successfully from mnemonic');
    } else {
      // It's a direct private key (hex string)
      console.log('🔑 Using direct private key...');
      privateKey = PrivateKey.fromString(operatorKey);
      console.log('✅ Private key loaded successfully');
    }

    // Create and configure Hedera client
    const client = Client.forTestnet();
    client.setOperator(operatorId, privateKey);

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