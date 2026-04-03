"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import { HiOutlineAcademicCap, HiOutlineDownload, HiOutlineEye } from "react-icons/hi2";

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCerts = async () => {
      try {
        const res = await api.get("/certificates");
        setCertificates(res.data.certificates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 mt-20 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-[var(--text-primary)]">
            My Certificates
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            View and manage your verified sign language credentials.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center mb-4 text-4xl">🎓</div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">No Certificates Yet</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mb-6">
              Complete a course with passing grades on all assessments to earn your first verified certificate.
            </p>
            <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {certificates.map(cert => (
              <div key={cert._id} className="glass-card overflow-hidden group border border-[var(--glass-border)]">
                
                {/* Visual Certificate Representation */}
                <div className="h-48 relative border-b border-[var(--glass-border)] flex flex-col items-center justify-center p-6 bg-[var(--bg-secondary)] overflow-hidden">
                  {/* Decorative background overlay */}
                  <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 2px, transparent 2px, transparent 8px)" }} />
                  
                  <HiOutlineAcademicCap className="w-12 h-12 text-[var(--primary)] mb-3 relative z-10" />
                  <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] relative z-10 text-center uppercase tracking-widest">{cert.courseName}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mt-2 relative z-10">
                    Official Certification
                  </p>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6 border-b border-[var(--glass-border)] pb-4">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Issued To</p>
                      <p className="font-bold text-lg text-[var(--text-primary)]">{cert.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Score</p>
                      <p className="font-bold text-lg text-[var(--success)]">{cert.score}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium">Issue Date</p>
                      <p className="text-[var(--text-primary)] font-medium">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium">Credential ID</p>
                      <p className="text-[var(--text-primary)] font-mono text-xs mt-1 bg-[var(--bg-secondary)] p-1 rounded inline-block">{cert.uniqueId}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/certificates/verify/${cert.uniqueId}`} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                      <HiOutlineEye className="w-4 h-4" /> View Public
                    </Link>
                    {/* Simulated Download button (requires separate PDF generation logic for production) */}
                    <button className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                      <HiOutlineDownload className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
