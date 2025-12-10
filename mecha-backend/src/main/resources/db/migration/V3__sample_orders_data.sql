-- Thêm dữ liệu ảo về bán hàng trong nhiều tháng năm 2024
-- Chạy script này trong PostgreSQL

-- Đảm bảo có ít nhất 1 user với role USER để làm customer
-- Giả sử user có id = 1 tồn tại (hoặc thay đổi customer_id phù hợp)

-- Tháng 1/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240105-001', 1, 2500000, 'COD', 'PAID', 'COMPLETED', '123 Nguyễn Văn A, Q1, HCM', '0901234567', 'Đơn hàng tháng 1', '2024-01-05 10:00:00+07', '2024-01-05 10:00:00+07'),
('ORD-20240112-002', 1, 1800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '456 Lê Văn B, Q3, HCM', '0912345678', 'Đơn hàng tháng 1', '2024-01-12 14:30:00+07', '2024-01-12 14:30:00+07'),
('ORD-20240120-003', 1, 3200000, 'COD', 'PAID', 'COMPLETED', '789 Trần Văn C, Q7, HCM', '0923456789', 'Đơn hàng tháng 1', '2024-01-20 09:15:00+07', '2024-01-20 09:15:00+07');

-- Tháng 2/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240203-001', 1, 4500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '321 Phạm Văn D, Q5, HCM', '0934567890', 'Đơn hàng tháng 2', '2024-02-03 11:00:00+07', '2024-02-03 11:00:00+07'),
('ORD-20240215-002', 1, 2100000, 'COD', 'PAID', 'COMPLETED', '654 Hoàng Văn E, Q10, HCM', '0945678901', 'Đơn hàng tháng 2', '2024-02-15 15:45:00+07', '2024-02-15 15:45:00+07'),
('ORD-20240225-003', 1, 3800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '987 Võ Văn F, Bình Thạnh, HCM', '0956789012', 'Đơn hàng tháng 2', '2024-02-25 08:30:00+07', '2024-02-25 08:30:00+07'),
('ORD-20240228-004', 1, 1500000, 'COD', 'PAID', 'COMPLETED', '147 Đinh Văn G, Tân Bình, HCM', '0967890123', 'Đơn hàng tháng 2', '2024-02-28 16:20:00+07', '2024-02-28 16:20:00+07');

-- Tháng 3/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240305-001', 1, 5200000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '258 Bùi Văn H, Q2, HCM', '0978901234', 'Đơn hàng tháng 3', '2024-03-05 10:30:00+07', '2024-03-05 10:30:00+07'),
('ORD-20240312-002', 1, 2800000, 'COD', 'PAID', 'COMPLETED', '369 Đỗ Văn I, Q9, HCM', '0989012345', 'Đơn hàng tháng 3', '2024-03-12 13:15:00+07', '2024-03-12 13:15:00+07'),
('ORD-20240320-003', 1, 4100000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '741 Ngô Văn K, Thủ Đức, HCM', '0990123456', 'Đơn hàng tháng 3', '2024-03-20 09:45:00+07', '2024-03-20 09:45:00+07'),
('ORD-20240328-004', 1, 1900000, 'COD', 'PAID', 'COMPLETED', '852 Lý Văn L, Q4, HCM', '0901234568', 'Đơn hàng tháng 3', '2024-03-28 17:00:00+07', '2024-03-28 17:00:00+07'),
('ORD-20240331-005', 1, 3500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '963 Trịnh Văn M, Q6, HCM', '0912345679', 'Đơn hàng tháng 3', '2024-03-31 11:30:00+07', '2024-03-31 11:30:00+07');

-- Tháng 4/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240408-001', 1, 6500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '123 Nguyễn Trãi, Q1, HCM', '0923456780', 'Đơn hàng tháng 4', '2024-04-08 10:00:00+07', '2024-04-08 10:00:00+07'),
('ORD-20240415-002', 1, 2200000, 'COD', 'PAID', 'COMPLETED', '456 Lê Lợi, Q1, HCM', '0934567891', 'Đơn hàng tháng 4', '2024-04-15 14:00:00+07', '2024-04-15 14:00:00+07'),
('ORD-20240422-003', 1, 4800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '789 Hai Bà Trưng, Q3, HCM', '0945678902', 'Đơn hàng tháng 4', '2024-04-22 09:30:00+07', '2024-04-22 09:30:00+07');

