import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trash2, Mail, Calendar } from 'lucide-react';
import { fetchUsers, deleteUser } from '../../api/users';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    try {
      const data = await fetchUsers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-xl animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Customers</h1>
          <p className="text-slate-400 text-sm mt-0.5">{customers.length} registered customers</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3" />
          No customers yet
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-100">
          {customers.map((customer) => (
            <div key={customer._id} className="flex items-center justify-between px-5 py-4">
              <Link to={`/admin/customers/${customer._id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-sm shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-navy text-sm truncate">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-slate-400 text-xs truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      {customer.email}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(customer._id, customer.name)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                aria-label="Delete customer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;