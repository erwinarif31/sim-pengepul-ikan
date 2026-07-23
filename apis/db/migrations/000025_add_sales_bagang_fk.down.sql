DROP INDEX IF EXISTS idx_sales_bagang_id;
ALTER TABLE sales DROP CONSTRAINT IF EXISTS fk_sales_bagang;
ALTER TABLE sales DROP COLUMN IF EXISTS bagang_id;
