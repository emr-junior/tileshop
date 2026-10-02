import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Home } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(price);

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const { orderNumber, totalAmount, whatsapp } = state || {};

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="card p-8 md:p-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>

          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-stone-500 mb-6">
            Thank you for your order. We'll contact you via WhatsApp shortly to confirm and arrange delivery.
          </p>

          {orderNumber && (
            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-stone-500 mb-1">Order Number</p>
              <p className="font-mono font-bold text-xl text-primary-700">{orderNumber}</p>
              {totalAmount && (
                <p className="text-sm text-stone-500 mt-2">Total: <strong className="text-stone-800">{formatPrice(totalAmount)}</strong></p>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left space-y-2">
            <p className="text-sm font-medium text-amber-800">What happens next?</p>
            <ul className="text-sm text-amber-700 space-y-1.5">
              <li>📱 We'll message you on WhatsApp to confirm</li>
              <li>🚚 Delivery time: 24–48 hours in Douala</li>
              <li>💳 Pay on delivery or Mobile Money</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/237600000000?text=${encodeURIComponent(`Hello! I just placed an order ${orderNumber ? `#${orderNumber}` : ''}. Can you confirm?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-3.5 px-6 rounded-xl transition-colors"
            >
              <MessageCircle size={18} />
              Message Us on WhatsApp
            </a>
            <Link to="/" className="btn-secondary justify-center w-full">
              <Home size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
