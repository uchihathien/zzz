package com.example.mecha.product;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên sản phẩm
    @Column(nullable = false)
    private String name;

    // Mã SKU
    @Column(unique = true)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Giá cơ bản (fallback nếu không có tier price)
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal basePrice;

    // Tồn kho
    @Column(nullable = false)
    private Integer stockQuantity;

    // Đơn vị: cái, bộ, kg,...
    private String unitOfMeasure;

    // Thuộc tính kỹ thuật động → map thành JSONB
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> attributes = new HashMap<>();


    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("minQty ASC")
    @Builder.Default
    private List<ProductTierPrice> tierPrices = new ArrayList<>();
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, createdAt ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    // Ẩn sản phẩm (soft delete)
    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean hidden = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
    }
    public void addImage(ProductImage img) {
        images.add(img);
        img.setProduct(this);
    }

    public void removeImage(ProductImage img) {
        images.remove(img);
        img.setProduct(null);
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public void setTierPrices(List<ProductTierPrice> tierPrices) {
        if (this.tierPrices == null) {
            this.tierPrices = new ArrayList<>();
        }
        this.tierPrices.clear();
        if (tierPrices != null) {
            for (ProductTierPrice p : tierPrices) {
                p.setProduct(this);
                this.tierPrices.add(p);
            }
        }
    }
}
