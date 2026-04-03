"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import { HiOutlineCheckBadge, HiOutlineXCircle } from "react-icons/hi2";

export default function VerifyCertificatePage() {
  const { uniqueId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/certificates/verify/${uniqueId}`);
        setData(res.data);
      } catch (err) {
        setData({ valid: false, message: "Certificate not found or invalid." });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 mt-20 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Credential Verification</h1>
            <p className="text-[var(--text-secondary)] mt-2">Signa Authentic Accreditation System</p>
          </div>

          <div className="glass-card p-8 sm:p-12 relative overflow-hidden border-2 shadow-2xl transition-all duration-300"
               style={{ borderColor: data?.valid ? "var(--success)" : "var(--error)" }}>
            
            {/* Status Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
              {data?.valid ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[var(--success)]">
                    <HiOutlineCheckBadge className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--success)] uppercase tracking-wide">Verified Credential</h2>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">This certificate is fully valid and authentic.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-[var(--error)]">
                    <HiOutlineXCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--error)] uppercase tracking-wide">Invalid Credential</h2>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{data?.message}</p>
                  </div>
                </>
              )}
            </div>

            {/* Certificate Details */}
            {data?.valid && data.certificate && (
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)]">
                
                <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Recipient</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{data.certificate.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Credential ID</p>
                    <p className="text-lg font-mono text-[var(--text-primary)]">{data.certificate.uniqueId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Certification Completed</p>
                    <p className="text-lg font-bold text-[var(--primary)]">{data.certificate.courseName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Issue Date</p>
                    <p className="text-lg font-medium text-[var(--text-primary)]">{new Date(data.certificate.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Final Score</p>
                    <div className="inline-block px-3 py-1 bg-[rgba(16,185,129,0.1)] text-[var(--success)] font-bold rounded-lg text-lg">
                      {data.certificate.score}%
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            <div className="mt-10 text-center">
              <Link href="/" className="text-sm font-bold text-[var(--primary)] hover:underline">
                Learn more about Signa
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
