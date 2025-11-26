const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    message: err.message || 'An unexpected error occurred',
  });
};

module.exports = errorHandler;
