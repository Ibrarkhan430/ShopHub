import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Agar order hi nahi aaya toh home pe bhejo
  if (!order) return <Navigate to="/" replace />;

  // ✅ Safe extraction — koi bhi field missing ho toh bhi crash nahi hoga
  const orderId = order._id || order.id;
  const orderNumber = orderId 
    ? orderId.toString().slice(-8).toUpperCase() 
    : 'PENDING';
  
  const totalPrice = order.totalPrice ?? order.totalAmount ?? 0;
  const status = order.status || 'Processing';
  
  const shippingAddress = order.shippingAddress || {};
  const city = shippingAddress.city || 'N/A';
  const country = shippingAddress.country || 'N/A';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full mb-4 sm:mb-6"
        >
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
        </motion.div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2 sm:mb-3">
          Order Placed!
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-8">
          Thank you for your purchase. Your order is being processed.
        </p>

        <div className="bg-white border border-slate-100 rounded-xl p-5 sm:p-6 text-left mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-navy text-sm sm:text-base">
              Order #{orderNumber}
            </span>
          </div>
          <div className="space-y-2 text-sm sm:text-base">
            <div className="flex justify-between text-slate-600">
              <span>Total Amount</span>
              <span className="font-semibold text-navy">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status</span>
              <span className="capitalize font-medium text-amber-600">{status}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivering to</span>
              <span className="text-navy text-right">
                {city}, {country}
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 sm:px-8 py-3 text-sm sm:text-base rounded-lg transition-colors"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;