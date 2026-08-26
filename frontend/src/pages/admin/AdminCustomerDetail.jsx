import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import API from '../../api/axios';

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await API.get(`/users/${id}`);

      setCustomer(data.user || data);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load customer');
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
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
          styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'
        }`}
      >
        {status || 'Unknown'}
      </span>
    );
  };

  const totalSpent = orders.reduce((s, o) => s + (o.totalPrice || o.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[14px] text-red-600">{error || 'Customer not found'}</p>
        <button
          onClick={() => navigate('/admin/customers')}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-[18px] font-bold text-[#344050]">Customer Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-2xl font-bold mb-3">
              {customer.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h3 className="text-[16px] font-bold text-[#344050]">{customer.name}</h3>
            <p className="text-[12px] text-[#8A94A6] mt-0.5">{customer.email}</p>
            <span
              className={`mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                customer.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {customer.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-[13px] text-[#344050]">
              <Mail className="w-4 h-4 text-[#8A94A6]" />
              {customer.email}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#344050]">
              <Phone className="w-4 h-4 text-[#8A94A6]" />
              {customer.phone || 'Not provided'}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#344050]">
              <Calendar className="w-4 h-4 text-[#8A94A6]" />
              Joined{' '}
              {new Date(customer.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#344050]">
              <MapPin className="w-4 h-4 text-[#8A94A6]" />
              {customer.address || 'No address saved'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-[#D97706]" />
            </div>
            <p className="text-[22px] font-bold text-[#344050]">{orders.length}</p>
            <p className="text-[12px] text-[#8A94A6] mt-0.5">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[22px] font-bold text-[#344050]">{formatCurrency(totalSpent)}</p>
            <p className="text-[12px] text-[#8A94A6] mt-0.5">Total Spent</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-[22px] font-bold text-[#344050]">
              {orders.filter((o) => o.status?.toLowerCase() === 'delivered').length}
            </p>
            <p className="text-[12px] text-[#8A94A6] mt-0.5">Delivered</p>
          </div>

          <div className="sm:col-span-3 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h4 className="text-[14px] font-bold text-[#344050]">Order History</h4>
            </div>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F7FA]/50">
                      <th className="text-left px-4 py-2.5 text-[11px] font-bold text-[#8A94A6] uppercase">Order ID</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-bold text-[#8A94A6] uppercase hidden sm:table-cell">Date</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-bold text-[#8A94A6] uppercase">Amount</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-bold text-[#8A94A6] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-[#F5F7FA]/30">
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#344050]">
                          #{order._id?.slice(-6)?.toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#6C757D] hidden sm:table-cell">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-[#344050]">
                          {formatCurrency(order.totalPrice || order.totalAmount)}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-[#E5E7EB] mx-auto mb-3" />
                <p className="text-[13px] text-[#8A94A6]">No orders from this customer</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCustomerDetail;