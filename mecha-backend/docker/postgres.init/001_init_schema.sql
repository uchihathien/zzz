-- Sample Data for Mecha Platform
-- Run này trong PostgreSQL database của bạn

-- ============================================
-- CATEGORIES (Danh mục sản phẩm)
-- ============================================

INSERT INTO product_categories (name, description, slug, created_at, updated_at) VALUES
                                                                                     ('Máy móc công nghiệp', 'Các loại máy móc và thiết bị công nghiệp', 'may-moc-cong-nghiep', NOW(), NOW()),
                                                                                     ('Linh kiện cơ khí', 'Linh kiện, phụ tùng cơ khí', 'linh-kien-co-khi', NOW(), NOW()),
                                                                                     ('Dụng cụ và công cụ', 'Dụng cụ cầm tay và công cụ chuyên dụng', 'dung-cu-cong-cu', NOW(), NOW()),
-- Child categories
                                                                                     ('Máy gia công', 'Máy tiện, phay, mài...', 'may-gia-cong', NOW(), NOW()),
                                                                                     ('Ổ bi và bạc đạn', 'Các loại ổ bi công nghiệp', 'o-bi-bac-dan', NOW(), NOW());

-- Link child categories to parents
UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'may-moc-cong-nghiep' LIMIT 1)
WHERE slug = 'may-gia-cong';

UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'linh-kien-co-khi' LIMIT 1)
WHERE slug = 'o-bi-bac-dan';

-- ============================================
-- PRODUCTS (Sản phẩm)
-- ============================================

-- Get category IDs for reference
DO $$
DECLARE
cat_may_moc_id BIGINT;
    cat_linh_kien_id BIGINT;
    cat_dung_cu_id BIGINT;
    cat_may_gia_cong_id BIGINT;
    cat_o_bi_id BIGINT;
BEGIN
SELECT id INTO cat_may_moc_id FROM product_categories WHERE slug = 'may-moc-cong-nghiep';
SELECT id INTO cat_linh_kien_id FROM product_categories WHERE slug = 'linh-kien-co-khi';
SELECT id INTO cat_dung_cu_id FROM product_categories WHERE slug = 'dung-cu-cong-cu';
SELECT id INTO cat_may_gia_cong_id FROM product_categories WHERE slug = 'may-gia-cong';
SELECT id INTO cat_o_bi_id FROM product_categories WHERE slug = 'o-bi-bac-dan';

-- Insert Products
INSERT INTO products (name, code, description, base_price, unit, stock_quantity, status, image_url, category_id, created_at, updated_at) VALUES
                                                                                                                                             -- Máy móc
                                                                                                                                             ('Máy tiện CNC 3 trục', 'PRD-001', 'Máy tiện CNC 3 trục công suất cao, độ chính xác cao, thích hợp cho gia công kim loại', 150000000, 'cái', 5, 'ACTIVE', NULL, cat_may_gia_cong_id, NOW(), NOW()),
                                                                                                                                             ('Máy phay vạn năng', 'PRD-002', 'Máy phay đa năng có thể gia công nhiều loại chi tiết', 85000000, 'cái', 3, 'ACTIVE', NULL, cat_may_gia_cong_id, NOW(), NOW()),
                                                                                                                                             ('Máy mài phẳng', 'PRD-003', 'Máy mài bề mặt phẳng chính xác cao', 45000000, 'cái', 8, 'ACTIVE', NULL, cat_may_gia_cong_id, NOW(), NOW()),

                                                                                                                                             -- Linh kiện
                                                                                                                                             ('Ổ bi SKF 6206', 'PRD-010', 'Ổ bi cỡ 30mm đường kính trong, hàng SKF chính hãng', 180000, 'cái', 200, 'ACTIVE', NULL, cat_o_bi_id, NOW(), NOW()),
                                                                                                                                             ('Ổ bi NSK 6308', 'PRD-011', 'Ổ bi cỡ lớn 40mm đường kính trong, NSK Nhật Bản', 350000, 'cái', 150, 'ACTIVE', NULL, cat_o_bi_id, NOW(), NOW()),
                                                                                                                                             ('Bạc đạn trơn', 'PRD-012', 'Bạc đạn trơn phi 50mm, hợp kim đồng', 120000, 'cái', 300, 'ACTIVE', NULL, cat_o_bi_id, NOW(), NOW()),

                                                                                                                                             -- Dụng cụ
                                                                                                                                             ('Bộ khoan Bosch 100 món', 'PRD-020', 'Bộ khoan taro đa năng Bosch 100 món trong hộp', 2500000, 'bộ', 50, 'ACTIVE', NULL, cat_dung_cu_id, NOW(), NOW()),
                                                                                                                                             ('Cờ lê lực 1/2 inch', 'PRD-021', 'Cờ lê lực từ 40-200Nm', 1200000, 'cái', 30, 'ACTIVE', NULL, cat_dung_cu_id, NOW(), NOW()),
                                                                                                                                             ('Thước kẹp điện tử Mitutoyo', 'PRD-022', 'Thước cặp điện tử 150mm Mitutoyo Nhật', 850000, 'cái', 25, 'ACTIVE', NULL, cat_dung_cu_id, NOW(), NOW()),

                                                                                                                                             -- General category products
                                                                                                                                             ('Máy nén khí 3HP', 'PRD-030', 'Máy nén khí piston 3HP, bình chứa 100L', 12000000, 'cái', 10, 'ACTIVE', NULL, cat_may_moc_id, NOW(), NOW()),
                                                                                                                                             ('Động cơ điện 3 pha 5.5KW', 'PRD-031', 'Động cơ điện 3 pha 5.5KW 380V', 6500000, 'cái', 20, 'ACTIVE', NULL, cat_may_moc_id, NOW(), NOW());
