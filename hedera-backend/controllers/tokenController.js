// controllers/tokenController.js  ←←← OFFICIAL HEDERA DOCS VERSION + CLOCK-SAFE
const { 
  TokenCreateTransaction, 
  TokenMintTransaction, 
  TransferTransaction, 
  TokenType, 
  TokenSupplyType, 
  AccountId, 
  Hbar, 
  TransactionId, 
  NftId 
} = require('@hashgraph/sdk');

const initializeClient = require('../utils/hederaClient');

let clientInstance;

async function getClient() {
  if (!clientInstance) {
    clientInstance = await initializeClient();
  }
  return clientInstance;
}

// CREATE NFT COLLECTION (OFFICIAL PATTERN — NO MANUAL TIMESTAMP)
const createToken = async (req, res) => {
  console.log('📥 Creating NFT token...');
  
  try {
    const client = await getClient();
    const { name = 'NFT Receipt Collection', symbol = 'NFTREC' } = req.body;

    // Build the transaction (SDK auto-handles validStart with clock adjustment)
    const tx = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(client.operatorAccountId)
      .setSupplyKey(client.operatorPublicKey)
      .setDecimals(0)
      .setInitialSupply(0)
      .setMaxTransactionFee(new Hbar(50));  // Higher fee for safety

    // Freeze, sign, execute (SDK builds TransactionId/validStart here)
    console.log('Freezing & signing...');
    const frozenTx = await tx.freezeWith(client);
    const signedTx = await frozenTx.sign(client.operatorPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed: ${receipt.status}`);
    }

    const tokenId = receipt.tokenId.toString();
    console.log(`✅ NFT Collection created: ${tokenId}`);

    res.json({
      success: true,
      tokenId,
      message: `NFT Collection "${name}" created successfully!`,
    });
  } catch (err) {
    console.error('❌ Create Token Error:', err.message);
    console.error('Full error:', err);  // Log full error for debugging
    res.status(500).json({ 
      success: false, 
      error: err.message,
      errorType: err.name 
    });
  }
};

// MINT NFT (same pattern)
const mintToken = async (req, res) => {
  console.log('📥 Minting NFT...');
  
  try {
    const client = await getClient();
    const { tokenId, metadataUri } = req.body;

    if (!tokenId) {
      return res.status(400).json({ success: false, error: 'Token ID is required.' });
    }

    const metadata = Buffer.from(metadataUri || `ipfs://metadata/${Date.now()}`);

    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .setMaxTransactionFee(new Hbar(30));

    const frozenTx = await mintTx.freezeWith(client);
    const signedTx = await frozenTx.sign(client.operatorPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const serialNumber = receipt.serials[0].low;
    console.log(`✅ NFT minted: Serial ${serialNumber}`);

    res.json({
      success: true,
      tokenId,
      serialNumber,
      metadataUri,
      message: `NFT minted successfully. Serial: ${serialNumber}`,
    });
  } catch (err) {
    console.error('❌ Mint Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// TRANSFER NFT (same pattern)
const transferToken = async (req, res) => {
  console.log('📥 Transferring NFT...');
  
  try {
    const client = await getClient();
    const { tokenId, recipient, serialNumber } = req.body;

    if (!tokenId || !recipient || !serialNumber) {
      return res.status(400).json({ success: false, error: 'tokenId, recipient, and serialNumber required.' });
    }

    const transferTx = new TransferTransaction()
      .addNftTransfer(
        NftId.fromString(`${tokenId}@${serialNumber}`),
        client.operatorAccountId,
        AccountId.fromString(recipient)
      )
      .setMaxTransactionFee(new Hbar(30));

    const frozenTx = await transferTx.freezeWith(client);
    const signedTx = await frozenTx.sign(client.operatorPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ NFT transferred: Serial ${serialNumber} to ${recipient}`);

    res.json({
      success: true,
      status: receipt.status.toString(),
      message: `NFT Serial #${serialNumber} transferred to ${recipient}.`,
    });
  } catch (err) {
    console.error('❌ Transfer Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createToken, mintToken, transferToken };