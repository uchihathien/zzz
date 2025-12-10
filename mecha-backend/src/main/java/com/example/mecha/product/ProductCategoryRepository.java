package com.example.mecha.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    Optional<ProductCategory> findBySlug(String slug);

    List<ProductCategory> findByParentIsNullOrderBySortOrderAsc();
}
