CREATE TABLE production_costs_type (
    name VARCHAR(255) NOT NULL UNIQUE CHECK (name = UPPER(name))
);
