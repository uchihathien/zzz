// components/Providers.tsx
"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ConfirmProvider } from "@/components/shared/ConfirmDialog";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <ConfirmProvider>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#fff',
                            color: '#1e293b',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#22c55e',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </ConfirmProvider>
        </AuthProvider>
    );
}
