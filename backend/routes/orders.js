const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route POST /api/orders
// @desc Create new order (public)
router.post('/', async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer info and items are required' });
    }

    // Validate and enrich items with product data
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} not found or unavailable` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock} boxes` 
        });
      }

      const subtotal = product.pricePerBox * item.quantity;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        size: product.size,
        pricePerBox: product.pricePerBox,
        quantity: item.quantity,
        subtotal
      });
      totalAmount += subtotal;
    }

    // Create order
    const order = await Order.create({
      customer,
      items: enrichedItems,
      totalAmount,
      statusHistory: [{ status: 'pending', note: 'Order placed' }]
    });

    // Update stock
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        _id: order._id
      },
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route GET /api/orders
// @desc Get all orders (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.fullName': { $regex: search, $options: 'i' } },
        { 'customer.whatsapp': { $regex: search, $options: 'i' } },
        { 'customer.location': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name images')
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/orders/:id
// @desc Get single order (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images category size');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PATCH /api/orders/:id/status
// @desc Update order status (admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/orders/:id/notes
// @desc Add admin notes to order
router.put('/:id/notes', protect, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
