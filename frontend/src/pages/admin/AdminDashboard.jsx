import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, TrendingUp, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../utils/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(price);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  processing: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-stone-900 mb-0.5">{value}</p>
      <p className="text-sm text-stone-500">{title}</p>
      {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-6 rounded w-1/2" />
              <div className="skeleton h-4 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentOrders, ordersByStatus, topProducts, revenueByMonth } = data || {};

  const chartData = (revenueByMonth || []).map(item => ({
    name: MONTH_NAMES[(item._id.month - 1)],
    revenue: item.revenue,
    orders: item.orders,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.monthOrders || 0} this month`}
          icon={ShoppingBag}
          trend={stats?.orderGrowth}
          color="primary"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          subtitle={`${formatPrice(stats?.monthRevenue || 0)} this month`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subtitle="Awaiting confirmation"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockProducts || 0} low stock`}
          icon={Package}
          color="blue"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-stone-900">Revenue (Last 6 Months)</h2>
            <BarChart2 size={18} className="text-stone-400" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip
                  formatter={(value) => [formatPrice(value), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: "'DM Sans', sans-serif" }}
                />
                <Bar dataKey="revenue" fill="#d67a22" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-stone-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-stone-900 mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${STATUS_COLORS[status] || 'badge-gray'} capitalize`}>{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-stone-100 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (count / (stats?.totalOrders || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-stone-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {(!ordersByStatus || Object.keys(ordersByStatus).length === 0) && (
              <p className="text-stone-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-stone-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(recentOrders || []).map(order => (
              <Link
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 text-sm font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500 truncate">{order.customer?.fullName} • {order.customer?.location}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'} capitalize hidden sm:inline-flex`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-stone-800">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-stone-400 text-sm py-4 text-center">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-stone-900">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Manage</Link>
          </div>
          <div className="space-y-3">
            {(topProducts || []).map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.totalOrdered} boxes sold</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 flex-shrink-0">{formatPrice(product.revenue)}</span>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-stone-400 text-sm py-4 text-center">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} running low on stock
            </p>
            <Link to="/admin/products" className="text-xs text-amber-700 underline mt-0.5 inline-block hover:text-amber-900">
              Review inventory →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
