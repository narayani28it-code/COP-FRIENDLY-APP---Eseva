/**
 * Build paginated response object
 * @param {Array} data - Query results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total documents count
 * @returns {Object} Paginated response
 */
const paginatedResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Parse pagination query params with defaults
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { paginatedResponse, parsePagination };
