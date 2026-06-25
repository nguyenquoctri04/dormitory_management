const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        channel = await connection.createChannel();
        await channel.assertExchange('user_events', 'topic', { durable: true });
        console.log('✅ Connected to RabbitMQ (auth-service)');
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
    }
}

async function publishMessage(exchange, routingKey, message) {
    try {
        if (!channel) await connectRabbitMQ();
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`[x] Sent to ${exchange} (${routingKey}):`, message);
    } catch (error) {
        console.error('❌ Failed to publish message:', error);
    }
}

module.exports = { connectRabbitMQ, publishMessage };
