const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route GET /api/analytics/dashboard
// @desc Get dashboard analytics (admin)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalRevenue,
      monthRevenue,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
      topProducts,
      revenueByMonth
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),
      // This month orders
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Last month orders
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      // Total revenue
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Month revenue
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Pending orders
      Order.countDocuments({ status: 'pending' }),
      // Total products
      Product.countDocuments({ isActive: true }),
      // Low stock
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 }, isActive: true }),
      // Recent 5 orders
      Order.find().sort('-createdAt').limit(5).lean(),
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Top 5 products by order frequency
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalOrdered: { $sum: '$items.quantity' }, revenue: { $sum: '$items.subtotal' } } },
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 }
      ]),
      // Revenue by month (last 6 months)
      Order.aggregate([
        { $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }},
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const orderGrowth = lastMonthOrders > 0 
      ? Math.round(((monthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          monthOrders,
          orderGrowth,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthRevenue: monthRevenue[0]?.total || 0,
          pendingOrders,
          totalProducts,
          lowStockProducts
        },
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topProducts,
        revenueByMonth
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
