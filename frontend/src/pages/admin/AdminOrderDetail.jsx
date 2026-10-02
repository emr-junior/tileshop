import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MapPin, User, Package, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../utils/api';

const formatPrice = (p) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p);

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(res => {
        setOrder(res.data.data);
        setAdminNote(res.data.data.adminNotes || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      const res = await orderAPI.updateStatus(id, newStatus, statusNote);
      setOrder(res.data.data);
      setStatusNote('');
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await orderAPI.addNotes(id, adminNote);
      toast.success('Note saved');
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 rounded w-48" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3"><div className="skeleton h-32 rounded" /></div>
          <div className="card p-6 space-y-3"><div className="skeleton h-32 rounded" /></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-stone-500">Order not found</p>
        <Link to="/admin/orders" className="btn-primary mt-4">Back to Orders</Link>
      </div>
    );
  }

  const formatDate = (d) => new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 rounded-xl hover:bg-stone-100 text-stone-500">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-stone-900">
              Order <span className="font-mono text-primary-600">{order.orderNumber}</span>
            </h1>
            <p className="text-stone-500 text-sm">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <span className={`badge text-sm px-3 py-1.5 capitalize font-medium ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-4">Customer Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Full Name</p>
                  <p className="font-medium text-stone-900">{order.customer.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={15} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">WhatsApp</p>
                  <a
                    href={`https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${order.customer.fullName}! Regarding your order ${order.orderNumber}...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-600 hover:text-green-700 hover:underline flex items-center gap-1"
                  >
                    {order.customer.whatsapp}
                    <MessageCircle size={12} />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Delivery Location</p>
                  <p className="font-medium text-stone-900">{order.customer.location}</p>
                </div>
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2 bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">Customer Notes</p>
                  <p className="text-stone-700 text-sm">{order.customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-4">
              Order Items ({order.items.length})
            </h2>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, i) => {
                const img = item.product?.images?.[0]?.url;
                return (
                  <div key={i} className="flex items-center gap-4 py-4">
                    {img ? (
                      <img src={img} alt={item.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-stone-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">{item.name}</p>
                      <p className="text-sm text-stone-500">{item.size} cm</p>
                      <p className="text-xs text-stone-400">
                        {formatPrice(item.pricePerBox)} × {item.quantity} box{item.quantity !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <p className="font-bold text-stone-900 flex-shrink-0">{formatPrice(item.subtotal)}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-stone-200 mt-2 pt-4 flex justify-between items-center">
              <span className="font-bold text-stone-700">Total</span>
              <span className="font-bold text-xl text-primary-700">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Admin notes */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-3">Admin Notes</h2>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Internal notes (not visible to customer)..."
              rows={3}
              className="input-field resize-none mb-3"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="btn-primary disabled:opacity-60"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Update status */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-4">Update Status</h2>
            <div className="space-y-2 mb-4">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updatingStatus || s === order.status}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left capitalize transition-all border
                    ${s === order.status
                      ? `${STATUS_COLORS[s] || ''} border-transparent cursor-default`
                      : 'border-stone-200 text-stone-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50'
                    }`}
                >
                  {s === order.status ? `✓ ${s} (current)` : s}
                </button>
              ))}
            </div>
            <textarea
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              placeholder="Optional note for this status change..."
              rows={2}
              className="input-field resize-none text-sm"
            />
          </div>

          {/* Status history */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-4">Status History</h2>
            <div className="space-y-3">
              {[...(order.statusHistory || [])].reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                    {i < (order.statusHistory?.length - 1) && <div className="w-0.5 flex-1 bg-stone-200 mt-1" />}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-sm font-medium text-stone-800 capitalize">{h.status}</p>
                    {h.note && <p className="text-xs text-stone-500">{h.note}</p>}
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(h.changedAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp quick actions */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-stone-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                ['Confirm Order', `Hello ${order.customer.fullName}! Your order ${order.orderNumber} has been confirmed. We'll arrange delivery soon.`],
                ['Request Delivery Info', `Hello ${order.customer.fullName}! To deliver your order ${order.orderNumber}, please confirm your exact address in ${order.customer.location}.`],
                ['Order Delivered', `Hello ${order.customer.fullName}! Your order ${order.orderNumber} has been delivered. Thank you for shopping with TileShop!`],
              ].map(([label, msg]) => (
                <a
                  key={label}
                  href={`https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-stone-700 border border-stone-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
                >
                  <MessageCircle size={14} className="text-green-500" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
