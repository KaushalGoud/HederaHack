const { TokenCreateTransaction, Hbar, TokenType, TokenSupplyType, AccountId, TokenMintTransaction, TransferTransaction } = require("@hashgraph/sdk");
const client = require('../utils/hederaClient');

let tokenId;

exports.createToken = async (req, res) => {
    try {
        const { name, symbol, initialSupply, decimals } = req.body;

        const tokenTx = await new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setTreasuryAccountId(client.operatorAccountId)
            .setInitialSupply(initialSupply)
            .setDecimals(decimals)
            .setTokenType(TokenType.FungibleCommon)
            .setSupplyType(TokenSupplyType.Infinite)
            .setMaxTransactionFee(new Hbar(30))
            .freezeWith(client);

        const signTx = await tokenTx.sign(client.operatorPublicKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        tokenId = receipt.tokenId;

        res.json({ success: true, tokenId: tokenId.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.mintToken = async (req, res) => {
    try {
        const { amount } = req.body;

        const mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(amount)
            .freezeWith(client);

        const signTx = await mintTx.sign(client.operatorPublicKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        res.json({ success: true, newTotalSupply: receipt.totalSupply.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.transferToken = async (req, res) => {
    try {
        const { recipient, amount } = req.body;

        const transferTx = await new TransferTransaction()
            .addTokenTransfer(tokenId, client.operatorAccountId, -amount)
            .addTokenTransfer(tokenId, recipient, amount)
            .freezeWith(client);

        const signTx = await transferTx.sign(client.operatorPublicKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        res.json({ success: true, status: receipt.status.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
