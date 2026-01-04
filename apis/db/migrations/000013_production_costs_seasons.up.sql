ALTER TABLE production_costs ADD COLUMN production_costs_season integer DEFAULT 1;
ALTER TABLE production_costs ADD CONSTRAINT fk_production_costs_seasons FOREIGN KEY (production_costs_season) REFERENCES seasons (id);
