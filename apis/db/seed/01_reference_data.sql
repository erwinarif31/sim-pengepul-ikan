-- Catchery Reference Data Seed
-- Seeds lookup/reference tables: harvest_types, production_costs_type
-- Run after truncate.sql

BEGIN;

-- Harvest Types (fish sizes)
INSERT INTO harvest_types (name) VALUES 
    ('Kecil'),
    ('Menengah'),
    ('Besar')
ON CONFLICT (name) DO NOTHING;

-- Production Cost Types (UPPERCASE required by CHECK constraint)
INSERT INTO production_costs_type (name) VALUES 
    ('MINYAK'),   -- Oil/Lubricant
    ('BERAS'),    -- Rice
    ('GULA'),     -- Sugar
    ('UTANG'),    -- Debt
    ('ES'),       -- Ice
    ('BBM')       -- Fuel
ON CONFLICT (name) DO NOTHING;

COMMIT;

SELECT 'Reference data seeded successfully' AS status;
