-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cnpj VARCHAR(18) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(10),
    website VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'seller', 'viewer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Create revendas table
CREATE TABLE revendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    postal_code VARCHAR(10),
    website VARCHAR(255),
    contact_person VARCHAR(255),
    commission_percentage DECIMAL(5,2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    revenda_id UUID REFERENCES revendas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50),
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('gasoline', 'diesel', 'ethanol', 'hybrid', 'electric')),
    transmission VARCHAR(50) CHECK (transmission IN ('manual', 'automatic')),
    mileage INTEGER,
    price DECIMAL(12,2) NOT NULL,
    description TEXT,
    interior_color VARCHAR(50),
    doors INTEGER,
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('car', 'truck', 'motorcycle', 'van', 'suv')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicle images table
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    revenda_id UUID REFERENCES revendas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    portal_id UUID,
    portal_listing_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    contacts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create portals table
CREATE TABLE portals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    base_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Create portal mappings table
CREATE TABLE portal_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'synced', 'failed', 'archived')),
    sync_error TEXT,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, portal_id)
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    source VARCHAR(50) CHECK (source IN ('website', 'olx', 'marketplace', 'direct', 'other')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'rejected', 'sold')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'contact', 'share', 'like')),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_revendas_tenant_id ON revendas(tenant_id);
CREATE INDEX idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX idx_vehicles_revenda_id ON vehicles(revenda_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_announcements_tenant_id ON announcements(tenant_id);
CREATE INDEX idx_announcements_vehicle_id ON announcements(vehicle_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_portal_id ON announcements(portal_id);
CREATE INDEX idx_portals_tenant_id ON portals(tenant_id);
CREATE INDEX idx_portal_mappings_announcement_id ON portal_mappings(announcement_id);
CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX idx_contacts_announcement_id ON contacts(announcement_id);
CREATE INDEX idx_analytics_tenant_id ON analytics(tenant_id);
CREATE INDEX idx_analytics_announcement_id ON analytics(announcement_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
