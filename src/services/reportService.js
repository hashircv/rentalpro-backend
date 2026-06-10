const { pool } = require('../db/db');

const getSummary = async ({ start_date, end_date }) => {
  const start = start_date || `${new Date().getFullYear()}-01-01`;
  const end = end_date || `${new Date().getFullYear()}-12-31`;

  const occupancyData = await pool.query(`
    SELECT p.name,
           COUNT(u.id) as total_units,
           SUM(CASE WHEN u.is_occupied THEN 1 ELSE 0 END) as occupied_units,
           SUM(CASE WHEN NOT u.is_occupied THEN 1 ELSE 0 END) as vacant_units
    FROM properties p
    LEFT JOIN units u ON p.id = u.property_id
    GROUP BY p.name
  `);

  const rentData = await pool.query(
    `SELECT
      TO_CHAR(rp.payment_month, 'YYYY-MM') AS month,
      t.name AS tenant_name,
      u.unit_number,
      p.name AS property_name,
      rp.amount_due,
      rp.amount_paid AS total_collected,
      rp.balance AS total_pending
   FROM rent_payments rp
   JOIN tenants t ON rp.tenant_id = t.id
   JOIN units u ON rp.unit_id = u.id
   JOIN properties p ON u.property_id = p.id
   WHERE rp.payment_month BETWEEN $1::date AND $2::date
   ORDER BY rp.payment_month DESC, t.name`,
    [start, end]
  );

  const expenseData = await pool.query(
    `SELECT category, SUM(amount) as total
     FROM expenses
     WHERE expense_date >= $1 AND expense_date <= $2
     GROUP BY category
     ORDER BY total DESC`,
    [start, end]
  );

  return {
    occupancy: occupancyData.rows,
    rent: rentData.rows,
    expenses: expenseData.rows,
    period: { start, end },
  };
};

module.exports = {
  getSummary,
};
