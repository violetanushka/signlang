"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import { HiOutlineShieldCheck, HiOutlineCreditCard, HiOutlineAcademicCap } from "react-icons/hi2";

export default function CheckoutPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const initCheckout = async () => {
      try {
        const resCourse = await api.get(`/courses/${courseId}`);
        setCourse(resCourse.data.course);

        // Intentionally create order immediately to check discounts
        const resOrder = await api.post("/payments/create-order", { courseId });
        setOrderData(resOrder.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize checkout.");
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [courseId, user, router]);

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      if (orderData.stubbed) {
        // Simulating the Razorpay popup delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Directly hit verify endpoint (stub logic)
        const resVerify = await api.post("/payments/verify", {
          orderId: orderData.orderId,
          paymentId: `pay_stub_${Date.now()}`
        });
        
        // Success
        router.push(`/courses/${courseId}?success=true`);
      } else {
        // Real Razorpay implementation would go here
        setError("Razorpay not yet configured for production.");
        setProcessing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
      setProcessing(false);
    }
  };

  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Checkout Error</h2>
        <p className="text-[var(--text-secondary)] mb-6">{error}</p>
        <button onClick={() => router.push("/courses")} className="btn btn-primary">Back to Courses</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 mt-20 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Secure Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HiOutlineAcademicCap className="w-6 h-6 text-[var(--primary)]" />
                Order Summary
              </h2>

              <div className="flex gap-4 items-start mb-6">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: course.color }}
                >
                  {course.title.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">{course.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{course.level} Level • {course.totalLessons} Lessons</p>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-[var(--glass-border)] pt-4">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Course Price</span>
                  <span>₹{orderData?.originalAmount}</span>
                </div>
                
                {orderData?.discountPercent > 0 && (
                  <div className="flex justify-between text-[var(--success)] font-medium">
                    <span>Performance Discount ({orderData.discountPercent}%)</span>
                    <span>- ₹{orderData.originalAmount - orderData.amount}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg text-[var(--text-primary)] pt-3 border-t border-[var(--glass-border)]">
                  <span>Total Amount</span>
                  <span>₹{orderData?.amount}</span>
                </div>
              </div>
            </div>

            <div className="glass-sm p-4 flex items-start gap-3 bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)]">
              <HiOutlineShieldCheck className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-secondary)]">
                Secure 256-bit encrypted payment via Razorpay. Your data is never stored on our servers.
              </p>
            </div>
          </div>

          {/* Payment Action */}
          <div>
            <div className="glass-card p-6 border-t-4 border-[var(--primary)]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HiOutlineCreditCard className="w-6 h-6 text-[var(--primary)]" />
                Payment Details
              </h2>
              
              {error && (
                <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {orderData?.stubbed && (
                <div className="p-4 mb-6 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-600 dark:text-orange-400">
                  <p className="font-bold mb-1">Development Mode Active</p>
                  <p>Payments are currently stubbed. Clicking pay will simulate a successful transaction without charging anything.</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Account Email</label>
                  <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg text-sm text-[var(--text-primary)]">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={processing || !orderData}
                className={`btn btn-primary btn-lg w-full flex items-center justify-center gap-2 ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{orderData?.amount}</>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
