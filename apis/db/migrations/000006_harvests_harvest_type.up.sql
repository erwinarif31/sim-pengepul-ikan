ALTER TABLE harvests ADD COLUMN harvest_type VARCHAR(255) NOT NULL;
ALTER TABLE harvests ADD CONSTRAINT fk_harvests_harvest_types FOREIGN KEY (harvest_type) REFERENCES harvest_types (name);
