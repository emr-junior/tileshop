const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route GET /api/categories
// @desc Get all categories with counts
router.get('/', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryInfo = {
      floor: { label: 'Floor Tiles', icon: '🏠', description: 'Durable tiles for all floor types' },
      wall: { label: 'Wall Tiles', icon: '🧱', description: 'Beautiful tiles for walls' },
      outdoor: { label: 'Outdoor Tiles', icon: '🌿', description: 'Weather-resistant outdoor tiles' },
      bathroom: { label: 'Bathroom Tiles', icon: '🚿', description: 'Elegant bathroom solutions' },
      kitchen: { label: 'Kitchen Tiles', icon: '🍳', description: 'Functional kitchen tiles' },
      decorative: { label: 'Decorative', icon: '✨', description: 'Artistic accent tiles' },
      mosaic: { label: 'Mosaic Tiles', icon: '🎨', description: 'Unique mosaic patterns' }
    };

    const result = categories.map(cat => ({
      id: cat._id,
      ...categoryInfo[cat._id],
      count: cat.count
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
