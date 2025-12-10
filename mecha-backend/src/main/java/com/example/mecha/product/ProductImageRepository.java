// product/ProductImageRepository.java
package com.example.mecha.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAscCreatedAtAsc(Long productId);

    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);
}
