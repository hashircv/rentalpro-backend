const { pool } = require('../db/db');

const getStats = async () => {
  const totalProperties = await pool.query('SELECT COUNT(*) FROM properties');
  const totalUnits = await pool.query('SELECT COUNT(*) FROM units');
  const occupiedUnits = await pool.query('SELECT COUNT(*) FROM units WHERE is_occupied = true');
  const vacantUnits = await pool.query('SELECT COUNT(*) FROM units WHERE is_occupied = false');

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const rentCollected = await pool.query('SELECT SUM(amount_paid) as total FROM rent_payments WHERE payment_month >= $1', [
    currentMonth,
  ]);
  const pendingRent = await pool.query('SELECT SUM(balance) as total FROM rent_payments WHERE payment_month >= $1', [
    currentMonth,
  ]);
  const expenses = await pool.query('SELECT SUM(amount) as total FROM expenses WHERE expense_date >= $1', [currentMonth]);

  const rentTotal = Number(rentCollected.rows[0].total || 0);
  const expenseTotal = Number(expenses.rows[0].total || 0);

  return {
    properties: parseInt(totalProperties.rows[0].count, 10),
    units: parseInt(totalUnits.rows[0].count, 10),
    occupied: parseInt(occupiedUnits.rows[0].count, 10),
    vacant: parseInt(vacantUnits.rows[0].count, 10),
    rentCollected: rentTotal,
    pendingRent: Number(pendingRent.rows[0].total || 0),
    expenses: expenseTotal,
    netProfit: rentTotal - expenseTotal,
  };
};

module.exports = {
  getStats,
};
