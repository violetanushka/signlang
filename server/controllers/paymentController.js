const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Progress = require("../models/Progress");

// NOTE: Razorpay is stubbed until API keys are provided.
// When keys are added, uncomment the Razorpay initialization.

// const Razorpay = require("razorpay");
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// @desc    Create payment order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Check if already purchased
    const user = await User.findById(req.user._id);
    const alreadyPurchased = user.purchasedCourses.find(
      (p) => p.courseId.toString() === courseId
    );
    if (alreadyPurchased) {
      return res.status(400).json({ message: "Course already purchased." });
    }

    // Check for discount eligibility (score ≥ 90% in previous level)
    let discountPercent = 0;
    const levelOrder = ["beginner", "intermediate", "pro"];
    const currentLevelIdx = levelOrder.indexOf(course.level);

    if (currentLevelIdx > 0) {
      const prevLevel = levelOrder[currentLevelIdx - 1];
      const prevCourse = await Course.findOne({ level: prevLevel });
      if (prevCourse) {
        const prevProgress = await Progress.find({
          userId: req.user._id,
          courseId: prevCourse._id,
        });
        if (prevProgress.length > 0) {
          const avgScore =
            prevProgress.reduce((s, p) => s + p.bestScore, 0) / prevProgress.length;
          if (avgScore >= 90) {
            discountPercent = 15; // 15% discount
          }
        }
      }
    }

    const originalAmount = course.price;
    const finalAmount = Math.round(originalAmount * (1 - discountPercent / 100));

    // STUBBED: In production, create Razorpay order
    // const order = await razorpay.orders.create({
    //   amount: finalAmount * 100, // paise
    //   currency: "INR",
    //   receipt: `rcpt_${Date.now()}`,
    // });

    const stubbedOrderId = `order_stub_${Date.now()}`;

    const payment = await Payment.create({
      userId: req.user._id,
      courseId,
      amount: finalAmount,
      originalAmount,
      discountPercent,
      razorpayOrderId: stubbedOrderId,
      status: "created",
    });

    res.json({
      orderId: stubbedOrderId,
      amount: finalAmount,
      originalAmount,
      discountPercent,
      currency: "INR",
      courseName: course.title,
      paymentId: payment._id,
      // In production: key: process.env.RAZORPAY_KEY_ID,
      stubbed: true,
      message: "Payment integration is stubbed. Add Razorpay keys to enable.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment (stub)
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId: razorpayPaymentId } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // STUBBED: In production, verify Razorpay signature
    // const crypto = require("crypto");
    // const sign = orderId + "|" + razorpayPaymentId;
    // const expectedSign = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(sign)
    //   .digest("hex");

    // Mark as paid (stubbed)
    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId || `pay_stub_${Date.now()}`;
    await payment.save();

    // Add course to user's purchased list
    const user = await User.findById(req.user._id);
    user.purchasedCourses.push({
      courseId: payment.courseId,
      paymentId: payment._id.toString(),
    });
    await user.save();

    res.json({
      message: "Payment verified successfully.",
      payment,
    });
  } catch (error) {
    next(error);
  }
};
