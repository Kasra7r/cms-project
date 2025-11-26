const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomerById } = require('../controllers/customerController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Only admins manage customers; اگر نیاز داری، نقش‌ها رو تغییر بده
router.post('/', protect, checkRole(['admin']), createCustomer);
router.get('/', protect, checkRole(['admin']), getCustomers);
router.get('/:id', protect, checkRole(['admin']), getCustomerById);

module.exports = router;

