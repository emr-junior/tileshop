const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/products/admin/all
router.get('/admin/all', protect, async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST create product
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body };

    // Parse numbers
    productData.pricePerBox = parseFloat(productData.pricePerBox);
    productData.pricePerM2 = productData.pricePerM2 ? parseFloat(productData.pricePerM2) : undefined;
    productData.stock = parseInt(productData.stock);
    productData.coveragePerBox = productData.coveragePerBox ? parseFloat(productData.coveragePerBox) : 1;
    productData.tilesPerBox = productData.tilesPerBox ? parseInt(productData.tilesPerBox) : 1;

    // Parse booleans
    productData.isFeatured = productData.isFeatured === 'true';
    productData.isActive = productData.isActive !== 'false';

    // Parse tags
    if (productData.tags && typeof productData.tags === 'string') {
      productData.tags = productData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // ✅ FIXED IMAGE HANDLING
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,   // 🔥 FIX HERE
        publicId: file.filename
      }));
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// @route PUT update product
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updateData = { ...req.body };

    if (updateData.pricePerBox) updateData.pricePerBox = parseFloat(updateData.pricePerBox);
    if (updateData.pricePerM2) updateData.pricePerM2 = parseFloat(updateData.pricePerM2);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
    if (updateData.coveragePerBox) updateData.coveragePerBox = parseFloat(updateData.coveragePerBox);
    if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true';
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive !== 'false';

    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // ✅ FIXED IMAGE HANDLING
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,   // 🔥 FIX HERE TOO
        publicId: file.filename
      }));

      if (req.query.replaceImages === 'true') {
        updateData.images = newImages;
      } else {
        updateData.images = [...(product.images || []), ...newImages];
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updated });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PATCH stock
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: parseInt(stock) },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ success: true, data: product });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete local images
    if (product.images) {
      product.images.forEach(img => {
        if (img.publicId) {
          const filePath = path.join(__dirname, '../uploads', img.publicId);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;