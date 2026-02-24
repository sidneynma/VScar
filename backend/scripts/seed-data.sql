-- Seed data for VSCar system

-- Insert initial admin tenant
INSERT INTO tenants (id, name, slug, email, phone, cnpj, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'VSCar Admin', 'vscar-admin', 'admin@vscar.com.br', '11999999999', '00.000.000/0000-00', 'active')
ON CONFLICT DO NOTHING;

-- Insert initial admin user (password: admin123)
INSERT INTO users (id, tenant_id, name, email, password_hash, role, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Admin VSCar', 'admin@vscar.com.br', '$2a$10$K4wWwxG0P5Jxz8Q9L1M2Ne8R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9', 'admin', 'active')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insert sample tenant (for testing)
INSERT INTO tenants (id, name, slug, email, phone, cnpj, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', 'Teste Revendas', 'teste-revendas', 'contato@teste.com.br', '11988888888', '11.222.333/0001-81', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample user for test tenant
INSERT INTO users (id, tenant_id, name, email, password_hash, role, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Gerenciador Teste', 'gerenciador@teste.com.br', '$2a$10$K4wWwxG0P5Jxz8Q9L1M2Ne8R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9', 'admin', 'active')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insert sample revenda
INSERT INTO revendas (id, tenant_id, name, cnpj, email, phone, address, city, state, postal_code, commission_percentage, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Revenda Centro', '12.345.678/0001-90', 'revenda@teste.com.br', '1133333333', 'Avenida Principal, 1000', 'São Paulo', 'SP', '01310-100', 5.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (id, tenant_id, revenda_id, title, brand, model, year, plate, color, fuel_type, transmission, mileage, price, description, vehicle_type, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Honda Civic 2022', 'Honda', 'Civic', 2022, 'ABC1D23', 'Preto', 'gasoline', 'automatic', 15000, 125000.00, 'Veículo em perfeito estado, único dono', 'car', 'available'),
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Toyota Corolla 2021', 'Toyota', 'Corolla', 2021, 'EFG4H56', 'Branco', 'gasoline', 'automatic', 25000, 95000.00, 'Corolla automático impecável', 'car', 'available')
ON CONFLICT DO NOTHING;

-- Insert portals
INSERT INTO portals (id, tenant_id, name, slug, is_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'OLX', 'olx', true),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Marketplace', 'marketplace', true)
ON CONFLICT DO NOTHING;
