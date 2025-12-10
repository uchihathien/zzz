package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu cập nhật danh mục sản phẩm")
public class CategoryUpdateRequest {

    @Schema(description = "Tên danh mục", example = "Bulong - Ốc vít (update)")
    @Size(max = 255, message = "Tên danh mục không được dài quá 255 ký tự")
    private String name;

    @Schema(description = "Thứ tự hiển thị", example = "1")
    @Min(value = 0, message = "sortOrder phải >= 0")
    private Integer sortOrder;

    @Schema(description = "ID danh mục cha (nếu có)", example = "1")
    private Long parentId;
}
