import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  ArrowUpDown,
  Package,
  TrendingDown,
} from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [editingStock, setEditingStock] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get('/products', { params: { limit: 1000 } });
      const prods = data.products || data.data || [];
      setProducts(prods);
    } catch (err) {
      console.error('Inventory load error:', err);
      setError('Failed to load inventory. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock, threshold) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: XCircle };
    if (stock <= threshold) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
  };

  const handleStockChange = (id, value) => {
    setEditingStock((prev) => ({ ...prev, [id]: value }));
  };

  const saveStock = async (id) => {
    const newStock = editingStock[id];
    if (newStock === undefined) return;
    setSaving(id);
    try {
      const { data } = await API.put(`/products/${id}`, {
        stock: Math.max(0, parseInt(newStock, 10) || 0),
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...data } : p))
      );
    } catch (err) {
      console.error(err);
    }
    setEditingStock((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setSaving(null);
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }
    if (stockFilter === 'low') result = result.filter((p) => p.stock > 0 && p.stock <= (p.threshold || 10));
    if (stockFilter === 'out') result = result.filter((p) => p.stock === 0);
    if (stockFilter === 'in') result = result.filter((p) => p.stock > (p.threshold || 10));
    return result;
  }, [products, search, stockFilter]);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.threshold || 10)).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <XCircle className="w-10 h-10 text-red-400" />
        <p className="text-[13px] text-red-600">{error}</p>
        <button
          onClick={loadInventory}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
          { title: 'In Stock', value: products.filter((p) => p.stock > (p.threshold || 10)).length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { title: 'Low Stock', value: lowStockCount, icon: TrendingDown, color: 'bg-amber-50 text-amber-600' },
          { title: 'Out of Stock', value: outOfStockCount, icon: XCircle, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-4"
          >
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-[20px] font-bold text-[#344050]">{s.value}</p>
            <p className="text-[11px] text-[#8A94A6] font-semibold uppercase">{s.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-[13px] text-amber-800 font-medium">
            {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock. Restock soon.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F7FA]/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Product</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Price</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Sold</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Stock</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {filtered.length > 0 ? (
                filtered.map((product) => {
                  const status = getStockStatus(product.stock, product.threshold || 10);
                  const StatusIcon = status.icon;
                  const isEditing = editingStock[product._id] !== undefined;
                  return (
                    <tr key={product._id} className="hover:bg-[#F5F7FA]/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-[#344050]">{product.name}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#344050]">Rs. {(product.price || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#6C757D]">{product.sold || 0}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={product.stock}
                            onChange={(e) => handleStockChange(product._id, e.target.value)}
                            className="w-20 px-2 py-1.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none text-center"
                          />
                          <span className="text-[11px] text-[#8A94A6]">min: {product.threshold || 10}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditing && (
                          <button
                            onClick={() => saveStock(product._id)}
                            disabled={saving === product._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-[11px] font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-50"
                          >
                            {saving === product._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Boxes className="w-10 h-10 text-[#E5E7EB] mx-auto mb-3" />
                    <p className="text-[13px] text-[#8A94A6]">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;