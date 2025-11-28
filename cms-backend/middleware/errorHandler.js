const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred";

  console.error("❌ Error:", message);

  res.status(status).json({ message });
};

module.exports = errorHandler;
