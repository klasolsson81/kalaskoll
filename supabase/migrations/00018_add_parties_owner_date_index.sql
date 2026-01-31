-- Composite index for dashboard queries that filter by owner_id and sort by party_date
CREATE INDEX IF NOT EXISTS idx_parties_owner_date ON parties(owner_id, party_date DESC);
