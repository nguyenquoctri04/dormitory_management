const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  let retries = 5;
  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log('✅ Connected to MongoDB with Prisma');
      break;
    } catch (error) {
      console.error(`❌ Failed to connect to database. Retries left: ${retries - 1}`);
      console.error(error.message);
      retries -= 1;
      if (retries === 0) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Auth Service is running on port ${PORT}`);
  });
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

