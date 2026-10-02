import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Layers, Palette, Globe, Plus, Minus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(price);

const availabilityConfig = {
  in_stock: { label: 'In Stock', className: 'text-emerald-600 bg-emerald-50' },
  low_stock: { label: 'Low Stock', className: 'text-amber-600 bg-amber-50' },
  out_of_stock: { label: 'Out of Stock', className: 'text-red-600 bg-red-50' },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, updateQuantity: updateCartQty } = useCart();

  const cartItem = items.find(i => i._id === id);

  useEffect(() => {
    productAPI.getOne(id)
      .then(res => { setProduct(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 rounded w-3/4" />
              <div className="skeleton h-4 rounded w-1/2" />
              <div className="skeleton h-16 rounded" />
              <div className="skeleton h-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' }];

  const avail = availabilityConfig[product.availability] || availabilityConfig.in_stock;
  const totalCoverage = (product.coveragePerBox * quantity).toFixed(2);
  const totalPrice = product.pricePerBox * quantity;

  const handleAddToCart = () => {
    if (product.availability === 'out_of_stock') return;
    if (cartItem) {
      updateCartQty(product._id, quantity);
      toast.success('Cart quantity updated!');
    } else {
      addItem(product);
      if (quantity > 1) updateCartQty(product._id, quantity);
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                      ${i === selectedImage ? 'border-primary-600 shadow-md' : 'border-stone-200 hover:border-primary-300'}`}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                {product.brand && <p className="text-sm text-primary-600 font-medium mb-1">{product.brand}</p>}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">{product.name}</h1>
              </div>
              <span className={`flex-shrink-0 text-sm font-medium px-3 py-1.5 rounded-full ${avail.className}`}>
                {avail.label}
              </span>
            </div>

            {/* Specs row */}
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { icon: Package, text: `${product.size} cm` },
                { icon: Layers, text: product.material },
                { icon: Palette, text: product.finish },
                product.origin && { icon: Globe, text: product.origin }
              ].filter(Boolean).map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 bg-stone-100 text-stone-600 text-sm px-3 py-1.5 rounded-full capitalize">
                  <Icon size={13} />
                  {text}
                </span>
              ))}
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>

            {/* Price block */}
            <div className="bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-100">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-3xl font-bold text-primary-700">{formatPrice(product.pricePerBox)}</p>
                  <p className="text-sm text-stone-500">per box • covers {product.coveragePerBox}m²</p>
                </div>
                {product.pricePerM2 && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-stone-700">{formatPrice(product.pricePerM2)}</p>
                    <p className="text-xs text-stone-500">per m²</p>
                  </div>
                )}
              </div>
              <div className="text-xs text-stone-400 space-y-1">
                <p>{product.tilesPerBox} tiles per box</p>
                {product.color && <p>Color: {product.color}</p>}
              </div>
            </div>

            {/* Quantity + total */}
            <div className="mb-6">
              <label className="text-sm font-medium text-stone-700 mb-2 block">Quantity (boxes)</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={product.stock}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-x border-stone-200 h-11 focus:outline-none text-stone-800 font-medium"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-sm text-stone-500">
                  = <span className="font-semibold text-stone-800">{formatPrice(totalPrice)}</span>
                  <span className="ml-1">/ covers ~{totalCoverage}m²</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2">{product.stock} boxes in stock</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.availability === 'out_of_stock'}
                className={`flex-1 btn-primary justify-center text-base py-4 ${product.availability === 'out_of_stock' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cartItem ? <><Check size={18} /> Update Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <a
                href={`https://wa.me/237600000000?text=${encodeURIComponent(`Hello! I'm interested in: ${product.name} (${product.size} cm) - ${quantity} box(es)`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-4 px-6 rounded-lg transition-colors text-base"
              >
                Order via WhatsApp
              </a>
            </div>

            {cartItem && (
              <div className="mt-3">
                <Link to="/cart" className="w-full btn-secondary justify-center">
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary-600 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
