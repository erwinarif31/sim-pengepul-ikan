DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM sales_details
        GROUP BY sales_id
        HAVING COUNT(DISTINCT bagang_id) > 1
            OR (COUNT(bagang_id) > 0 AND COUNT(bagang_id) <> COUNT(*))
    ) THEN
        RAISE EXCEPTION 'cannot downgrade mixed-Bagang sales without losing source allocations';
    END IF;
END $$;

ALTER TABLE sales ADD COLUMN bagang_id UUID;
ALTER TABLE sales ADD CONSTRAINT fk_sales_bagang FOREIGN KEY (bagang_id) REFERENCES bagang(id) ON DELETE SET NULL;
CREATE INDEX idx_sales_bagang_id ON sales(bagang_id);

UPDATE sales
SET bagang_id = source.bagang_id
FROM (
    SELECT sales_id, MIN(bagang_id) AS bagang_id
    FROM sales_details
    WHERE bagang_id IS NOT NULL
    GROUP BY sales_id
    HAVING COUNT(DISTINCT bagang_id) = 1
) AS source
WHERE sales.id = source.sales_id;

DROP INDEX IF EXISTS idx_sales_details_bagang_id;
ALTER TABLE sales_details DROP CONSTRAINT IF EXISTS fk_sales_details_bagang;
ALTER TABLE sales_details DROP COLUMN IF EXISTS bagang_id;
