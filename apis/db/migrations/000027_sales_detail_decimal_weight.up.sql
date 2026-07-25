ALTER TABLE sales_details
    ALTER COLUMN weight TYPE NUMERIC(12, 3)
    USING weight::numeric;
