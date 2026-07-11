CREATE UNIQUE INDEX idx_seasons_single_active ON seasons ((true)) WHERE end_date IS NULL;
