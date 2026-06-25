const amqp = require('amqplib');
const prisma = require('./prismaClient');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    if (connection && channel) return { connection, channel };
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    await channel.assertExchange('payment_events', 'topic', { durable: true });
    await channel.assertExchange('registration_events', 'topic', { durable: true });
    await channel.assertExchange('user_events', 'topic', { durable: true });
    return { connection, channel };
}

async function consumePaymentEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        await channel.assertExchange('payment_events', 'topic', { durable: true });
        
        // Queue for registration updates
        const q = await channel.assertQueue('registration_payment_queue', { durable: true });
        
        // Bind to both success and failure
        await channel.bindQueue(q.queue, 'payment_events', 'payment.completed');
        await channel.bindQueue(q.queue, 'payment_events', 'payment.failed');
        
        console.log('📥 Waiting for payment events in Registration Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                
                console.log(`[x] Received ${routingKey}:`, content);
                
                try {
                    if (routingKey === 'payment.completed') {
                        // Move to PENDING for Admin Manual Approval (Invoice already marked PAID in payment-service)
                        await prisma.registration.update({
                            where: { id: content.registrationId },
                            data: { status: 'PENDING' }
                        });
                        console.log(`✅ Registration ${content.registrationId} moved to PENDING (Waiting for Admin approval)`);
                    } else if (routingKey === 'payment.failed') {
                        // ROLLBACK: Delete or Reject
                        // User wants "undo like it never happened", so let's DELETE if it was just PENDING
                        const reg = await prisma.registration.findUnique({ where: { id: content.registrationId } });
                        if (reg && (reg.status === 'PENDING' || reg.status === 'WAITING_PAYMENT')) {
                            await prisma.registration.delete({ where: { id: content.registrationId } });
                            console.log(`🔄 Registration ${content.registrationId} DELETED (Rollback)`);
                        } else if (reg) {
                             await prisma.registration.update({
                                where: { id: content.registrationId },
                                data: { status: 'REJECTED', rejectionReason: 'Thanh toán thất bại' }
                            });
                            console.log(`❌ Registration ${content.registrationId} REJECTED`);
                        }
                    }
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error processing message:', err);
                    // Deciding whether to nack based on error type. For now, ack to avoid infinite loop on bad data.
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ RabbitMQ Consumer Error:', error);
        setTimeout(consumePaymentEvents, 5000);
    }
}

async function consumeStayEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        await channel.assertExchange('stay_events', 'topic', { durable: true });
        const q = await channel.assertQueue('registration_stay_queue', { durable: true });
        
        await channel.bindQueue(q.queue, 'stay_events', 'stay.created');
        await channel.bindQueue(q.queue, 'stay_events', 'stay.updated');
        
        console.log('📥 Waiting for stay events in Registration Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                
                console.log(`[x] Received ${routingKey}:`, content);
                
                try {
                    if (routingKey === 'stay.created') {
                        // Mark registration as COMPLETED
                        await prisma.registration.update({
                            where: { id: content.registrationId },
                            data: { status: 'COMPLETED' }
                        });
                        console.log(`✅ Registration ${content.registrationId} COMPLETED (Stay Created)`);
                    } else if (routingKey === 'stay.updated' && (content.status === 'LEFT_EARLY' || content.status === 'ENDED')) {
                        // User left early -> Release the registration so they can register again
                        await prisma.registration.updateMany({
                            where: { 
                                studentId: content.studentId,
                                status: 'COMPLETED'
                            },
                            data: { 
                                status: 'REJECTED', 
                                rejectionReason: `Cư trú kết thúc` 
                            }
                        });
                        console.log(`✅ Released registration for Student ${content.studentId} due to ${content.status}`);
                    }
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error processing stay message:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ Stay Events Consumer Error:', error);
        setTimeout(consumeStayEvents, 5000);
    }
}

async function publishMessage(exchange, routingKey, message) {
    try {
        const { channel } = await connectRabbitMQ();
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        console.log(`[x] Sent ${routingKey} to ${exchange}:`, message);
    } catch (error) {
        console.error('❌ Failed to publish message:', error);
    }
}

async function consumeUserEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        await channel.assertExchange('user_events', 'topic', { durable: true });
        const q = await channel.assertQueue('registration_user_queue', { durable: true });
        await channel.bindQueue(q.queue, 'user_events', 'user.deleted');
        
        console.log('📥 Waiting for user events in Registration Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { userId } = content;
                
                try {
                    console.log(`🧹 Processing user deletion for Registration: ${userId}`);
                    await prisma.registration.deleteMany({
                        where: { studentId: userId }
                    });
                    console.log(`✅ Cleaned up registrations for Student ID: ${userId}`);
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error cleaning up registrations:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ User Events Consumer Error:', error);
        setTimeout(consumeUserEvents, 5000);
    }
}

module.exports = { consumePaymentEvents, consumeUserEvents, consumeStayEvents, publishMessage };
