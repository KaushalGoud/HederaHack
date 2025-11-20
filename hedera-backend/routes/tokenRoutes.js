// routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const { createToken, mintToken } = require('../controllers/tokenController');

router.post('/create-token', createToken);
router.post('/mint-token', mintToken);

module.exports = router;