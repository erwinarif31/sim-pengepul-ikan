ALTER TABLE production_costs ADD COLUMN created_by uuid;
ALTER TABLE production_costs ADD CONSTRAINT fk_production_costs_created_by FOREIGN KEY (created_by) REFERENCES workers (id);
ALTER TABLE production_costs ADD COLUMN created_by_name varchar(255);
