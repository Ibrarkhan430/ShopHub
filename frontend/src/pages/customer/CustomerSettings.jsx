import { useState } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { changePassword } from '../../api/apiClient'; // ✅ Import API

const CustomerSettings = () => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // ✅ Validation
    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      // ✅ REAL API CALL - setTimeout nahi!
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setSaved(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-[18px] font-bold text-[#344050] mb-5">Settings</h2>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-[14px] font-bold text-[#344050] mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#8A94A6]" /> 
          Change Password
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            placeholder="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none"
          />
          
          <input
            type="password"
            required
            placeholder="New Password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none"
          />
          
          <input
            type="password"
            required
            placeholder="Confirm New Password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Updated!</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerSettings;