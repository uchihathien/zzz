// booking/BookingRepository.java  (thêm method)
package com.example.mecha.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByScheduledAtDesc(Long customerId);

    List<Booking> findByTechnicianIdOrderByScheduledAtDesc(Long technicianId);

    @Query(value = """
           SELECT * FROM bookings b
           WHERE (CAST(:status AS VARCHAR) IS NULL OR b.status = CAST(:status AS VARCHAR))
             AND (CAST(:from AS TIMESTAMP) IS NULL OR b.scheduled_at >= CAST(:from AS TIMESTAMP))
             AND (CAST(:to AS TIMESTAMP) IS NULL OR b.scheduled_at <= CAST(:to AS TIMESTAMP))
           ORDER BY b.scheduled_at DESC
           """, nativeQuery = true)
    List<Booking> search(
            @Param("status") String status,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    @Query("""
           SELECT COUNT(b) > 0 FROM Booking b
           WHERE b.customer.id = :userId
             AND b.service.id = :serviceId
             AND b.status = com.example.mecha.booking.BookingStatus.COMPLETED
           """)
    boolean existsCompletedBookingForService(
            @Param("userId") Long userId,
            @Param("serviceId") Long serviceId
    );
}
