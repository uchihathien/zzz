// booking/BookingService.java
package com.example.mecha.booking;

import com.example.mecha.booking.dto.BookingAssignTechnicianRequest;
import com.example.mecha.booking.dto.BookingCreateRequest;
import com.example.mecha.booking.dto.BookingDto;
import com.example.mecha.booking.dto.BookingUpdateStatusRequest;
import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import com.example.mecha.servicecatalog.ServiceEntity;
import com.example.mecha.servicecatalog.ServiceRepository;
import com.example.mecha.servicecatalog.ServiceStatus;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRepository;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    // USER / STAFF / ADMIN: đặt lịch
    @Transactional
    public BookingDto createBooking(BookingCreateRequest request, User currentUser) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND"));

        if (service.getStatus() != ServiceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE_NOT_ACTIVE");
        }

        Booking booking = Booking.builder()
                .service(service)
                .customer(currentUser)
                .scheduledAt(request.getScheduledAt())
                .addressLine(request.getAddressLine())
                .contactPhone(request.getContactPhone())
                .note(request.getNote())
                .status(BookingStatus.PENDING)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.COD)
                .paymentStatus(PaymentStatus.PENDING)
                .priceAtBooking(service.getBasePrice())
                .build();

        booking = bookingRepository.save(booking);
        return toDto(booking);
    }

    // USER: xem booking của chính mình
    @Transactional(readOnly = true)
    public List<BookingDto> listMyBookings(User currentUser) {
        return bookingRepository.findByCustomerIdOrderByScheduledAtDesc(currentUser.getId())
                .stream().map(this::toDto).toList();
    }

    // TECHNICIAN: xem booking được assign cho mình
    @Transactional(readOnly = true)
    public List<BookingDto> listMyAssignedBookings(User currentUser) {
        return bookingRepository.findByTechnicianIdOrderByScheduledAtDesc(currentUser.getId())
                .stream().map(this::toDto).toList();
    }

    // ADMIN / STAFF: xem tất cả booking (filter theo status, from, to)
    @Transactional(readOnly = true)
    public List<BookingDto> searchForAdmin(BookingStatus status, OffsetDateTime from, OffsetDateTime to) {
        String statusStr = status != null ? status.name() : null;
        return bookingRepository.search(statusStr, from, to)
                .stream().map(this::toDto).toList();
    }

    // xem chi tiết booking (check quyền)
    @Transactional(readOnly = true)
    public BookingDto getByIdForUser(Long id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        if (!canView(booking, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }

        return toDto(booking);
    }

    // Thay đổi trạng thái booking
    @Transactional
    public BookingDto updateStatus(Long id, BookingUpdateStatusRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        BookingStatus newStatus = request.getStatus();

        // User thường chỉ được hủy booking của mình
        if (currentUser.getRole() == UserRole.USER) {
            if (!booking.getCustomer().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
            }
            if (newStatus != BookingStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "USER_CAN_ONLY_CANCEL_BOOKING");
            }
            if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "BOOKING_ALREADY_FINALIZED");
            }
        } else {
            // STAFF / TECHNICIAN / ADMIN: được đổi sang các trạng thái khác
            if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "BOOKING_ALREADY_FINALIZED");
            }
        }

        booking.setStatus(newStatus);

        // lưu note (ghi chú lý do hủy / cập nhật)
        if (request.getNote() != null) {
            booking.setNote(request.getNote());
        }

        return toDto(booking);
    }

    // Gán kỹ thuật viên (ADMIN / STAFF)
    @Transactional
    public BookingDto assignTechnician(Long id, BookingAssignTechnicianRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN && currentUser.getRole() != UserRole.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ONLY_ADMIN_OR_STAFF_CAN_ASSIGN_TECHNICIAN");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TECHNICIAN_NOT_FOUND"));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "USER_IS_NOT_TECHNICIAN");
        }

        booking.setTechnician(technician);
        return toDto(booking);
    }

    private boolean canView(Booking booking, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF) {
            return true;
        }
        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            return booking.getTechnician() != null &&
                    booking.getTechnician().getId().equals(currentUser.getId());
        }
        // USER
        return booking.getCustomer().getId().equals(currentUser.getId());
    }

    private BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .serviceId(b.getService().getId())
                .serviceName(b.getService().getName())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getFullName())
                .technicianId(b.getTechnician() != null ? b.getTechnician().getId() : null)
                .technicianName(b.getTechnician() != null ? b.getTechnician().getFullName() : null)
                .scheduledAt(b.getScheduledAt())
                .addressLine(b.getAddressLine())
                .contactPhone(b.getContactPhone())
                .note(b.getNote())
                .status(b.getStatus())
                .paymentMethod(b.getPaymentMethod())
                .paymentStatus(b.getPaymentStatus())
                .priceAtBooking(b.getPriceAtBooking())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
