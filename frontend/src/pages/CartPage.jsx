import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(price);

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-stone-400" />
            </div>
            <h2 className="font-display text-3xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
            <p className="text-stone-500 mb-8">Browse our collection and add some tiles to get started.</p>
            <Link to="/products" className="btn-primary">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="section-title mb-2">Shopping Cart</h1>
        <p className="text-stone-500 mb-8">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imageUrl = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200';
              const subtotal = item.pricePerBox * item.quantity;

              return (
                <div key={item._id} className="card p-5 flex gap-5">
                  {/* Image */}
                  <Link to={`/products/${item._id}`} className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link to={`/products/${item._id}`} className="font-display font-semibold text-stone-900 hover:text-primary-700 transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-sm text-stone-500 mt-0.5">{item.size} cm • {item.material}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Covers ~{(item.coveragePerBox * item.quantity).toFixed(2)}m²
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium text-stone-800 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-bold text-primary-700 text-lg">{formatPrice(subtotal)}</p>
                        <p className="text-xs text-stone-400">{formatPrice(item.pricePerBox)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-2">
              <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-stone-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-stone-600 truncate mr-2">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-stone-800 flex-shrink-0">{formatPrice(item.pricePerBox * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-stone-700">Subtotal</span>
                  <span className="font-bold text-xl text-primary-700">{formatPrice(totalAmount)}</span>
                </div>
                <p className="text-xs text-stone-400">Delivery fees calculated at checkout</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 mb-5">
                💡 Free delivery in Douala for orders above 100,000 FCFA
              </div>

              <Link to="/checkout" className="btn-primary w-full justify-center text-base py-4">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <a
                href="https://wa.me/237600000000?text=Hello! I'd like to place an order."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-6 rounded-xl transition-colors text-sm"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
