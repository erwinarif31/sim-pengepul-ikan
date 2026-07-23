DROP INDEX IF EXISTS users_worker_id_idx;
DROP INDEX IF EXISTS users_role_idx;
DROP INDEX IF EXISTS users_token_idx;
DROP INDEX IF EXISTS users_worker_id_unique;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_worker'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT fk_users_worker;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT chk_users_role;
    END IF;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS token_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS worker_id;
ALTER TABLE users DROP COLUMN IF EXISTS role;
