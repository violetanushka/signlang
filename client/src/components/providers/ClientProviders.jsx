"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AccessibilityToolbar from "@/components/accessibility/AccessibilityToolbar";

export default function ClientProviders({ children }) {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AccessibilityToolbar />
        {children}
      </AuthProvider>
    </AccessibilityProvider>
  );
}
