ALTER TABLE Users ADD provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE Users ADD provider_id VARCHAR(255);
ALTER TABLE Users ADD avatar_url VARCHAR(255);

-- Cho phép cột password là NULL cho các tài khoản social
ALTER TABLE Users ALTER COLUMN passwordHash VARCHAR(255) NULL;

-- Đảm bảo mỗi user từ một provider là duy nhất
CREATE UNIQUE INDEX uk_users_provider_provider_id ON Users(provider, provider_id);