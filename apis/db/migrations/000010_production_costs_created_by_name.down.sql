ALTER TABLE production_costs DROP COLUMN created_by;
ALTER TABLE production_costs DROP COLUMN created_by_name;
ALTER TABLE production_costs DROP CONSTRAINT fk_production_costs_created_by;
