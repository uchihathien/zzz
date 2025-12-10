// servicecatalog/ServiceEntity.java
package com.example.mecha.servicecatalog;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên dịch vụ
    @Column(nullable = false)
    private String name;

    // Mã dịch vụ (unique), ví dụ: CLEANING_AC
    @Column(unique = true)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType type;

    // Đơn giá cơ bản
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal basePrice;

    // Thời lượng dự kiến (phút)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (status == null) status = ServiceStatus.ACTIVE;
        if (type == null) type = ServiceType.OTHER;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
