// billing/Quotation.java
package com.example.mecha.billing;

import com.example.mecha.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "quotations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Số báo giá: QUO-XXXX
    @Column(name = "quote_number", unique = true)
    private String quoteNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Ngày phát hành
    @Column(nullable = false)
    private Instant issueDate;

    // Hạn hiệu lực (optional)
    private Instant validUntil;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (issueDate == null) {
            issueDate = Instant.now();
        }
        createdAt = Instant.now();
    }
}
