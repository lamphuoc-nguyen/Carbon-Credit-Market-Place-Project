-- ========================================================================
-- Certificate Issue Date Migration (Simplified - No Snapshots)
-- Date: 2025-11-01
-- Purpose: Add issue_date field to certificates table
-- ========================================================================

-- Step 1: Add issue_date column to certificates table
-- ========================================================================
ALTER TABLE certificates
ADD COLUMN issue_date DATE;

-- Step 2: Populate issue_date for existing records
-- Use retirement_date as the default value
-- ========================================================================
UPDATE certificates
SET issue_date = retirement_date
WHERE issue_date IS NULL;

-- Step 3: Make issue_date NOT NULL after populating
-- ========================================================================
ALTER TABLE certificates
ALTER COLUMN issue_date SET NOT NULL;

-- ========================================================================
-- Verification Queries
-- ========================================================================

-- Check if issue_date is populated
SELECT
    COUNT(*) as total_certificates,
    COUNT(issue_date) as with_issue_date,
    COUNT(*) - COUNT(issue_date) as missing_issue_date
FROM certificates;

-- View sample certificates with issue dates
SELECT
    certificate_code,
    issue_date,
    retirement_date,
    created_at,
    status
FROM certificates
ORDER BY created_at DESC
LIMIT 10;

-- ========================================================================
-- Rollback Script (Use with caution!)
-- ========================================================================
/*
-- To rollback this migration, uncomment and run:
ALTER TABLE certificates DROP COLUMN IF EXISTS issue_date;
*/

