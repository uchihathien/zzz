// components/shared/Footer.tsx
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo size="small" clickable={false} />
                            <span className="text-xl font-bold">Getabec</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Giải pháp cơ khí chuyên nghiệp cho mọi nhu cầu. Cung cấp sản phẩm và dịch vụ chất lượng cao.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Linh kiện cơ khí
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Phụ tùng máy
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Vật tư công nghiệp
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Thiết bị đo lường
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Dịch vụ */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Dịch vụ</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Sửa chữa máy móc
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Bảo trì định kỳ
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Vệ sinh công nghiệp
                                </Link>
                            </li>
                            <li>
                                <Link href="/bookings/create" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Đặt lịch tư vấn
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>1900 1234</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@getabec.vn</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>123 Đường ABC, Quận 1<br />TP. Hồ Chí Minh</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} Getabec. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <Link href="#" className="hover:text-white transition-colors">Điều khoản</Link>
                            <Link href="#" className="hover:text-white transition-colors">Chính sách</Link>
                            <Link href="#" className="hover:text-white transition-colors">Hỗ trợ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
