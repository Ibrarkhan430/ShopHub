// frontend/src/Context/WishlistContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  fetchWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from '../api/apiClient';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const getProductId = (item) => item?.product?._id || item?.product || item?._id;

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false); // ✅ Prevent double setState

  const loadWishlist = useCallback(async () => {
    if (!user?.token) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await fetchWishlist();
      setWishlistItems(data?.products || []);
    } catch (error) {
      console.error('Load wishlist error:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // ✅ Load wishlist only once
  useEffect => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    loadWishlist();
  }, [loadWishlist];

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some((item) => getProductId(item) === productId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!product?._id) return;

      if (!user?.token) {
        window.location.assign('/login');
        return;
      }

      const alreadyIn = isInWishlist(product._id);

      if (alreadyIn) {
        setWishlistItems((prev) => prev.filter((item) => getProductId(item) !== product._id));

        try {
          await removeFromWishlistApi(product._id);
        } catch (error) {
          console.error('Remove wishlist error:', error);
          loadWishlist();
        }

        return;
      }

      setWishlistItems((prev) => [
        ...prev,
        { product, addedAt: new Date().toISOString() },
      ]);

      try {
        await addToWishlistApi(product._id);
      } catch (error) {
        console.error('Add wishlist error:', error);
        loadWishlist();
      }
    },
    [isInWishlist, user?.token, loadWishlist]
  );

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const value = useMemo(
    () => ({
      wishlistItems,
      isInWishlist,
      toggleWishlist,
      wishlistCount,
      loading,
      refreshWishlist: loadWishlist,
    }),
    [wishlistItems, isInWishlist, toggleWishlist, wishlistCount, loading, loadWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used inside a WishlistProvider');
  }

  return context;
};