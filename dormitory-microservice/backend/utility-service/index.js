const express = require('express');
const cors = require('cors');
require('dotenv').config();
const utilityRoutes = require('./routes/utilityRoutes');
const prisma = require('./lib/prismaClient');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use('/api/v1/utilities', utilityRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB Utility DB with Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Utility Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
