CREATE TABLE production_costs (
    id UUID PRIMARY KEY,
    bagang_id UUID NOT NULL,
    production_costs_type VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bagang_id) REFERENCES bagang (id),
    FOREIGN KEY (production_costs_type) REFERENCES production_costs_type (name)
);
