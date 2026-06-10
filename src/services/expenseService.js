const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = ['property_id', 'category', 'amount', 'expense_date', 'description', 'payment_mode'];

const list = async () => {
  const result = await pool.query(`
    SELECT e.*, p.name as property_name
    FROM expenses e
    LEFT JOIN properties p ON e.property_id = p.id
    ORDER BY e.expense_date DESC
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    `SELECT e.*, p.name as property_name
     FROM expenses e
     LEFT JOIN properties p ON e.property_id = p.id
     WHERE e.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO expenses (property_id, category, amount, expense_date, description, payment_mode)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.property_id, data.category, data.amount, data.expense_date, data.description, data.payment_mode]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'expenses', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update,
};
