// frontend/src/Context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_STORAGE_KEY = 'guest_cart';

const readCart = (userId) => {
  try {
    const key = userId ? `cart_${userId}` : GUEST_STORAGE_KEY;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const isInitialized = useRef(false); // ✅ Prevent double setState

  // ✅ Load cart when user changes - only once
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const userId = user?._id || user?.id;
    const loadedCart = readCart(userId);
    setCartItems(loadedCart);
  }, [user]);

  // ✅ Save cart when it changes
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      const key = `cart_${userId}`;
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (product, quantity = 1) => {
    if (!product?._id) {
      console.error('Product _id missing:', product);
      return;
    }

    const requested = Math.max(1, Number(quantity) || 1);
    const stock = Number(product.stock);

    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const currentQty = existing?.quantity || 0;
      const maxQty = Number.isFinite(stock) ? stock : Infinity;
      const nextQty = Math.min(currentQty + requested, maxQty);

      if (nextQty < 1) return prev;

      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item._id === product._id
            ? { ...item, ...product, quantity: nextQty }
            : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: Math.min(requested, maxQty) }];
      }
      
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const requested = Math.floor(Number(quantity));

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item._id !== productId) return item;

          const stock = Number(item.stock);
          const maxQty = Number.isFinite(stock) ? stock : Infinity;
          const nextQty = Math.min(requested, maxQty);

          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const userId = user?._id || user?.id;
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    } else {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    userId: user?._id || user?.id || null,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }

  return context;
};