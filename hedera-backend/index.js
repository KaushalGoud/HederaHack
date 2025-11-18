const express = require('express');
const cors = require('cors');
const tokenRoutes = require('./routes/tokenRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', tokenRoutes);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
