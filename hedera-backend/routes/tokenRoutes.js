// routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// Route to create the NFT collection (one-time setup)
router.post('/create-token', tokenController.createToken);

// Route to mint a new NFT receipt with metadata
router.post('/mint-token', tokenController.mintToken);

// Route to transfer the newly minted NFT to the user
router.post('/transfer-token', tokenController.transferToken);

// NEW: Associate a token with a receiver account (REQUIRED before transfer!)
// router.post('/associate-token', tokenController.associateToken);

module.exports = router;