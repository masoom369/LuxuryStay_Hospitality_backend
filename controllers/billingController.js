// ======================
// Billing Controller
// ======================
const { Billing, Reservation } = require('../models/');

const createBill = async (req, res) => {
  try {
    const billData = req.body;

    // Generate invoice number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    billData.invoiceNumber = `INV${timestamp}${random}`;

    // Calculate totals
    billData.subtotal = billData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    billData.totalAmount = billData.subtotal + (billData.tax || 0) - (billData.discount || 0);
    billData.balanceAmount = billData.totalAmount - (billData.paidAmount || 0);

    billData.generatedBy = req.user.userId;

    const bill = new Billing(billData);
    await bill.save();

    // Update reservation payment status
    const reservation = await Reservation.findById(billData.reservation);
    if (reservation) {
      if (billData.paidAmount >= billData.totalAmount) {
        reservation.paymentStatus = 'paid';
      } else if (billData.paidAmount > 0) {
        reservation.paymentStatus = 'partial';
      }
      await reservation.save();
    }

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bill creation failed',
      error: error.message
    });
  }
};

const getAllBills = async (req, res) => {
  try {
    const { paymentStatus, guest, reservation } = req.query;
    const filter = { deletedAt: null };

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (guest) filter.guest = guest;
    if (reservation) filter.reservation = reservation;

    const bills = await Billing.find(filter)
      .populate('guest', 'username email')
      .populate('reservation', 'reservationId checkInDate checkOutDate')
      .populate('generatedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bills,
      count: bills.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await Billing.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('guest')
      .populate('reservation')
      .populate('generatedBy', 'username email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
};

const updateBill = async (req, res) => {
  try {
    const bill = await Billing.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bill update failed',
      error: error.message
    });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const bill = await Billing.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    bill.paidAmount += amount;
    bill.balanceAmount = bill.totalAmount - bill.paidAmount;
    bill.paymentMethod = paymentMethod;

    if (bill.paidAmount >= bill.totalAmount) {
      bill.paymentStatus = 'paid';
      bill.paidAt = new Date();
    } else if (bill.paidAmount > 0) {
      bill.paymentStatus = 'partial';
    }

    await bill.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment recording failed',
      error: error.message
    });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  recordPayment
};