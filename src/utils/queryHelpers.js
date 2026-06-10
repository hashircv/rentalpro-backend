const pickDefined = (source, fields) =>
  fields.reduce((values, field) => {
    if (source[field] !== undefined) {
      values[field] = source[field];
    }
    return values;
  }, {});

const buildUpdateQuery = ({ table, id, data, allowedFields, returning = '*', touchUpdatedAt = true }) => {
  const updates = pickDefined(data, allowedFields);
  const fields = Object.keys(updates);

  if (fields.length === 0) {
    const error = new Error('No fields to update');
    error.statusCode = 400;
    throw error;
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map((field) => updates[field]);
  values.push(id);

  return {
    text: `UPDATE ${table} SET ${setClause}${touchUpdatedAt ? ', updated_at = NOW()' : ''} WHERE id = $${
      fields.length + 1
    } RETURNING ${returning}`,
    values,
  };
};

module.exports = {
  buildUpdateQuery,
  pickDefined,
};
