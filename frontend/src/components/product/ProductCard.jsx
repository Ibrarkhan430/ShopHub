import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Package, Star, Sparkles, TrendingUp, Tag, GitCompareArrows } from 'lucide-react';
import { useCart } from '../../Context/CartContext';
import { useWishlist } from '../../Context/WishlistContext';

const TAG_CONFIG = {
  new: { label: 'New', icon: Sparkles, className: 'bg-blue-500 text-white' },
  bestseller: { label: 'Best Seller', icon: TrendingUp, className: 'bg-navy text-white' },
  sale: { label: 'Sale', icon: Tag, className: 'bg-red-500 text-white' },
};

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isCompared, setIsCompared] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    setIsCompared((prev) => !prev);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const tagInfo = product.tag && product.tag !== 'none' ? TAG_CONFIG[product.tag] : null;
  const hasReviews = product.numReviews > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/products/${product._id}`}
        className="group block bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
      >
        {/* Image area */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
            {discount ? (
              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                -{discount}%
              </span>
            ) : tagInfo ? (
              <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm ${tagInfo.className}`}>
                <tagInfo.icon className="w-3 h-3" />
                {tagInfo.label}
              </span>
            ) : null}
          </div>

          {/* Right side action icons - wishlist + compare */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleCompare}
              aria-label="Compare product"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center"
            >
              <GitCompareArrows className={`w-4 h-4 transition-colors ${isCompared ? 'text-amber-600' : 'text-slate-500'}`} />
            </motion.button>
          </div>

          {/* Quick view - desktop hover only */}
          <div className="hidden sm:block absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-navy/95 backdrop-blur-sm text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </div>
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-navy/60 flex items-center justify-center">
              <span className="text-white font-semibold text-xs sm:text-sm bg-navy px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4">
          <p className="text-amber-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-display font-semibold text-navy text-sm sm:text-base mb-1 line-clamp-1">
            {product.name}
          </h3>

          {hasReviews ? (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-slate-400 text-[10px] sm:text-xs ml-1">({product.numReviews})</span>
            </div>
          ) : (
            <div className="h-4 sm:h-[18px] mb-2" />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-navy text-base sm:text-lg">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-slate-400 text-xs sm:text-sm line-through">
                  Rs. {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-navy p-2 rounded-lg transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;