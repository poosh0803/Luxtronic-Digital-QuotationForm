-- One-off migration for databases created before created_at columns were
-- switched from TIMESTAMP (no time zone) to TIMESTAMPTZ.
--
-- Existing created_at values were always written as literal UTC clock digits
-- (frontend sends new Date().toISOString()), so `AT TIME ZONE 'UTC'` below
-- correctly reinterprets them as true UTC instants with no data loss.
--
-- New setups created from docker/init.sql don't need this.

ALTER TABLE quotations
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE favorites
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
