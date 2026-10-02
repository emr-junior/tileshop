import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(price);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    whatsapp: '',
    location: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.whatsapp.trim()) e.whatsapp = 'WhatsApp number is required';
    else if (!/^\+?[0-9]{8,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = 'Enter a valid phone number';
    if (!form.location.trim()) e.location = 'Location is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const orderData = {
        customer: {
          fullName: form.fullName.trim(),
          whatsapp: form.whatsapp.trim(),
          location: form.location.trim(),
          notes: form.notes.trim()
        },
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity
        }))
      };

      const res = await orderAPI.create(orderData);
      clearCart();
      navigate('/order-success', {
        state: {
          orderNumber: res.data.data.orderNumber,
          totalAmount: res.data.data.totalAmount,
          whatsapp: form.whatsapp
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary-600 transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="section-title mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <div className="card p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-stone-900 mb-6">Your Details</h2>
              <p className="text-stone-500 text-sm mb-6">
                No account needed. We'll contact you via WhatsApp to confirm your order.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Jean-Baptiste Mbida"
                      className={`input-field pl-10 ${errors.fullName ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      className={`input-field pl-10 ${errors.whatsapp ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                  <p className="text-xs text-stone-400 mt-1">We'll send order confirmation via WhatsApp</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Delivery Location *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g., Douala, Bonamoussadi Carrefour Shell"
                      className={`input-field pl-10 ${errors.location ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Additional Notes <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                    <textarea
                      value={form.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Delivery instructions, questions, or special requests..."
                      rows={3}
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Placing Order...</>
                  ) : (
                    <><CheckCircle size={18} /> Place Order</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-stone-900 mb-5">Order Summary</h2>

              <div className="divide-y divide-stone-100">
                {items.map(item => {
                  const img = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100';
                  return (
                    <div key={item._id} className="flex gap-4 py-4">
                      <img
                        src={img}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.size} cm</p>
                        <p className="text-xs text-stone-400">×{item.quantity} boxes = ~{(item.coveragePerBox * item.quantity).toFixed(1)}m²</p>
                      </div>
                      <p className="font-semibold text-stone-900 text-sm flex-shrink-0">
                        {formatPrice(item.pricePerBox * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-200 pt-4 mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Delivery</span>
                  <span className="text-emerald-600 font-medium">To be confirmed</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-500 space-y-1">
                <p>✅ No payment required online</p>
                <p>✅ Pay on delivery or via Mobile Money</p>
                <p>✅ We'll confirm via WhatsApp within 1 hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
