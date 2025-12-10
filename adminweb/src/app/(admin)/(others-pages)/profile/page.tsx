"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { vi } from "@/i18n";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">{vi.messages.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">Chưa đăng nhập</p>
      </div>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get role display name
  const getRoleName = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "STAFF":
        return "Nhân viên";
      case "TECHNICIAN":
        return "Kỹ thuật viên";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return role;
    }
  };

  // Get status display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Hoạt động
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Bị khóa
          </span>
        );
      case "PENDING_VERIFICATION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Chờ xác minh
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Hồ sơ cá nhân
        </h3>

        {/* Profile Card */}
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              {/* Avatar */}
              <div className="w-24 h-24 overflow-hidden border-2 border-brand-200 rounded-full dark:border-brand-800 flex items-center justify-center bg-brand-100 dark:bg-brand-900">
                {user.avatar ? (
                  <Image
                    width={96}
                    height={96}
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-brand-600 dark:text-brand-300">
                    {getInitials(user.fullName)}
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="order-3 xl:order-2 text-center xl:text-left">
                <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                  {user.fullName}
                </h4>
                <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {getRoleName(user.role)}
                  </span>
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>

            {/* Provider Badge */}
            <div className="flex items-center justify-center xl:justify-end">
              {user.provider === "GOOGLE" ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                      fill="#EB4335"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Đăng nhập qua Google
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Đăng nhập qua Email
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mt-6 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Thông tin cá nhân
          </h4>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Họ và tên
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {user.fullName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Số điện thoại
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {user.phone || "Chưa cập nhật"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Vai trò
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {getRoleName(user.role)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Trạng thái tài khoản
              </p>
              <div>{getStatusBadge(user.status)}</div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Ngày tạo tài khoản
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="mt-6 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Bảo mật tài khoản
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg">
                  <svg
                    className="w-5 h-5 text-brand-600 dark:text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    Mật khẩu
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.provider === "LOCAL"
                      ? "Đã thiết lập mật khẩu"
                      : "Đăng nhập qua Google - không cần mật khẩu"}
                  </p>
                </div>
              </div>
              {user.provider === "LOCAL" && (
                <button className="px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                  Đổi mật khẩu
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    Xác thực email
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.status === "ACTIVE"
                      ? "Email đã được xác thực"
                      : "Email chưa được xác thực"}
                  </p>
                </div>
              </div>
              {user.status === "ACTIVE" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Đã xác thực
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
