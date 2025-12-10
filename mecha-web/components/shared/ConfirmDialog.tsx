// components/shared/ConfirmDialog.tsx
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { AlertTriangle, X, Trash2, XCircle } from "lucide-react";

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    icon?: ReactNode;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return context.confirm;
}

interface DialogState extends ConfirmOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        message: "",
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                ...options,
                isOpen: true,
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        dialog.resolve?.(true);
        setDialog((prev) => ({ ...prev, isOpen: false }));
    }, [dialog.resolve]);

    const handleCancel = useCallback(() => {
        dialog.resolve?.(false);
        setDialog((prev) => ({ ...prev, isOpen: false }));
    }, [dialog.resolve]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && dialog.isOpen) {
                handleCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dialog.isOpen, handleCancel]);

    const getTypeStyles = () => {
        switch (dialog.type) {
            case "danger":
                return {
                    iconBg: "bg-red-100",
                    iconColor: "text-red-600",
                    buttonBg: "bg-red-600 hover:bg-red-700",
                    icon: dialog.icon || <Trash2 className="w-6 h-6" />,
                };
            case "warning":
                return {
                    iconBg: "bg-yellow-100",
                    iconColor: "text-yellow-600",
                    buttonBg: "bg-yellow-600 hover:bg-yellow-700",
                    icon: dialog.icon || <AlertTriangle className="w-6 h-6" />,
                };
            default:
                return {
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    buttonBg: "bg-blue-600 hover:bg-blue-700",
                    icon: dialog.icon || <AlertTriangle className="w-6 h-6" />,
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Overlay */}
            <div
                className={`fixed inset-0 z-[100] transition-all duration-300 ${dialog.isOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleCancel}
                />

                {/* Dialog */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div
                        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${dialog.isOpen
                                ? "scale-100 opacity-100 translate-y-0"
                                : "scale-95 opacity-0 translate-y-4"
                            }`}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div
                                    className={`w-16 h-16 rounded-full ${styles.iconBg} ${styles.iconColor} flex items-center justify-center`}
                                >
                                    {styles.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {dialog.title || "Xác nhận"}
                            </h3>

                            {/* Message */}
                            <p className="text-slate-600 text-center mb-6">
                                {dialog.message}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    {dialog.cancelText || "Hủy"}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-colors ${styles.buttonBg}`}
                                >
                                    {dialog.confirmText || "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ConfirmContext.Provider>
    );
}
