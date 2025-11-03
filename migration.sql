-- This script updates the database schema from the old version to the new version.
-- It adds price columns for each component to the quotations table.

ALTER TABLE quotations
ADD COLUMN cpu_price NUMERIC(10, 2),
ADD COLUMN cpu_cooling_price NUMERIC(10, 2),
ADD COLUMN motherboard_price NUMERIC(10, 2),
ADD COLUMN ram_price NUMERIC(10, 2),
ADD COLUMN storage1_price NUMERIC(10, 2),
ADD COLUMN storage2_price NUMERIC(10, 2),
ADD COLUMN gpu_price NUMERIC(10, 2),
ADD COLUMN case_price NUMERIC(10, 2),
ADD COLUMN psu_price NUMERIC(10, 2),
ADD COLUMN sys_fan_price NUMERIC(10, 2),
ADD COLUMN os_price NUMERIC(10, 2),
ADD COLUMN monitor_price NUMERIC(10, 2),
ADD COLUMN others_price NUMERIC(10, 2);
