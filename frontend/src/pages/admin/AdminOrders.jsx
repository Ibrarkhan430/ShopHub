import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Package,
  ArrowUpDown,
  X,
  User,
  MapPin,
  CreditCard,
  Phone,
} from 'lucide-react';

import API from '../../api/axios';

const statusConfig = {
  all: { label: 'All Orders', color: 'bg-gray-500', lightColor: 'bg-gray-50', textColor: 'text-gray-600', icon: ShoppingBag },
  pending: { label: 'Pending', color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-600', icon: XCircle },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get('/orders');
      
      // ✅ Normalize orders - ensure status is always lowercase
      const normalizedOrders = (data.orders || data.data || data || []).map(order => ({
        ...order,
        status: order.status?.toLowerCase() || 'pending', // Default to 'pending' if status missing
      }));
      
      setOrders(normalizedOrders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('❌ Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // ✅ Update with normalized status
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus.toLowerCase() } : o))
      );
      
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus.toLowerCase() }));
      }
    } catch (err) {
      console.error('❌ Error updating status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // ✅ Filter by status (case-insensitive)
    if (activeTab !== 'all') {
      result = result.filter((o) => {
        const orderStatus = o.status?.toLowerCase() || '';
        return orderStatus === activeTab;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.shippingAddress?.name?.toLowerCase().includes(q) ||
          o._id?.slice(-6)?.toLowerCase().includes(q)
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0];
      result = result.filter((o) => {
        const orderDate = new Date(o.createdAt || o.date).toISOString().split('T')[0];
        return orderDate === filterDate;
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, activeTab, searchQuery, dateFilter, sortOrder]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || o.totalAmount || 0), 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => (o.status?.toLowerCase() || '') === 'pending').length,
      processing: orders.filter((o) => (o.status?.toLowerCase() || '') === 'processing').length,
      delivered: orders.filter((o) => (o.status?.toLowerCase() || '') === 'delivered').length,
      revenue: totalRevenue,
    };
  }, [orders]);

  const formatCurrency = (amount) => `Rs. ${Math.round(amount || 0).toLocaleString()}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'N/A';

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.all;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.lightColor} ${config.textColor} border-current border-opacity-20`}>
        <Icon className="w-3 h-3" />
        {status || 'Unknown'}
      </span>
    );
  };

  const tabCounts = useMemo(() => {
    const counts = { all: orders.length };
    Object.keys(statusConfig).forEach((key) => {
      if (key !== 'all') {
        counts[key] = orders.filter((o) => (o.status?.toLowerCase() || '') === key).length;
      }
    });
    return counts;
  }, [orders]);

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Date', 'Amount', 'Status'];
    const rows = filteredOrders.map((o) => [
      o._id,
      o.user?.name || o.customer?.name || 'Guest',
      new Date(o.createdAt).toLocaleDateString(),
      o.totalPrice || o.totalAmount,
      o.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
          <p className="text-[13px] text-[#8A94A6]">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[14px] text-red-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-[#344050]', bg: 'bg-white' },
          { title: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Processing', value: stats.processing, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-[#344050]', bg: 'bg-white' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${stat.bg} rounded-xl border border-[#E5E7EB] p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#8A94A6] uppercase">{stat.title}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-[20px] font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-[#344050]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6] pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all cursor-pointer"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-[#344050]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSortOrder((p) => (p === 'desc' ? 'asc' : 'desc'))}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] hover:bg-[#E5E7EB] transition-colors"
              title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] hover:bg-[#E5E7EB] transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  isActive
                    ? `${config.lightColor} ${config.textColor} ring-1 ring-current ring-opacity-20`
                    : 'text-[#6C757D] hover:bg-[#F5F7FA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/60' : 'bg-[#E5E7EB] text-[#6C757D]'}`}>
                  {tabCounts[key] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F7FA]/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Order ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#F5F7FA]/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#344050]">#{order._id?.slice(-6)?.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[11px] font-bold text-[#8A94A6]">
                          {(order.user?.name || order.customer?.name || order.shippingAddress?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#344050] truncate max-w-[140px]">
                            {order.user?.name || order.customer?.name || order.shippingAddress?.name || 'Guest'}
                          </p>
                          <p className="text-[11px] text-[#8A94A6] truncate max-w-[140px]">
                            {order.user?.email || order.customer?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-[#6C757D]">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-[#344050]">{formatCurrency(order.totalPrice || order.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <select
                          value={order.status || ''}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className={`appearance-none pr-7 pl-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border outline-none focus:ring-2 focus:ring-[#F59E0B]/30 transition-all ${
                            updatingStatus === order._id ? 'opacity-50 cursor-wait' : ''
                          } ${statusConfig[order.status?.toLowerCase()]?.lightColor || 'bg-gray-50'} ${
                            statusConfig[order.status?.toLowerCase()]?.textColor || 'text-gray-600'
                          }`}
                        >
                          {Object.entries(statusConfig)
                            .filter(([k]) => k !== 'all')
                            .map(([k, c]) => (
                              <option key={k} value={k}>
                                {c.label}
                              </option>
                            ))}
                        </select>
                        {updatingStatus === order._id && (
                          <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-current" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
                    <p className="text-[14px] font-semibold text-[#344050]">No orders found</p>
                    <p className="text-[12px] text-[#8A94A6] mt-1">
                      {searchQuery || dateFilter || activeTab !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Orders will appear here when customers start buying'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB]">
            <p className="text-[12px] text-[#8A94A6]">
              Showing <span className="font-semibold text-[#344050]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-[#344050]">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
              <span className="font-semibold text-[#344050]">{filteredOrders.length}</span> orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-[#F59E0B] text-white'
                      : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {detailOpen && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-[16px] font-bold text-[#344050]">Order Details</h3>
                  <p className="text-[12px] text-[#8A94A6]">#{selectedOrder._id?.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="p-2 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedOrder.status)}
                  <span className="text-[12px] text-[#8A94A6]">{formatDate(selectedOrder.createdAt)}</span>
                </div>

                <div className="bg-[#F5F7FA] rounded-xl p-4 space-y-3">
                  <h4 className="text-[12px] font-bold text-[#8A94A6] uppercase tracking-wider">Customer</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[14px] font-bold text-[#8A94A6] shadow-sm">
                      {(selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#344050]">
                        {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'Guest'}
                      </p>
                      <p className="text-[12px] text-[#6C757D]">{selectedOrder.user?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="bg-[#F5F7FA] rounded-xl p-4 space-y-3">
                    <h4 className="text-[12px] font-bold text-[#8A94A6] uppercase tracking-wider">Shipping Address</h4>
                    <div className="space-y-1">
                      <p className="text-[13px] text-[#344050] font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-[13px] text-[#6C757D]">{selectedOrder.shippingAddress.address}</p>
                      <p className="text-[13px] text-[#6C757D]">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-[13px] text-[#6C757D]">{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-[13px] text-[#6C757D] flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[12px] font-bold text-[#8A94A6] uppercase tracking-wider">Items</h4>
                  {selectedOrder.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-[#8A94A6]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#344050] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#8A94A6]">Qty: {item.qty || item.quantity}</p>
                      </div>
                      <span className="text-[13px] font-bold text-[#344050]">{formatCurrency(item.price * (item.qty || item.quantity))}</span>
                    </div>
                  )) || <p className="text-[13px] text-[#8A94A6]">No items data</p>}
                </div>

                <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6C757D]">Subtotal</span>
                    <span className="text-[#344050] font-medium">{formatCurrency((selectedOrder.totalPrice || selectedOrder.totalAmount || 0) - (selectedOrder.shippingPrice || 0) - (selectedOrder.taxPrice || 0))}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6C757D]">Shipping</span>
                    <span className="text-[#344050] font-medium">{formatCurrency(selectedOrder.shippingPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6C757D]">Tax</span>
                    <span className="text-[#344050] font-medium">{formatCurrency(selectedOrder.taxPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-[#E5E7EB]">
                    <span className="text-[#344050]">Total</span>
                    <span className="text-[#F59E0B]">{formatCurrency(selectedOrder.totalPrice || selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {selectedOrder.paymentMethod && (
                  <div className="flex items-center gap-2 text-[12px] text-[#6C757D] bg-[#F5F7FA] rounded-lg px-3 py-2">
                    <CreditCard className="w-4 h-4" />
                    Paid via {selectedOrder.paymentMethod}
                    {selectedOrder.isPaid && <span className="ml-auto text-emerald-600 font-semibold">Paid</span>}
                  </div>
                )}

                <div className="pt-2">
                  <label className="text-[12px] font-bold text-[#8A94A6] uppercase tracking-wider block mb-2">Update Status</label>
                  <div className="flex gap-2">
                    {Object.entries(statusConfig)
                      .filter(([k]) => k !== 'all')
                      .map(([k, c]) => (
                        <button
                          key={k}
                          onClick={() => updateOrderStatus(selectedOrder._id, k)}
                          disabled={updatingStatus === selectedOrder._id || selectedOrder.status?.toLowerCase() === k}
                          className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                            selectedOrder.status?.toLowerCase() === k
                              ? `${c.lightColor} ${c.textColor} ring-1 ring-current ring-opacity-30`
                              : 'bg-[#F5F7FA] text-[#6C757D] hover:bg-[#E5E7EB]'
                          } ${updatingStatus === selectedOrder._id ? 'opacity-50' : ''}`}
                        >
                          {c.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;