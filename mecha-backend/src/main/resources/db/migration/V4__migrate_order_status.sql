-- Migration: Cập nhật OrderStatus cũ sang mới
-- COMPLETED -> DELIVERED
-- CONFIRMED -> PENDING (hoặc DELIVERED tùy paymentStatus)
-- PROCESSING -> PENDING
-- SHIPPED -> PENDING

-- Chuyển tất cả COMPLETED thành DELIVERED
UPDATE orders SET status = 'DELIVERED' WHERE status = 'COMPLETED';

-- Chuyển CONFIRMED với PAID thành DELIVERED, còn lại thành PENDING
UPDATE orders SET status = 'DELIVERED' WHERE status = 'CONFIRMED' AND payment_status = 'PAID';
UPDATE orders SET status = 'PENDING' WHERE status = 'CONFIRMED' AND payment_status != 'PAID';

-- Chuyển PROCESSING thành PENDING
UPDATE orders SET status = 'PENDING' WHERE status = 'PROCESSING';

-- Chuyển SHIPPED thành PENDING (chưa giao)
UPDATE orders SET status = 'PENDING' WHERE status = 'SHIPPED';
