import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Home,
  Store,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useCart } from '../../Context/CartContext';
import { fetchCategories } from '../../api/categories';
import { useSettings } from '../../Context/SettingsContext'; // ✅ ADDED

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { settings } = useSettings(); // ✅ ADDED
  const navigate = useNavigate();

  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setCategoryMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setMobileCategoriesOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    closeMobileMenu();
    setSearchOpen(false);
    if (searchValue.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleCategoryClick = (categoryName) => {
    setCategoryMenuOpen(false);
    closeMobileMenu();
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/products', icon: Store },
  ];

  return (
    <div className="top-0 sticky z-50 px-3 sm:px-4">
      <header className="max-w-7xl mx-auto bg-blue-50/95 backdrop-blur-sm rounded-full shadow-lg shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center justify-between gap-2 sm:gap-4 pl-2 sm:pl-3 pr-2 py-2">
          {/* ✅ LOGO - UPDATED WITH SETTINGS */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.storeName || 'ShopHub'}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-500/30"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy font-display font-extrabold text-base sm:text-lg shrink-0">
                {settings?.storeName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="font-display font-bold text-navy text-sm sm:text-base leading-tight">
                {settings?.storeName || 'ShopHub'}
              </p>
              <p className="text-slate-400 text-[10px] sm:text-[11px] leading-tight">
                Shop Smarter, Live Better.
              </p>
            </div>
          </Link>

          {/* Center Pill Nav - desktop only */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-50 rounded-full px-2 py-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-slate-500 hover:text-amber-600 hover:bg-white transition-all"
              >
                <link.icon className="w-4 h-4" />
                <span className="text-[11px] font-medium">{link.name}</span>
              </Link>
            ))}

            <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />

            {/* Categories Dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-slate-500 hover:text-amber-600 hover:bg-white transition-all"
              >
                <FolderTree className="w-4 h-4" />
                <span className="text-[11px] font-medium flex items-center gap-0.5">
                  Categories
                  <ChevronDown className={`w-3 h-3 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {categoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-2xl shadow-xl overflow-hidden py-2 border border-slate-100"
                  >
                    {categories.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-slate-400">No categories yet</p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => handleCategoryClick(cat.name)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side - Cart & Search ALWAYS visible */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl p-2 border border-slate-100"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth - desktop */}
            {user ? (
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-navy font-semibold text-sm pl-4 pr-2 py-2 rounded-full transition-all"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-white/50"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-navy text-xs font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl overflow-hidden py-2 border border-slate-100"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-navy truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      {user.role !== 'admin' && (
                        <Link
                          to="/customer/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          My Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-navy font-semibold text-sm pl-4 pr-2 py-2 rounded-full transition-all"
              >
                Sign In
                <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            )}

            {/* Hamburger - mobile/tablet */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full bg-navy hover:bg-navy-light flex items-center justify-center text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-navy/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  {settings?.logo ? (
                    <img
                      src={settings.logo}
                      alt={settings.storeName || 'ShopHub'}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy font-display font-extrabold text-sm">
                      {settings?.storeName?.charAt(0) || 'S'}
                    </div>
                  )}
                  <p className="font-display font-bold text-navy text-sm">
                    {settings?.storeName || 'ShopHub'}
                  </p>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto">
                {user && (
                  <div className="mx-5 mt-5 p-4 rounded-2xl bg-linear-to-br from-navy to-navy-light flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-slate-300 text-xs truncate mt-0.5">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-amber-500 text-navy px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="px-5 mt-5">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-slate-50 text-navy placeholder:text-slate-400 pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </form>
                </div>

                <div className="px-5 mt-5">
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-2 px-1">
                    Menu
                  </p>
                  <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3.5 text-navy hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <link.icon className="w-4 h-4" />
                        </span>
                        {link.name}
                      </Link>
                    ))}

                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between px-4 py-3.5 text-navy hover:bg-slate-50 text-sm font-medium transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </span>
                        Cart
                      </span>
                      {cartCount > 0 && (
                        <span className="bg-amber-500 text-navy text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    <div>
                      <button
                        onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-navy hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <FolderTree className="w-4 h-4" />
                          </span>
                          Categories
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${mobileCategoriesOpen ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {mobileCategoriesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-slate-50"
                          >
                            {categories.length === 0 ? (
                              <p className="px-6 py-3 text-sm text-slate-400">No categories yet</p>
                            ) : (
                              categories.map((cat) => (
                                <button
                                  key={cat._id}
                                  onClick={() => handleCategoryClick(cat.name)}
                                  className="block text-left w-full pl-14 pr-4 py-2.5 text-sm text-slate-600 hover:text-amber-600 hover:bg-white transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3.5 text-navy hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </span>
                        Admin Dashboard
                      </Link>
                    )}

                    {user && user.role !== 'admin' && (
                      <Link
                        to="/customer/dashboard"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3.5 text-navy hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </span>
                        My Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 border-t border-slate-100 shrink-0">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-3 rounded-xl w-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 bg-linear-to-r from-amber-400 to-amber-600 text-navy font-semibold text-sm px-4 py-3 rounded-xl w-full"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;