// booking/BookingStatus.java
package com.example.mecha.booking;

public enum BookingStatus {
    PENDING,       // user vừa đặt
    CONFIRMED,     // đã xác nhận (bởi staff)
    IN_PROGRESS,   // đang thực hiện
    COMPLETED,     // hoàn thành
    CANCELLED      // đã hủy
}
