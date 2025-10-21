# 🔐 Hướng dẫn Test JWT Authentication trong Postman

## ✅ Các thay đổi đã được thực hiện:

1. **JwtUtil.java** - Fix lỗi role được lưu dưới dạng String thay vì Enum
2. **JwtFilter.java** - Thêm logging chi tiết để debug
3. **SecurityConfig.java** - Đã có JwtFilter được register
4. **application.properties** - Thêm logging configuration để debug

## 🚀 Các bước test:

### Bước 1: Restart ứng dụng
```bash
# Stop ứng dụng hiện tại (Ctrl+C)
# Chạy lại ứng dụng
mvnw spring-boot:run
```

### Bước 2: Đăng ký user mới (nếu chưa có)
**POST** `http://localhost:8080/api/users/register`

Body:
```json
{
  "username": "evowner1",
  "email": "evowner1@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789",
  "role": "EV_OWNER"
}
```

### Bước 3: Login để lấy token
**POST** `http://localhost:8080/api/auth/login`

Body:
```json
{
  "username": "evowner1",
  "password": "password123"
}
```

Response sẽ có:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJldm93bmVyMSIsInJvbGUiOiJFVl9PV05FUiIsInVzZXJJZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTAxMiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDg2NDAwfQ.abc123xyz",
  "type": "Bearer"
}
```

### Bước 4: Copy token và test API với authorization

#### 4.1. Trong Postman:
1. Chọn request bạn muốn test (ví dụ: Create Vehicle, Create Journey)
2. Vào tab **Authorization**
3. Type: Chọn **Bearer Token**
4. Paste token vào ô **Token**

#### 4.2. Test Create Vehicle:
**POST** `http://localhost:8080/api/vehicles`

Headers:
```
Authorization: Bearer {your_token_here}
```

Body:
```json
{
  "vin": "1HGBH41JXMN109186",
  "model": "Tesla Model 3",
  "registrationDate": "2023-01-15"
}
```

#### 4.3. Test Create Journey:
**POST** `http://localhost:8080/api/journeys`

Headers:
```
Authorization: Bearer {your_token_here}
```

Body:
```json
{
  "vehicle": {
    "id": "your-vehicle-uuid"
  },
  "startLocation": "Ho Chi Minh City",
  "endLocation": "Hanoi",
  "distanceKm": 1720,
  "energyConsumedKwh": 250,
  "startTime": "2024-01-15T08:00:00",
  "endTime": "2024-01-15T18:00:00"
}
```

## 🔍 Kiểm tra logs để debug:

Khi bạn gọi API, console sẽ in ra:

```
🎫 Generating token for user: evowner1 with role: EV_OWNER
👤 Authenticating user: evowner1 with role: EV_OWNER
✨ Granted authorities: [ROLE_EV_OWNER]
✅ Authentication set in SecurityContext for user: evowner1
```

## ❌ Nếu vẫn gặp lỗi 401:

### Kiểm tra 1: Token có được gửi đúng không?
- Đảm bảo header là: `Authorization: Bearer {token}`
- Không có khoảng trắng thừa
- Token không bị expired (token chỉ valid trong 24 giờ)

### Kiểm tra 2: Role có đúng không?
- Kiểm tra trong database xem user có role `EV_OWNER` không
- Decode token tại https://jwt.io để xem claim "role" có giá trị gì

### Kiểm tra 3: Xem logs
Console sẽ hiển thị:
- `⚠️ Token validation failed` - Token không hợp lệ hoặc expired
- `⚠️ Token is blacklisted` - Token đã bị blacklist (sau khi logout)
- `⚠️ Role claim is null in token` - Token không có claim "role"

## 🎯 Các endpoint cần role cụ thể:

| Endpoint | Method | Required Role |
|----------|--------|---------------|
| `/api/vehicles` | POST | EV_OWNER, ADMIN |
| `/api/vehicles/my-vehicles` | GET | Any authenticated |
| `/api/vehicles` | GET | ADMIN, CVA |
| `/api/journeys` | POST | EV_OWNER |
| `/api/journeys/my-journeys` | GET | Any authenticated |

## 🔑 Decode JWT để kiểm tra:

Truy cập https://jwt.io và paste token của bạn vào.

Payload nên có dạng:
```json
{
  "sub": "evowner1",
  "role": "EV_OWNER",
  "userId": "12345678-1234-1234-1234-123456789012",
  "iat": 1600000000,
  "exp": 1600086400
}
```

**Quan trọng**: Claim "role" phải có giá trị là String (ví dụ: "EV_OWNER"), không phải Object.

## 💡 Tips:

1. **Token expired?** - Login lại để lấy token mới
2. **403 Forbidden?** - User không có quyền truy cập (role không đúng)
3. **401 Unauthorized?** - Token không hợp lệ hoặc không được gửi
4. **Token mới có role đúng chưa?** - Phải login lại sau khi fix code để lấy token mới có format đúng

## ✨ Test thành công khi:

- API trả về status 200 hoặc 201
- Response body có dữ liệu chính xác
- Console log hiển thị: `✅ Authentication set in SecurityContext for user: {username}`

