-- 002_indexes.sql
CREATE INDEX IF NOT EXISTS idx_people_active ON people(active);
CREATE INDEX IF NOT EXISTS idx_payments_paid_on ON payments(paid_on);
CREATE INDEX IF NOT EXISTS idx_payments_person ON payments(person_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);