import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, FolderTree } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (category) => {
    setForm({ name: category.name, description: category.description || '' });
    setEditingId(category._id);
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      await loadCategories();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-xl animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Categories</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 bg-navy hover:bg-navy-light text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-xl p-5 sm:p-6 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Electronics"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Electronic devices and accessories"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </motion.div>
      )}

      {categories.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-slate-400">
          <FolderTree className="w-10 h-10 mx-auto mb-3" />
          No categories yet
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-100">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-navy text-sm">{cat.name}</p>
                {cat.description && (
                  <p className="text-slate-400 text-xs mt-0.5">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditForm(cat)}
                  className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;