// frontend/src/pages/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, Lock } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, userId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('🛒 Current User:', user?._id || user?.id || 'Guest');
  console.log('🛒 Cart Items:', cartItems);
  console.log('📦 Cart Total:', cartTotal);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full mb-4 sm:mb-6">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-navy mb-2">
            Your cart is empty
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-navy font-semibold px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-colors"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
          Your Cart ({cartItems.length} items)
        </h1>
        {user && (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            👤 {user.name || user.email}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 sm:gap-4 bg-white border border-slate-100 rounded-xl p-3 sm:p-4"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-sm sm:text-base line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-amber-600 font-bold text-sm sm:text-base">
                      Rs. {item.price.toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Total: Rs. {itemTotal.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 hover:bg-slate-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                        </button>
                        <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 hover:bg-slate-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5 sm:p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-xl p-5 sm:p-6 sticky top-24">
            <h2 className="font-display text-lg sm:text-xl font-bold text-navy mb-4 sm:mb-5">
              Order Summary
            </h2>
            
            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-800">
                      Rs. {itemTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5 sm:space-y-3 mb-4 sm:mb-5 text-sm sm:text-base">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 sm:pt-4 mb-5 sm:mb-6">
              <div className="flex justify-between font-display font-bold text-navy text-base sm:text-lg">
                <span>Total</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold py-3 text-sm sm:text-base rounded-lg transition-colors"
            >
              {user ? (
                <>
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Login to Checkout
                </>
              )}
            </motion.button>

            {!user && (
              <p className="text-xs text-center text-slate-400 mt-3">
                You need to login to complete your purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;