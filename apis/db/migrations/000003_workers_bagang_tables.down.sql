ALTER TABLE bagang DROP COLUMN worker_id;
ALTER TABLE bagang DROP CONSTRAINT fk_bagang_worker;

ALTER TABLE bagang DROP COLUMN owner_id;
ALTER TABLE bagang DROP CONSTRAINT fk_bagang_owner;
