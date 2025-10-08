const Invoice = require('../models/Invoice');

const generateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getInvoiceByBooking = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId })
      .populate('guest', 'name')
      .populate('hotel', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generateInvoice,
  getInvoiceByBooking
};
