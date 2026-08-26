import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

import API from '../../api/axios';

const fetchOrders = async () => {
  const { data } = await API.get('/orders');
  return data;
};

const fetchProducts = async () => {
  const { data } = await API.get('/products?limit=1000');
  return data;
};

const fetchUsers = async () => {
  const { data } = await API.get('/users');
  return data;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetchOrders().catch(() => ({ orders: [] })),
        fetchProducts().catch(() => ({ products: [] })),
        fetchUsers().catch(() => ({ users: [] })),
      ]);
const orders = Array.isArray(ordersRes)
  ? ordersRes
  : ordersRes.orders || ordersRes.data || [];

const products = Array.isArray(productsRes)
  ? productsRes
  : productsRes.products || productsRes.data || [];

const users = Array.isArray(usersRes)
  ? usersRes
  : usersRes.users || usersRes.data || [];

      const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = users.filter((u) => u.role === 'user' || !u.role).length;
      const totalProducts = Number.isFinite(productsRes.total) ? productsRes.total : products.length;

      setStats((prev) => ({ ...prev, totalSales, totalOrders, totalCustomers, totalProducts }));

      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setRecentOrders(sortedOrders.slice(0, 8));

      const sortedProducts = [...products]
        .sort((a, b) => (b.sold || b.numReviews || 0) - (a.sold || a.numReviews || 0))
        .slice(0, 5);
      setTopProducts(sortedProducts);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const dailySales = last7Days.map((date) => {
        const dayOrders = orders.filter((o) => {
          const orderDate = new Date(o.createdAt || o.date).toISOString().split('T')[0];
          return orderDate === date;
        });
        const amount = dayOrders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
        const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return { label, amount, orders: dayOrders.length };
      });
      setSalesData(dailySales);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `Rs. ${Math.round(amount || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-700 border-green-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = { delivered: CheckCircle2, shipped: Package, processing: Clock, pending: AlertCircle, cancelled: XCircle };
    const style = styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    const Icon = icons[status?.toLowerCase()] || Clock;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>
        <Icon className="w-3 h-3" />
        {status || 'Unknown'}
      </span>
    );
  };

  const maxSales = Math.max(...salesData.map((d) => d.amount), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
          <p className="text-[13px] text-[#8A94A6]">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-[14px] text-red-600 mb-3">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Sales', value: formatCurrency(stats.totalSales), icon: DollarSign, lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, lightColor: 'bg-amber-50', textColor: 'text-[#D97706]' },
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, lightColor: 'bg-purple-50', textColor: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[12px] font-semibold text-[#8A94A6] uppercase tracking-wide">{card.title}</p>
                <p className="text-[22px] font-bold text-[#344050]">{card.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.lightColor} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="xl:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-[#344050]">Revenue Overview</h3>
              <p className="text-[12px] text-[#8A94A6] mt-0.5">Last 7 days sales performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8A94A6]">Total:</span>
              <span className="text-[13px] font-bold text-[#344050]">
                {formatCurrency(salesData.reduce((s, d) => s + d.amount, 0))}
              </span>
            </div>
          </div>
          {salesData.length > 0 ? (
            <div className="flex items-end justify-between gap-3 h-48 px-2">
              {salesData.map((day, i) => {
                const heightPercent = maxSales > 0 ? (day.amount / maxSales) * 100 : 0;
                const isHighest = day.amount === maxSales && day.amount > 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#344050] text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none">
                        {formatCurrency(day.amount)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#344050]" />
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className={`w-full max-w-[48px] rounded-t-md cursor-pointer transition-colors ${
                          isHighest ? 'bg-[#F59E0B]' : 'bg-[#F59E0B]/70 hover:bg-[#F59E0B]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-[#8A94A6] font-medium">{day.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#8A94A6] text-[13px]">No sales data available</div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[#344050]">Top Products</h3>
            <Link to="/admin/products" className="text-[11px] font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div key={product._id || i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[11px] font-bold text-[#8A94A6]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#344050] truncate">{product.name}</p>
                    <p className="text-[11px] text-[#8A94A6]">{product.sold || 0} sold · {product.stock || 0} in stock</p>
                  </div>
                  <span className="text-[13px] font-bold text-[#344050]">Rs. {(product.price || 0).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[#8A94A6] text-center py-6">No products yet</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
      >
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#344050]">Recent Orders</h3>
            <p className="text-[12px] text-[#8A94A6] mt-0.5">You have {recentOrders.length} recent orders</p>
          </div>
          <Link
            to="/admin/orders"
            className="px-3 py-1.5 bg-[#FFF3D6] text-[#D97706] rounded-lg text-[12px] font-semibold hover:bg-[#F59E0B] hover:text-white transition-colors"
          >
            View All Orders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F7FA]/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Order ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#F5F7FA]/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-semibold text-[#344050]">#{order._id?.slice(-6)?.toUpperCase() || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[11px] font-bold text-[#8A94A6]">
                          {(order.user?.name || order.customer?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] text-[#344050] truncate max-w-[120px]">
                          {order.user?.name || order.customer?.name || order.shippingAddress?.name || 'Guest'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-[12px] text-[#6C757D]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-[#344050]">
                        {formatCurrency(order.totalPrice || order.totalAmount || 0)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to="/admin/orders"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-[#E5E7EB] mx-auto mb-3" />
                    <p className="text-[13px] text-[#8A94A6]">No orders found</p>
                    <p className="text-[11px] text-[#8A94A6] mt-1">Orders will appear here once customers start buying</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;