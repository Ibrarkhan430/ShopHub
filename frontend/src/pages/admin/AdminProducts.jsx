import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  ImageOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get('/products', { params: { limit: 'all' } }), // ✅ SAB PRODUCTS
        API.get('/categories'),
      ]);
      setProducts(prodRes.data?.products || prodRes.data?.data || []);
      setCategories(catRes.data?.categories || catRes.data?.data || catRes.data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
    setDeleting(true);
    await Promise.all(selectedIds.map((id) => API.delete(`/products/${id}`)));
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
    setSelectedIds([]);
    setDeleting(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p._id));
    }
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q) || p._id?.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category?._id === categoryFilter || p.category === categoryFilter);
    }
    if (stockFilter !== 'all') {
      if (stockFilter === 'out') result = result.filter((p) => (p.stock || p.countInStock || 0) === 0);
      else if (stockFilter === 'low') result = result.filter((p) => { const s = p.stock || p.countInStock || 0; return s > 0 && s <= 5; });
      else if (stockFilter === 'in') result = result.filter((p) => (p.stock || p.countInStock || 0) > 5);
    }
    return result;
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStockBadge = (stock) => {
    const s = stock || 0;
    if (s === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold"><XCircle className="w-3 h-3" />Out</span>;
    if (s <= 5) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold"><AlertTriangle className="w-3 h-3" />Low ({s})</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" />In Stock ({s})</span>;
  };

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = filtered.map((p) => [p.name, p.category?.name || p.category || 'N/A', p.price, p.stock || p.countInStock || 0, (p.stock || 0) > 0 ? 'Active' : 'Out of Stock']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-[60vh] gap-4"><AlertCircle className="w-10 h-10 text-red-400" /><p className="text-red-600">{error}</p><button onClick={fetchData} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold">Retry</button></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#344050]">Products</h2>
          <p className="text-[12px] text-[#8A94A6] mt-0.5">Manage your store products</p>
        </div>
        <Link to="/admin/products/add" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F59E0B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#D97706] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] placeholder-[#8A94A6] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none transition-all" />
          </div>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none cursor-pointer">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[13px] text-[#344050] border border-transparent focus:border-[#F59E0B]/40 focus:bg-white focus:outline-none cursor-pointer">
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <button onClick={exportCSV} className="px-3 py-2.5 bg-[#F5F7FA] rounded-lg text-[#344050] hover:bg-[#E5E7EB] transition-colors" title="Export CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7EB]">
            <span className="text-[12px] text-[#344050] font-medium">{selectedIds.length} selected</span>
            <button onClick={bulkDelete} disabled={deleting} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[12px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F7FA]/50">
                <th className="px-4 py-3 text-left"><input type="checkbox" checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-[#E5E7EB] text-[#F59E0B] focus:ring-[#F59E0B]" /></th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Product</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8A94A6] uppercase hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Price</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Stock</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-[#8A94A6] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-[#F5F7FA]/30 transition-colors">
                    <td className="px-4 py-3.5"><input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => toggleSelect(product._id)} className="w-4 h-4 rounded border-[#E5E7EB] text-[#F59E0B] focus:ring-[#F59E0B]" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                          {product.image || product.images?.[0] ? (
                            <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-[#8A94A6]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#344050] truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[11px] text-[#8A94A6]">ID: {product._id?.slice(-6)?.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><span className="text-[12px] text-[#6C757D]">{product.category?.name || product.category || 'Uncategorized'}</span></td>
                    <td className="px-4 py-3.5"><span className="text-[13px] font-bold text-[#344050]">${product.price}</span></td>
                    <td className="px-4 py-3.5">{getStockBadge(product.stock || product.countInStock)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/edit/${product._id}`} className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProduct(product._id)} className="p-1.5 rounded-lg text-[#6C757D] hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Package className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
                    <p className="text-[14px] font-semibold text-[#344050]">No products found</p>
                    <p className="text-[12px] text-[#8A94A6] mt-1">{search || categoryFilter !== 'all' || stockFilter !== 'all' ? 'Try adjusting filters' : 'Add your first product to get started'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB]">
            <p className="text-[12px] text-[#8A94A6]">Showing <span className="font-semibold text-[#344050]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-[#344050]">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-semibold text-[#344050]">{filtered.length}</span></p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${currentPage === page ? 'bg-[#F59E0B] text-white' : 'text-[#6C757D] hover:bg-[#F5F7FA]'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;