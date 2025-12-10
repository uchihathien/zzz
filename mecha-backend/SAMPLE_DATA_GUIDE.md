# Sample Data Setup Guide

## 📊 Cách chạy Sample Data SQL Script

### Option 1: Dùng psql command line

```bash
# Navigate to backend folder
cd d:\btl\mecha-backend

# Run SQL script
psql -U postgres -d mecha_db -f sample-data.sql
```

### Option 2: Dùng pgAdmin

1. Mở pgAdmin
2. Connect to database `mecha_db`
3. Tools → Query Tool
4. Mở file `sample-data.sql`
5. Click Execute (F5)

### Option 3: Copy-paste vào SQL editor

1. Mở file `sample-data.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL editor (pgAdmin, DBeaver, etc.)
4. Execute

## 📋 Data sẽ được tạo:

### Categories (5 items)
- Máy móc công nghiệp (root)
  - Máy gia công (child)
- Linh kiện cơ khí (root)
  - Ổ bi và bạc đạn (child)
- Dụng cụ và công cụ (root)

### Products (11 items)
**Máy gia công (3 products):**
- Máy tiện CNC 3 trục - 150,000,000đ
- Máy phay vạn năng - 85,000,000đ
- Máy mài phẳng - 45,000,000đ

**Ổ bi và bạc đạn (3 products):**
- Ổ bi SKF 6206 - 180,000đ (có tier pricing)
- Ổ bi NSK 6308 - 350,000đ
- Bạc đạn trơn - 120,000đ

**Dụng cụ (3 products):**
- Bộ khoan Bosch 100 món - 2,500,000đ (có tier pricing)
- Cờ lê lực 1/2 inch - 1,200,000đ
- Thước kẹp điện tử - 850,000đ

**Máy móc (2 products):**
- Máy nén khí 3HP - 12,000,000đ
- Động cơ điện 3 pha - 6,500,000đ

### Services (11 items)
**CLEANING (3 services):**
- Vệ sinh máy móc công nghiệp - 500,000đ (2h)
- Vệ sinh bảo dưỡng động cơ - 800,000đ (3h)
- Vệ sinh hệ thống thủy lực - 1,200,000đ (4h)

**MAINTENANCE (3 services):**
- Bảo trì định kỳ máy CNC - 3,000,000đ (6h)
- Bảo trì hệ thống điện - 1,500,000đ (4h)
- Bảo trì máy nén khí - 800,000đ (2h)

**REPAIR (3 services):**
- Sửa chữa máy CNC - 5,000,000đ (8h)
- Sửa chữa khẩn cấp - 8,000,000đ (6h)
- Sửa chữa động cơ điện - 2,000,000đ (4h)

**OTHER (2 services):**
- Tư vấn kỹ thuật - 2,000,000đ (3h)
- Lắp đặt máy móc - 10,000,000đ (12h)

## ✅ Verify Data

Sau khi chạy script, test bằng cách:

1. **Check in database:**
```sql
SELECT COUNT(*) FROM product_categories;  -- Should be 5
SELECT COUNT(*) FROM products;            -- Should be 11
SELECT COUNT(*) FROM services;            -- Should be 11
SELECT COUNT(*) FROM tier_prices;         -- Should be 5
```

2. **Test APIs:**
```
GET http://localhost:8080/api/categories
GET http://localhost:8080/api/products
GET http://localhost:8080/api/services
```

3. **Test Frontend:**
```
http://localhost:3000/products  -- Xem products
http://localhost:3000/services  -- Xem services
```

## 🔧 Troubleshooting

**Lỗi: relation does not exist**
→ Chạy `./mvnw spring-boot:run` để create tables trước

**Lỗi: duplicate key value**
→ Data đã tồn tại, xóa và chạy lại:
```sql
TRUNCATE tier_prices, products, product_categories, services CASCADE;
```

**Lỗi: password authentication failed**
→ Check PostgreSQL credentials trong `application.properties`

---

**Ready to test!** 🚀
