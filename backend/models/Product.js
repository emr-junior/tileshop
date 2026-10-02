const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['floor', 'wall', 'outdoor', 'bathroom', 'kitchen', 'decorative', 'mosaic']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    // e.g., "60x60", "30x60", "80x80"
  },
  material: {
    type: String,
    enum: ['ceramic', 'porcelain', 'marble', 'granite', 'travertine', 'slate', 'glass', 'other'],
    default: 'ceramic'
  },
  finish: {
    type: String,
    enum: ['matte', 'glossy', 'polished', 'textured', 'satin'],
    default: 'matte'
  },
  pricePerBox: {
    type: Number,
    required: [true, 'Price per box is required'],
    min: [0, 'Price cannot be negative']
  },
  pricePerM2: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  tilesPerBox: {
    type: Number,
    default: 1
  },
  coveragePerBox: {
    type: Number, // m² per box
    required: true,
    default: 1
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    url: String,
    publicId: String // for Cloudinary
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  color: String,
  brand: String,
  origin: String // country of origin
}, {
  timestamps: true
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < 10) return 'low_stock';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });

// Indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
