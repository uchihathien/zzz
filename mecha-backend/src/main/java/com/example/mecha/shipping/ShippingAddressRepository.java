// shipping/ShippingAddressRepository.java
package com.example.mecha.shipping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    List<ShippingAddress> findByUserIdOrderByCreatedAtDesc(Long userId);

    Long countByUserId(Long userId);

    Optional<ShippingAddress> findByIdAndUserId(Long id, Long userId);

    Optional<ShippingAddress> findByUserIdAndDefaultAddressTrue(Long userId);
}
