// app/(auth)/layout.tsx - Auth Layout with White/Blue Theme
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Logo size="small" clickable={false} />
          <span className="text-xl font-bold text-slate-800">Getabec</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Getabec. All rights reserved.
      </footer>
    </div>
  );
}
