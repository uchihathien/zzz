// servicecatalog/ServiceController.java
package com.example.mecha.servicecatalog;

import com.example.mecha.servicecatalog.dto.ServiceCreateRequest;
import com.example.mecha.servicecatalog.dto.ServiceDto;
import com.example.mecha.servicecatalog.dto.ServiceUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Validated
@Tag(name = "Services", description = "CRUD dịch vụ vệ sinh / bảo trì / sửa chữa")
public class ServiceController {

    private final ServiceManagementService serviceManagementService;

    // Public: xem danh sách dịch vụ (mặc định active)
    @GetMapping
    @Operation(summary = "Danh sách dịch vụ", description = "Lọc theo trạng thái, mặc định trả về dịch vụ ACTIVE")
    public ResponseEntity<List<ServiceDto>> list(
            @Parameter(description = "Trạng thái dịch vụ", example = "ACTIVE")
            @RequestParam(required = false) ServiceStatus status
    ) {
        return ResponseEntity.ok(serviceManagementService.list(status));
    }

    // Public: xem chi tiết dịch vụ
    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết dịch vụ")
    public ResponseEntity<ServiceDto> getById(
            @Parameter(description = "ID dịch vụ") @PathVariable @Positive Long id
    ) {
        return ResponseEntity.ok(serviceManagementService.getById(id));
    }

    // ADMIN / STAFF: tạo dịch vụ
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Tạo mới dịch vụ", description = "Chỉ ADMIN/STAFF được phép tạo dịch vụ")
    public ResponseEntity<ServiceDto> create(
            @Valid @RequestBody ServiceCreateRequest request
    ) {
        return ResponseEntity.ok(serviceManagementService.create(request));
    }

    // ADMIN / STAFF: cập nhật dịch vụ
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cập nhật dịch vụ", description = "Chỉ ADMIN/STAFF được phép cập nhật dịch vụ")
    public ResponseEntity<ServiceDto> update(
            @Parameter(description = "ID dịch vụ") @PathVariable @Positive Long id,
            @Valid @RequestBody ServiceUpdateRequest request
    ) {
        return ResponseEntity.ok(serviceManagementService.update(id, request));
    }

    // ADMIN / STAFF: đổi trạng thái
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Đổi trạng thái dịch vụ", description = "ACTIVE hoặc INACTIVE")
    public ResponseEntity<ServiceDto> changeStatus(
            @Parameter(description = "ID dịch vụ") @PathVariable @Positive Long id,
            @RequestParam ServiceStatus status
    ) {
        return ResponseEntity.ok(serviceManagementService.changeStatus(id, status));
    }

    // ADMIN / STAFF: xóa dịch vụ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Xóa dịch vụ")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID dịch vụ") @PathVariable @Positive Long id
    ) {
        serviceManagementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
