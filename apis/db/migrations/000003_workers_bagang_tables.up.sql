ALTER TABLE bagang ADD COLUMN worker_id UUID;
ALTER TABLE bagang ADD CONSTRAINT fk_bagang_worker FOREIGN KEY (worker_id) REFERENCES workers (id);

ALTER TABLE bagang ADD COLUMN owner_id UUID;
ALTER TABLE bagang ADD CONSTRAINT fk_bagang_owner FOREIGN KEY (owner_id) REFERENCES workers (id);
