const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');

const login = async ({ email, password }) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('Account is deactivated');
    error.statusCode = 403;
    throw error;
  }

  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getCurrentUser = async (id) => {
  const result = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [id]);
  if (!result.rows[0]) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return result.rows[0];
};

module.exports = {
  getCurrentUser,
  login,
};
