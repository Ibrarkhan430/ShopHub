import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import PromoGrid from '../components/home/PromoGrid';
import PopularItems from '../components/home/PopularItems';
import Newsletter from '../components/home/Newsletter';
import BackgroundSlideshow from '../components/home/BackgroundSlideshow';
import Footer from '../components/layout/Footer';

const heroImages = [
  "/images/1.png",
  "/images/2.jpg",
  "/images/3.png",
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts({ limit: 8 });
        const productList = data?.products || data || [];
        setProducts(productList);
        console.log('✅ Home products loaded:', productList.length);
      } catch (err) {
        console.error('❌ Error loading products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const perks = [
    { icon: Truck, title: 'Express Delivery', desc: 'Fast nationwide shipping' },
    { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% encrypted protection' },
    { icon: RefreshCw, title: 'Hassle-Free Returns', desc: '7-day policy' },
  ];

  return (
    <div className="bg-slate-50/50 px-2 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 min-h-[85vh] flex items-center">
        <BackgroundSlideshow images={heroImages} interval={4000} />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/10 to-slate-950/40 z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/30 to-slate-950/80 z-10 pointer-events-none" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 sm:mb-8 backdrop-blur-md shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="tracking-wide uppercase">Exclusive Spring Collection</span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-6 sm:mb-8">
              Shop Smarter,<br />
              <span className="bg-linear-to-r from-amber-400 via-amber-500 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
                Live Better.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-xl font-light leading-relaxed">
              Discover handpicked luxury & daily essentials crafted for individuals who demand sophistication without compromise.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 text-base rounded-xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30"
                >
                  Explore Collection
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* ✅ SIMPLE LINK - NO SCROLL */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products?sort=popular"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-7 py-4 text-base rounded-xl backdrop-blur-md border border-white/15 transition-all duration-300"
                >
                  View Trending
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <PromoGrid />

      <section className="bg-white border-y border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-colors duration-200"
              >
                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl shrink-0">
                  <perk.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">{perk.title}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-amber-600 font-semibold text-xs uppercase tracking-widest">Curated Catalog</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm group transition-colors"
          >
            Explore All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200/60 rounded-2xl aspect-3/4 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-slate-500 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            No products available right now. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <PopularItems />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;