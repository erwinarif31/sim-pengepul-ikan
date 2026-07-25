ALTER TABLE sales_details ADD COLUMN bagang_id UUID;
ALTER TABLE sales_details ADD CONSTRAINT fk_sales_details_bagang FOREIGN KEY (bagang_id) REFERENCES bagang(id) ON DELETE SET NULL;
CREATE INDEX idx_sales_details_bagang_id ON sales_details(bagang_id);

UPDATE sales_details AS detail
SET bagang_id = sales.bagang_id
FROM sales
WHERE sales.id = detail.sales_id
  AND detail.bagang_id IS NULL
  AND sales.bagang_id IS NOT NULL;

ALTER TABLE sales DROP CONSTRAINT IF EXISTS fk_sales_bagang;
DROP INDEX IF EXISTS idx_sales_bagang_id;
ALTER TABLE sales DROP COLUMN IF EXISTS bagang_id;
