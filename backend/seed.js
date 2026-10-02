const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Ivory Marble Polished',
    description: 'Luxurious ivory marble-effect porcelain tile with a mirror-polish finish. Perfect for elegant living rooms and entrances. Creates an atmosphere of refined sophistication.',
    category: 'floor',
    size: '60x60',
    material: 'porcelain',
    finish: 'polished',
    pricePerBox: 18500,
    pricePerM2: 8500,
    tilesPerBox: 4,
    coveragePerBox: 1.44,
    stock: 120,
    color: 'Ivory/Cream',
    brand: 'EuroTile',
    origin: 'Spain',
    isFeatured: true,
    tags: ['marble', 'luxury', 'polished', 'living room'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', publicId: 'sample1' }]
  },
  {
    name: 'Anthracite Concrete',
    description: 'Industrial-chic concrete-effect porcelain tile in dark anthracite. Ideal for modern interiors. Extremely durable and easy to maintain.',
    category: 'floor',
    size: '60x120',
    material: 'porcelain',
    finish: 'matte',
    pricePerBox: 24000,
    pricePerM2: 10000,
    tilesPerBox: 2,
    coveragePerBox: 1.44,
    stock: 85,
    color: 'Anthracite/Dark Gray',
    brand: 'Gresie Pro',
    origin: 'Italy',
    isFeatured: true,
    tags: ['concrete', 'modern', 'industrial', 'large format'],
    images: [{ url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', publicId: 'sample2' }]
  },
  {
    name: 'Sahara Wood Effect',
    description: 'Authentic wood-look ceramic tile in warm sandy tones. Anti-slip surface makes it safe for all areas. Brings warmth of natural wood without the maintenance.',
    category: 'floor',
    size: '20x120',
    material: 'ceramic',
    finish: 'textured',
    pricePerBox: 15000,
    pricePerM2: 6250,
    tilesPerBox: 6,
    coveragePerBox: 1.44,
    stock: 200,
    color: 'Sandy Brown',
    brand: 'WoodLine',
    origin: 'Portugal',
    isFeatured: false,
    tags: ['wood effect', 'natural', 'warm', 'anti-slip'],
    images: [{ url: 'https://images.unsplash.com/photo-1579782483922-b7c60c9c2a3e?w=800', publicId: 'sample3' }]
  },
  {
    name: 'White Subway Metro',
    description: 'Classic white subway tiles for a timeless kitchen or bathroom backsplash. High-gloss finish reflects light beautifully. Easy to clean and maintain.',
    category: 'wall',
    size: '10x30',
    material: 'ceramic',
    finish: 'glossy',
    pricePerBox: 6500,
    pricePerM2: 4340,
    tilesPerBox: 33,
    coveragePerBox: 0.99,
    stock: 350,
    color: 'White',
    brand: 'ClassicWall',
    origin: 'Turkey',
    isFeatured: false,
    tags: ['subway', 'classic', 'kitchen', 'backsplash'],
    images: [{ url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', publicId: 'sample4' }]
  },
  {
    name: 'Ocean Blue Mosaic',
    description: 'Stunning ocean-blue glass mosaic tiles. Perfect for pool areas, bathroom accents, and feature walls. Creates a shimmering aquatic effect.',
    category: 'mosaic',
    size: '30x30',
    material: 'glass',
    finish: 'glossy',
    pricePerBox: 28000,
    pricePerM2: 31000,
    tilesPerBox: 9,
    coveragePerBox: 0.81,
    stock: 45,
    color: 'Ocean Blue',
    brand: 'AquaMosaic',
    origin: 'Spain',
    isFeatured: true,
    tags: ['mosaic', 'glass', 'pool', 'bathroom', 'accent'],
    images: [{ url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800', publicId: 'sample5' }]
  },
  {
    name: 'Terracotta Outdoor',
    description: 'Authentic terracotta-style outdoor tile. Non-slip, frost-resistant, and UV-stable. Perfect for patios, terraces and outdoor spaces in Cameroon\'s climate.',
    category: 'outdoor',
    size: '40x40',
    material: 'ceramic',
    finish: 'textured',
    pricePerBox: 12000,
    pricePerM2: 7500,
    tilesPerBox: 16,
    coveragePerBox: 1.6,
    stock: 150,
    color: 'Terracotta Orange',
    brand: 'OutdoorMax',
    origin: 'Morocco',
    isFeatured: false,
    tags: ['outdoor', 'patio', 'terrace', 'non-slip', 'terracotta'],
    images: [{ url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800', publicId: 'sample6' }]
  },
  {
    name: 'Noir Bathroom Set',
    description: 'Sophisticated matte black bathroom tiles for walls and floors. Creates a dramatic, modern spa-like atmosphere. Hides soap residue and water marks.',
    category: 'bathroom',
    size: '30x60',
    material: 'porcelain',
    finish: 'matte',
    pricePerBox: 19500,
    pricePerM2: 10800,
    tilesPerBox: 9,
    coveragePerBox: 1.62,
    stock: 75,
    color: 'Matte Black',
    brand: 'NuBath',
    origin: 'Italy',
    isFeatured: true,
    tags: ['black', 'bathroom', 'modern', 'matte', 'spa'],
    images: [{ url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', publicId: 'sample7' }]
  },
  {
    name: 'Herringbone Kitchen Backsplash',
    description: 'Classic herringbone pattern ceramic tile for kitchen backsplashes. Available in white/grey tones. Easy to install with self-spacing lugs.',
    category: 'kitchen',
    size: '7.5x30',
    material: 'ceramic',
    finish: 'glossy',
    pricePerBox: 8900,
    pricePerM2: 5900,
    tilesPerBox: 20,
    coveragePerBox: 0.9,
    stock: 180,
    color: 'White/Grey',
    brand: 'KitchenPro',
    origin: 'Belgium',
    isFeatured: false,
    tags: ['herringbone', 'kitchen', 'backsplash', 'classic', 'pattern'],
    images: [{ url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', publicId: 'sample8' }]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tileshop');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Admin.deleteMany({});
  await Product.deleteMany({});

  // Create admin
  await Admin.create({
    email: process.env.ADMIN_EMAIL || 'admin@tileshop.cm',
    password: process.env.ADMIN_PASSWORD || 'Admin@2024!',
    name: 'TileShop Admin',
    role: 'superadmin'
  });
  console.log('✅ Admin created - Email:', process.env.ADMIN_EMAIL || 'admin@tileshop.cm');

  // Create products
  await Product.insertMany(sampleProducts);
  console.log(`✅ ${sampleProducts.length} sample products created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('Admin credentials:');
  console.log('  Email:', process.env.ADMIN_EMAIL || 'admin@tileshop.cm');
  console.log('  Password:', process.env.ADMIN_PASSWORD || 'Admin@2024!');

  mongoose.disconnect();
}

seed().catch(console.error);
