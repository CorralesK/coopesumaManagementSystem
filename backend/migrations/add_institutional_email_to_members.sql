-- Migration: Add institutional_email column to members table
-- Date: 2025-10-14
-- Description: Adds institutional_email field to store student email addresses

-- Add institutional_email column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS institutional_email VARCHAR(255);

-- Add unique constraint to ensure no duplicate emails
ALTER TABLE members
ADD CONSTRAINT members_institutional_email_unique UNIQUE (institutional_email);

-- Add check constraint to validate email format (must end with mep.go.cr)
ALTER TABLE members
ADD CONSTRAINT chk_institutional_email_format CHECK (
    institutional_email IS NULL OR
    institutional_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]*mep\.go\.cr$'
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_members_institutional_email
ON members(institutional_email)
WHERE institutional_email IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN members.institutional_email IS 'Student institutional email address (must end with mep.go.cr) - used for creating student user accounts';
