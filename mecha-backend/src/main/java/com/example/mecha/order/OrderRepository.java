// order/OrderRepository.java
package com.example.mecha.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Order> findByOrderCode(String orderCode); // NEW
    
    // Method findAll ordered by createdAt descending (tránh null param issue)
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("""
           SELECT o FROM Order o
           WHERE (:status IS NULL OR o.status = :status)
             AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)
             AND (:from IS NULL OR o.createdAt >= :from)
             AND (:to IS NULL OR o.createdAt <= :to)
           ORDER BY o.createdAt DESC
           """)
    List<Order> searchForAdmin(
            @Param("status") OrderStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    // Find expired unpaid BANK_TRANSFER orders for auto-cancel
    List<Order> findByPaymentMethodAndPaymentStatusAndStatusAndCreatedAtBefore(
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            OrderStatus status,
            Instant createdAtBefore
    );
}
