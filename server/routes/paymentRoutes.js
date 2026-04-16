const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { auth } = require("../middleware/auth");

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const secret    = process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  if (!secret || !signature) {
    console.warn('Razorpay webhook: missing secret or signature — ignored');
    return res.json({ status: 'ignored' });
  }
  const crypto = require('crypto');
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (signature !== expected) {
    console.warn('Razorpay webhook: invalid signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }
  const event = JSON.parse(req.body.toString());
  console.log('Razorpay event:', event.event);
  (async () => {
    try {
      if (event.event === 'payment.captured') {
        const { order_id, id: payment_id } = event.payload.payment.entity;
        const Payment = require('../models/Payment');
        const payment = await Payment.findOneAndUpdate(
          { razorpayOrderId: order_id },
          { razorpayPaymentId: payment_id, status: 'paid', paidAt: new Date() },
          { new: true }
        );
        if (payment) {
          const User = require('../models/User');
          await User.findByIdAndUpdate(payment.userId, { plan: payment.plan });
          console.log(`Payment captured: user=${payment.userId} plan=${payment.plan}`);
        }
      }
      if (event.event === 'payment.failed') {
        const Payment = require('../models/Payment');
        await Payment.findOneAndUpdate(
          { razorpayOrderId: event.payload.payment.entity.order_id },
          { status: 'failed' }
        );
      }
    } catch (err) {
      console.error('Webhook handler error:', err.message);
    }
  })();
  return res.json({ status: 'ok' });
});

module.exports = router;
