-- Migration: User watchlist with add-event logging

CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INT NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, tmdb_id, media_type)
);

CREATE TABLE IF NOT EXISTS watchlist_events (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    watchlist_item_id INT REFERENCES watchlist_items(id) ON DELETE SET NULL,
    tmdb_id INT NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    action VARCHAR(20) NOT NULL DEFAULT 'added',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_watchlist_items_user_id'
    ) THEN
        CREATE INDEX idx_watchlist_items_user_id ON watchlist_items(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_watchlist_items_user_media_type'
    ) THEN
        CREATE INDEX idx_watchlist_items_user_media_type ON watchlist_items(user_id, media_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_watchlist_events_user_id'
    ) THEN
        CREATE INDEX idx_watchlist_events_user_id ON watchlist_events(user_id);
    END IF;
END $$;
