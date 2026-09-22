-- Catchery Seasons Seed
-- Seeds 1 active season started three months ago
-- Run after 01_reference_data.sql

BEGIN;

-- 1 Active Season (started three months ago, still ongoing)
INSERT INTO seasons (start_date, end_date) VALUES 
    (CURRENT_DATE - INTERVAL '3 months', NULL); -- Active season

COMMIT;

SELECT 'Seasons data seeded successfully' AS status;
SELECT id, start_date, end_date FROM seasons ORDER BY id;
