// ======================
// Room Service Controller
// ======================

const { AdditionalService } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

const getMenuItems = async (req, res) => {
  try {
    // Return a standard room service menu
    const menu = [
      {
        id: 'BREAKFAST-001',
        category: 'breakfast',
        name: 'Continental Breakfast',
        description: 'Fresh fruit, yogurt, pastries and coffee',
        price: 25.00,
        available: true
      },
      {
        id: 'BREAKFAST-002',
        category: 'breakfast',
        name: 'Full English Breakfast',
        description: 'Eggs, bacon, sausages, beans, toast and coffee',
        price: 32.00,
        available: true
      },
      {
        id: 'LUNCH-001',
        category: 'lunch',
        name: 'Club Sandwich',
        description: 'Turkey, ham, bacon, cheese, lettuce and tomato',
        price: 18.50,
        available: true
      },
      {
        id: 'LUNCH-002',
        category: 'lunch',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, parmesan, croutons, Caesar dressing',
        price: 16.00,
        available: true
      },
      {
        id: 'DINNER-001',
        category: 'dinner',
        name: 'Grilled Salmon',
        description: 'Salmon fillet with seasonal vegetables',
        price: 35.00,
        available: true
      },
      {
        id: 'DINNER-002',
        category: 'dinner',
        name: 'Ribeye Steak',
        description: '12oz ribeye steak cooked to your preference',
        price: 42.00,
        available: true
      },
      {
        id: 'DESSERT-001',
        category: 'dessert',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 12.00,
        available: true
      },
      {
        id: 'DESSERT-002',
        category: 'dessert',
        name: 'Fresh Fruit Platter',
        description: 'Seasonal fruits with whipped cream',
        price: 14.50,
        available: true
      }
    ];

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
};

const placeOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      guest: req.user.userId, // Using guest instead of customer for consistency
      serviceType: 'room-service', // Specific service type for room service
      status: 'pending',
      createdAt: new Date(),
      // Calculate total amount based on items ordered
      cost: calculateTotalAmount(req.body.items)
    };

    const order = new AdditionalService(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filters = { 
      guest: req.user.userId,
      serviceType: 'room-service', // Only fetch room service orders
      deletedAt: null 
    };

    if (status) filters.status = status;

    const orders = await AdditionalService.find(filters)
      .populate('guest', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await AdditionalService.countDocuments(filters);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await AdditionalService.findOne({
      _id: req.params.id,
      guest: req.user.userId,
      serviceType: 'room-service', // Only allow access to room service orders
      deletedAt: null
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Helper function to calculate total amount of an order
const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
};

module.exports = {
  getMenuItems,
  placeOrder,
  getOrders,
  getOrderById
};