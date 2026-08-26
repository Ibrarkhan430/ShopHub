// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import ProductCard from '../components/product/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('❌ Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || 'All');
    setCurrentPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
        };
        if (keyword) params.keyword = keyword;
        if (category !== 'All') params.category = category;
        
        const data = await fetchProducts(params);
        
        // ✅ Safe access
        const productList = data?.products || data || [];
        setProducts(productList);
        setTotalProducts(data?.total || productList.length);
        setTotalPages(data?.pages || 1);
        
        console.log('✅ Products loaded:', productList.length);
      } catch (err) {
        console.error('❌ Error loading products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [keyword, category, currentPage]);

  const handleKeywordChange = (value) => {
    setKeyword(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('keyword', value);
    else next.delete('keyword');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    const next = new URLSearchParams(searchParams);
    if (value !== 'All') next.set('category', value);
    else next.delete('category');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const next = new URLSearchParams(searchParams);
    next.set('page', page);
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setKeyword('');
    const next = new URLSearchParams(searchParams);
    next.delete('keyword');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-1">Shop All Products</h1>
        <p className="text-slate-500 text-sm sm:text-base">
          {totalProducts > 0 ? `${totalProducts} products found` : 'Browse our full collection'}
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          {keyword && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="pl-10 pr-8 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer min-w-[160px]"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      {!loading && products.length > 0 && (
        <p className="text-sm text-slate-500 mb-4">
          Showing {products.length} of {totalProducts} products
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-navy mb-2">No products found</h3>
          <p className="text-slate-500 text-sm">
            We couldn't find any products matching your search.
            <br />
            Try adjusting your search terms or filters.
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 text-amber-600 font-semibold hover:text-amber-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;