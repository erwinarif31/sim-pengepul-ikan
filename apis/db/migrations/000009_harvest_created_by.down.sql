ALTER TABLE harvests DROP COLUMN created_by;
ALTER TABLE harvests DROP COLUMN created_by_name;
ALTER TABLE harvests DROP CONSTRAINT fk_harvests_created_by;
