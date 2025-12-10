// payment/sepay/SepayTransaction.java
package com.example.mecha.payment.sepay;

import com.example.mecha.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sepay_transactions",
        uniqueConstraints = @UniqueConstraint(columnNames = "sepay_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SepayTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID giao dịch trên SePay
    @Column(name = "sepay_id", nullable = false)
    private Long sepayId;

    @Column(length = 100)
    private String gateway;

    @Column(name = "transaction_date")
    private Instant transactionDate;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(length = 100)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "transfer_type", length = 10)
    private String transferType; // "in" / "out"

    @Column(name = "transfer_amount", precision = 18, scale = 2)
    private BigDecimal transferAmount;

    @Column(precision = 18, scale = 2)
    private BigDecimal accumulated;

    @Column(name = "sub_account", length = 100)
    private String subAccount;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Đơn hàng match được từ code
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
