const express = require('express');
const cors = require('cors');
require('dotenv').config();
const complaintRoutes = require('./routes/complaintRoutes');
const prisma = require('./lib/prismaClient');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use('/api/v1/complaints', complaintRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB Complaint DB with Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Complaint Service is running on port ${PORT}`);
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
