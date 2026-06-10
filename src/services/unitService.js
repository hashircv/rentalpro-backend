const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = [
  'property_id',
  'unit_number',
  'floor_number',
  'floor_label',
  'unit_type',
  'monthly_rent',
  'is_occupied',
  'description',
];

const list = async () => {
  const result = await pool.query(`
    SELECT u.*, p.name as property_name
    FROM units u
    JOIN properties p ON u.property_id = p.id
    ORDER BY p.id ASC, u.floor_number ASC, u.unit_number ASC
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    `SELECT u.*, p.name as property_name
     FROM units u
     JOIN properties p ON u.property_id = p.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO units (property_id, unit_number, floor_number, floor_label, unit_type, monthly_rent, is_occupied, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.property_id,
      data.unit_number,
      data.floor_number || 0,
      data.floor_label,
      data.unit_type || 'house',
      data.monthly_rent || 0,
      data.is_occupied || false,
      data.description,
    ]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'units', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM units WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update,
};
