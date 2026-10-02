import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { orderAPI } from '../../utils/api';

const formatPrice = (p) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p);

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  processing: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort: '-createdAt' };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await orderAPI.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [search, status, page]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Orders</h1>
        <p className="text-stone-500 text-sm">{pagination.total || 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, order #, WhatsApp, location..."
            className="input-field pl-9 h-10 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-field h-10 text-sm pr-8 min-w-[150px] appearance-none capitalize"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {['', 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize flex-shrink-0
              ${status === s ? 'bg-primary-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-primary-300'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Order #</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden xl:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-stone-500 font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-stone-400">No orders found</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-stone-800">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{order.customer?.fullName}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <a
                      href={`https://wa.me/${order.customer?.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 hover:underline"
                    >
                      {order.customer?.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-stone-600 hidden lg:table-cell max-w-[150px] truncate">
                    {order.customer?.location}
                  </td>
                  <td className="px-4 py-3 text-stone-600 hidden sm:table-cell">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-semibold text-stone-800">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${STATUS_COLORS[order.status] || 'badge-gray'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs hidden xl:table-cell whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1 p-1.5 rounded-lg hover:bg-primary-50 text-stone-400 hover:text-primary-600 transition-colors"
                    >
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              Page {page} of {pagination.pages} • {pagination.total} orders
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm disabled:opacity-40 hover:bg-stone-50">
                Previous
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm disabled:opacity-40 hover:bg-stone-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