-- Tháng 5/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240502-001', 1, 3800000, 'COD', 'PAID', 'COMPLETED', '321 Điện Biên Phủ, Bình Thạnh, HCM', '0956789013', 'Đơn hàng tháng 5', '2024-05-02 11:00:00+07', '2024-05-02 11:00:00+07'),
('ORD-20240510-002', 1, 5500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '654 Cách Mạng Tháng 8, Q10, HCM', '0967890124', 'Đơn hàng tháng 5', '2024-05-10 15:30:00+07', '2024-05-10 15:30:00+07'),
('ORD-20240518-003', 1, 2900000, 'COD', 'PAID', 'COMPLETED', '987 Nguyễn Thị Minh Khai, Q3, HCM', '0978901235', 'Đơn hàng tháng 5', '2024-05-18 08:45:00+07', '2024-05-18 08:45:00+07'),
('ORD-20240525-004', 1, 4200000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '147 Võ Văn Tần, Q3, HCM', '0989012346', 'Đơn hàng tháng 5', '2024-05-25 16:00:00+07', '2024-05-25 16:00:00+07');

-- Tháng 6/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240603-001', 1, 7200000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '258 Pasteur, Q1, HCM', '0990123457', 'Đơn hàng tháng 6', '2024-06-03 10:30:00+07', '2024-06-03 10:30:00+07'),
('ORD-20240612-002', 1, 3100000, 'COD', 'PAID', 'COMPLETED', '369 Nam Kỳ Khởi Nghĩa, Q3, HCM', '0901234569', 'Đơn hàng tháng 6', '2024-06-12 13:00:00+07', '2024-06-12 13:00:00+07'),
('ORD-20240620-003', 1, 5800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '741 Trần Hưng Đạo, Q5, HCM', '0912345680', 'Đơn hàng tháng 6', '2024-06-20 09:15:00+07', '2024-06-20 09:15:00+07'),
('ORD-20240628-004', 1, 2400000, 'COD', 'PAID', 'COMPLETED', '852 Nguyễn Đình Chiểu, Q3, HCM', '0923456781', 'Đơn hàng tháng 6', '2024-06-28 17:45:00+07', '2024-06-28 17:45:00+07');

-- Tháng 7/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240705-001', 1, 4600000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '963 Lý Tự Trọng, Q1, HCM', '0934567892', 'Đơn hàng tháng 7', '2024-07-05 11:00:00+07', '2024-07-05 11:00:00+07'),
('ORD-20240715-002', 1, 8500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '123 Nguyễn Huệ, Q1, HCM', '0945678903', 'Đơn hàng tháng 7', '2024-07-15 14:30:00+07', '2024-07-15 14:30:00+07'),
('ORD-20240722-003', 1, 3200000, 'COD', 'PAID', 'COMPLETED', '456 Đồng Khởi, Q1, HCM', '0956789014', 'Đơn hàng tháng 7', '2024-07-22 10:00:00+07', '2024-07-22 10:00:00+07'),
('ORD-20240730-004', 1, 5100000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '789 Lê Duẩn, Q1, HCM', '0967890125', 'Đơn hàng tháng 7', '2024-07-30 16:15:00+07', '2024-07-30 16:15:00+07');

-- Tháng 8/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240806-001', 1, 6800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '321 Phạm Ngọc Thạch, Q3, HCM', '0978901236', 'Đơn hàng tháng 8', '2024-08-06 09:30:00+07', '2024-08-06 09:30:00+07'),
('ORD-20240814-002', 1, 2700000, 'COD', 'PAID', 'COMPLETED', '654 Nguyễn Thị Minh Khai, Q1, HCM', '0989012347', 'Đơn hàng tháng 8', '2024-08-14 13:45:00+07', '2024-08-14 13:45:00+07'),
('ORD-20240822-003', 1, 9200000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '987 Hoàng Sa, Q3, HCM', '0990123458', 'Đơn hàng tháng 8', '2024-08-22 11:00:00+07', '2024-08-22 11:00:00+07'),
('ORD-20240828-004', 1, 4300000, 'COD', 'PAID', 'COMPLETED', '147 Trường Sa, Phú Nhuận, HCM', '0901234570', 'Đơn hàng tháng 8', '2024-08-28 15:30:00+07', '2024-08-28 15:30:00+07'),
('ORD-20240831-005', 1, 3600000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '258 Phan Xích Long, Phú Nhuận, HCM', '0912345681', 'Đơn hàng tháng 8', '2024-08-31 17:00:00+07', '2024-08-31 17:00:00+07');

-- Tháng 9/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20240904-001', 1, 5400000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '369 Nguyễn Văn Trỗi, Phú Nhuận, HCM', '0923456782', 'Đơn hàng tháng 9', '2024-09-04 10:00:00+07', '2024-09-04 10:00:00+07'),
('ORD-20240912-002', 1, 7800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '741 Lê Quang Định, Bình Thạnh, HCM', '0934567893', 'Đơn hàng tháng 9', '2024-09-12 14:00:00+07', '2024-09-12 14:00:00+07'),
('ORD-20240920-003', 1, 2500000, 'COD', 'PAID', 'COMPLETED', '852 Xô Viết Nghệ Tĩnh, Bình Thạnh, HCM', '0945678904', 'Đơn hàng tháng 9', '2024-09-20 09:45:00+07', '2024-09-20 09:45:00+07'),
('ORD-20240928-004', 1, 6100000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '963 Đinh Bộ Lĩnh, Bình Thạnh, HCM', '0956789015', 'Đơn hàng tháng 9', '2024-09-28 16:30:00+07', '2024-09-28 16:30:00+07');

