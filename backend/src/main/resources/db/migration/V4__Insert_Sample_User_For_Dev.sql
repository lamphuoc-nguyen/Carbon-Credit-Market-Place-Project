-- Insert a sample user for development and manual testing
-- Đã loại bỏ cột 'status'
INSERT INTO Users (email, name, passwordHash, provider, roleID, created_at)
VALUES (
           'test@example.com',
           'Test User',
           '$2a$10$WazzjaaCSio/CeFW3bVtceG1b3iqC9r6SfvNXL9wazul9Yxt41a4m',
           'LOCAL',
           (SELECT roleID FROM Roles WHERE roleName = 'buyer'),
           GETDATE()
       );