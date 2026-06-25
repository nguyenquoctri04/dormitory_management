const express = require('express');
const cors = require('cors');
require('dotenv').config();
const roomRoutes = require('./routes/roomRoutes');
const periodRoutes = require('./routes/periodRoutes');
const stayRoutes = require('./routes/stayRoutes');
const { PrismaClient } = require('@prisma/client');
const { consumeRegistrationEvents, consumeUserEvents } = require('./lib/rabbitmq');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/periods', periodRoutes);
app.use('/api/v1/stays', stayRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB with Prisma');
    
    // Start RabbitMQ Consumers
    consumeRegistrationEvents();
    consumeUserEvents();

    app.listen(PORT, () => {
      console.log(`🚀 Room Service is running on port ${PORT}`);
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
