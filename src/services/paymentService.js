const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = [
  'agreement_id',
  'unit_id',
  'tenant_id',
  'payment_month',
  'amount_due',
  'amount_paid',
  'payment_date',
  'payment_mode',
  'is_advance',
  'is_late',
  'notes',
];

const list = async () => {
  const result = await pool.query(`
    WITH agreement_months AS (
      SELECT
        a.id AS agreement_id,
        a.unit_id,
        a.tenant_id,
        a.monthly_rent,
        generate_series(
          date_trunc('month', a.start_date)::date,
          date_trunc('month', LEAST(COALESCE(a.end_date, CURRENT_DATE), CURRENT_DATE))::date,
          INTERVAL '1 month'
        )::date AS payment_month
      FROM agreements a
      WHERE a.status = 'active'
        AND a.start_date <= CURRENT_DATE
        AND (a.end_date IS NULL OR a.end_date >= a.start_date)
    ),
    payment_totals AS (
      SELECT
        agreement_id,
        date_trunc('month', payment_month)::date AS payment_month,
        MAX(id) AS id,
        MAX(amount_due) AS amount_due,
        SUM(amount_paid) AS amount_paid,
        MAX(payment_date) AS payment_date,
        MAX(payment_mode) AS payment_mode,
        BOOL_OR(is_advance) AS is_advance,
        BOOL_OR(is_late) AS is_late,
        STRING_AGG(NULLIF(notes, ''), ' | ') AS notes
      FROM rent_payments
      GROUP BY agreement_id, date_trunc('month', payment_month)::date
    )
    SELECT
      pt.id,
      (am.agreement_id::text || '-' || to_char(am.payment_month, 'YYYY-MM')) AS payment_key,
      am.agreement_id,
      am.unit_id,
      am.tenant_id,
      am.payment_month,
      COALESCE(pt.amount_due, am.monthly_rent) AS amount_due,
      COALESCE(pt.amount_paid, 0) AS amount_paid,
      COALESCE(pt.amount_due, am.monthly_rent) - COALESCE(pt.amount_paid, 0) AS balance,
      pt.payment_date,
      pt.payment_mode,
      COALESCE(pt.is_advance, false) AS is_advance,
      COALESCE(pt.is_late, false) AS is_late,
      pt.notes,
      pt.id IS NULL AS is_virtual_due,
      u.unit_number,
      p.name AS property_name,
      t.name AS tenant_name
    FROM agreement_months am
    LEFT JOIN payment_totals pt
      ON pt.agreement_id = am.agreement_id
      AND pt.payment_month = am.payment_month
    JOIN units u ON am.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN tenants t ON am.tenant_id = t.id
    ORDER BY am.payment_month DESC, p.name, u.unit_number
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    `SELECT rp.*, u.unit_number, p.name as property_name, t.name as tenant_name
     FROM rent_payments rp
     JOIN units u ON rp.unit_id = u.id
     JOIN properties p ON u.property_id = p.id
     JOIN tenants t ON rp.tenant_id = t.id
     WHERE rp.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (data) => {
  const existingResult = await pool.query(
    'SELECT id, amount_paid FROM rent_payments WHERE agreement_id = $1 AND payment_month = $2',
    [data.agreement_id, data.payment_month]
  );

  if (existingResult.rows.length > 0) {
    const existingPayment = existingResult.rows[0];
    const newTotalPaid = Number(existingPayment.amount_paid) + Number(data.amount_paid || 0);
    const result = await pool.query(
      `UPDATE rent_payments
       SET amount_paid = $1, payment_date = $2, payment_mode = $3, notes = CONCAT(COALESCE(notes, ''), ' | ', $4::text), updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [newTotalPaid, data.payment_date, data.payment_mode, data.notes || '', existingPayment.id]
    );
    return result.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO rent_payments
     (agreement_id, unit_id, tenant_id, payment_month, amount_due, amount_paid, payment_date, payment_mode, is_advance, is_late, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      data.agreement_id,
      data.unit_id,
      data.tenant_id,
      data.payment_month,
      data.amount_due,
      data.amount_paid || 0,
      data.payment_date,
      data.payment_mode,
      data.is_advance || false,
      data.is_late || false,
      data.notes,
    ]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({ table: 'rent_payments', id, data, allowedFields: writableFields });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM rent_payments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update,
};
