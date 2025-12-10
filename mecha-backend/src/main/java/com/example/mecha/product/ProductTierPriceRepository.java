package com.example.mecha.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductTierPriceRepository extends JpaRepository<ProductTierPrice, Long> {

    List<ProductTierPrice> findByProductIdOrderByMinQtyAsc(Long productId);
}
