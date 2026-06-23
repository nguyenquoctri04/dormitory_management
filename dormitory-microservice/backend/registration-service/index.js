const express = require('express');
const cors = require('cors');
require('dotenv').config();
const registrationRoutes = require('./routes/registrationRoutes');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/api/v1/registrations', registrationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB with Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Registration Service is running on port ${PORT}`);
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
