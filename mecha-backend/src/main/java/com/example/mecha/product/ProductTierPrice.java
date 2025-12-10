package com.example.mecha.product;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_tier_prices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTierPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sản phẩm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Số lượng tối thiểu
    @Column(nullable = false)
    private Integer minQty;

    // Số lượng tối đa (null = không giới hạn)
    private Integer maxQty;

    // Đơn giá áp dụng cho tier này
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;
}
