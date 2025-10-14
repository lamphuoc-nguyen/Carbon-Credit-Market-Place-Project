# Hướng dẫn tích hợp API Backend

## Cấu hình

### 1. Thiết lập biến môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```bash
cp .env.example .env
```

Sau đó cập nhật URL của backend server:

```env
VITE_API_URL=http://localhost:8080/api/auth
```

### 2. Cấu trúc API Service

Dự án đã được tích hợp các API service sau:

#### `src/service/index.ts`
- Cấu hình axios instance
- Thêm interceptor tự động gắn token vào header
- Xử lý lỗi chung (401, 403, 500)

#### `src/service/user.js`
- `login(credentials)` - Đăng nhập
- `register(userData)` - Đăng ký tài khoản
- `logout()` - Đăng xuất
- `getCurrentUser()` - Lấy thông tin user hiện tại
- `getAuthToken()` - Lấy auth token
- `getAllUsers()` - Lấy danh sách users
- `getUserById(id)` - Lấy thông tin user theo ID
- `createUser(userData)` - Tạo user mới
- `updateUser(id, userData)` - Cập nhật user
- `deleteUser(id)` - Xóa user

## Sử dụng API

### Login Form

File: `src/pages/LoginForm.jsx`

```javascript
// API được gọi khi user submit form login
const response = await userApi.login({
    username: formData.username,
    password: formData.password
});

// Response sẽ tự động lưu token vào localStorage
// Token: localStorage.getItem('authToken')
// User info: localStorage.getItem('user')
```

### Register Form

File: `src/pages/RegisterForm.jsx`

```javascript
// API được gọi khi user submit form register
const response = await userApi.register({
    email: formData.email,
    username: formData.username,
    phone: formData.phone,
    password: formData.password,
    role: formData.businessType
});

// Sau khi đăng ký thành công, user sẽ được chuyển về trang login
```

## Format API Response mong đợi từ Backend

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "carbon-credit-producer"
  }
}
```

### Register Response
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Error Response
```json
{
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

## Features

### 🔐 Authentication
- ✅ Login với username/password
- ✅ Register tài khoản mới
- ✅ Tự động lưu token vào localStorage
- ✅ Remember Me functionality

### 🔄 Request Interceptor
- ✅ Tự động thêm Bearer token vào mỗi request
- ✅ Xử lý lỗi 401 (Unauthorized) - tự động logout
- ✅ Xử lý lỗi 403 (Forbidden)
- ✅ Xử lý lỗi 500 (Server Error)

### 🎨 UI/UX
- ✅ Loading state khi gọi API
- ✅ Hiển thị lỗi từ API
- ✅ Disable button khi đang submit
- ✅ Form validation

## Endpoints Backend cần implement

```
POST /api/auth/login
POST /api/auth/register
GET  /api/users
GET  /api/users/:id
POST /api/users
PUT  /api/users/:id
DELETE /api/users/:id
```

## Testing

### Test Login
1. Nhập username và password
2. Click "Log In"
3. Kiểm tra console và Network tab trong DevTools
4. Xem token được lưu trong localStorage

### Test Register
1. Điền đầy đủ thông tin form
2. Click "Sign Up"
3. Kiểm tra console để xem response
4. Sau khi thành công, được redirect về trang login

## Lưu ý quan trọng

⚠️ **Backend URL**: Đảm bảo cập nhật đúng URL backend trong file `.env`

⚠️ **CORS**: Backend cần enable CORS cho frontend URL

⚠️ **Token Format**: Backend cần trả về token theo format JWT

⚠️ **Response Structure**: Backend response cần match với format mong đợi ở trên

## Troubleshooting

### Lỗi "Network Error"
- Kiểm tra backend server có đang chạy không
- Kiểm tra URL trong file `.env`
- Kiểm tra CORS settings ở backend

### Lỗi "401 Unauthorized"
- Token hết hạn hoặc không hợp lệ
- Cần login lại

### Lỗi "CORS"
- Backend cần enable CORS
- Thêm origin của frontend vào whitelist

## Dependencies

```json
{
  "axios": "^1.12.2",
  "react-router-dom": "^7.9.4"
}
```
