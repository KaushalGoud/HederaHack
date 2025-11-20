// controllers/tokenController.js — FINAL WORKING VERSION (2025)
const { 
  TokenCreateTransaction,
  TransferTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TokenMintTransaction,
  TokenId
} = require('@hashgraph/sdk');

const initializeClient = require('../utils/hederaClient');

let client;
async function getClient() {
  if (!client) client = await initializeClient();
  return client;
}

const createToken = async (req, res) => {
  try {
    const client = await getClient();
    const tx = new TokenCreateTransaction()
      .setTokenName("Receipt NFT")
      .setTokenSymbol("RCPT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(client.operatorAccountId)
      .setAdminKey(client.operatorPublicKey)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(50));

    const frozen = await tx.freezeWith(client);
    const signed = await frozen.sign(client.operatorPrivateKey);
    const resp = await signed.execute(client);
    const receipt = await resp.getReceipt(client);

    res.json({ success: true, tokenId: receipt.tokenId.toString() });
  } catch (err) {
    console.error("CREATE ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

const mintToken = async (req, res) => {
  try {
    console.log("Mint request:", req.body);
    const client = await getClient();
    const { tokenId, metadataUri } = req.body;

    if (!tokenId || !metadataUri) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const token = TokenId.fromString(tokenId);

    // ONLY MINT — NO TRANSFER NEEDED WHEN SENDING TO SELF
    const mintTx = new TokenMintTransaction()
      .setTokenId(token)
      .setMetadata([Buffer.from(metadataUri)])
      .setMaxTransactionFee(new Hbar(30));

    const frozen = await mintTx.freezeWith(client);
    const signed = await frozen.sign(client.operatorPrivateKey);
    const response = await signed.execute(client);
    const receipt = await response.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      throw new Error("Mint failed: " + receipt.status);
    }

    const serial = receipt.serials[0].low;

    console.log(`NFT #${serial} minted successfully to operator treasury`);

    res.json({
      success: true,
      tokenId,
      serialNumber: serial,
      message: "NFT Delivered!"
    });

  } catch (err) {
    console.error("MINT ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createToken, mintToken };