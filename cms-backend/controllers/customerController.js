const Customer = require("../models/Customer");

/* -------------------------------------------------------
   Create a new customer
   (note to self: keeping this simple for now)
-------------------------------------------------------- */
const createCustomer = async (req, res) => {
  const { name, email, phone, address, company } = req.body;

  try {
    // learning note: basic create + save pattern
    const customer = new Customer({ name, email, phone, address, company });
    await customer.save();

    return res.status(201).json(customer);
  } catch (error) {
    // reminder: could log error details later if needed
    return res.status(500).json({ message: "Error creating customer" });
  }
};

/* -------------------------------------------------------
   Get all customers
   (note: no filters or pagination yet)
-------------------------------------------------------- */
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    // note to self: add pagination if list gets big
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching customers" });
  }
};

/* -------------------------------------------------------
   Get a customer by ID
   (intern reminder: invalid ObjectId also triggers catch)
-------------------------------------------------------- */
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      // small note: 404 is correct if ID exists but user not found
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json(customer);
  } catch (error) {
    // note: this also catches malformed ObjectId errors
    return res.status(500).json({ message: "Error fetching customer" });
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById };
