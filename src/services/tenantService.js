const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = [
  'name',
  'phone',
  'email',
  'aadhaar_number',
  'occupation',
  'family_members',
  'address',
  'is_active',
];

const list = async () => {
  const result = await pool.query('SELECT * FROM tenants ORDER BY name ASC');
  return result.rows;
};

const getById = async (id) => {
  const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
  const tenant = tenantResult.rows[0];
  if (!tenant) return null;

  const agreementsResult = await pool.query(
    `SELECT a.*, u.unit_number, p.name as property_name
     FROM agreements a
     JOIN units u ON a.unit_id = u.id
     JOIN properties p ON u.property_id = p.id
     WHERE a.tenant_id = $1
     ORDER BY a.start_date DESC`,
    [id]
  );

  const paymentsResult = await pool.query(
    `SELECT rp.*, u.unit_number, p.name as property_name
     FROM rent_payments rp
     JOIN units u ON rp.unit_id = u.id
     JOIN properties p ON u.property_id = p.id
     WHERE rp.tenant_id = $1
     ORDER BY rp.payment_month DESC`,
    [id]
  );

  return { ...tenant, agreements: agreementsResult.rows, payments: paymentsResult.rows };
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO tenants (name, phone, email, aadhaar_number, occupation, family_members, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.name, data.phone, data.email, data.aadhaar_number, data.occupation, data.family_members || 1, data.address]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'tenants', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update,
};
