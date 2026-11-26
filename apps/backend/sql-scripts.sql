-- The app's schema. Safe to run again on an existing database: it only adds what is missing.

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT,  -- NULL for accounts that sign in only with Google or GitHub
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- databases created before Google and GitHub sign-in had password_hash NOT NULL
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    session_id UUID PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens (user_id);

-- A Google or GitHub account linked to a user. provider_user_id is the provider's own stable id for the
-- person (Google's "sub", GitHub's numeric id), which never changes even when their email does.
CREATE TABLE IF NOT EXISTS oauth_accounts (
    provider         TEXT NOT NULL CHECK (provider IN ('google', 'github')),
    provider_user_id TEXT NOT NULL,
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts (user_id);

-- Sign-in attempts for rate limiting (see auth/rate_limit.py). Failed attempts stay for the lockout window,
-- successful ones are deleted, and old rows are pruned by the app, so the table stays small.
CREATE TABLE IF NOT EXISTS signin_attempts (
    id           BIGSERIAL PRIMARY KEY,
    email        TEXT NOT NULL,  -- lowercased, whether or not an account exists
    ip           TEXT NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signin_attempts_email_idx ON signin_attempts (email, attempted_at);
CREATE INDEX IF NOT EXISTS signin_attempts_ip_idx ON signin_attempts (ip, attempted_at);
CREATE INDEX IF NOT EXISTS signin_attempts_attempted_at_idx ON signin_attempts (attempted_at);
