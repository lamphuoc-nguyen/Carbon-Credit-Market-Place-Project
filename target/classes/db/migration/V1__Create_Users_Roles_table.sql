-- Tạo bảng Roles
CREATE TABLE Roles (
                       roleID INT IDENTITY(1,1) PRIMARY KEY,
                       roleName VARCHAR(50) NOT NULL
);

-- Tạo bảng Users
CREATE TABLE Users (
                       userID INT IDENTITY(1,1) PRIMARY KEY,
                       roleID INT NOT NULL,
                       email VARCHAR(190) NOT NULL UNIQUE,
                       passwordHash VARCHAR(255) NOT NULL,
                       name VARCHAR(120) NOT NULL,
                       created_at DATETIME,
                       phone VARCHAR(32),

    -- Tạo khóa ngoại liên kết đến bảng Roles
                       FOREIGN KEY (roleID) REFERENCES Roles(roleID)
);