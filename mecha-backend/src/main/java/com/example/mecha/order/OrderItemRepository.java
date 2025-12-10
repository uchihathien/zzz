// order/OrderItemRepository.java
package com.example.mecha.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
           SELECT COUNT(oi) > 0 FROM OrderItem oi
           WHERE oi.order.customer.id = :userId
             AND oi.product.id = :productId
             AND oi.order.status = com.example.mecha.order.OrderStatus.DELIVERED
           """)
    boolean existsCompletedOrderForProduct(
            @Param("userId") Long userId,
            @Param("productId") Long productId
    );
}
