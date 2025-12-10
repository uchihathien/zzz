-- ============================================
-- Sample Data for Mecha Platform
-- Chuẩn theo entities: Product, ProductCategory, ServiceEntity
-- ============================================

\c mecha_db;

-- ============================================
-- CATEGORIES (Danh mục sản phẩm)
-- Table: product_categories
-- Columns: name, slug, parent_id, sort_order
-- ============================================

INSERT INTO product_categories (name, slug, sort_order, created_at, updated_at) VALUES
('Máy móc công nghiệp', 'may-moc-cong-nghiep', 1, NOW(), NOW()),
('Linh kiện cơ khí', 'linh-kien-co-khi', 2, NOW(), NOW()),
('Dụng cụ và công cụ', 'dung-cu-cong-cu', 3, NOW(), NOW()),
('Máy gia công', 'may-gia-cong', 1, NOW(), NOW()),
('Ổ bi và bạc đạn', 'o-bi-bac-dan', 1, NOW(), NOW());

-- Link child categories to parents
UPDATE product_categories
SET parent_id = (SELECT id FROM product_categories WHERE slug = 'may-moc-cong-nghiep' LIMIT 1)
WHERE slug = 'may-gia-cong';

UPDATE product_categories
SET parent_id = (SELECT id FROM product_categories WHERE slug = 'linh-kien-co-khi' LIMIT 1)
WHERE slug = 'o-bi-bac-dan';

-- ============================================
-- PRODUCTS (Sản phẩm)
-- Table: products
-- Columns: name, sku, description, base_price, stock_quantity, unit_of_measure, category_id
-- ============================================

DO $$
DECLARE
    cat_may_moc_id BIGINT;
    cat_linh_kien_id BIGINT;
    cat_dung_cu_id BIGINT;
    cat_may_gia_cong_id BIGINT;
    cat_o_bi_id BIGINT;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_may_moc_id FROM product_categories WHERE slug = 'may-moc-cong-nghiep';
    SELECT id INTO cat_linh_kien_id FROM product_categories WHERE slug = 'linh-kien-co-khi';
    SELECT id INTO cat_dung_cu_id FROM product_categories WHERE slug = 'dung-cu-cong-cu';
    SELECT id INTO cat_may_gia_cong_id FROM product_categories WHERE slug = 'may-gia-cong';
    SELECT id INTO cat_o_bi_id FROM product_categories WHERE slug = 'o-bi-bac-dan';

    -- Insert Products
    -- Note: Using column names as in Product entity
    INSERT INTO products (name, sku, description, base_price, stock_quantity, unit_of_measure, category_id, created_at, updated_at) VALUES
    -- Máy gia công (3 products)
    ('Máy tiện CNC 3 trục', 'PRD-001', 'Máy tiện CNC 3 trục công suất cao, độ chính xác cao, thích hợp cho gia công kim loại chính xác', 150000000, 5, 'cái', cat_may_gia_cong_id, NOW(), NOW()),
    ('Máy phay vạn năng X6132', 'PRD-002', 'Máy phay đa năng có thể gia công nhiều loại chi tiết cơ khí phức tạp', 85000000, 3, 'cái', cat_may_gia_cong_id, NOW(), NOW()),
    ('Máy mài phẳng M7130', 'PRD-003', 'Máy mài bề mặt phẳng chính xác cao, độ nhám Ra 0.8', 45000000, 8, 'cái', cat_may_gia_cong_id, NOW(), NOW()),

    -- Ổ bi và bạc đạn (3 products)
    ('Ổ bi SKF 6206', 'PRD-010', 'Ổ bi cỡ 30mm đường kính trong, hàng SKF Sweden chính hãng, độ bền cao', 180000, 200, 'cái', cat_o_bi_id, NOW(), NOW()),
    ('Ổ bi NSK 6308', 'PRD-011', 'Ổ bi cỡ lớn 40mm đường kính trong, NSK Made in Japan, chất lượng cao', 350000, 150, 'cái', cat_o_bi_id, NOW(), NOW()),
    ('Bạc đạn trơn DU50', 'PRD-012', 'Bạc đạn trơn phi 50mm, hợp kim đồng, tự bôi trơn', 120000, 300, 'cái', cat_o_bi_id, NOW(), NOW()),

    -- Dụng cụ (3 products)
    ('Bộ khoan Bosch 100 món', 'PRD-020', 'Bộ khoan taro đa năng Bosch 100 món trong hộp nhựa, phù hợp đa dụng', 2500000, 50, 'bộ', cat_dung_cu_id, NOW(), NOW()),
    ('Cờ lê lực 1/2 inch', 'PRD-021', 'Cờ lê lực từ 40-200Nm, độ chính xác ±4%, có hộp đựng', 1200000, 30, 'cái', cat_dung_cu_id, NOW(), NOW()),
    ('Thước kẹp điện tử Mitutoyo 150mm', 'PRD-022', 'Thước cặp điện tử 150mm Mitutoyo Nhật Bản, độ chính xác 0.01mm', 850000, 25, 'cái', cat_dung_cu_id, NOW(), NOW()),

    -- Máy móc chung (2 products)
    ('Máy nén khí 3HP', 'PRD-030', 'Máy nén khí piston 3HP, bình chứa 100L, áp suất 8 bar', 12000000, 10, 'cái', cat_may_moc_id, NOW(), NOW()),
    ('Động cơ điện 3 pha 5.5KW', 'PRD-031', 'Động cơ điện 3 pha 5.5KW 380V 1450rpm, hiệu suất cao', 6500000, 20, 'cái', cat_may_moc_id, NOW(), NOW());
