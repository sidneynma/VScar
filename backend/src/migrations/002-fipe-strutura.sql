CREATE TABLE fipe_reference (
  id SERIAL PRIMARY KEY,
  codigo_tabela INT NOT NULL,
  mes_referencia VARCHAR(100) NOT NULL,
  ano INT NOT NULL,
  mes INT NOT NULL,
  ativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fipe_consult_history (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  fipe_reference_id INT REFERENCES fipe_reference(id),
  valor NUMERIC(15,2),
  codigo_fipe VARCHAR(20),
  marca VARCHAR(100),
  modelo VARCHAR(150),
  ano_modelo INT,
  combustivel VARCHAR(50),
  autenticacao VARCHAR(100),
  sigla_combustivel VARCHAR(10),
  data_consulta TIMESTAMP,
  raw_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE vehicles
ADD COLUMN fipe_code VARCHAR(20),
ADD COLUMN current_fipe_value NUMERIC(15,2),
ADD COLUMN fipe_reference_id INT REFERENCES fipe_reference(id);