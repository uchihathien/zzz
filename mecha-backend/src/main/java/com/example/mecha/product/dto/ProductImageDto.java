// product/dto/ProductImageDto.java
package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Ảnh của sản phẩm")
public class ProductImageDto {

    @Schema(example = "1")
    private Long id;

    @Schema(
            description = "URL ảnh (Cloudinary)",
            example = "https://res.cloudinary.com/.../image/upload/v123/products/img1.jpg"
    )
    private String imageUrl;

    @Schema(description = "Thứ tự hiển thị", example = "1")
    private Integer sortOrder;
}
