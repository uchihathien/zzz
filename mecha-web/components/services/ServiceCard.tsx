// components/services/ServiceCard.tsx
"use client";

import Link from "next/link";
import type { ServiceDto } from "@/lib/types";
import { getServiceTypeLabel, formatPrice, formatDuration } from "@/lib/services-api";

interface ServiceCardProps {
    service: ServiceDto;
}

export function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Link href={`/services/${service.id}`}>
            <div className="group bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-50 group-hover:text-indigo-400 transition-colors">
                            {service.name}
                        </h3>
                        {service.code && (
                            <p className="text-xs text-slate-500 mt-1">Mã: {service.code}</p>
                        )}
                    </div>

                    {/* Type Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                        {getServiceTypeLabel(service.type)}
                    </span>
                </div>

                {/* Description */}
                {service.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">
                        {service.description}
                    </p>
                )}

                {/* Info */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Giá dịch vụ:</span>
                        <span className="text-lg font-bold text-indigo-400">
                            {formatPrice(service.basePrice)}
                        </span>
                    </div>

                    {service.durationMinutes && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Thời gian:</span>
                            <span className="text-slate-200">{formatDuration(service.durationMinutes)}</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-4">
                    <div className="text-sm text-indigo-400 group-hover:text-indigo-300 flex items-center gap-2">
                        <span>Xem chi tiết</span>
                        <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        CLEANING: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        MAINTENANCE: "bg-green-500/20 text-green-400 border border-green-500/30",
        REPAIR: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        OTHER: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    };
    return colors[type] || colors.OTHER;
}
