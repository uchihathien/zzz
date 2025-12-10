package com.example.mecha.product;

import com.example.mecha.product.dto.ProductCreateRequest;
import com.example.mecha.product.dto.ProductDto;
import com.example.mecha.product.dto.ProductUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
@Tag(name = "Products", description = "Quản lý sản phẩm cơ khí")
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    @GetMapping
    @Operation(
            summary = "Danh sách sản phẩm",
            description = "Lọc theo categoryId hoặc keyword (search theo tên). Bỏ trống = lấy tất cả."
    )
    public ResponseEntity<List<ProductDto>> list(
            @Parameter(description = "ID danh mục cần lọc")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Từ khóa tìm kiếm theo tên")
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(productService.listProducts(categoryId, keyword));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết sản phẩm")
    public ResponseEntity<ProductDto> get(
            @Parameter(description = "ID sản phẩm") @PathVariable @Positive Long id
    ) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Tạo mới sản phẩm", description = "Chỉ ADMIN/STAFF được phép tạo sản phẩm")
    public ResponseEntity<ProductDto> create(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Cập nhật sản phẩm", description = "Chỉ ADMIN/STAFF được phép cập nhật sản phẩm")
    public ResponseEntity<ProductDto> update(
            @Parameter(description = "ID sản phẩm") @PathVariable @Positive Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Xóa sản phẩm", description = "Chỉ ADMIN/STAFF được phép xóa sản phẩm")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID sản phẩm") @PathVariable @Positive Long id
    ) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/price")
    @Operation(
            summary = "Tính đơn giá theo số lượng",
            description = "Lấy đơn giá áp dụng cho 1 sản phẩm với số lượng cụ thể (áp dụng tier price nếu có)."
    )
    public ResponseEntity<BigDecimal> getPriceForQty(
            @Parameter(description = "ID sản phẩm") @PathVariable @Positive Long id,
            @Parameter(description = "Số lượng cần báo giá") @RequestParam @Min(1) int quantity
    ) {
        return ResponseEntity.ok(productService.calculateUnitPrice(id, quantity));
    }

    @PostMapping(
            value = "/{id}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Thêm ảnh vào sản phẩm",
            description = "Upload file ảnh lên Cloudinary, thêm vào gallery; ảnh đầu tiên sẽ được dùng làm imageUrl"
    )
    public ResponseEntity<ProductDto> addImage(
            @PathVariable @Positive Long id,
            @Parameter(description = "File ảnh (JPEG/PNG/...)", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(productImageService.addImage(id, file));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Xóa 1 ảnh của sản phẩm",
            description = "Xóa ảnh khỏi Cloudinary & gallery; nếu là ảnh chính, tự động chuyển sang ảnh khác"
    )
    public ResponseEntity<ProductDto> deleteImage(
            @PathVariable @Positive Long id,
            @PathVariable @Positive Long imageId
    ) {
        return ResponseEntity.ok(productImageService.deleteImage(id, imageId));
    }

    @PatchMapping("/{id}/toggle-visibility")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Ẩn/Hiện sản phẩm",
            description = "Toggle trạng thái ẩn của sản phẩm (soft delete)"
    )
    public ResponseEntity<ProductDto> toggleVisibility(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(productService.toggleVisibility(id));
    }

    @PatchMapping("/{id}/images/{imageId}/set-primary")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Đặt ảnh làm ảnh chính",
            description = "Đặt một ảnh trong gallery làm ảnh chính (thumbnail) của sản phẩm"
    )
    public ResponseEntity<ProductDto> setPrimaryImage(
            @PathVariable @Positive Long id,
            @PathVariable @Positive Long imageId
    ) {
        return ResponseEntity.ok(productImageService.setPrimaryImage(id, imageId));
    }
}

