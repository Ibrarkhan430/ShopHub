import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Package, ChevronLeft, Heart, Zap, Star } from 'lucide-react';
import { fetchProductById } from '../api/products';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useAuth } from '../Context/AuthContext';
import { getProductReviews, createReview } from '../api/reviews';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodData, revData] = await Promise.all([
          fetchProductById(id),
          getProductReviews(id).catch(() => ({ reviews: [] })),
        ]);
        setProduct(prodData);
        setReviews(revData.reviews || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      setReviewLoading(true);
      const response = await createReview({
        product: id,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      
      // Refresh reviews
      const revData = await getProductReviews(id);
      setReviews(revData.reviews || []);
      
      toast.success(response.message || 'Review submitted! Pending admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (count) => {
    const rounded = Math.round(count || 0);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  };

  const wishlisted = product ? isInWishlist(product._id) : false;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 animate-pulse">
          <div className="aspect-square bg-slate-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-slate-500 text-sm sm:text-base">Product not found.</p>
        <Link to="/products" className="text-amber-600 font-semibold text-sm mt-2 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' 
    ? product.category?.name || 'Uncategorized'
    : product.category || 'Uncategorized';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center"
        >
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-[400px] object-contain p-8" />
          ) : (
            <Package className="w-20 h-20 sm:w-24 sm:h-24 text-slate-300" />
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
            {categoryName}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-lg">
              {renderStars(product.rating || 0)}
            </span>
            <span className="text-gray-500 text-sm">({product.numReviews || 0} reviews)</span>
          </div>

          <p className="font-display text-2xl sm:text-3xl font-bold text-blue-600 mb-4">
            Rs. {product.price.toLocaleString()}
          </p>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 text-xs sm:text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-500 text-xs sm:text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Out of Stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <>
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-lg font-medium transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  {/* ✅ FIX: Plus button disabled when quantity >= stock */}
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className={`px-4 py-2 text-lg font-medium transition ${
                      quantity >= product.stock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {quantity >= product.stock && (
                  <span className="text-xs text-amber-600 font-medium">Max stock reached</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold px-6 py-3.5 text-sm sm:text-base rounded-xl transition-colors ${
                    added ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <span>✓</span>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3.5 text-sm sm:text-base rounded-xl transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </motion.button>
              </div>
            </>
          )}

          {/* Wishlist Button */}
          <div className="mt-4">
            <button
              onClick={handleWishlist}
              className={`flex items-center gap-2 text-sm font-medium transition ${
                wishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
              {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <span className="flex items-center gap-1">✅ Free Shipping</span>
            <span className="flex items-center gap-1">✅ 7 Day Return</span>
            <span className="flex items-center gap-1">✅ Secure Payment</span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-8 border-b border-gray-200">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-sm tracking-wide transition relative capitalize ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'reviews' && `(${reviews.length})`}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6 min-h-[200px]">
          {activeTab === 'description' && (
            <div className="text-gray-600 leading-relaxed max-w-3xl">
              <p className="text-lg">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700 w-1/3">Category</td>
                    <td className="py-3 px-4 text-gray-600">{categoryName}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">Stock</td>
                    <td className="py-3 px-4 text-gray-600">{product.stock} units</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">Sold</td>
                    <td className="py-3 px-4 text-gray-600">{product.sold || 0} units</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">Rating</td>
                    <td className="py-3 px-4 text-gray-600">{product.rating || 0} / 5</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">Reviews</td>
                    <td className="py-3 px-4 text-gray-600">{product.numReviews || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm">
                            {(r.user?.name || r.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{r.user?.name || r.name}</p>
                            <p className="text-yellow-400 text-sm tracking-widest">{renderStars(r.rating)}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-6 mt-8 border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Write a Review
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-3xl transition hover:scale-110 focus:outline-none"
                        >
                          <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({rating} stars)</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                    <textarea
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {reviewLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Your review will be visible after admin approval.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl mt-6">
                  <p className="text-gray-500">
                    Please <Link to="/login" className="text-blue-600 hover:underline font-medium">login</Link> to write a review.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;