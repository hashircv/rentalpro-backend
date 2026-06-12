-- ============================================================
-- RENTAL PROPERTY MANAGEMENT SYSTEM — SEED DATA
-- ============================================================

-- Create default admin
INSERT INTO users (name, email, password_hash, role)
VALUES ('Super Admin', 'admin@example.com', '$2a$10$X8O9jB9qY.cZ.j/Z/6z.8.Q6z.8.Q6z.8.Q6z.8.Q6z.8.Q6z.8.Q', 'super_admin') -- password: password
ON CONFLICT DO NOTHING;

-- Insert Properties
INSERT INTO properties (name, address, property_type, total_units) VALUES
('HABEEBASS APARTMENT', 'Habeebass St', 'apartment', 5),
('AR APARTMENTS', 'AR St', 'apartment', 10),
('SUMMAYAS APARTMENTS', 'Summayas St', 'apartment', 10),
('TOWN HALL', 'Town Hall Rd', 'townhall', 2);

-- Insert Units for HABEEBASS APARTMENT (ID: 1)
-- Ground Floor: 2, Second Floor: 3
INSERT INTO units (property_id, unit_number, floor_number, floor_label, unit_type, monthly_rent) VALUES
(1, 'G1', 0, 'Ground Floor', 'house', 10000),
(1, 'G2', 0, 'Ground Floor', 'house', 10000),
(1, 'S1', 2, 'Second Floor', 'house', 12000),
(1, 'S2', 2, 'Second Floor', 'house', 12000),
(1, 'S3', 2, 'Second Floor', 'house', 12000);

-- Insert Units for AR APARTMENTS (ID: 2)
-- GF: 3, 1F: 3, 2F: 3, 3F: 1
INSERT INTO units (property_id, unit_number, floor_number, floor_label, unit_type, monthly_rent) VALUES
(2, 'G1', 0, 'Ground Floor', 'house', 15000),
(2, 'G2', 0, 'Ground Floor', 'house', 15000),
(2, 'G3', 0, 'Ground Floor', 'house', 15000),
(2, '101', 1, 'First Floor', 'house', 16000),
(2, '102', 1, 'First Floor', 'house', 16000),
(2, '103', 1, 'First Floor', 'house', 16000),
(2, '201', 2, 'Second Floor', 'house', 17000),
(2, '202', 2, 'Second Floor', 'house', 17000),
(2, '203', 2, 'Second Floor', 'house', 17000),
(2, '301', 3, 'Third Floor', 'house', 18000);

-- Insert Units for SUMMAYAS APARTMENTS (ID: 3)
-- GF: 3, 1F: 3, 2F: 3, 3F: 1
INSERT INTO units (property_id, unit_number, floor_number, floor_label, unit_type, monthly_rent) VALUES
(3, 'G1', 0, 'Ground Floor', 'house', 15000),
(3, 'G2', 0, 'Ground Floor', 'house', 15000),
(3, 'G3', 0, 'Ground Floor', 'house', 15000),
(3, '101', 1, 'First Floor', 'house', 16000),
(3, '102', 1, 'First Floor', 'house', 16000),
(3, '103', 1, 'First Floor', 'house', 16000),
(3, '201', 2, 'Second Floor', 'house', 17000),
(3, '202', 2, 'Second Floor', 'house', 17000),
(3, '203', 2, 'Second Floor', 'house', 17000),
(3, '301', 3, 'Third Floor', 'house', 18000);

-- Insert Units for TOWN HALL (ID: 4)
-- Total Rooms: 2 (Rental Room)
INSERT INTO units (property_id, unit_number, floor_number, floor_label, unit_type, monthly_rent) VALUES
(4, 'R1', 0, 'Ground Floor', 'room', 5000),
(4, 'R2', 0, 'Ground Floor', 'room', 5000);

-- Insert Some Dummy Tenants
INSERT INTO tenants (name, phone, email, aadhaar_number, occupation, family_members, address) VALUES
('John Doe', '9876543210', 'john@example.com', '123456789012', 'Software Engineer', 2, '123 Main St'),
('Jane Smith', '9876543211', 'jane@example.com', '123456789013', 'Teacher', 3, '456 Oak St');

-- Insert Dummy Agreements (make units occupied)
INSERT INTO agreements (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit, advance_paid, status) VALUES
(1, 1, '2023-01-01', '2024-12-31', 10000, 50000, 10000, 'active'),
(11, 2, '2023-06-01', '2024-05-31', 15000, 75000, 15000, 'active');

UPDATE units SET is_occupied = TRUE WHERE id IN (1, 11);

-- Insert Some dummy payments
INSERT INTO rent_payments (agreement_id, unit_id, tenant_id, payment_month, amount_due, amount_paid, payment_date, payment_mode, collected_by) VALUES
(1, 1, 1, '2024-05-01', 10000, 10000, '2024-05-05', 'upi', 'Super Admin'),
(2, 11, 2, '2024-05-01', 15000, 15000, '2024-05-02', 'bank_transfer', 'Super Admin');

-- Insert Some dummy expenses
INSERT INTO expenses (property_id, category, amount, expense_date, description, payment_mode) VALUES
(1, 'EB Bill', 1500, '2024-05-10', 'Common area electricity', 'upi'),
(2, 'Maintenance', 5000, '2024-05-15', 'Plumbing repair', 'cash');

-- Insert some dummy notifications
INSERT INTO notifications (type, title, message) VALUES
('general', 'System initialized', 'Welcome to the Rental Property Management System.');
