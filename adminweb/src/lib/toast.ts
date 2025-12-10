/**
 * Custom Toast Utility - Beautiful toast notifications
 */
import toast from 'react-hot-toast';

// Success toast with custom icon
export const showSuccess = (message: string) => {
    toast.success(message, {
        icon: '✅',
    });
};

// Error toast with custom icon
export const showError = (message: string) => {
    toast.error(message, {
        icon: '❌',
    });
};

// Info toast
export const showInfo = (message: string) => {
    toast(message, {
        icon: 'ℹ️',
        style: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
        },
    });
};

// Warning toast
export const showWarning = (message: string) => {
    toast(message, {
        icon: '⚠️',
        style: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            border: 'none',
        },
    });
};

// Loading toast with promise
export const showLoading = (message: string) => {
    return toast.loading(message, {
        icon: '⏳',
    });
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

// Promise toast - handles loading, success, error states automatically
export const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    }
) => {
    return toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
    });
};

// Custom styled toast for special occasions
export const showCustom = (message: string, options?: {
    icon?: string;
    bgColor?: string;
    textColor?: string;
    duration?: number;
}) => {
    toast(message, {
        icon: options?.icon || '🔔',
        duration: options?.duration || 4000,
        style: {
            background: options?.bgColor || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: options?.textColor || '#fff',
            border: 'none',
        },
    });
};

// Export default toast for direct use
export { toast };
