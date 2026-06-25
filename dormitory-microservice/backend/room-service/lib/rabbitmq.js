const amqp = require('amqplib');
const prisma = require('./prismaClient');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    if (connection && channel) return { connection, channel };
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    await channel.assertExchange('stay_events', 'topic', { durable: true });
    return { connection, channel };
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

async function consumeRegistrationEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const conn = await amqp.connect(rabbitUrl);
        const ch = await conn.createChannel();
        
        await ch.assertExchange('registration_events', 'topic', { durable: true });
        
        // Queue for stay creation
        const q = await ch.assertQueue('room_registration_queue', { durable: true });
        
        // Bind to registration.approved (triggered by Admin Manual Approval)
        await ch.bindQueue(q.queue, 'registration_events', 'registration.approved');
        
        console.log('📥 Waiting for registration approval events in Room Service...');
        
        ch.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                
                console.log(`[x] Received ${routingKey}:`, content);
                
                try {
                    // Fetch registration details from registration-service
                    const regUrl = `http://registration-service:3004/api/v1/registrations/admin/${content.registrationId}`;
                    const response = await fetch(regUrl, {
                        headers: { 'Authorization': `Bearer ${process.env.INTERNAL_TOKEN || 'internal-secret'}` }
                    });
                    
                    if (response.ok) {
                        const reg = await response.json();
                        
                        // Check if stay already exists (idempotency)
                        const existingStay = await prisma.stay.findFirst({
                            where: { 
                                studentId: reg.studentId,
                                roomId: reg.roomId,
                                status: 'ACTIVE'
                            }
                        });

                        if (existingStay) {
                            console.log(`ℹ️ Stay already exists for Student ${reg.studentId}. Skipping.`);
                            return ch.ack(msg);
                        }

                        // Create stay
                        const stay = await prisma.stay.create({
                            data: {
                                studentId: reg.studentId,
                                roomId: reg.roomId,
                                periodId: reg.periodId,
                                startDate: new Date(reg.startDate),
                                endDate: reg.endDate ? new Date(reg.endDate) : null,
                                registrationDate: reg.registrationDate ? new Date(reg.registrationDate) : null,
                                academicYear: reg.academicYear || null,
                                semester: reg.semester || null,
                                status: 'ACTIVE',
                            }
                        });
                        console.log(`✅ Stay created for Student ${reg.studentId} in Room ${reg.roomId}`);
                        
                        // PUBLISH stay.created event → updates registration status to COMPLETED
                        await publishMessage('stay_events', 'stay.created', {
                            stayId: stay.id,
                            registrationId: reg.id,
                            studentId: reg.studentId,
                            status: 'ACTIVE'
                        });
                    } else {
                        console.error(`❌ Failed to fetch registration ${content.registrationId}`);
                    }
                    
                    ch.ack(msg);
                } catch (err) {
                    console.error('❌ Error processing message:', err);
                    ch.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ RabbitMQ Consumer Error:', error);
        setTimeout(consumeRegistrationEvents, 5000);
    }
}

async function consumeUserEvents() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const conn = await amqp.connect(rabbitUrl);
        const ch = await conn.createChannel();
        
        await ch.assertExchange('user_events', 'topic', { durable: true });
        const q = await ch.assertQueue('room_user_queue', { durable: true });
        await ch.bindQueue(q.queue, 'user_events', 'user.deleted');
        
        console.log('📥 Waiting for user events in Room Service...');
        
        ch.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { userId } = content;
                
                try {
                    console.log(`🧹 Processing user deletion for Student ID: ${userId}`);
                    
                    // 1. Find all active stays for this user
                    const activeStays = await prisma.stay.findMany({
                        where: { studentId: userId, status: 'ACTIVE' }
                    });
                    
                    for (const stay of activeStays) {
                        // 2. Decrement occupiedSlots for the room
                        await prisma.room.update({
                            where: { id: stay.roomId },
                            data: {
                                occupiedSlots: { decrement: 1 }
                            }
                        });
                        console.log(`📉 Decremented occupiedSlots for Room ${stay.roomId}`);
                    }
                    
                    // 3. Delete or mark inactive all stays for this user
                    await prisma.stay.deleteMany({
                        where: { studentId: userId }
                    });
                    
                    console.log(`✅ Cleaned up residence info for Student ID: ${userId}`);
                    ch.ack(msg);
                } catch (err) {
                    console.error('❌ Error cleaning up residency:', err);
                    ch.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ User Events Consumer Error:', error);
        setTimeout(consumeUserEvents, 5000);
    }
}

module.exports = { consumeRegistrationEvents, consumeUserEvents, publishMessage };
