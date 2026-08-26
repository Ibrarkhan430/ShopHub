// frontend/src/pages/Categories.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories } from '../api/categories';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Shop by Category</h1>
      <p className="text-slate-500 mb-8">Browse our curated collection by category</p>

      {categories.length === 0 ? (
        <p className="text-slate-500 text-center py-12">No categories found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="block bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 text-center"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-4xl">📂</span>
                  </div>
                )}
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{category.description}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;