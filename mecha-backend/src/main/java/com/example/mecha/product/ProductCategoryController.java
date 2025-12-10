package com.example.mecha.product;

import com.example.mecha.product.dto.CategoryCreateRequest;
import com.example.mecha.product.dto.CategoryDto;
import com.example.mecha.product.dto.CategoryUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
@Tag(name = "Product Categories", description = "Quản lý danh mục sản phẩm đa cấp")
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lấy cây danh mục", description = "Trả về cây danh mục đa cấp (root + children)")
    public ResponseEntity<List<CategoryDto>> getTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Tạo mới danh mục", description = "Chỉ ADMIN/STAFF được phép tạo mới danh mục")
    public ResponseEntity<CategoryDto> create(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Cập nhật danh mục", description = "Chỉ ADMIN/STAFF được phép cập nhật danh mục")
    public ResponseEntity<CategoryDto> update(
            @Parameter(description = "ID danh mục") @PathVariable @Positive Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Xóa danh mục", description = "Chỉ ADMIN/STAFF được phép xóa danh mục")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID danh mục") @PathVariable @Positive Long id
    ) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
