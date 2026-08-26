import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import API from '../../api/axios';

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');

      // Step 1: Upload to your upload endpoint
      const uploadData = new FormData();
      uploadData.append('image', file);

      // ✅ FIX: Use /upload/profile instead of /upload
      const uploadRes = await API.post('/upload/profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Correctly extract imageUrl
      const imageUrl = uploadRes.data?.imageUrl || uploadRes.data?.image || uploadRes.data?.url;

      if (!imageUrl) {
        throw new Error('Image upload failed: URL missing from response');
      }

      // Step 2: Update user profile image on backend
      const { data } = await API.put('/upload/profile-image', { imageUrl });

      // Step 3: Update local auth context
      updateUser(data);
      setSuccess(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const { data } = await API.put('/auth/profile', formData);
      updateUser(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#344050]">My Profile</h2>
        <p className="text-sm text-[#8A94A6]">Manage your personal information</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center"
      >
        <div
          onClick={handleImageClick}
          className="relative w-24 h-24 rounded-full bg-[#F5F7FA] flex items-center justify-center cursor-pointer group overflow-hidden border-4 border-white shadow-lg"
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-[#8A94A6]" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="text-xs text-[#8A94A6] mt-3">Click to change photo</p>
      </motion.div>

      {/* Profile Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#344050] mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-sm text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all"
              placeholder="Your name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344050] mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-sm text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344050] mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-sm text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all"
              placeholder="+92 300 1234567"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </motion.button>
      </motion.form>
    </div>
  );
};

export default CustomerProfile;