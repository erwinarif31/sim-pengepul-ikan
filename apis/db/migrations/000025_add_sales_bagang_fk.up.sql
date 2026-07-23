ALTER TABLE sales ADD COLUMN bagang_id UUID;
ALTER TABLE sales ADD CONSTRAINT fk_sales_bagang FOREIGN KEY (bagang_id) REFERENCES bagang(id) ON DELETE SET NULL;
CREATE INDEX idx_sales_bagang_id ON sales(bagang_id);
