import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, ImagePlus, X, Package } from 'lucide-react';
import { fetchProductById, createProduct, updateProduct } from '../../api/products';
import { fetchCategories } from '../../api/categories';
import { uploadImage } from '../../api/upload';

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    image: '',
    stock: '',
    tag: 'none',
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (!isEdit && data.length > 0) {
          setForm((prev) => ({ ...prev, category: data[0].name }));
        }
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        try {
          const data = await fetchProductById(id);
          setForm({
            name: data.name,
            description: data.description,
            price: data.price,
            oldPrice: data.oldPrice || '',
            category: data.category,
            image: data.image || '',
            stock: data.stock,
            tag: data.tag || 'none',
          });
          setImagePreview(data.image || '');
        } catch (err) {
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setError('');
    setUploading(true);

    try {
      const imageUrl = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
      setImagePreview(form.image);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        stock: Number(form.stock),
      };
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-xl animate-pulse" />;
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-600 text-sm mb-5 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-100 rounded-xl p-5 sm:p-6"
      >
        <h1 className="font-display text-xl sm:text-2xl font-bold text-navy mb-5 sm:mb-6">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Product Image
            </label>

            {imagePreview ? (
              <div className="relative w-full aspect-video sm:aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-navy" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video sm:aspect-[21/9] border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600 transition-colors"
              >
                <ImagePlus className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-xs sm:text-sm font-medium">Click to upload image</span>
                <span className="text-[10px] sm:text-xs text-slate-400">JPG, PNG or WEBP (max 5MB)</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview && !uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-600 text-xs sm:text-sm font-medium mt-2 hover:text-amber-700"
              >
                Change image
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Wireless Headphones"
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="High-quality noise-cancelling wireless headphones"
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price (Rs.)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="5999"
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Old Price (Rs.) <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                name="oldPrice"
                min="0"
                value={form.oldPrice}
                onChange={handleChange}
                placeholder="7999"
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Tag
              </label>
              <select
                name="tag"
                value={form.tag}
                onChange={handleChange}
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
              >
                <option value="none">None</option>
                <option value="new">New Arrival</option>
                <option value="bestseller">Best Seller</option>
                <option value="sale">On Sale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
            >
              {categories.length === 0 && <option value="">No categories yet</option>}
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || uploading}
            className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-semibold py-3 text-sm sm:text-base rounded-lg transition-colors mt-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Update Product' : 'Create Product'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;