-- Add username field to Users table
ALTER TABLE Users ADD username VARCHAR(50) UNIQUE;

-- Create index for better performance on username searches
CREATE INDEX idx_users_username ON Users(username);

-- Update existing users with a default username based on their email
-- This is a temporary measure for existing data
UPDATE Users
SET username = LEFT(email, CHARINDEX('@', email) - 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Make username NOT NULL after populating existing records
ALTER TABLE Users ALTER COLUMN username VARCHAR(50) NOT NULL;
