-- =============================================================================
-- FAVORITES FEATURE - DATABASE MIGRATION SCRIPT
-- =============================================================================
-- This script adds the favorites table to your existing quotation database.
-- Run this on your live server to enable cross-device synchronized favorites.
--
-- Usage: Execute this script in your PostgreSQL database after deploying 
--        the updated application code.
-- =============================================================================

-- UBUNTU SERVER DEPLOYMENT COMMANDS:
-- ===================================
-- 
-- Option 1: Using psql directly (if PostgreSQL is installed locally)
-- sudo -u postgres psql -d your_database_name -f add-favorites-table.sql
--
-- Option 2: Using Docker (if PostgreSQL runs in Docker)
-- cat add-favorites-table.sql | docker exec -i your_postgres_container psql -U your_username -d your_database_name
--
-- Option 3: Copy and paste into psql interactive session
-- sudo -u postgres psql -d your_database_name
-- Then copy and paste the SQL commands below
--
-- Option 4: Using a database management tool (pgAdmin, DBeaver, etc.)
-- Simply run this entire script in your SQL editor
-- 
-- Replace the following placeholders with your actual values:
-- - your_database_name: Your PostgreSQL database name
-- - your_postgres_container: Your Docker container name (if using Docker)
-- - your_username: Your PostgreSQL username
-- ===================================

-- Add favorites table to existing database
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    quotation_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    UNIQUE(quotation_id) -- Prevents duplicate favorites for the same quotation
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_quotation_id ON favorites(quotation_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- =============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the table was created)
-- =============================================================================

-- Check if table was created successfully
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'favorites' 
-- ORDER BY ordinal_position;

-- Check indexes were created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'favorites';

-- =============================================================================
-- UBUNTU SERVER DEPLOYMENT STEPS:
-- =============================================================================
-- 1. Upload this file to your Ubuntu server
-- 2. Deploy your updated application code
-- 3. Run one of the commands above to execute this SQL script
-- 4. Restart your Node.js application
-- 5. Test the favorites functionality
-- 
-- Example complete deployment sequence:
-- scp add-favorites-table.sql user@your-server:/path/to/your/app/
-- ssh user@your-server
-- cd /path/to/your/app/
-- sudo -u postgres psql -d your_database_name -f add-favorites-table.sql
-- pm2 restart your-app  # or however you restart your Node.js app
-- =============================================================================

-- =============================================================================
-- NOTES FOR LIVE DEPLOYMENT:
-- =============================================================================
-- 1. This script is safe to run multiple times (uses IF NOT EXISTS)
-- 2. The UNIQUE constraint on quotation_id prevents duplicate favorites
-- 3. Foreign key constraint ensures data integrity (favorites auto-delete when quotation is deleted)
-- 4. Indexes improve query performance for large datasets
-- 5. No existing data will be affected - this only adds new functionality
-- =============================================================================
