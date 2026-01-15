-- Catchery Seasons Seed
-- Seeds 1 active season (current)
-- Run after 01_reference_data.sql

BEGIN;

-- 1 Active Season (started 4 months ago, still ongoing)
INSERT INTO seasons (start_date, end_date) VALUES 
    ('2025-09-15', NULL);           -- Active season - Sep 2025 to present

COMMIT;

SELECT 'Seasons data seeded successfully' AS status;
SELECT id, start_date, end_date FROM seasons ORDER BY id;