-- Tháng 10/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20241003-001', 1, 8900000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '123 Nguyễn Xí, Bình Thạnh, HCM', '0967890126', 'Đơn hàng tháng 10', '2024-10-03 11:00:00+07', '2024-10-03 11:00:00+07'),
('ORD-20241010-002', 1, 3400000, 'COD', 'PAID', 'COMPLETED', '456 Bạch Đằng, Bình Thạnh, HCM', '0978901237', 'Đơn hàng tháng 10', '2024-10-10 13:30:00+07', '2024-10-10 13:30:00+07'),
('ORD-20241018-003', 1, 10500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '789 Phan Văn Trị, Gò Vấp, HCM', '0989012348', 'Đơn hàng tháng 10', '2024-10-18 10:15:00+07', '2024-10-18 10:15:00+07'),
('ORD-20241025-004', 1, 4700000, 'COD', 'PAID', 'COMPLETED', '321 Quang Trung, Gò Vấp, HCM', '0990123459', 'Đơn hàng tháng 10', '2024-10-25 15:45:00+07', '2024-10-25 15:45:00+07'),
('ORD-20241031-005', 1, 5900000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '654 Nguyễn Oanh, Gò Vấp, HCM', '0901234571', 'Đơn hàng tháng 10', '2024-10-31 17:30:00+07', '2024-10-31 17:30:00+07');

-- Tháng 11/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20241105-001', 1, 7500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '987 Lê Đức Thọ, Gò Vấp, HCM', '0912345682', 'Đơn hàng tháng 11', '2024-11-05 10:30:00+07', '2024-11-05 10:30:00+07'),
('ORD-20241112-002', 1, 2800000, 'COD', 'PAID', 'COMPLETED', '147 Phạm Văn Chiêu, Gò Vấp, HCM', '0923456783', 'Đơn hàng tháng 11', '2024-11-12 14:15:00+07', '2024-11-12 14:15:00+07'),
('ORD-20241120-003', 1, 11200000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '258 Lê Văn Thọ, Gò Vấp, HCM', '0934567894', 'Đơn hàng tháng 11', '2024-11-20 09:00:00+07', '2024-11-20 09:00:00+07'),
('ORD-20241128-004', 1, 4100000, 'COD', 'PAID', 'COMPLETED', '369 Nguyễn Thái Sơn, Gò Vấp, HCM', '0945678905', 'Đơn hàng tháng 11', '2024-11-28 16:00:00+07', '2024-11-28 16:00:00+07');

-- Tháng 12/2024
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20241202-001', 1, 9800000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '741 Dương Quảng Hàm, Gò Vấp, HCM', '0956789016', 'Đơn hàng tháng 12', '2024-12-02 11:00:00+07', '2024-12-02 11:00:00+07'),
('ORD-20241205-002', 1, 3500000, 'COD', 'PAID', 'COMPLETED', '852 Cộng Hòa, Tân Bình, HCM', '0967890127', 'Đơn hàng tháng 12', '2024-12-05 13:45:00+07', '2024-12-05 13:45:00+07'),
('ORD-20241208-003', 1, 12500000, 'BANK_TRANSFER', 'PAID', 'COMPLETED', '963 Hoàng Văn Thụ, Tân Bình, HCM', '0978901238', 'Đơn hàng tháng 12', '2024-12-08 10:30:00+07', '2024-12-08 10:30:00+07'),
('ORD-20241210-004', 1, 5200000, 'COD', 'PENDING', 'CONFIRMED', '123 Trường Chinh, Tân Bình, HCM', '0989012349', 'Đơn hàng đang xử lý', '2024-12-10 09:00:00+07', '2024-12-10 09:00:00+07');

-- Thêm một vài đơn PENDING để test
INSERT INTO orders (order_code, customer_id, total_amount, payment_method, payment_status, status, shipping_address, contact_phone, note, created_at, updated_at)
VALUES 
('ORD-20241210-005', 1, 6700000, 'BANK_TRANSFER', 'PENDING', 'PENDING', '456 Âu Cơ, Tân Phú, HCM', '0990123460', 'Đơn chờ thanh toán', '2024-12-10 14:00:00+07', '2024-12-10 14:00:00+07');
