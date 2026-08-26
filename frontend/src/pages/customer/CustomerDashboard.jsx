import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Calendar,
  Truck,
  DollarSign,
} from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await API.get('/orders/myorders');
        const customerOrders = Array.isArray(data) ? data : data.orders || data.data || [];
        setOrders(customerOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const recentOrders = orders.slice(0, 5);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
  const processingOrders = orders.filter((o) => o.status?.toLowerCase() === 'processing').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const getStatusColor = (status) => {
    const map = {
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const map = {
      delivered: CheckCircle2,
      pending: Clock,
      processing: Package,
      shipped: Truck,
      cancelled: AlertCircle,
    };
    return map[status?.toLowerCase()] || Package;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#344050]">Welcome back, {firstName}! 👋</h2>
          <p className="text-sm text-[#8A94A6] mt-1">Here's what's happening with your account today.</p>
        </div>
        <Link
          to="/customer/profile"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md w-fit"
        >
          <User className="w-4 h-4" />
          Edit Profile
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid - Admin Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: '+12%' },
          { label: 'Pending', value: pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', trend: '+3%' },
          { label: 'Processing', value: processingOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+5%' },
          { label: 'Delivered', value: deliveredOrders, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+8%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`${stat.bg} border ${stat.border} rounded-xl p-5 relative overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-[11px] font-bold ${stat.color} flex items-center gap-0.5`}>
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-bold text-[#344050]">{stat.value}</p>
            <p className="text-xs text-[#8A94A6] mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Admin Table Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm"
        >
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#344050]">Recent Orders</h3>
              <p className="text-xs text-[#8A94A6] mt-0.5">You have placed {totalOrders} orders so far</p>
            </div>
            <Link
              to="/customer/orders"
              className="text-sm font-semibold text-[#F59E0B] hover:text-[#D97706] flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {recentOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <tr key={order._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#8A94A6]" />
                            </div>
                            <span className="text-sm font-bold text-[#344050]">
                              #{order._id?.slice(-6)?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-xs text-[#64748B] font-medium">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-[#344050]">
                            {formatCurrency(order.totalPrice || order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status || 'Processing'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <ShoppingBag className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-sm text-[#8A94A6]">No orders yet</p>
              <Link
                to="/products"
                className="inline-block mt-3 px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </motion.div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Total Spent - Gradient Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-sm font-medium text-white/70">Total Spent</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-white/50 mt-2">Across {totalOrders} orders</p>
            </div>
          </motion.div>

          {/* Quick Links - Admin Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-[#344050] mb-4 uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-1">
              {[
                { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag, color: 'text-[#F59E0B]', bg: 'bg-amber-50' },
                { name: 'Wishlist', path: '/customer/wishlist', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                { name: 'Addresses', path: '/customer/addresses', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
                { name: 'Edit Profile', path: '/customer/profile', icon: User, color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg ${link.bg} flex items-center justify-center`}>
                    <link.icon className={`w-4 h-4 ${link.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#344050] flex-1">{link.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#F59E0B] transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Member Since */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8A94A6]" />
            </div>
            <div>
              <p className="text-xs text-[#8A94A6] font-medium">Member Since</p>
              <p className="text-sm font-bold text-[#344050]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;