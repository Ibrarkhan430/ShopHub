import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit3, X, CheckCircle2, Loader2 } from 'lucide-react';
import { addAddress, updateAddress, deleteAddress } from '../../api/apiClient';
import { useAuth } from '../../Context/AuthContext';

const Addresses = () => {
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    fullName: '', 
    address: '', 
    city: '', 
    postalCode: '', 
    country: '', 
    phone: '', 
    isDefault: false 
  });

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingId) {
        res = await updateAddress(editingId, form);
      } else {
        res = await addAddress(form);
      }
      // ✅ res.data contains updated addresses array
      updateUser({ addresses: res.data });
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', fullName: '', address: '', city: '', postalCode: '', country: '', phone: '', isDefault: false });
    } catch (err) {
      console.error('Address error:', err);
      alert(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await deleteAddress(id);
      updateUser({ addresses: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const editAddress = (addr) => {
    setForm(addr);
    setEditingId(addr._id);
    setShowForm(true);
  };

  const setDefault = async (id) => {
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;
    try {
      const res = await updateAddress(id, { ...addr, isDefault: true });
      updateUser({ addresses: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#344050]">My Addresses</h2>
        <button 
          onClick={() => { 
            setShowForm(true); 
            setEditingId(null); 
            setForm({ name: '', fullName: '', address: '', city: '', postalCode: '', country: '', phone: '', isDefault: false }); 
          }} 
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F59E0B] text-white rounded-lg text-[12px] font-semibold hover:bg-[#D97706]"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-[#344050]">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[#F5F7FA] text-[#6C757D]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                required 
                placeholder="Label (e.g. Home)" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="Full Name" 
                value={form.fullName} 
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="Street Address" 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
                className="sm:col-span-2 px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="City" 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="Postal Code" 
                value={form.postalCode} 
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="Country" 
                value={form.country} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <input 
                required 
                placeholder="Phone" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none" 
              />
              <div className="sm:col-span-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="default" 
                  checked={form.isDefault} 
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} 
                  className="w-4 h-4 rounded border-[#E5E7EB] text-[#F59E0B]" 
                />
                <label htmlFor="default" className="text-[13px] text-[#344050]">Set as default</label>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-4 py-2.5 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />} 
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="px-4 py-2.5 bg-[#F5F7FA] text-[#344050] rounded-lg text-[13px] font-semibold hover:bg-[#E5E7EB]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr, i) => (
          <motion.div 
            key={addr._id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className={`bg-white rounded-xl border p-5 relative ${addr.isDefault ? 'border-[#F59E0B] ring-1 ring-[#F59E0B]/20' : 'border-[#E5E7EB]'}`}
          >
            {addr.isDefault && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#FFF3D6] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Default
              </span>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#8A94A6]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#344050]">{addr.name}</h4>
                <p className="text-[13px] text-[#344050] font-medium">{addr.fullName}</p>
              </div>
            </div>
            <div className="space-y-1 pl-12">
              <p className="text-[13px] text-[#6C757D]">{addr.address}</p>
              <p className="text-[13px] text-[#6C757D]">{addr.city}, {addr.postalCode}</p>
              <p className="text-[13px] text-[#6C757D]">{addr.country}</p>
              <p className="text-[13px] text-[#6C757D]">{addr.phone}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pl-12">
              <button 
                onClick={() => editAddress(addr)} 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F7FA] text-[12px] font-semibold text-[#344050] hover:bg-[#E5E7EB]"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(addr._id)} 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-[12px] font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              {!addr.isDefault && (
                <button 
                  onClick={() => setDefault(addr._id)} 
                  className="ml-auto text-[11px] font-semibold text-[#F59E0B] hover:text-[#D97706]"
                >
                  Set Default
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <MapPin className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="text-[16px] font-bold text-[#344050] mb-1">No addresses saved</h3>
          <p className="text-[13px] text-[#8A94A6]">Add an address to speed up checkout.</p>
        </div>
      )}
    </div>
  );
};

export default Addresses;