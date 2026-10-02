# 🏠 TileShop Cameroon — Full-Stack Web Application

A complete e-commerce platform for a tile shop in Cameroon, featuring a modern customer storefront and a secure admin dashboard.

---

## 📁 Project Structure

```
tileshop/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── Product.js        # Product schema (tiles)
│   │   ├── Order.js          # Customer order schema
│   │   └── Admin.js          # Admin user schema
│   ├── routes/
│   │   ├── auth.js           # Admin login / JWT auth
│   │   ├── products.js       # CRUD for products
│   │   ├── orders.js         # Order management
│   │   ├── categories.js     # Category listing
│   │   └── analytics.js      # Dashboard analytics
│   ├── middleware/
│   │   ├── auth.js           # JWT protection middleware
│   │   └── upload.js         # Image upload (local + Cloudinary)
│   ├── uploads/              # Local image storage (auto-created)
│   ├── server.js             # Express server entry
│   ├── seed.js               # Database seeder with sample data
│   ├── .env.example          # Environment variable template
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind CSS
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   ├── WhatsAppButton.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   ├── CartContext.jsx   # Global cart state
        │   └── AuthContext.jsx   # Admin auth state
        ├── pages/
        │   ├── HomePage.jsx          # Hero, categories, featured
        │   ├── ProductsPage.jsx      # Catalog with filters
        │   ├── ProductDetailPage.jsx # Single product view
        │   ├── CartPage.jsx          # Shopping cart
        │   ├── CheckoutPage.jsx      # Customer details form
        │   ├── OrderSuccessPage.jsx  # Order confirmation
        │   └── admin/
        │       ├── AdminLogin.jsx
        │       ├── AdminLayout.jsx       # Sidebar layout
        │       ├── AdminDashboard.jsx    # Analytics & stats
        │       ├── AdminProducts.jsx     # Product CRUD
        │       ├── AdminOrders.jsx       # Orders list
        │       └── AdminOrderDetail.jsx  # Order detail & status
        └── utils/
            └── api.js                # Axios API client
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** (local or MongoDB Atlas cloud)
- Git (optional)

---

### 1. Backend Setup

```bash
# Navigate to backend
cd tileshop/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

**Edit `.env` with your settings:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tileshop   # or your Atlas URI
JWT_SECRET=change_this_to_a_long_random_string
ADMIN_EMAIL=admin@tileshop.cm
ADMIN_PASSWORD=Admin@2024!
FRONTEND_URL=http://localhost:3000

# Optional: Cloudinary for cloud image hosting
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# WhatsApp number (digits only, with country code)
WHATSAPP_NUMBER=237600000000
```

**Seed the database (creates admin + sample products):**
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev   # development with nodemon
# OR
npm start     # production
```

Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
# Navigate to frontend
cd tileshop/frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "VITE_API_URL=/api" > .env
echo "VITE_WHATSAPP=237600000000" >> .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

> The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

## 🔑 Default Admin Credentials

After running `npm run seed`:

| Field    | Value                |
|----------|----------------------|
| Email    | admin@tileshop.cm    |
| Password | Admin@2024!          |
| URL      | http://localhost:3000/admin/login |

**⚠️ Change these immediately in production!**

---

## 🌐 Key Pages

### Customer Storefront
| Page | URL |
|------|-----|
| Home (Hero + Categories) | `/` |
| All Products | `/products` |
| Filter by Category | `/products?category=floor` |
| Product Detail | `/products/:id` |
| Shopping Cart | `/cart` |
| Checkout | `/checkout` |
| Order Confirmed | `/order-success` |

### Admin Dashboard
| Page | URL |
|------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin` |
| Manage Products | `/admin/products` |
| View Orders | `/admin/orders` |
| Order Detail | `/admin/orders/:id` |

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters: category, search, featured) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/categories` | Get categories with counts |
| POST | `/api/orders` | Create new order |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/me` | Get current admin |
| GET | `/api/products/admin/all` | All products (including inactive) |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Update stock only |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/orders` | List orders (filters: status, search) |
| GET | `/api/orders/:id` | Get order detail |
| PATCH | `/api/orders/:id/status` | Update order status |
| PUT | `/api/orders/:id/notes` | Add admin notes |
| GET | `/api/analytics/dashboard` | Dashboard analytics |

---

## 🖼️ Image Storage Options

### Option A: Local Storage (default)
Images are stored in `backend/uploads/`. No extra config needed.
- Suitable for development and small deployments
- Serve via: `http://localhost:5000/uploads/filename.jpg`

### Option B: Cloudinary (recommended for production)
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, API Secret
3. Add to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the backend — it auto-detects Cloudinary

---

## 📱 WhatsApp Integration

The app includes:
- **Floating WhatsApp button** on all customer pages
- **"Order via WhatsApp"** button on product detail pages
- **Quick message templates** in the admin order detail page
- **Direct customer WhatsApp links** in the orders table

Configure your WhatsApp number in `.env`:
```
WHATSAPP_NUMBER=237600000000
```
And in `frontend/.env`:
```
VITE_WHATSAPP=237600000000
```

---

## 🏗️ Production Deployment

### Backend (e.g., Railway, Render, VPS)
```bash
# Set environment variables in your hosting dashboard
# Then deploy with:
npm start
```

### Frontend (e.g., Netlify, Vercel)
```bash
# Build the frontend
cd frontend
npm run build

# Upload the `dist/` folder to your hosting
# Set VITE_API_URL to your backend URL
```

### Nginx Config (VPS)
```nginx
# Serve frontend
server {
    listen 80;
    server_name yourdomain.cm;
    root /var/www/tileshop/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;

    location /api/ {
        proxy_pass http://localhost:5000;
    }

    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Charts | Recharts |
| State | React Context API + useReducer |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Image Upload | Multer + optional Cloudinary |
| Security | Helmet, express-rate-limit, bcryptjs |

---

## 💡 Features Summary

### Customer Storefront
- ✅ Hero banner with CTA
- ✅ Category browsing with images
- ✅ Product grid with search, sort, filter & pagination
- ✅ Product detail with image gallery, size, price, availability
- ✅ Add to cart with quantity control
- ✅ Cart with subtotals and coverage calculator
- ✅ Checkout with name, WhatsApp, location, notes
- ✅ Order confirmation page
- ✅ Floating WhatsApp button
- ✅ Mobile-responsive design

### Admin Dashboard
- ✅ Secure JWT login with rate limiting
- ✅ Dashboard with revenue chart, order stats, top products
- ✅ Product CRUD with image upload
- ✅ Inline stock editing
- ✅ Full order listing with search and filters
- ✅ Order detail with status history
- ✅ One-click WhatsApp messaging to customers
- ✅ Admin notes per order

---

## 🤝 Support

For questions about setup or customization, contact the development team.

Built for Cameroon 🇨🇲 — Prices in XAF (FCFA)
