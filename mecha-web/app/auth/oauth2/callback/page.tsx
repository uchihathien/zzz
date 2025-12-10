// app/auth/oauth2/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");
    const from = searchParams.get("from") ?? "/";

    if (error) {
      let errorMessage = "Không nhận được token hợp lệ.";
      if (error === "ACCOUNT_SUSPENDED") {
        errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị.";
      }
      setStatus("error");
      setMessage(errorMessage);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
      }, 2000);
      return;
    }

    if (accessToken && refreshToken) {
      // Save tokens to localStorage
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      setStatus("success");
      setMessage("Đăng nhập thành công! Đang chuyển hướng...");

      // Redirect to home or requested page
      setTimeout(() => {
        router.push(from);
        // Force reload to update auth state
        window.location.href = from;
      }, 500);
    } else {
      setStatus("error");
      setMessage("Không nhận được token hợp lệ.");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="animate-spin w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Đang xử lý đăng nhập...</h2>
            <p className="text-slate-500 mt-2">Vui lòng chờ trong giây lát</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-700">{message}</h2>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700">Đăng nhập thất bại</h2>
            <p className="text-slate-500 mt-2">{message}</p>
            <p className="text-sm text-slate-400 mt-4">Đang chuyển về trang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Đang tải...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
