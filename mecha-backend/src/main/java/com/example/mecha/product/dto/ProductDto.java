package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@Schema(description = "Thông tin sản phẩm cơ khí")
public class ProductDto {

    @Schema(example = "10")
    private Long id;

    @Schema(example = "Bulong M10x50 Thép 8.8")
    private String name;

    @Schema(example = "BL-M10x50-8.8")
    private String sku;

    @Schema(description = "ID danh mục", example = "2")
    private Long categoryId;

    @Schema(description = "Tên danh mục", example = "Bulong lục giác")
    private String categoryName;

    private String description;

    @Schema(description = "Giá cơ bản", example = "5000")
    private BigDecimal basePrice;

    @Schema(description = "Tồn kho hiện tại", example = "1000")
    private Integer stockQuantity;

    @Schema(description = "Đơn vị tính", example = "cái")
    private String unitOfMeasure;

    @Schema(description = "Thuộc tính kỹ thuật", example = "{\"material\":\"Thép 8.8\"}")
    private Map<String, String> attributes;

    @Schema(description = "Danh sách giá theo số lượng")
    private List<TierPriceDto> tierPrices;

    @Schema(description = "URL ảnh chính (thumbnail) – ảnh đầu tiên trong gallery")
    private String imageUrl;

    @Schema(description = "Danh sách ảnh của sản phẩm")
    private List<ProductImageDto> images;

    @Schema(description = "Sản phẩm đã bị ẩn", example = "false")
    private Boolean hidden;
}
