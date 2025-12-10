package com.example.mecha.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Migration script to update old enum values:
 * OrderStatus: COMPLETED/CONFIRMED/PROCESSING/SHIPPED -> DELIVERED/PENDING
 * PaymentMethod: BANKING -> BANK_TRANSFER
 */
@Component
@Order(1) // Run before other initializers
public class OrderStatusMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public OrderStatusMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        migrateOrderStatus();
        migratePaymentMethod();
    }

    private void migrateOrderStatus() {
        log.info("=== Running OrderStatus migration ===");

        try {
            // Step 1: Drop old constraint if exists
            try {
                jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
                log.info("Dropped old orders_status_check constraint");
            } catch (Exception e) {
                log.info("No old constraint to drop or already dropped");
            }

            // Step 2: Update data - COMPLETED -> DELIVERED
            int completed = jdbcTemplate.update(
                    "UPDATE orders SET status = 'DELIVERED' WHERE status = 'COMPLETED'"
            );
            log.info("Migrated {} orders from COMPLETED to DELIVERED", completed);

            // CONFIRMED with PAID -> DELIVERED
            int confirmedPaid = jdbcTemplate.update(
                    "UPDATE orders SET status = 'DELIVERED' WHERE status = 'CONFIRMED' AND payment_status = 'PAID'"
            );
            log.info("Migrated {} orders from CONFIRMED (PAID) to DELIVERED", confirmedPaid);

            // CONFIRMED not PAID -> PENDING
            int confirmedNotPaid = jdbcTemplate.update(
                    "UPDATE orders SET status = 'PENDING' WHERE status = 'CONFIRMED'"
            );
            log.info("Migrated {} orders from CONFIRMED to PENDING", confirmedNotPaid);

            // PROCESSING -> PENDING
            int processing = jdbcTemplate.update(
                    "UPDATE orders SET status = 'PENDING' WHERE status = 'PROCESSING'"
            );
            log.info("Migrated {} orders from PROCESSING to PENDING", processing);

            // SHIPPED -> PENDING
            int shipped = jdbcTemplate.update(
                    "UPDATE orders SET status = 'PENDING' WHERE status = 'SHIPPED'"
            );
            log.info("Migrated {} orders from SHIPPED to PENDING", shipped);

            // Step 3: Add new constraint with only allowed values
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE orders ADD CONSTRAINT orders_status_check " +
                    "CHECK (status IN ('PENDING', 'DELIVERED', 'CANCELLED'))"
                );
                log.info("Added new orders_status_check constraint");
            } catch (Exception e) {
                log.info("Constraint already exists or cannot be added: {}", e.getMessage());
            }

            int total = completed + confirmedPaid + confirmedNotPaid + processing + shipped;
            log.info("=== OrderStatus migration complete: {} orders updated ===", total);

        } catch (Exception e) {
            log.warn("OrderStatus migration error: {}", e.getMessage());
        }
    }

    private void migratePaymentMethod() {
        log.info("=== Running PaymentMethod migration ===");

        try {
            // Fix BANKING -> BANK_TRANSFER in orders table
            int ordersFixed = jdbcTemplate.update(
                    "UPDATE orders SET payment_method = 'BANK_TRANSFER' WHERE payment_method = 'BANKING'"
            );
            log.info("Fixed {} orders with BANKING -> BANK_TRANSFER", ordersFixed);

            // Fix BANKING -> BANK_TRANSFER in bookings table
            int bookingsFixed = jdbcTemplate.update(
                    "UPDATE bookings SET payment_method = 'BANK_TRANSFER' WHERE payment_method = 'BANKING'"
            );
            log.info("Fixed {} bookings with BANKING -> BANK_TRANSFER", bookingsFixed);

            log.info("=== PaymentMethod migration complete ===");

        } catch (Exception e) {
            log.warn("PaymentMethod migration error: {}", e.getMessage());
        }
    }
}

