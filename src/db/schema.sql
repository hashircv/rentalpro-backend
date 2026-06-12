-- ============================================================
-- RENTAL PROPERTY MANAGEMENT SYSTEM — DATABASE SCHEMA
-- ============================================================

-- Users (Admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'manager' CHECK (role IN ('super_admin', 'manager')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties (Apartment buildings / houses)
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  property_type VARCHAR(50) DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'house', 'townhall', 'other')),
  total_units INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Units (House / Flat / Room per property)
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  floor_number INT DEFAULT 0,
  floor_label VARCHAR(50),
  unit_type VARCHAR(20) NOT NULL DEFAULT 'house' CHECK (unit_type IN ('house', 'flat', 'room')),
  monthly_rent NUMERIC(10,2) DEFAULT 0,
  is_occupied BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(150),
  aadhaar_number VARCHAR(20),
  occupation VARCHAR(100),
  family_members INT DEFAULT 1,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agreements (Lease)
CREATE TABLE IF NOT EXISTS agreements (
  id SERIAL PRIMARY KEY,
  unit_id INT NOT NULL REFERENCES units(id),
  tenant_id INT NOT NULL REFERENCES tenants(id),
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(10,2) NOT NULL,
  security_deposit NUMERIC(10,2) DEFAULT 0,
  advance_paid NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'terminated', 'expired', 'renewed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rent Payments
CREATE TABLE IF NOT EXISTS rent_payments (
  id SERIAL PRIMARY KEY,
  agreement_id INT NOT NULL REFERENCES agreements(id),
  unit_id INT NOT NULL REFERENCES units(id),
  tenant_id INT NOT NULL REFERENCES tenants(id),
  payment_month DATE NOT NULL,
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  balance NUMERIC(10,2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
  payment_date DATE,
  payment_mode VARCHAR(30) CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')),
  collected_by VARCHAR(100),
  is_advance BOOLEAN DEFAULT FALSE,
  is_late BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE rent_payments
ADD COLUMN IF NOT EXISTS collected_by VARCHAR(100);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  property_id INT REFERENCES properties(id),
  category VARCHAR(80) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  payment_mode VARCHAR(30) CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rent_due', 'agreement_expiry', 'vacant_unit', 'general')),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  related_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_agreements_unit ON agreements(unit_id);
CREATE INDEX IF NOT EXISTS idx_agreements_tenant ON agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_agreement ON rent_payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payments_month ON rent_payments(payment_month);
CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
