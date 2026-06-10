const { pool } = require('../db/db');
const { buildUpdateQuery } = require('../utils/queryHelpers');

const writableFields = ['type', 'title', 'message', 'is_read', 'related_id', 'related_type'];

const ensurePaymentDueReminders = async () => {
  await pool.query(
    `
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
          )::date AS due_month
        FROM agreements a
        WHERE a.status = 'active'
          AND a.start_date <= CURRENT_DATE
          AND (a.end_date IS NULL OR a.end_date >= a.start_date)
      ),
      monthly_dues AS (
        SELECT
          am.agreement_id,
          am.due_month,
          t.name AS tenant_name,
          p.name AS property_name,
          u.unit_number,
          am.monthly_rent,
          COALESCE(SUM(rp.amount_paid), 0) AS amount_paid,
          am.monthly_rent - COALESCE(SUM(rp.amount_paid), 0) AS balance
        FROM agreement_months am
        JOIN tenants t ON am.tenant_id = t.id
        JOIN units u ON am.unit_id = u.id
        JOIN properties p ON u.property_id = p.id
        LEFT JOIN rent_payments rp
          ON rp.agreement_id = am.agreement_id
          AND date_trunc('month', rp.payment_month)::date = am.due_month
        GROUP BY am.agreement_id, am.due_month, t.name, p.name, u.unit_number, am.monthly_rent
        HAVING am.monthly_rent - COALESCE(SUM(rp.amount_paid), 0) > 0
      )
      INSERT INTO notifications (type, title, message, is_read, related_id, related_type)
      SELECT
        'rent_due',
        'Rent due: ' || tenant_name || ' (' || to_char(due_month, 'YYYY-MM') || ')',
        tenant_name || ' has an unpaid rent balance of Rs ' ||
          trim(to_char(balance, 'FM9999999990.00')) ||
          ' for ' || to_char(due_month, 'YYYY-MM') || ' at ' || property_name || ' / Unit ' || unit_number || '.',
        false,
        agreement_id,
        'rent_due:' || to_char(due_month, 'YYYY-MM')
      FROM monthly_dues due
      WHERE NOT EXISTS (
        SELECT 1
        FROM notifications n
        WHERE n.type = 'rent_due'
          AND n.related_id = due.agreement_id
          AND n.related_type = 'rent_due:' || to_char(due.due_month, 'YYYY-MM')
      )
    `
  );
};

const ensureVacantUnitReminders = async () => {
  await pool.query(`
    DELETE FROM notifications n
    WHERE n.type = 'vacant_unit'
      AND n.related_type = 'vacant_unit'
      AND EXISTS (
        SELECT 1
        FROM units u
        WHERE u.id = n.related_id
          AND u.is_occupied = true
      )
  `);

  await pool.query(`
    WITH vacant_units AS (
      SELECT
        u.id AS unit_id,
        u.unit_number,
        u.floor_label,
        p.name AS property_name,
        u.monthly_rent
      FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE u.is_occupied = false
        AND NOT EXISTS (
          SELECT 1
          FROM agreements a
          WHERE a.unit_id = u.id
            AND a.status = 'active'
            AND a.start_date <= CURRENT_DATE
            AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE)
        )
    )
    INSERT INTO notifications (type, title, message, is_read, related_id, related_type)
    SELECT
      'vacant_unit',
      'Vacant unit: ' || property_name || ' / Unit ' || unit_number,
      property_name || ' / Unit ' || unit_number ||
        COALESCE(' (' || NULLIF(floor_label, '') || ')', '') ||
        ' is vacant. Expected rent: Rs ' ||
        trim(to_char(monthly_rent, 'FM9999999990.00')) || '.',
      false,
      unit_id,
      'vacant_unit'
    FROM vacant_units vu
    WHERE NOT EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.type = 'vacant_unit'
        AND n.related_id = vu.unit_id
        AND n.related_type = 'vacant_unit'
    )
  `);
};

const ensureAgreementExpiryReminders = async () => {
  await pool.query(`
    DELETE FROM notifications n
    WHERE n.type = 'agreement_expiry'
      AND n.related_type = 'agreement'
      AND NOT EXISTS (
        SELECT 1
        FROM agreements a
        WHERE a.id = n.related_id
          AND a.status = 'active'
          AND a.end_date IS NOT NULL
          AND a.end_date <= CURRENT_DATE + INTERVAL '30 days'
      )
  `);

  await pool.query(`
    WITH expiring_agreements AS (
      SELECT
        a.id AS agreement_id,
        a.end_date,
        t.name AS tenant_name,
        p.name AS property_name,
        u.unit_number,
        GREATEST(a.end_date - CURRENT_DATE, 0) AS days_left
      FROM agreements a
      JOIN tenants t ON a.tenant_id = t.id
      JOIN units u ON a.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE a.status = 'active'
        AND a.end_date IS NOT NULL
        AND a.end_date <= CURRENT_DATE + INTERVAL '30 days'
    )
    INSERT INTO notifications (type, title, message, is_read, related_id, related_type)
    SELECT
      'agreement_expiry',
      'Agreement expiry: ' || tenant_name,
      tenant_name || '''s agreement for ' || property_name || ' / Unit ' || unit_number ||
        CASE
          WHEN end_date < CURRENT_DATE THEN ' expired on ' || to_char(end_date, 'YYYY-MM-DD') || '.'
          WHEN days_left = 0 THEN ' expires today.'
          ELSE ' expires in ' || days_left || ' day(s) on ' || to_char(end_date, 'YYYY-MM-DD') || '.'
        END,
      false,
      agreement_id,
      'agreement'
    FROM expiring_agreements ea
    WHERE NOT EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.type = 'agreement_expiry'
        AND n.related_id = ea.agreement_id
        AND n.related_type = 'agreement'
    )
  `);
};

const list = async () => {
  await ensurePaymentDueReminders();
  await ensureVacantUnitReminders();
  await ensureAgreementExpiryReminders();
  const result = await pool.query(`
    SELECT *
    FROM notifications
    ORDER BY
      is_read ASC,
      CASE type
        WHEN 'agreement_expiry' THEN 1
        WHEN 'vacant_unit' THEN 2
        WHEN 'rent_due' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT 200
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO notifications (type, title, message, is_read, related_id, related_type)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.type, data.title, data.message, data.is_read || false, data.related_id, data.related_type]
  );
  return result.rows[0];
};

const update = async (id, data) => {
  const query = buildUpdateQuery({
    table: 'notifications',
    id,
    data,
    allowedFields: writableFields,
    touchUpdatedAt: false,
  });
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
};

const markRead = async (id) => update(id, { is_read: true });

const remove = async (id) => {
  const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  ensureAgreementExpiryReminders,
  ensurePaymentDueReminders,
  ensureVacantUnitReminders,
  getById,
  list,
  markRead,
  remove,
  update,
};
