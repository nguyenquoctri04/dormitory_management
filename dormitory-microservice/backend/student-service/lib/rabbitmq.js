const amqp = require('amqplib');
const prisma = require('./prismaClient');

async function consumeUserEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        await channel.assertExchange('user_events', 'topic', { durable: true });
        const q = await channel.assertQueue('student_user_queue', { durable: true });
        await channel.bindQueue(q.queue, 'user_events', 'user.deleted');
        
        console.log('📥 Waiting for user events in Student Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { userId } = content;
                
                try {
                    console.log(`🧹 Processing user deletion for Profile: ${userId}`);
                    await prisma.student.deleteMany({
                        where: { userId: userId }
                    });
                    console.log(`✅ Cleaned up student profile for User ID: ${userId}`);
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error cleaning up student profile:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ User Events Consumer Error:', error);
        setTimeout(consumeUserEvents, 5000);
    }
}

module.exports = { consumeUserEvents };
