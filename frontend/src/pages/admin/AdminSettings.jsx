import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  Truck,
  Camera,
  Loader2,
  CheckCircle2,
  CreditCard,
  Shield,
} from 'lucide-react';
import { getSettings, updateSettings } from '../../api/settings';
import { useSettings } from '../../Context/SettingsContext';
import API from '../../api/axios';

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef(null);
  const [settings, setSettings] = useState({
    storeName: 'ShopHop',
    storeEmail: 'support@shophop.com',
    storePhone: '+1 234 567 890',
    storeAddress: '123 Commerce St, New York, NY 10001',
    currency: 'USD',
    taxRate: 10,
    shippingFee: 5.99,
    freeShippingThreshold: 50,
    logo: null,
    paymentMethods: ['Stripe', 'PayPal', 'Cash on Delivery'],
  });

  // ✅ Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  // ✅ Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      setError('');

      // ✅ Upload to backend
      const { data } = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update settings with logo URL
      setSettings({ ...settings, logo: data.imageUrl });
      setUploading(false);
    } catch (err) {
      console.error('Logo upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload logo');
      setUploading(false);
    }
  };

  // ✅ Handle Save
  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      await updateSettings(settings);
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const inputClass =
    'w-full px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all';

  return (
    <div className="max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-[#E5E7EB] p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                active ? 'bg-[#FFF3D6] text-[#D97706]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <h3 className="text-[16px] font-bold text-[#344050]">Store Information</h3>

            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#F5F7FA] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-[#8A94A6]" />
                )}
              </div>
              <div>
                {/* ✅ Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {/* ✅ Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-[#F5F7FA] rounded-lg text-[12px] font-semibold text-[#344050] hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <p className="text-[11px] text-[#8A94A6] mt-1">Recommended: 200x200px, PNG or JPG, Max 2MB</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Store Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Store Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Currency</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className={`${inputClass} pl-10`}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (₨)</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Store Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="text"
                    value={settings.storeAddress}
                    onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <h3 className="text-[16px] font-bold text-[#344050]">Payment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Payment Methods</label>
                <div className="space-y-2">
                  {['Stripe', 'PayPal', 'Cash on Delivery'].map((method) => (
                    <label key={method} className="flex items-center gap-2 px-3 py-2 bg-[#F5F7FA] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.paymentMethods?.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              paymentMethods: [...(settings.paymentMethods || []), method],
                            });
                          } else {
                            setSettings({
                              ...settings,
                              paymentMethods: (settings.paymentMethods || []).filter((m) => m !== method),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-[#E5E7EB] text-[#F59E0B] focus:ring-[#F59E0B]"
                      />
                      <span className="text-[13px] text-[#344050]">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <h3 className="text-[16px] font-bold text-[#344050]">Shipping Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Default Shipping Fee</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="number"
                    step="0.01"
                    value={settings.shippingFee}
                    onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Free Shipping Threshold</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <h3 className="text-[16px] font-bold text-[#344050]">Security</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#344050] mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> Saved successfully
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;