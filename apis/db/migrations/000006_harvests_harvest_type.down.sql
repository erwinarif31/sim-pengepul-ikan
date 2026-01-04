ALTER TABLE harvests DROP COLUMN harvest_type;
ALTER TABLE harvests DROP CONSTRAINT fk_harvests_harvest_types;
