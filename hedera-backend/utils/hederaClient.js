// utils/hederaClient.js  ←←← KEEP THIS EXACTLY
require('dotenv').config();
const { Client, PrivateKey, Mnemonic, AccountId } = require('@hashgraph/sdk');

const operatorIdStr = process.env.OPERATOR_ID;
const operatorKeyStr = process.env.OPERATOR_KEY;
const network = process.env.HEDERA_NETWORK || 'testnet';

if (!operatorIdStr || !operatorKeyStr) {
  throw new Error('Missing OPERATOR_ID or OPERATOR_KEY in .env');
}

async function initializeClient() {
  let privateKey;

  if (operatorKeyStr.includes(' ')) {
    const mnemonic = await Mnemonic.fromString(operatorKeyStr.trim().replace(/["']/g, ''));
    privateKey = await mnemonic.toStandardEd25519PrivateKey();
  } else {
    privateKey = PrivateKey.fromString(operatorKeyStr);
  }

  const operatorId = AccountId.fromString(operatorIdStr);

  const client = network === 'mainnet'
    ? Client.forMainnet()
    : network === 'previewnet'
    ? Client.forPreviewnet()
    : Client.forTestnet();

  client.setOperator(operatorId, privateKey);

  client.operatorAccountId = operatorId;
  client.operatorPrivateKey = privateKey;
  client.operatorPublicKey = privateKey.publicKey;

  console.log(`Hedera client ready → ${operatorId.toString()} on ${network}`);
  return client;
}

module.exports = initializeClient;