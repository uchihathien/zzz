// shipping/ShippingAddress.java
package com.example.mecha.shipping;

import com.example.mecha.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "shipping_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chủ sở hữu (customer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Nhãn: "Nhà", "Cơ quan", ...
    @Column(length = 100)
    private String label;

    // Tên người nhận
    @Column(name = "recipient_name", nullable = false, length = 255)
    private String recipientName;

    // Số điện thoại nhận hàng
    @Column(nullable = false, length = 50)
    private String phone;

    // Địa chỉ chi tiết
    @Column(name = "address_line", nullable = false, length = 500)
    private String addressLine;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String ward;

    @Column(name = "is_default", nullable = false)
    private boolean defaultAddress;

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
