package com.example.mecha.config;

import com.example.mecha.order.*;
import com.example.mecha.user.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.*;
import java.util.Random;

/**
 * Initialize sample order data for dashboard charts
 */
@Component
@Order(2) // Run after DataInitializer
@RequiredArgsConstructor
public class SampleOrderDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SampleOrderDataInitializer.class);
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        // Only add sample data if there are fewer than 10 orders
        if (orderRepository.count() >= 10) {
            log.info("Sample order data already exists, skipping...");
            return;
        }

        User customer = userRepository.findByEmail("admin@mecha.com")
                .orElse(null);
        
        if (customer == null) {
            log.warn("No customer found to create sample orders");
            return;
        }

        log.info("Creating sample order data for dashboard charts...");
        
        Random random = new Random(42); // Fixed seed for reproducibility
        String[] addresses = {
            "123 Nguyễn Văn A, Q1, HCM",
            "456 Lê Văn B, Q3, HCM",
            "789 Trần Văn C, Q7, HCM",
            "321 Phạm Văn D, Bình Thạnh, HCM",
            "654 Hoàng Văn E, Tân Bình, HCM"
        };
        
        String[] phones = {"0901234567", "0912345678", "0923456789", "0934567890", "0945678901"};
        
        int orderCount = 0;
        int year = 2024;
        
        // Create orders for each month of 2024
        for (int month = 1; month <= 12; month++) {
            // Number of orders per month (3-6)
            int ordersThisMonth = 3 + random.nextInt(4);
            
            for (int i = 0; i < ordersThisMonth; i++) {
                // Random day in the month
                int maxDay = YearMonth.of(year, month).lengthOfMonth();
                int day = 1 + random.nextInt(maxDay);
                
                LocalDateTime orderDateTime = LocalDateTime.of(year, month, day, 
                        8 + random.nextInt(10), random.nextInt(60));
                Instant createdAt = orderDateTime.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
                
                // Random amount between 1.5M and 15M VND
                BigDecimal amount = BigDecimal.valueOf(1500000 + random.nextInt(13500000));
                
                // 80% paid, 20% pending
                PaymentStatus paymentStatus = random.nextDouble() < 0.8 ? PaymentStatus.PAID : PaymentStatus.PENDING;
                OrderStatus status = paymentStatus == PaymentStatus.PAID ? OrderStatus.DELIVERED : OrderStatus.PENDING;
                PaymentMethod paymentMethod = random.nextBoolean() ? PaymentMethod.COD : PaymentMethod.BANK_TRANSFER;
                
                String orderCode = String.format("ORD-%d%02d%02d-%03d", year, month, day, i + 1);
                
                // Check if order code already exists
                if (orderRepository.findByOrderCode(orderCode).isPresent()) {
                    continue;
                }
                
                com.example.mecha.order.Order order = com.example.mecha.order.Order.builder()
                        .orderCode(orderCode)
                        .customer(customer)
                        .totalAmount(amount)
                        .paymentMethod(paymentMethod)
                        .paymentStatus(paymentStatus)
                        .status(status)
                        .shippingAddress(addresses[random.nextInt(addresses.length)])
                        .contactPhone(phones[random.nextInt(phones.length)])
                        .note("Đơn hàng mẫu tháng " + month)
                        .build();
                
                // Set createdAt manually using reflection or save then update
                order.setCreatedAt(createdAt);
                order.setUpdatedAt(createdAt);
                
                orderRepository.save(order);
                orderCount++;
            }
        }
        
        log.info("Created {} sample orders for dashboard", orderCount);
    }
}
