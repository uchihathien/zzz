// booking/Booking.java
package com.example.mecha.booking;

import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import com.example.mecha.servicecatalog.ServiceEntity;
import com.example.mecha.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dịch vụ đã chọn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    // Khách hàng đặt lịch
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Kỹ thuật viên được phân công (có thể null lúc mới đặt)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;

    // Thời điểm hẹn (ngày + giờ)
    @Column(nullable = false)
    private OffsetDateTime scheduledAt;

    // Địa chỉ thực hiện dịch vụ
    @Column(nullable = false, length = 500)
    private String addressLine;

    // Số điện thoại liên hệ
    @Column(nullable = false, length = 50)
    private String contactPhone;

    // Ghi chú từ khách / nội bộ
    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    // Payment method and status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Snapshot giá tại thời điểm đặt
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal priceAtBooking;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = BookingStatus.PENDING;
        if (paymentMethod == null) paymentMethod = PaymentMethod.COD;
        if (paymentStatus == null) paymentStatus = PaymentStatus.PENDING;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
