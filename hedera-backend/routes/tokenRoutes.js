const express = require('express');
const router = express.Router();
const { createToken, mintToken, transferToken } = require('../controllers/tokenController');

router.post('/create', createToken);
router.post('/mint', mintToken);
router.post('/transfer', transferToken);

module.exports = router;
