const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    try {
        if (connection) return { connection, channel };

        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        
        console.log('✅ Connected to RabbitMQ');
        
        // Ensure exchanges exist
        await channel.assertExchange('payment_events', 'topic', { durable: true });
        await channel.assertExchange('registration_events', 'topic', { durable: true });
        await channel.assertExchange('user_events', 'topic', { durable: true });
        
        return { connection, channel };
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
        // Retry logic could go here
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

async function consumeEvents() {
    try {
        const { channel } = await connectRabbitMQ();
        
        // 1. Queue for Invoice Creation & In-person Update
        const q = await channel.assertQueue('payment_registration_queue', { durable: true });
        
        await channel.bindQueue(q.queue, 'registration_events', 'registration.created');
        await channel.bindQueue(q.queue, 'registration_events', 'registration.approved');
        await channel.bindQueue(q.queue, 'registration_events', 'registration.rejected');
        await channel.bindQueue(q.queue, 'registration_events', 'utility.created'); // NEW
        await channel.bindQueue(q.queue, 'payment_events', 'payment.completed');
        await channel.bindQueue(q.queue, 'payment_events', 'payment.failed');

        console.log('📥 Waiting for events in Payment Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                const prisma = require('./prismaClient');
                const axios = require('axios');
                
                console.log(`[x] Processing ${routingKey}:`, content);

                try {
                    if (routingKey === 'registration.created') {
                        // Create UNPAID Invoice for Room Fee
                        await prisma.invoice.create({
                            data: {
                                studentId: content.studentId,
                                roomId: content.roomId || "PENDING",
                                type: 'ROOM_FEE',
                                amount: parseFloat(content.amount || 0),
                                status: 'UNPAID',
                                paymentMethod: content.paymentMethod || 'CASH',
                                registrationId: content.registrationId,
                                month: new Date().getMonth() + 1,
                                year: new Date().getFullYear()
                            }
                        });
                        console.log(`📄 UNPAID Invoice created for Reg: ${content.registrationId}`);
                    } 
                    else if (routingKey === 'utility.created') {
                        // 1. Get all students currently in this room (ACTIVE stays)
                        const internalToken = process.env.INTERNAL_TOKEN || 'your-internal-secret-token';
                        const roomServiceUrl = `http://room-service:3003/api/v1/stays/admin/list?room_id=${content.roomId}&status=ACTIVE`;
                        
                        const response = await axios.get(roomServiceUrl, {
                            headers: { 'Authorization': `Bearer ${internalToken}`, 'x-internal-service': 'payment-service' }
                        });
                        
                        const activeStays = response.data || [];
                        if (activeStays.length === 0) {
                            console.log(`⚠️ No active students found in room ${content.roomId} to split bill ${content.utilityId}`);
                            return channel.ack(msg);
                        }

                        // 2. Split Amount
                        const perStudentAmount = content.totalAmount / activeStays.length;

                        // 3. Create Invoices for each student
                        for (const stay of activeStays) {
                            await prisma.invoice.create({
                                data: {
                                    studentId: stay.studentId,
                                    roomId: stay.roomId,
                                    type: 'UTILITY',
                                    utilityId: content.utilityId,
                                    amount: perStudentAmount,
                                    status: 'UNPAID',
                                    paymentMethod: 'CASH', // Default
                                    month: content.month,
                                    year: content.year
                                }
                            });
                        }
                        console.log(`📄 Split UTILITY Invoices created for ${activeStays.length} students in room ${content.roomId}`);
                    }
                    else if (routingKey === 'registration.approved') {
                        // Mark In-person Invoice as PAID
                        if (content.registrationId) {
                            await prisma.invoice.updateMany({
                                where: { registrationId: content.registrationId },
                                data: { status: 'PAID' }
                            });
                            console.log(`✅ Invoice marked PAID (Approved) for Reg: ${content.registrationId}`);
                        }
                    }
                    else if (routingKey === 'payment.completed') {
                        // Update Invoice status to PAID
                        // It could be linked by registrationId OR invoiceId (from VNPay callback)
                        let updatedInvoices = [];
                        
                        if (content.registrationId) {
                            await prisma.invoice.updateMany({
                                where: { registrationId: content.registrationId },
                                data: { status: 'PAID' }
                            });
                            console.log(`✅ Invoice marked PAID (VNPay Reg): ${content.registrationId}`);
                        } else if (content.invoiceId) {
                            const updated = await prisma.invoice.update({
                                where: { id: content.invoiceId },
                                data: { status: 'PAID' }
                            });
                            updatedInvoices.push(updated);
                            console.log(`✅ Invoice marked PAID (VNPay Invoice): ${content.invoiceId}`);
                        }

                        // IF it was a UTILITY invoice, check if all invoices for that utilityId are DONE
                        for (const inv of updatedInvoices) {
                            if (inv.type === 'UTILITY' && inv.utilityId) {
                                const allInvoices = await prisma.invoice.findMany({
                                    where: { utilityId: inv.utilityId }
                                });
                                const unpaid = allInvoices.filter(i => i.status === 'UNPAID');
                                
                                if (unpaid.length === 0) {
                                    // PUBLISH FULLY PAID EVENT
                                    await publishMessage('registration_events', 'utility.fully_paid', {
                                        utilityId: inv.utilityId,
                                        roomId: inv.roomId,
                                        status: 'PAID'
                                    });
                                    console.log(`🏆 Room ${inv.roomId} COMPLETELY PAID utility ${inv.utilityId}`);
                                } else {
                                    console.log(`🕒 Room ${inv.roomId} utility ${inv.utilityId} still has ${unpaid.length} unpaid invoices`);
                                }
                            }
                        }
                    }
                    else if (routingKey === 'payment.failed' || routingKey === 'registration.rejected') {
                        await prisma.invoice.deleteMany({
                            where: { registrationId: content.registrationId, status: 'UNPAID' }
                        });
                    }
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error processing message:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ RabbitMQ Consumer Error:', error);
        setTimeout(consumeEvents, 5000);
    }
}

async function consumeUserEvents() {
    try {
        const { channel } = await connectRabbitMQ();
        const q = await channel.assertQueue('payment_user_queue', { durable: true });
        await channel.bindQueue(q.queue, 'user_events', 'user.deleted');
        
        console.log('📥 Waiting for user events in Payment Service...');
        
        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { userId } = content;
                const prisma = require('./prismaClient');
                
                try {
                    console.log(`🧹 Processing user deletion for Invoices: ${userId}`);
                    await prisma.invoice.deleteMany({
                        where: { studentId: userId }
                    });
                    console.log(`✅ Cleaned up invoices for Student ID: ${userId}`);
                    channel.ack(msg);
                } catch (err) {
                    console.error('❌ Error cleaning up invoices:', err);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ User Events Consumer Error:', error);
        setTimeout(consumeUserEvents, 5000);
    }
}

module.exports = { connectRabbitMQ, publishMessage, consumeEvents, consumeUserEvents };
