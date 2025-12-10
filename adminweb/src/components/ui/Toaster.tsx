"use client";
import React from "react";
import toast, { Toaster as HotToaster, Toast } from "react-hot-toast";

// Custom toast renderer with Tailwind
const CustomToast = ({ t, message, type }: { t: Toast; message: string; type: 'success' | 'error' | 'info' | 'warning' | 'loading' }) => {
    const baseClasses = "max-w-md w-full shadow-2xl rounded-xl pointer-events-auto flex items-center gap-3 p-4 transition-all duration-300";

    const typeClasses = {
        success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
        error: "bg-gradient-to-r from-red-500 to-rose-600 text-white",
        info: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
        warning: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
        loading: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
    };

    const icons = {
        success: (
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
        error: (
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        ),
        info: (
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        warning: (
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        ),
        loading: (
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        ),
    };

    return (
        <div
            className={`${baseClasses} ${typeClasses[type]} ${t.visible ? 'animate-enter opacity-100 translate-x-0' : 'animate-leave opacity-0 translate-x-full'
                }`}
        >
            {icons[type]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            {type !== 'loading' && (
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// Toaster component with Tailwind styling
export const Toaster = () => (
    <HotToaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName="!top-20 !right-5"
        containerStyle={{
            zIndex: 99999,
        }}
        toastOptions={{
            duration: 4000,
        }}
    />
);

// Custom toast functions
export const showSuccess = (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />, {
        duration: 4000,
    });
};

export const showError = (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, {
        duration: 5000,
    });
};

export const showInfo = (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="info" />, {
        duration: 4000,
    });
};

export const showWarning = (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, {
        duration: 4500,
    });
};

export const showLoading = (message: string) => {
    return toast.custom((t) => <CustomToast t={t} message={message} type="loading" />, {
        duration: Infinity,
    });
};

export const dismissToast = (id: string) => {
    toast.dismiss(id);
};

// Promise-based toast
export const showPromise = <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
) => {
    const id = showLoading(messages.loading);

    return promise
        .then((result) => {
            toast.dismiss(id);
            showSuccess(messages.success);
            return result;
        })
        .catch((error) => {
            toast.dismiss(id);
            showError(messages.error);
            throw error;
        });
};

// Re-export original toast for fallback
export { toast };
