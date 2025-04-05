const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const gadgetRoutes = require('./src/routes/gadgetRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gadgets', gadgetRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1); // Mandatory (as per the Node.js docs)
});