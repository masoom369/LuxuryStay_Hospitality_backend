const Invoice = require('../models/Invoice');
const nodemailer = require('nodemailer');

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
      .populate('guest', 'name email')
      .populate('hotel', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('guest', 'name email').populate('hotel', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemsText = invoice.items.map(item => `${item.description}: $${item.amount}`).join('\n');
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: invoice.guest.email,
      subject: `Invoice from ${invoice.hotel.name}`,
      text: `Dear ${invoice.guest.name},\n\nYour invoice details:\n\n${itemsText}\n\nTotal: $${invoice.totalAmount}\n\nThank you for staying with us!`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Invoice email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('guest', 'name').populate('hotel', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // Placeholder for print functionality (in real app, generate PDF)
    const printData = {
      hotel: invoice.hotel.name,
      guest: invoice.guest.name,
      items: invoice.items,
      total: invoice.totalAmount,
      date: invoice.issuedAt
    };

    res.status(200).json({ success: true, message: 'Print data generated', data: printData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generateInvoice,
  getInvoiceByBooking,
  sendInvoiceEmail,
  printInvoice
};
