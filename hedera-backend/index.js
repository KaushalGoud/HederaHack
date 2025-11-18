require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const tokenRoutes = require('./routes/tokenRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the API routes
app.use('/api', tokenRoutes);

// Simple health check endpoint
app.get('/', (req, res) => {
    res.send('NFT Receipt Backend is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log('Ensure you have a .env file with OPERATOR_ID and OPERATOR_KEY set.');
});