END $$;

-- ============================================
-- TIER PRICES (Giá theo số lượng)
-- Table: product_tier_prices
-- Columns: product_id, min_qty, unit_price
-- ============================================

DO $$
DECLARE
    product_id_bearing BIGINT;
    product_id_tool BIGINT;
BEGIN
    -- Get product IDs
    SELECT id INTO product_id_bearing FROM products WHERE sku = 'PRD-010';
    SELECT id INTO product_id_tool FROM products WHERE sku = 'PRD-020';

    -- Ổ bi SKF - giảm giá khi mua số lượng lớn
    IF product_id_bearing IS NOT NULL THEN
        INSERT INTO product_tier_prices (product_id, min_qty, unit_price) VALUES
        (product_id_bearing, 10, 170000),
        (product_id_bearing, 50, 160000),
        (product_id_bearing, 100, 150000);
    END IF;

    -- Bộ khoan - giảm giá số lượng
    IF product_id_tool IS NOT NULL THEN
        INSERT INTO product_tier_prices (product_id, min_qty, unit_price) VALUES
        (product_id_tool, 5, 2300000),
        (product_id_tool, 10, 2100000);
    END IF;
END $$;

-- ============================================
-- SERVICES (Dịch vụ)
-- Table: services
-- Columns: name, code, description, type, base_price, duration_minutes, status
-- Enums: type (CLEANING, MAINTENANCE, REPAIR, OTHER)
--        status (ACTIVE, INACTIVE)
-- ============================================

INSERT INTO services (name, code, description, type, base_price, duration_minutes, status, created_at, updated_at) VALUES
-- CLEANING Services
('Vệ sinh máy móc công nghiệp', 'SVC-CLEAN-001', 'Dịch vụ vệ sinh chuyên sâu cho máy móc công nghiệp, giúp tăng hiệu suất và tuổi thọ thiết bị. Bao gồm: tẩy dầu mỡ, làm sạch bụi bẩn, kiểm tra sơ bộ các bộ phận.', 'CLEANING', 500000, 120, 'ACTIVE', NOW(), NOW()),
('Vệ sinh bảo dưỡng động cơ', 'SVC-CLEAN-002', 'Vệ sinh bảo dưỡng động cơ điện, động cơ đốt trong công nghiệp. Kiểm tra và làm sạch các bộ phận, thay dầu mỡ bôi trơn.', 'CLEANING', 800000, 180, 'ACTIVE', NOW(), NOW()),
('Vệ sinh hệ thống thủy lực', 'SVC-CLEAN-003', 'Làm sạch hệ thống thủy lực, thay dầu thủy lực, kiểm tra van và đường ống, đảm bảo hoạt động ổn định.', 'CLEANING', 1200000, 240, 'ACTIVE', NOW(), NOW()),

