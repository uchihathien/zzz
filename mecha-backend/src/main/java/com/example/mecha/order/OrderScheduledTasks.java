// order/OrderScheduledTasks.java
package com.example.mecha.order;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduled tasks for order management:
 * - Auto-cancel unpaid BANK_TRANSFER orders after 30 minutes
 */
@Component
@RequiredArgsConstructor
public class OrderScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(OrderScheduledTasks.class);
    
    // Time limit for bank transfer payment (30 minutes)
    private static final int PAYMENT_TIMEOUT_MINUTES = 30;

    private final OrderRepository orderRepository;

    /**
     * Run every 5 minutes to check and cancel expired unpaid orders
     */
    @Scheduled(fixedRate = 5 * 60 * 1000) // every 5 minutes
    @Transactional
    public void cancelExpiredUnpaidOrders() {
        Instant cutoffTime = Instant.now().minus(PAYMENT_TIMEOUT_MINUTES, ChronoUnit.MINUTES);
        
        // Find BANK_TRANSFER orders that are PENDING payment and older than 30 minutes
        List<Order> expiredOrders = orderRepository.findByPaymentMethodAndPaymentStatusAndStatusAndCreatedAtBefore(
                PaymentMethod.BANK_TRANSFER,
                PaymentStatus.PENDING,
                OrderStatus.PENDING,
                cutoffTime
        );
        
        if (expiredOrders.isEmpty()) {
            return;
        }
        
        log.info("Found {} unpaid BANK_TRANSFER orders to cancel", expiredOrders.size());
        
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setNote((order.getNote() != null ? order.getNote() + " | " : "") + 
                    "Tự động hủy do không thanh toán trong 30 phút");
            
            log.info("Auto-cancelled order {} due to payment timeout", order.getOrderCode());
        }
        
        orderRepository.saveAll(expiredOrders);
    }
}
