CREATE TABLE IF NOT EXISTS vehicle_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document VARCHAR(30),
    profile_type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (profile_type IN ('owner', 'buyer', 'both')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_party_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES vehicle_parties(id) ON DELETE CASCADE,
    relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('owner', 'buyer')),
    event_date DATE DEFAULT CURRENT_DATE,
    sale_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_parties_tenant_id ON vehicle_parties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_party_history_tenant_id ON vehicle_party_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_party_history_party_id ON vehicle_party_history(party_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_party_history_vehicle_id ON vehicle_party_history(vehicle_id);
