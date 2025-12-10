// components/bookings/BookingCard.tsx
"use client";

import Link from "next/link";
import type { BookingDto } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/bookings-api";

interface BookingCardProps {
    booking: BookingDto;
}

export function BookingCard({ booking }: BookingCardProps) {
    return (
        <Link href={`/bookings/${booking.id}`}>
            <div className="group bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-50 group-hover:text-indigo-400 transition-colors mb-1">
                            {booking.serviceName || `Booking #${booking.id}`}
                        </h3>
                        <p className="text-sm text-slate-500">
                            Mã: #{booking.id}
                        </p>
                    </div>
                    <StatusBadge status={booking.status} />
                </div>

                {/* Info Grid */}
                <div className="space-y-3">
                    {/* Schedule */}
                    <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-300">{formatDateTime(booking.scheduledAt)}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 text-sm">
                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-slate-400 line-clamp-1">{booking.addressLine}</span>
                    </div>

                    {/* Technician */}
                    {booking.technicianName && (
                        <div className="flex items-center gap-3 text-sm">
                            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-slate-400">KTV: {booking.technicianName}</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Giá dịch vụ:</span>
                        <span className="text-lg font-bold text-indigo-400">
                            {formatPrice(booking.priceAtBooking)}
                        </span>
                    </div>
                </div>

                {/* View Detail */}
                <div className="mt-4 text-sm text-indigo-400 group-hover:text-indigo-300 flex items-center gap-2">
                    <span>Xem chi tiết</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
