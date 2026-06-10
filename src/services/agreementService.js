const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = [
  'unit_id',
  'tenant_id',
  'start_date',
  'end_date',
  'monthly_rent',
  'security_deposit',
  'advance_paid',
  'status',
  'notes',
];

const list = async () => {
  const result = await pool.query(`
    SELECT a.*, u.unit_number, p.name as property_name, t.name as tenant_name
    FROM agreements a
    JOIN units u ON a.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN tenants t ON a.tenant_id = t.id
    ORDER BY a.start_date DESC
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, u.unit_number, p.name as property_name, t.name as tenant_name
     FROM agreements a
     JOIN units u ON a.unit_id = u.id
     JOIN properties p ON u.property_id = p.id
     JOIN tenants t ON a.tenant_id = t.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingAgreement = await client.query(
      'SELECT id FROM agreements WHERE unit_id = $1 AND status = $2',
      [data.unit_id, 'active']
    );

    if (existingAgreement.rows.length > 0) {
      const error = new Error('Unit already has an active agreement');
      error.statusCode = 400;
      throw error;
    }

    const result = await client.query(
      `INSERT INTO agreements (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit, advance_paid, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.unit_id,
        data.tenant_id,
        data.start_date,
        data.end_date,
        data.monthly_rent,
        data.security_deposit || 0,
        data.advance_paid || 0,
        data.status || 'active',
        data.notes,
      ]
    );

    await client.query('UPDATE units SET is_occupied = true, updated_at = NOW() WHERE id = $1', [data.unit_id]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'agreements', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const terminate = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const agreementRes = await client.query('SELECT unit_id FROM agreements WHERE id = $1', [id]);
    const agreement = agreementRes.rows[0];
    if (!agreement) {
      await client.query('ROLLBACK');
      return null;
    }

    const result = await client.query(
      'UPDATE agreements SET status = $1, end_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
      ['terminated', id]
    );

    await client.query('UPDATE units SET is_occupied = false, updated_at = NOW() WHERE id = $1', [agreement.unit_id]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const agreementResult = await client.query(
      'SELECT * FROM agreements WHERE id = $1 FOR UPDATE',
      [id]
    );
    const agreement = agreementResult.rows[0];

    if (!agreement) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query('DELETE FROM rent_payments WHERE agreement_id = $1', [id]);
    await client.query(
      "DELETE FROM notifications WHERE related_id = $1 AND (related_type = 'agreement' OR related_type LIKE 'rent_due:%')",
      [id]
    );

    const deleteResult = await client.query('DELETE FROM agreements WHERE id = $1 RETURNING *', [id]);

    const activeAgreementResult = await client.query(
      'SELECT id FROM agreements WHERE unit_id = $1 AND status = $2 LIMIT 1',
      [agreement.unit_id, 'active']
    );

    if (activeAgreementResult.rows.length === 0) {
      await client.query('UPDATE units SET is_occupied = false, updated_at = NOW() WHERE id = $1', [agreement.unit_id]);
    }

    await client.query('COMMIT');
    return deleteResult.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  create,
  getById,
  list,
  remove,
  terminate,
  update,
};
