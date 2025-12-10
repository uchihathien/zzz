package com.example.mecha.product;

import com.example.mecha.product.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;

    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(category)
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .unitOfMeasure(request.getUnitOfMeasure())
                .attributes(request.getAttributes())
                .build();

        List<ProductTierPrice> tiers = buildTierEntities(request.getTierPrices());
        product.setTierPrices(tiers);

        product = productRepository.save(product);
        return toDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSku() != null) product.setSku(request.getSku());

        if (request.getCategoryId() != null) {
            ProductCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getBasePrice() != null) product.setBasePrice(request.getBasePrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getUnitOfMeasure() != null) product.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getAttributes() != null) product.setAttributes(request.getAttributes());

        if (request.getTierPrices() != null) {
            List<ProductTierPrice> tiers = buildTierEntities(request.getTierPrices());
            product.setTierPrices(tiers);
        }

        // Cập nhật imageUrl trực tiếp nếu có
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        return toDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
        // Lưu ý: audit log sẽ được handle bởi AOP module sau
    }

    @Transactional(readOnly = true)
    public List<ProductDto> listProducts(Long categoryId, String keyword) {
        List<Product> products;

        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else if (keyword != null && !keyword.isBlank()) {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toDto(p);
    }

    @Transactional
    public ProductDto toggleVisibility(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setHidden(!Boolean.TRUE.equals(product.getHidden()));
        return toDto(productRepository.save(product));
    }

    /**
     * Tính đơn giá áp dụng cho 1 sản phẩm theo số lượng:
     * - Nếu có tier nào thỏa (minQty <= qty <= maxQty/null), dùng unitPrice của tier đó
     * - Nếu không tìm thấy tier phù hợp → dùng basePrice
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateUnitPrice(Long productId, int quantity) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (p.getTierPrices() == null || p.getTierPrices().isEmpty()) {
            return p.getBasePrice();
        }

        return p.getTierPrices().stream()
                .sorted(Comparator.comparing(ProductTierPrice::getMinQty))
                .filter(tier -> {
                    boolean geMin = quantity >= tier.getMinQty();
                    boolean leMax = tier.getMaxQty() == null || quantity <= tier.getMaxQty();
                    return geMin && leMax;
                })
                .findFirst()
                .map(ProductTierPrice::getUnitPrice)
                .orElse(p.getBasePrice());
    }

    private List<ProductTierPrice> buildTierEntities(List<TierPriceCreateRequest> reqs) {
        List<ProductTierPrice> tiers = new ArrayList<>();
        if (reqs == null) return tiers;

        for (TierPriceCreateRequest r : reqs) {
            ProductTierPrice tier = ProductTierPrice.builder()
                    .minQty(r.getMinQty())
                    .maxQty(r.getMaxQty())
                    .unitPrice(r.getUnitPrice())
                    .build();
            tiers.add(tier);
        }
        return tiers;
    }

    private ProductDto toDto(Product p) {
        List<TierPriceDto> tiers = new ArrayList<>();
        if (p.getTierPrices() != null) {
            for (ProductTierPrice t : p.getTierPrices()) {
                tiers.add(TierPriceDto.builder()
                        .id(t.getId())
                        .minQty(t.getMinQty())
                        .maxQty(t.getMaxQty())
                        .unitPrice(t.getUnitPrice())
                        .build());
            }
        }
        List<ProductImageDto> imageDtos = new ArrayList<>();
        if (p.getImages() != null) {
            for (ProductImage img : p.getImages()) {
                imageDtos.add(ProductImageDto.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .sortOrder(img.getSortOrder())
                        .build());
            }
        }

        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .description(p.getDescription())
                .basePrice(p.getBasePrice())
                .stockQuantity(p.getStockQuantity())
                .unitOfMeasure(p.getUnitOfMeasure())
                .attributes(p.getAttributes())
                .tierPrices(tiers)
                .imageUrl(p.getImageUrl())
                .images(imageDtos)
                .hidden(p.getHidden())
                .build();
    }
}
