ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_status_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_status_check
CHECK (status IN ('draft', 'active', 'inactive', 'archived', 'sold', 'preparing'));
