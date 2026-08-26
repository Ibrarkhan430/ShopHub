// frontend/src/components/home/PopularItems.jsx
import { useState, useEffect, useRef } from 'react';
import { fetchProducts } from '../../api/products';
import ProductCard from '../product/ProductCard';

const TABS = [
  { key: 'new', label: 'New' },
  { key: 'bestseller', label: 'Best Sellers' },
  { key: 'sale', label: 'Sale' },
];

const PopularItems = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false); // ✅ Prevent double call

  useEffect(() => {
    // ✅ Prevent double API call in Strict Mode
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ limit: 100 });
        
        // ✅ Safe access - handles both array and paginated response
        const productList = data?.products || data || [];
        setProducts(productList);
        
        console.log('✅ Popular items loaded:', productList.length);
      } catch (err) {
        console.error('❌ Error loading popular items:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

  const filtered = products.filter((p) => p.tag === activeTab);

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-navy text-center">
          Currently Popular Items
        </h2>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm sm:text-base font-medium pb-1.5 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-amber-600 border-amber-500'
                  : 'text-slate-500 border-transparent hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 sm:mt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-center py-12 text-sm sm:text-base">
              No products tagged "{TABS.find((t) => t.key === activeTab)?.label}" yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularItems;