ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS vehicle_tag_id UUID;

CREATE TABLE IF NOT EXISTS vehicle_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    revenda_id UUID REFERENCES revendas(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#3B82F6',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, revenda_id, name)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_vehicles_vehicle_tag'
    ) THEN
        ALTER TABLE vehicles
            ADD CONSTRAINT fk_vehicles_vehicle_tag
            FOREIGN KEY (vehicle_tag_id)
            REFERENCES vehicle_tags(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_tags_tenant_id ON vehicle_tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tags_revenda_id ON vehicle_tags(revenda_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_tag_id ON vehicles(vehicle_tag_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_parties_tenant_document_unique
    ON vehicle_parties (
        tenant_id,
        regexp_replace(COALESCE(document, ''), '\\D', '', 'g')
    )
    WHERE regexp_replace(COALESCE(document, ''), '\\D', '', 'g') <> '';
