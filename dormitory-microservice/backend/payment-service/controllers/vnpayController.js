const prisma = require('../lib/prismaClient');
const crypto = require('crypto');
const { sortObject } = require('../lib/vnpayUtil');
const { publishMessage } = require('../lib/rabbitmq');

// Helper to format date YYYYMMDDHHmmss
function formatDate(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

const createPaymentUrl = async (req, res) => {
    try {
        const registrationId = req.body.registrationId || req.body.registration_id;
        const invoiceId = req.body.invoiceId || req.body.invoice_id;
        const amount = req.body.amount;
        const bankCode = req.body.bankCode;
        const roomId = req.body.roomId || req.body.room_id;
        
        const studentId = req.user.id; // From authMiddleware

        if ((!registrationId && !invoiceId) || !amount) {
            return res.status(400).json({ error: 'Missing registrationId/invoiceId or amount' });
        }

        // Create a payment record in PENDING state
        const payment = await prisma.payment.create({
            data: {
                registrationId: registrationId || null,
                invoiceId: invoiceId || null,
                studentId,
                roomId: roomId || null,
                amount: parseFloat(amount),
                status: 'PENDING',
                paymentMethod: 'VNPAY',
            }
        });


        const tmnCode = process.env.vnp_TmnCode;
        const secretKey = process.env.vnp_HashSecret;
        let vnpUrl = process.env.vnp_Url;
        const returnUrl = process.env.VNP_RETURN_URL;

        const date = new Date();
        const createDate = formatDate(date);
        
        // vnp_TxnRef should be unique. Using payment ID.
        const orderId = payment.id;
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = invoiceId 
            ? 'Thanh toan hoa don dien nuoc: ' + orderId 
            : 'Thanh toan dang ky phong: ' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.json({ paymentUrl: vnpUrl });
    } catch (error) {
        console.error('Create Payment URL Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const vnpayIpn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = process.env.vnp_HashSecret;
        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            // Check if payment exists
            const payment = await prisma.payment.findUnique({
                where: { id: orderId }
            });

            if (!payment) {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }

            if (payment.status !== 'PENDING') {
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (rspCode === '00') {
                // Success
                await prisma.payment.update({
                    where: { id: orderId },
                    data: { 
                        status: 'PAID',
                        paymentDate: new Date()
                    }
                });

                // PUBLISH SUCCESS EVENT
                await publishMessage('payment_events', 'payment.completed', {
                    paymentId: orderId,
                    registrationId: payment.registrationId,
                    invoiceId: payment.invoiceId,
                    studentId: payment.studentId,
                    roomId: payment.roomId, // PASS ROOM ID
                    amount: payment.amount,
                    timestamp: new Date()
                });

                res.status(200).json({ RspCode: '00', Message: 'Success' });
            } else {
                // Failed
                await prisma.payment.update({
                    where: { id: orderId },
                    data: { status: 'FAILED' }
                });

                // PUBLISH FAILURE EVENT
                await publishMessage('payment_events', 'payment.failed', {
                    paymentId: orderId,
                    registrationId: payment.registrationId,
                    reason: `VNPay Response Code: ${rspCode}`
                });

                res.status(200).json({ RspCode: '00', Message: 'Success' });
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('VNPay IPN Error:', error);
        res.status(500).json({ error: error.message });
    }
};


const rollbackPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        if (payment.status === 'PAID') {
            return res.status(400).json({ error: 'Cannot rollback a PAID payment' });
        }

        // 1. Delete Payment record (if any)
        await prisma.payment.deleteMany({ where: { id: paymentId } });

        // 2. Clear any accidental Invoices for this registration
        await prisma.invoice.deleteMany({ where: { registrationId: payment.registrationId } });

        // 3. Publish FAILURE event to trigger rollback in Registration-service
        await publishMessage('payment_events', 'payment.failed', {
            paymentId: paymentId,
            registrationId: payment.registrationId,
            reason: 'Rollback triggered by manual failure/cancellation'
        });

        res.json({ message: 'Rollback initiated successfully' });
    } catch (error) {
        console.error('Rollback Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/v1/payments/vnpay/confirm
 * Called by the frontend after being redirected back from VNPay with a successful responseCode.
 * This is needed because VNPay IPN may not reach localhost/dev environments.
 * The frontend sends the full vnp_* query params, we re-verify the signature and process.
 */
const confirmVnpayPayment = async (req, res) => {
    try {
        let vnp_Params = { ...req.body };
        const secureHash = vnp_Params['vnp_SecureHash'];

        if (!secureHash) {
            return res.status(400).json({ error: 'Missing vnp_SecureHash' });
        }

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = process.env.vnp_HashSecret;
        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash !== signed) {
            return res.status(400).json({ error: 'Invalid signature - payment cannot be confirmed', RspCode: '97' });
        }

        const rspCode = vnp_Params['vnp_ResponseCode'];
        const orderId = vnp_Params['vnp_TxnRef']; // This is our payment.id

        if (rspCode !== '00') {
            return res.status(400).json({ error: 'Payment was not successful', RspCode: rspCode });
        }

        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { id: orderId }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        // Idempotency: if already paid, return success without processing again
        if (payment.status === 'PAID') {
            console.log(`ℹ️ Payment ${orderId} already confirmed. Skipping duplicate.`);
            return res.json({ message: 'Payment already confirmed', alreadyProcessed: true });
        }

        if (payment.status !== 'PENDING') {
            return res.status(400).json({ error: `Payment is in unexpected state: ${payment.status}` });
        }

        // Mark payment as PAID
        await prisma.payment.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                paymentDate: new Date()
            }
        });
        console.log(`✅ Payment ${orderId} marked as PAID (confirmed by frontend)`);

        // PUBLISH SUCCESS EVENT → triggers registration approval, stay creation, invoice creation
        await publishMessage('payment_events', 'payment.completed', {
            paymentId: orderId,
            registrationId: payment.registrationId,
            invoiceId: payment.invoiceId,
            studentId: payment.studentId,
            roomId: payment.roomId,
            amount: payment.amount,
            timestamp: new Date()
        });
        console.log(`📤 payment.completed event published for payment ${orderId}`);

        res.json({
            message: payment.invoiceId 
                ? 'Thanh toán hóa đơn điện nước thành công.' 
                : 'Thanh toán đăng ký phòng thành công. Đang xử lý hồ sơ cư trú.',
            paymentId: orderId,
            registrationId: payment.registrationId,
            invoiceId: payment.invoiceId
        });
    } catch (error) {
        console.error('Confirm VNPay Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPaymentUrl, vnpayIpn, rollbackPayment, confirmVnpayPayment };
