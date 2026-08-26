import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import API from '../../api/axios';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await API.get('/orders/myorders');

        const customerOrders = Array.isArray(data)
          ? data
          : data.orders || data.data || [];

        setOrders(customerOrders);
      } catch (err) {
        console.error('Failed to load customer orders:', err);

        setError(
          err.response?.data?.message ||
            'Failed to load your orders. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount) || 0);

  const getStatus = (status) => {
    const normalizedStatus = status?.toLowerCase();

    const styles = {
      delivered: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
      shipped: 'bg-purple-100 text-purple-700',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          styles[normalizedStatus] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {status || 'Processing'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />

        <p className="text-red-600 text-sm">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-[13px] font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-[#344050]">
          My Orders
        </h2>

        <p className="text-[12px] text-[#8A94A6] mt-1">
          View and track all your orders.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden divide-y divide-[#F0F0F0]">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-5 hover:bg-[#F5F7FA]/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[14px] font-bold text-[#344050]">
                      #
                      {order._id
                        ?.slice(-6)
                        ?.toUpperCase()}
                    </span>

                    {getStatus(order.status)}
                  </div>

                  <p className="text-[12px] text-[#8A94A6]">
                    Placed on{' '}
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[16px] font-bold text-[#344050]">
                    {formatCurrency(
                      order.totalPrice ||
                        order.totalAmount
                    )}
                  </p>

                  <p className="text-[11px] text-[#8A94A6]">
                    {order.orderItems?.length || 0}{' '}
                    items
                  </p>
                </div>
              </div>

              {order.orderItems?.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {order.orderItems.map((item, index) => (
                    <div
                      key={`${order._id}-${item.product || index}`}
                      className="flex items-center gap-2 bg-[#F5F7FA] rounded-lg px-3 py-2"
                    >
                      <Package className="w-4 h-4 text-[#8A94A6]" />

                      <span className="text-[12px] text-[#344050] font-medium truncate max-w-[150px]">
                        {item.name || 'Product'}
                      </span>

                      <span className="text-[11px] text-[#8A94A6]">
                        x{item.qty || item.quantity || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />

          <p className="text-[14px] font-semibold text-[#344050]">
            No orders yet
          </p>

          <p className="text-[12px] text-[#8A94A6] mt-1">
            Start shopping to see your orders here.
          </p>

          <Link
            to="/products"
            className="inline-block mt-4 px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;