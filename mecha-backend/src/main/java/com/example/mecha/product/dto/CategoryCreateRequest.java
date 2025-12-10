package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu tạo mới danh mục sản phẩm")
public class CategoryCreateRequest {

    @Schema(description = "Tên danh mục", example = "Bulong - Ốc vít")
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục không được dài quá 255 ký tự")
    private String name;

    @Schema(description = "Slug duy nhất cho URL", example = "bulong-oc-vit")
    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255, message = "Slug không được dài quá 255 ký tự")
    private String slug;

    @Schema(description = "ID danh mục cha (nếu có)", example = "1")
    private Long parentId;

    @Schema(description = "Thứ tự hiển thị", example = "1")
    @Min(value = 0, message = "sortOrder phải >= 0")
    private Integer sortOrder;
}
