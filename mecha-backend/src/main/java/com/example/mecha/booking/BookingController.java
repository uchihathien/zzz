// booking/BookingController.java
package com.example.mecha.booking;

import com.example.mecha.booking.dto.BookingAssignTechnicianRequest;
import com.example.mecha.booking.dto.BookingCreateRequest;
import com.example.mecha.booking.dto.BookingDto;
import com.example.mecha.booking.dto.BookingUpdateStatusRequest;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Validated
@Tag(name = "Bookings", description = "Đặt lịch và quản lý lịch dịch vụ")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    // Đặt lịch dịch vụ (USER / STAFF / ADMIN)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đặt lịch dịch vụ")
    public ResponseEntity<BookingDto> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BookingCreateRequest request
    ) {
        return ResponseEntity.ok(bookingService.createBooking(request, currentUser));
    }

    // USER: xem lịch của chính mình
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách lịch của tôi")
    public ResponseEntity<List<BookingDto>> myBookings(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bookingService.listMyBookings(currentUser));
    }

    // TECHNICIAN: xem lịch được giao cho mình
    @GetMapping("/assigned-to-me")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Danh sách lịch được giao cho kỹ thuật viên hiện tại")
    public ResponseEntity<List<BookingDto>> assignedToMe(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bookingService.listMyAssignedBookings(currentUser));
    }

    // ADMIN / STAFF: xem tất cả booking (filter)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Danh sách tất cả booking (admin/staff)")
    public ResponseEntity<List<BookingDto>> search(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        return ResponseEntity.ok(bookingService.searchForAdmin(status, from, to));
    }

    // Xem chi tiết booking (tùy quyền: owner, staff, technician, admin)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Chi tiết booking")
    public ResponseEntity<BookingDto> getById(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bookingService.getByIdForUser(id, currentUser));
    }

    // Đổi trạng thái booking
    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Thay đổi trạng thái booking",
            description = """
                - USER chỉ được đổi sang CANCELLED đối với booking của chính mình.
                - STAFF / TECHNICIAN / ADMIN được đổi sang CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED (tuỳ logic).
                """
    )
    public ResponseEntity<BookingDto> updateStatus(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BookingUpdateStatusRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request, currentUser));
    }

    // Gán kỹ thuật viên (chỉ ADMIN / STAFF)
    @PatchMapping("/{id}/assign-technician")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Gán kỹ thuật viên cho booking (admin/staff)")
    public ResponseEntity<BookingDto> assignTechnician(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BookingAssignTechnicianRequest request
    ) {
        return ResponseEntity.ok(bookingService.assignTechnician(id, request, currentUser));
    }
}
