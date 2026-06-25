const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    try {
        if (connection) return { connection, channel };

        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        
        console.log('✅ Connected to RabbitMQ (Utility)');
        
        // Ensure exchanges exist
        await channel.assertExchange('registration_events', 'topic', { durable: true });
        
        return { connection, channel };
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
}

async function publishMessage(exchange, routingKey, message) {
    try {
        if (!channel) await connectRabbitMQ();
        
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        console.log(`[x] Sent to ${exchange} (${routingKey}):`, message);
    } catch (error) {
        console.error('❌ Failed to publish message:', error);
    }
}

async function consumeUtilityEvents() {
    try {
        const { channel } = await connectRabbitMQ();
        const q = await channel.assertQueue('utility_sync_queue', { durable: true });
        
        await channel.bindQueue(q.queue, 'registration_events', 'utility.fully_paid');
        
        console.log('📥 Waiting for utility sync events...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                const prisma = require('./prismaClient');
                
                try {
                    if (routingKey === 'utility.fully_paid') {
                        await prisma.utility.update({
                            where: { id: content.utilityId },
                            data: { status: 'PAID' }
                        });
                        console.log(`🏆 Utility ${content.utilityId} marked as PAID`);
                    }
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error processing utility event:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ Utility Consumer Error:', error);
        setTimeout(consumeUtilityEvents, 5000);
    }
}

module.exports = { connectRabbitMQ, publishMessage, consumeUtilityEvents };
