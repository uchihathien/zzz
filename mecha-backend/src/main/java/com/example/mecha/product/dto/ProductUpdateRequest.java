package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Schema(description = "Yêu cầu cập nhật thông tin sản phẩm")
public class ProductUpdateRequest {

    @Schema(description = "Tên sản phẩm", example = "Bulong M10x50 Thép 8.8 (update)")
    @Size(max = 255, message = "Tên sản phẩm không được dài quá 255 ký tự")
    private String name;

    @Schema(description = "Mã SKU duy nhất", example = "BL-M10x50-8.8")
    @Size(max = 100, message = "SKU không được dài quá 100 ký tự")
    private String sku;

    @Schema(description = "ID danh mục", example = "2")
    private Long categoryId;

    @Schema(description = "Mô tả sản phẩm")
    private String description;

    @Schema(description = "Giá cơ bản", example = "5000")
    @DecimalMin(value = "0.0", inclusive = false, message = "basePrice phải > 0")
    private BigDecimal basePrice;

    @Schema(description = "Tồn kho", example = "800")
    @Min(value = 0, message = "stockQuantity phải >= 0")
    private Integer stockQuantity;

    @Schema(description = "Đơn vị tính", example = "cái")
    @Size(max = 50, message = "Đơn vị tính không được dài quá 50 ký tự")
    private String unitOfMeasure;

    @Schema(description = "Thuộc tính kỹ thuật động (key-value)")
    private Map<String, String> attributes;

    @Schema(description = "Danh sách giá theo số lượng")
    @Valid
    private List<TierPriceCreateRequest> tierPrices;

    @Schema(description = "URL ảnh chính (có thể nhập trực tiếp)")
    private String imageUrl;
}

