const Customer = require('../models/Customer');

// ایجاد مشتری
const createCustomer = async (req, res) => {
  const { name, email, phone, address, company } = req.body;
  try {
    const customer = new Customer({ name, email, phone, address, company });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer' });
  }
};

// لیست مشتریان
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// دریافت یک مشتری
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById };
