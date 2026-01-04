ALTER TABLE harvests ADD COLUMN created_by uuid;
ALTER TABLE harvests ADD CONSTRAINT fk_harvests_created_by FOREIGN KEY (created_by) REFERENCES workers (id);
ALTER TABLE harvests ADD COLUMN created_by_name varchar(255);