END $$;

-- ============================================
-- TIER PRICES (Giá theo số lượng)
-- ============================================

-- Add tier pricing for some products
DO $$
DECLARE
product_id_bearing BIGINT;
    product_id_tool BIGINT;
BEGIN
SELECT id INTO product_id_bearing FROM products WHERE code = 'PRD-010';
SELECT id INTO product_id_tool FROM products WHERE code = 'PRD-020';

-- Ổ bi SKF - giảm giá khi mua số lượng lớn
IF product_id_bearing IS NOT NULL THEN
        INSERT INTO tier_prices (product_id, min_quantity, unit_price) VALUES
        (product_id_bearing, 10, 170000),
        (product_id_bearing, 50, 160000),
        (product_id_bearing, 100, 150000);
END IF;

    -- Bộ khoan - giảm giá số lượng
    IF product_id_tool IS NOT NULL THEN
        INSERT INTO tier_prices (product_id, min_quantity, unit_price) VALUES
        (product_id_tool, 5, 2300000),
        (product_id_tool, 10, 2100000);
END IF;
END $$;

-- ============================================
-- SERVICES (Dịch vụ)
-- ============================================

INSERT INTO services (name, code, description, type, base_price, duration_minutes, status, created_at, updated_at) VALUES
-- CLEANING Services
('Vệ sinh máy móc công nghiệp', 'SVC-001', 'Dịch vụ vệ sinh chuyên sâu cho máy móc công nghiệp, giúp tăng hiệu suất và tuổi thọ thiết bị. Bao gồm: tẩy dầu mỡ, làm sạch bụi bẩn, kiểm tra sơ bộ.', 'CLEANING', 500000, 120, 'ACTIVE', NOW(), NOW()),
('Vệ sinh bảo dưỡng động cơ', 'SVC-002', 'Vệ sinh bảo dưỡng động cơ điện, động cơ đốt trong. Kiểm tra và làm sạch các bộ phận.', 'CLEANING', 800000, 180, 'ACTIVE', NOW(), NOW()),
('Vệ sinh hệ thống thủy lực', 'SVC-003', 'Làm sạch hệ thống thủy lực, thay dầu, kiểm tra van và đường ống.', 'CLEANING', 1200000, 240, 'ACTIVE', NOW(), NOW()),

-- MAINTENANCE Services
('Bảo trì định kỳ máy CNC', 'SVC-010', 'Bảo dưỡng và kiểm tra định kỳ máy CNC theo tiêu chuẩn nhà sản xuất. Bao gồm: bôi trơn, kiểm tra độ chính xác, căn chỉnh.', 'MAINTENANCE', 3000000, 360, 'ACTIVE', NOW(), NOW()),
('Bảo trì hệ thống điện', 'SVC-011', 'Kiểm tra và bảo dưỡng hệ thống điện công nghiệp, tủ điện, động cơ.', 'MAINTENANCE', 1500000, 240, 'ACTIVE', NOW(), NOW()),
('Bảo trì máy nén khí', 'SVC-012', 'Bảo dưỡng định kỳ máy nén khí: thay dầu, lọc gió, kiểm tra van.', 'MAINTENANCE', 800000, 120, 'ACTIVE', NOW(), NOW()),

-- REPAIR Services
('Sửa chữa máy CNC', 'SVC-020', 'Sửa chữa các sự cố về cơ điện, phần mềm của máy CNC. Thay thế linh kiện hư hỏng.', 'REPAIR', 5000000, 480, 'ACTIVE', NOW(), NOW()),
('Sửa chữa khẩn cấp', 'SVC-021', 'Dịch vụ sửa chữa nhanh trong vòng 24h khi máy móc gặp sự cố nghiêm trọng.', 'REPAIR', 8000000, 360, 'ACTIVE', NOW(), NOW()),
('Sửa chữa động cơ điện', 'SVC-022', 'Sửa chữa, quấn lại động cơ điện các loại công suất.', 'REPAIR', 2000000, 240, 'ACTIVE', NOW(), NOW()),

-- OTHER Services
('Tư vấn kỹ thuật', 'SVC-030', 'Tư vấn giải pháp kỹ thuật, lựa chọn thiết bị, tối ưu hóa quy trình sản xuất.', 'OTHER', 2000000, 180, 'ACTIVE', NOW(), NOW()),
('Lắp đặt máy móc', 'SVC-031', 'Dịch vụ lắp đặt, chạy thử và nghiệm thu máy móc mới.', 'OTHER', 10000000, 720, 'ACTIVE', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records
SELECT 'Categories' as table_name, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Tier Prices', COUNT(*) FROM tier_prices
UNION ALL
SELECT 'Services', COUNT(*) FROM services;

-- Show categories tree
SELECT
    c1.id,
    c1.name as category,
    c2.name as parent_category
FROM product_categories c1
         LEFT JOIN product_categories c2 ON c1.parent_id = c2.id
ORDER BY c2.id NULLS FIRST, c1.id;

-- ============================================
-- NOTES
-- ============================================
-- Sau khi chạy script này, bạn sẽ có:
-- - 5 categories (3 root + 2 child)
-- - 11 products với tier pricing
-- - 11 services (3 CLEANING, 3 MAINTENANCE, 3 REPAIR, 2 OTHER)
--
-- Test API:
-- GET http://localhost:8080/api/categories - Xem categories tree
-- GET http://localhost:8080/api/products - Xem products
-- GET http://localhost:8080/api/services - Xem services
