// frontend/src/Context/SettingsContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings } from '../api/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth(); // ✅ Ab kaam karega
  const [settings, setSettings] = useState({
    storeName: 'ShopHub',
    storeEmail: 'support@shophub.com',
    storePhone: '+1 234 567 890',
    storeAddress: '123 Commerce St, New York, NY 10001',
    currency: 'USD',
    taxRate: 10,
    shippingFee: 5.99,
    freeShippingThreshold: 50,
    logo: null,
    paymentMethods: ['Stripe', 'PayPal', 'Cash on Delivery'],
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    // ✅ SIRF ADMIN USER HI SETTINGS LOAD KARE
    if (!user?.token || user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      const data = await getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      // 403/401 ko ignore karein
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('⏭️ Settings not accessible (user not admin)');
      } else {
        console.error('Failed to load settings:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.token, user?.role]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};