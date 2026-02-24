ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS renavam VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis VARCHAR(30);

UPDATE vehicles
SET plate = CONCAT('SEMPLACA-', SUBSTRING(id::text, 1, 8))
WHERE plate IS NULL OR TRIM(plate) = '';

ALTER TABLE vehicles ALTER COLUMN plate SET NOT NULL;
DROP INDEX IF EXISTS idx_vehicles_plate_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_tenant_plate_unique ON vehicles (tenant_id, plate);
