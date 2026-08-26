import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import API from '../../api/axios';

const CustomerWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await API.get('/wishlist');
        
        // Backend returns: { products: [] }
        const items = data?.products || [];
        setWishlist(items);
      } catch (err) {
        console.error('Wishlist error:', err);
        setError('Failed to load wishlist');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      setRemovingId(productId);
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => {
        const id = item?.product?._id || item?.product || item?._id;
        return id !== productId;
      }));
    } catch (err) {
      console.error('Remove error:', err);
      alert('Failed to remove');
    } finally {
      setRemovingId(null);
    }
  };

  const getProduct = (item) => {
    if (!item) return null;
    if (item.product && typeof item.product === 'object') return item.product;
    if (item._id) return item;
    return null;
  };

  const getProductId = (item) => {
    if (!item) return null;
    if (item.product?._id) return item.product._id;
    if (item.product) return item.product;
    return item._id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-semibold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#344050]">My Wishlist</h2>
          <p className="text-sm text-[#8A94A6]">{wishlist.length} items saved</p>
        </div>
        <Link to="/products" className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-sm font-semibold">
          <ShoppingBag className="w-4 h-4" />
          Browse Products
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <Heart className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#344050] mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-[#8A94A6] mb-4">Save items you love and view them here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-sm font-semibold">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {wishlist.map((item, index) => {
              const product = getProduct(item);
              const productId = getProductId(item);
              if (!product || !productId) return null;

              return (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden group hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-[#F5F7FA] relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-[#E2E8F0]" />
                      </div>
                    )}
                    <button
                      onClick={() => removeItem(productId)}
                      disabled={removingId === productId}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-red-50 rounded-lg flex items-center justify-center text-[#8A94A6] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      {removingId === productId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                    <div className="absolute top-3 left-3 w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#344050] truncate mb-1">{product.name || 'Unnamed'}</h3>
                    <p className="text-lg font-bold text-[#F59E0B] mb-4">Rs. {(product.price || 0).toLocaleString()}</p>
                    <div className="flex gap-2">
                      <Link to={`/products/${productId}`} className="flex-1 py-2.5 bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#344050] rounded-lg text-xs font-semibold text-center transition-colors">
                        View Details
                      </Link>
                      <button className="flex-1 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-xs font-semibold transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CustomerWishlist;