const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = ['name', 'address', 'property_type', 'total_units', 'description'];

const list = async () => {
  const result = await pool.query('SELECT * FROM properties ORDER BY id ASC');
  return result.rows;
};

const getById = async (id) => {
  const propResult = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
  const property = propResult.rows[0];
  if (!property) return null;

  const unitsResult = await pool.query(
    'SELECT * FROM units WHERE property_id = $1 ORDER BY floor_number ASC, unit_number ASC',
    [id]
  );

  return { ...property, units: unitsResult.rows };
};

const create = async ({ name, address, property_type, total_units, description }) => {
  const result = await pool.query(
    `INSERT INTO properties (name, address, property_type, total_units, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, address, property_type || 'apartment', total_units || 0, description]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'properties', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update,
};
