// app/page.tsx - Homepage with Header/Footer Components
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

// Banner data
const banners = [
    {
        id: 1,
        image: "/banner/image.png",
        title: "Giải pháp Cơ khí Chuyên nghiệp",
        subtitle: "Cung cấp linh kiện, phụ tùng và dịch vụ sửa chữa cơ khí chất lượng cao",
        buttonText: "Xem sản phẩm",
        buttonLink: "/products",
    },
    {
        id: 2,
        image: "/banner/image copy.png",
        title: "Dịch vụ Sửa chữa Uy tín",
        subtitle: "Đội ngũ kỹ thuật viên chuyên nghiệp, sửa chữa nhanh chóng, bảo hành đầy đủ",
        buttonText: "Đặt lịch dịch vụ",
        buttonLink: "/services",
    },
    {
        id: 3,
        image: "/banner/image copy 2.png",
        title: "Giao hàng Toàn quốc",
        subtitle: "Đặt hàng online, giao hàng tận nơi với giá ưu đãi nhất",
        buttonText: "Mua ngay",
        buttonLink: "/products",
    },
];

export default function HomePage() {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextBanner = useCallback(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, []);

    const prevBanner = useCallback(() => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }, []);

    const goToBanner = (index: number) => {
        setCurrentBanner(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 5 seconds
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextBanner, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextBanner]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            {/* Banner Carousel */}
            <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                {/* Slides */}
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentBanner
                            ? "opacity-100 translate-x-0"
                            : index < currentBanner
                                ? "opacity-0 -translate-x-full"
                                : "opacity-0 translate-x-full"
                            }`}
                    >
                        {/* Background Image */}
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="max-w-5xl mx-auto px-6 md:px-12 w-full">
                                <div className="max-w-xl">
                                    <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-all duration-500 delay-200 ${index === currentBanner ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                        }`}>
                                        {banner.title}
                                    </h1>
                                    <p className={`text-lg md:text-xl text-white/90 mb-8 transition-all duration-500 delay-300 ${index === currentBanner ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                        }`}>
                                        {banner.subtitle}
                                    </p>
                                    <Link
                                        href={banner.buttonLink}
                                        className={`inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-500 delay-400 shadow-lg hover:shadow-xl ${index === currentBanner ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                            }`}
                                    >
                                        {banner.buttonText}
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
                    aria-label="Previous banner"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={nextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
                    aria-label="Next banner"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToBanner(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentBanner
                                ? "w-10 h-3 bg-white"
                                : "w-3 h-3 bg-white/50 hover:bg-white/75"
                                }`}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentBanner + 1) / banners.length) * 100}%` }}
                    />
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard value="500+" label="Sản phẩm" />
                        <StatCard value="1000+" label="Khách hàng" />
                        <StatCard value="50+" label="Kỹ thuật viên" />
                        <StatCard value="24/7" label="Hỗ trợ" />
                    </div>
                </div>
            </section>


            {/* Features */}
            <section className="py-16 px-4 flex-1">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Dịch vụ của chúng tôi</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Giải pháp toàn diện cho nhu cầu cơ khí của bạn</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="🔧"
                            title="Sản phẩm cơ khí"
                            description="Linh kiện, phụ tùng, vật tư cơ khí chất lượng cao với giá cạnh tranh"
                            link="/products"
                            color="blue"
                        />
                        <FeatureCard
                            icon="🛠️"
                            title="Dịch vụ sửa chữa"
                            description="Đội ngũ kỹ thuật viên chuyên nghiệp, sửa chữa nhanh chóng"
                            link="/services"
                            color="green"
                        />
                        <FeatureCard
                            icon="🚚"
                            title="Giao hàng tận nơi"
                            description="Giao hàng nhanh chóng, đóng gói cẩn thận, bảo hành đầy đủ"
                            link="/products"
                            color="orange"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-slate-100">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                            Bạn cần tư vấn?
                        </h2>
                        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                            Liên hệ với chúng tôi để được tư vấn miễn phí về giải pháp cơ khí phù hợp nhất
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/products"
                                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
                            >
                                Xem sản phẩm
                            </Link>
                            <Link
                                href="/bookings/create"
                                className="px-8 py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Đặt lịch tư vấn
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 font-mono tracking-tight">{value}</div>
            <div className="text-slate-600">{label}</div>
        </div>
    );
}


function FeatureCard({ icon, title, description, link, color }: {
    icon: string;
    title: string;
    description: string;
    link: string;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 border-blue-100 hover:border-blue-300",
        green: "bg-green-50 border-green-100 hover:border-green-300",
        orange: "bg-orange-50 border-orange-100 hover:border-orange-300",
    };

    return (
        <Link href={link} className={`group p-6 rounded-2xl border-2 transition-all ${colorClasses[color]}`}>
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
        </Link>
    );
}
