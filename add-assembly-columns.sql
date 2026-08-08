-- This script updates the database schema to add the Assembly component
-- (Assembly Fee) to the quotations table.
--
-- Usage:
--   docker exec -i luxtronic_postgres psql -U luxtronic_user -d luxtronic_db < add-assembly-columns.sql

ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS assembly_details TEXT,
ADD COLUMN IF NOT EXISTS assembly_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS assembly_unit INT,
ADD COLUMN IF NOT EXISTS assembly_upgrade_note TEXT;
