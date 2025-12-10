package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "Thông tin danh mục sản phẩm (tree)")
public class CategoryDto {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Bulong - Ốc vít")
    private String name;

    @Schema(example = "bulong-oc-vit")
    private String slug;

    @Schema(description = "ID danh mục cha (null nếu là root)", example = "null")
    private Long parentId;

    @Schema(description = "Thứ tự hiển thị", example = "1")
    private Integer sortOrder;

    private List<CategoryDto> children;
}
