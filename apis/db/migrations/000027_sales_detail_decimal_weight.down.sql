DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM sales_details WHERE weight <> ROUND(weight)) THEN
        RAISE EXCEPTION 'cannot downgrade decimal sales weights without losing precision';
    END IF;
END $$;

ALTER TABLE sales_details
    ALTER COLUMN weight TYPE INTEGER
    USING ROUND(weight)::integer;
