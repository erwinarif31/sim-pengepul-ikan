ALTER TABLE harvests ADD COLUMN harvests_season integer DEFAULT 1;
ALTER TABLE harvests ADD CONSTRAINT fk_harvests_seasons FOREIGN KEY (harvests_season) REFERENCES seasons (id);
