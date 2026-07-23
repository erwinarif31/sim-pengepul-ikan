CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    created_at BIGINT DEFAULT 0,
    updated_at BIGINT DEFAULT 0
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'WORKER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS worker_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires_at BIGINT DEFAULT 0;

UPDATE users SET role = 'WORKER' WHERE role IS NULL;
UPDATE users SET token_expires_at = 0 WHERE token_expires_at IS NULL;

ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN token_expires_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'OWNER', 'WORKER'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_worker'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_worker_id_unique ON users(worker_id) WHERE worker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_token_idx ON users(token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_worker_id_idx ON users(worker_id);
