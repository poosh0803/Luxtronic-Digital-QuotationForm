// Convert empty/missing form values to null so they store as SQL NULL instead of 0/NaN.
function parseIntOrNull(value) {
  return (value === '' || value === null || value === undefined) ? null : parseInt(value, 10);
}

function parseFloatOrNull(value) {
  return (value === '' || value === null || value === undefined) ? null : parseFloat(value);
}

module.exports = { parseIntOrNull, parseFloatOrNull };
