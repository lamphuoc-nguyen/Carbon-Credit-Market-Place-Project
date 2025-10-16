-- Tạo bảng Roles với ràng buộc UNIQUE cho roleName
CREATE TABLE Roles (
                       roleID INT IDENTITY(1,1) PRIMARY KEY,
                       roleName VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Tạo bảng Users với đầy đủ các cột và ràng buộc ngay từ đầu
CREATE TABLE Users (
                       userID INT IDENTITY(1,1) PRIMARY KEY,
                       roleID INT NULL, -- Allow NULL for incomplete profiles
                       email VARCHAR(190) NOT NULL UNIQUE,
                       username VARCHAR(50) NULL UNIQUE, -- Allow NULL for OAuth2 users
                       passwordHash VARCHAR(255) NULL, -- Cho phép NULL cho tài khoản OAuth2
                       name VARCHAR(120) NOT NULL,
                       phone VARCHAR(32),
                       profile_status INT NOT NULL DEFAULT 0, -- 0 = incomplete, 1 = complete
                       provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
                       provider_id VARCHAR(255),
                       avatar_url VARCHAR(255),
                       created_at DATETIME,

    -- Tạo khóa ngoại (nullable)
                       CONSTRAINT FK_Users_Roles FOREIGN KEY (roleID) REFERENCES Roles(roleID)
);
GO

-- Tạo index có điều kiện cho các tài khoản OAuth2
CREATE UNIQUE INDEX uk_users_provider_provider_id_not_null
    ON Users(provider, provider_id)
    WHERE provider_id IS NOT NULL;
GO

-- Chèn các dữ liệu khởi tạo cho bảng Roles
INSERT INTO Roles (roleName) VALUES ('evowner');
INSERT INTO Roles (roleName) VALUES ('buyer');
INSERT INTO Roles (roleName) VALUES ('verifier');
INSERT INTO Roles (roleName) VALUES ('admin');
GO

-- Insert a test user for development (with complete profile)
INSERT INTO Users (email, username, name, passwordHash, provider, roleID, profile_status, created_at)
VALUES (
           'test@example.com',
           'testuser',
           'Test User',
           '$2a$10$WazzjaaCSio/CeFW3bVtceG1b3iqC9r6SfvNXL9wazul9Yxt41a4m', -- password: "password123"
           'LOCAL',
           (SELECT roleID FROM Roles WHERE roleName = 'buyer'),
           1, -- Complete profile
           GETDATE()
       );
GO
