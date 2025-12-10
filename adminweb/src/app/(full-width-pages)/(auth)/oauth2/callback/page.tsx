"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokens } from "@/lib/api/httpClient";

export default function OAuth2CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refreshToken");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            setLoading(false);
            return;
        }

        if (token) {
            // Save tokens
            saveTokens(token, refreshToken || "");

            // Redirect to dashboard
            router.replace("/");
        } else {
            setError("Không tìm thấy token xác thực");
            setLoading(false);
        }
    }, [searchParams, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400">Đang xử lý đăng nhập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="mb-4 text-red-500">
                        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Đăng nhập thất bại
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <a
                        href="/signin"
                        className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                        Thử lại
                    </a>
                </div>
            </div>
        );
    }

    return null;
}
