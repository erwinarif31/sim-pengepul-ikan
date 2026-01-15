-- Catchery Database Truncate Script
-- Truncates all tables in correct FK dependency order
-- Usage: psql -h localhost -U user -d catchery -f truncate.sql

BEGIN;

-- Disable FK checks temporarily for clean truncation
SET CONSTRAINTS ALL DEFERRED;

-- Truncate in reverse FK dependency order
TRUNCATE TABLE transaction_details CASCADE;
TRUNCATE TABLE sales_details CASCADE;
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE production_costs CASCADE;
TRUNCATE TABLE harvests CASCADE;
TRUNCATE TABLE bagang CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE workers CASCADE;
TRUNCATE TABLE seasons CASCADE;
TRUNCATE TABLE production_costs_type CASCADE;
TRUNCATE TABLE harvest_types CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS sales_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_details_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS transaction_details_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS seasons_id_seq RESTART WITH 1;

COMMIT;

-- Confirmation
SELECT 'All tables truncated successfully' AS status;
