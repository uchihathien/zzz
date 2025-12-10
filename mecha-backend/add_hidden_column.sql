WITH addr AS (
    SELECT * FROM (VALUES
                       (1, '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh'),
                       (2, '25 Lý Thái Tổ, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội'),
                       (3, '45 Trần Phú, Phường Lộc Thọ, TP Nha Trang, Tỉnh Khánh Hòa'),
                       (4, '89 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, TP Đà Nẵng'),
                       (5, '101 Lê Lợi, Phường Vĩnh Ninh, TP Huế, Tỉnh Thừa Thiên Huế'),
                       (6, '56 Hùng Vương, Phường 7, TP Tuy Hòa, Tỉnh Phú Yên'),
                       (7, '78 Trường Chinh, Phường An Khánh, Quận Ninh Kiều, TP Cần Thơ'),
                       (8, '32 Cách Mạng Tháng 8, Phường 5, TP Đà Lạt, Tỉnh Lâm Đồng'),
                       (9, '210 Lý Thường Kiệt, Phường Vĩnh Ninh, TP Huế, Tỉnh Thừa Thiên Huế'),
                       (10, '15 Nguyễn Trãi, Phường 1, TP Mỹ Tho, Tỉnh Tiền Giang'),
                       (11, '27 Trần Hưng Đạo, Phường 1, TP Vũng Tàu, Tỉnh Bà Rịa - Vũng Tàu'),
                       (12, '99 30/4, Phường Hưng Lợi, Quận Ninh Kiều, TP Cần Thơ'),
                       (13, '134 Nguyễn Văn Cừ, Phường An Khánh, Quận Ninh Kiều, TP Cần Thơ'),
                       (14, '22 Phan Chu Trinh, Phường 2, TP Đà Lạt, Tỉnh Lâm Đồng'),
                       (15, '68 Lê Hồng Phong, Phường Phú Hòa, TP Thủ Dầu Một, Tỉnh Bình Dương'),
                       (16, '45 Võ Văn Tần, Phường Tân An, TP Thủ Dầu Một, Tỉnh Bình Dương'),
                       (17, '57 Trần Hưng Đạo, Phường Mỹ Bình, TP Long Xuyên, Tỉnh An Giang'),
                       (18, '73 Nguyễn Du, Phường Xuân Khánh, Quận Ninh Kiều, TP Cần Thơ'),
                       (19, '11 Quốc lộ 1A, Xã Tân Phú, Huyện Châu Thành, Tỉnh Tiền Giang'),
                       (20, '24 Hùng Vương, Phường 7, TP Bến Tre, Tỉnh Bến Tre'),
                       (21, '35 Lê Duẩn, Phường Trường Thi, TP Vinh, Tỉnh Nghệ An'),
                       (22, '64 Nguyễn Công Trứ, Phường Phương Lâm, TP Hòa Bình, Tỉnh Hòa Bình'),
                       (23, '88 Nguyễn Thái Học, Phường Điện Biên, TP Thanh Hóa, Tỉnh Thanh Hóa'),
                       (24, '102 Lê Hồng Phong, Phường Phước Ninh, Quận Hải Châu, TP Đà Nẵng'),
                       (25, '59 Nguyễn Tri Phương, Phường Chính Gián, Quận Thanh Khê, TP Đà Nẵng'),
                       (26, '17 Lý Tự Trọng, Phường An Cư, Quận Ninh Kiều, TP Cần Thơ'),
                       (27, '21 Nguyễn Huệ, Phường 1, TP Cao Lãnh, Tỉnh Đồng Tháp'),
                       (28, '39 Phan Đình Phùng, Phường Quang Trung, TP Quy Nhơn, Tỉnh Bình Định'),
                       (29, '44 Trần Hưng Đạo, Phường Hải Cảng, TP Quy Nhơn, Tỉnh Bình Định'),
                       (30, '66 Trần Phú, Phường Cẩm Châu, TP Hội An, Tỉnh Quảng Nam'),
                       (31, '77 Phan Chu Trinh, Phường Hải Châu 1, Quận Hải Châu, TP Đà Nẵng'),
                       (32, '19 Nguyễn Văn Linh, Phường Thanh Bình, TP Hải Dương, Tỉnh Hải Dương'),
                       (33, '83 Lý Thường Kiệt, Phường Quang Trung, TP Nam Định, Tỉnh Nam Định'),
                       (34, '52 Hùng Vương, Phường Ninh Sơn, TP Ninh Bình, Tỉnh Ninh Bình'),
                       (35, '27 Trần Phú, Phường Lộc Thọ, TP Nha Trang, Tỉnh Khánh Hòa'),
                       (36, '91 Nguyễn Huệ, Phường 2, TP Tuy Hòa, Tỉnh Phú Yên'),
                       (37, '38 Lê Lợi, Phường Thống Nhất, TP Kon Tum, Tỉnh Kon Tum'),
                       (38, '63 Trường Chinh, Phường Tân Lập, TP Buôn Ma Thuột, Tỉnh Đắk Lắk'),
                       (39, '71 Nguyễn Tất Thành, Phường Tân An, TP Buôn Ma Thuột, Tỉnh Đắk Lắk'),
                       (40, '29 Điện Biên Phủ, Phường 1, TP Đà Lạt, Tỉnh Lâm Đồng'),
                       (41, '55 Hùng Vương, Phường An Bình, TP Rạch Giá, Tỉnh Kiên Giang'),
                       (42, '100 Nguyễn Trung Trực, Phường Vĩnh Lạc, TP Rạch Giá, Tỉnh Kiên Giang'),
                       (43, '12 Lê Hồng Phong, Phường 4, TP Sóc Trăng, Tỉnh Sóc Trăng'),
                       (44, '34 Trần Hưng Đạo, Phường 3, TP Trà Vinh, Tỉnh Trà Vinh'),
                       (45, '46 Nguyễn Huệ, Phường 1, TP Vĩnh Long, Tỉnh Vĩnh Long'),
                       (46, '58 30/4, Phường 1, TP Bạc Liêu, Tỉnh Bạc Liêu'),
                       (47, '62 Hùng Vương, Phường 5, TP Cà Mau, Tỉnh Cà Mau'),
                       (48, '19 Lý Thường Kiệt, Phường Tân Lợi, TP Buôn Ma Thuột, Tỉnh Đắk Lắk'),
                       (49, '73 Lê Duẩn, Phường Tân Tiến, TP Buôn Ma Thuột, Tỉnh Đắk Lắk'),
                       (50, '84 Nguyễn Thị Minh Khai, Phường Phú Hòa, TP Thủ Dầu Một, Tỉnh Bình Dương')
                  ) AS t(addr_id, full_address)
),
     ord AS (
         SELECT
             id,
             ((ROW_NUMBER() OVER (ORDER BY id) - 1) % 50) + 1 AS addr_id
         FROM orders
     )
UPDATE orders o
SET shipping_address = a.full_address
FROM ord
         JOIN addr a ON ord.addr_id = a.addr_id
WHERE o.id = ord.id;
