// components/bookings/StatusBadge.tsx
import type { BookingStatus } from "@/lib/types";
import { getBookingStatusLabel, getBookingStatusColor } from "@/lib/bookings-api";

interface StatusBadgeProps {
    status: BookingStatus;
    className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusColor(status)} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {getBookingStatusLabel(status)}
        </span>
    );
}