-- MAINTENANCE Services
('Bảo trì định kỳ máy CNC', 'SVC-MAINT-001', 'Bảo dưỡng và kiểm tra định kỳ máy CNC theo tiêu chuẩn nhà sản xuất. Bao gồm: bôi trơn ray, kiểm tra độ chính xác, căn chỉnh hệ thống.', 'MAINTENANCE', 3000000, 360, 'ACTIVE', NOW(), NOW()),
('Bảo trì hệ thống điện công nghiệp', 'SVC-MAINT-002', 'Kiểm tra và bảo dưỡng hệ thống điện công nghiệp, tủ điện, động cơ. Đo điện trở cách điện, kiểm tra tiếp điểm.', 'MAINTENANCE', 1500000, 240, 'ACTIVE', NOW(), NOW()),
('Bảo trì máy nén khí', 'SVC-MAINT-003', 'Bảo dưỡng định kỳ máy nén khí: thay dầu máy nén, lọc gió, kiểm tra van an toàn, làm sạch tản nhiệt.', 'MAINTENANCE', 800000, 120, 'ACTIVE', NOW(), NOW()),

-- REPAIR Services
('Sửa chữa máy CNC', 'SVC-REPAIR-001', 'Sửa chữa các sự cố về cơ điện, phần mềm của máy CNC. Thay thế linh kiện hư hỏng, khắc phục lỗi hệ thống.', 'REPAIR', 5000000, 480, 'ACTIVE', NOW(), NOW()),
('Sửa chữa khẩn cấp 24/7', 'SVC-REPAIR-002', 'Dịch vụ sửa chữa nhanh trong vòng 24h khi máy móc gặp sự cố nghiêm trọng. Hỗ trợ khẩn cấp ngoài giờ.', 'REPAIR', 8000000, 360, 'ACTIVE', NOW(), NOW()),
('Sửa chữa động cơ điện', 'SVC-REPAIR-003', 'Sửa chữa, quấn lại động cơ điện các loại công suất. Thay ổ bi, sửa chữa trục, cân bằng roto.', 'REPAIR', 2000000, 240, 'ACTIVE', NOW(), NOW()),

-- OTHER Services
('Tư vấn kỹ thuật chuyên sâu', 'SVC-OTHER-001', 'Tư vấn giải pháp kỹ thuật, lựa chọn thiết bị phù hợp, tối ưu hóa quy trình sản xuất, cải tiến công nghệ.', 'OTHER', 2000000, 180, 'ACTIVE', NOW(), NOW()),
('Lắp đặt và chạy thử máy móc', 'SVC-OTHER-002', 'Dịch vụ lắp đặt máy móc mới, chạy thử, nghiệm thu, đào tạo vận hành. Bảo hành 12 tháng.', 'OTHER', 10000000, 720, 'ACTIVE', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records
SELECT 'Categories' as table_name, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Tier Prices', COUNT(*) FROM product_tier_prices
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

-- Show sample products
SELECT p.id, p.name, p.sku, p.base_price, p.stock_quantity, c.name as category
FROM products p
LEFT JOIN product_categories c ON p.category_id = c.id
ORDER BY p.id
LIMIT 5;

-- Show sample services
SELECT id, name, code, type, base_price, duration_minutes, status
FROM services
ORDER BY type, id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Sample data inserted successfully!' as message,
       (SELECT COUNT(*) FROM product_categories) as categories,
       (SELECT COUNT(*) FROM products) as products,
       (SELECT COUNT(*) FROM services) as services;
