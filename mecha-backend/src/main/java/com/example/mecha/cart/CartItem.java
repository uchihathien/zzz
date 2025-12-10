// cart/CartItem.java
package com.example.mecha.cart;

import com.example.mecha.product.Product;
import com.example.mecha.servicecatalog.ServiceEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Giỏ hàng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CartItemType itemType;

    // Nếu là PRODUCT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Nếu là SERVICE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    @Column(nullable = false)
    private Integer quantity;

    // Đơn giá tại thời điểm thêm vào giỏ
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    // Tổng tiền dòng = quantity * unitPrice
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal lineTotal;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
