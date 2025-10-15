-- Insert a sample user for development and manual testing
-- Updated to include username field
INSERT INTO Users (email, username, name, passwordHash, provider, roleID, created_at)
VALUES (
           'test@example.com',
           'testuser',
           'Test User',
           '$2a$10$WazzjaaCSio/CeFW3bVtceG1b3iqC9r6SfvNXL9wazul9Yxt41a4m',
           'LOCAL',
           (SELECT roleID FROM Roles WHERE roleName = 'buyer'),
           GETDATE()
       );