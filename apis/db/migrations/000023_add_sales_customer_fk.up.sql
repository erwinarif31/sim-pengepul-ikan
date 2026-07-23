ALTER TABLE sales ADD COLUMN customer_id UUID;
ALTER TABLE sales ADD CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
-- customer column remains as denormalized name for backward compatibility
