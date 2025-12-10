"use client";
import React, { useState, useCallback, createContext, useContext } from "react";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return context.confirm;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolvePromise?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolvePromise?.(false);
    };

    const typeStyles = {
        danger: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            ),
            confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
        },
        warning: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            ),
            confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        info: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            ),
            confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
        },
    };

    const currentType = options?.type || 'warning';
    const styles = typeStyles[currentType];

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Modal */}
            {isOpen && options && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={handleCancel}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <div className="text-center">
                            {styles.icon}

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {options.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 whitespace-pre-line">
                                {options.message}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {options.cancelText || "Hủy"}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${styles.confirmBtn}`}
                                >
                                    {options.confirmText || "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export default ConfirmProvider;
