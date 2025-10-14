-- Xóa index cũ đang gây lỗi
DROP INDEX uk_users_provider_provider_id ON Users;

-- Tạo lại index mới, chỉ áp dụng cho các dòng có provider_id (tức là user OAuth2)
-- và một index riêng cho email để đảm bảo email là duy nhất trên toàn hệ thống
CREATE UNIQUE INDEX uk_users_provider_provider_id_not_null
    ON Users(provider, provider_id)
    WHERE provider_id IS NOT NULL;
