-- Add missing username column and profile_status to existing Users table
ALTER TABLE Users ADD username VARCHAR(50) NULL UNIQUE;
GO

-- Add profile_status column with default value 0 (incomplete)
ALTER TABLE Users ADD profile_status INT NOT NULL DEFAULT 0;
GO

-- Make roleID nullable to support incomplete profiles
ALTER TABLE Users ALTER COLUMN roleID INT NULL;
GO

-- Update existing users to have complete profiles (since they already have roles)
UPDATE Users SET profile_status = 1 WHERE roleID IS NOT NULL;
GO
