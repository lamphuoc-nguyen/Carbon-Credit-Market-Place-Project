-- Add status field for tracking profile completion
ALTER TABLE Users ADD status VARCHAR(20) NOT NULL DEFAULT 'INCOMPLETE';
GO

-- Update existing users to have ACTIVE status if they have roles
UPDATE Users SET status = 'ACTIVE' WHERE roleID IS NOT NULL;
GO
