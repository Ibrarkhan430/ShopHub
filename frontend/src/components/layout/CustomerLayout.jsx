import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActiveRoute = (path) => location.pathname === path;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/customer' || path === '/customer/dashboard') return 'Dashboard';
    if (path.includes('/orders')) return 'My Orders';
    if (path.includes('/wishlist')) return 'Wishlist';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/addresses')) return 'Addresses';
    if (path.includes('/settings')) return 'Settings';
    return 'Account';
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { name: 'Wishlist', path: '/customer/wishlist', icon: Heart },
    { name: 'Profile', path: '/customer/profile', icon: User },
    { name: 'Addresses', path: '/customer/addresses', icon: MapPin },
    { name: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[70px]' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`h-16 flex items-center border-b border-[#E5E7EB] shrink-0 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
          <Link to="/customer/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            {!collapsed && <span className="text-[15px] font-bold text-[#344050]">ShopHub</span>}
          </Link>
          {!collapsed && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-md text-[#6C757D] hover:bg-[#F5F7FA]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActiveRoute(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  active ? 'bg-[#FFF3D6] text-[#D97706]' : 'text-[#344050] hover:bg-[#F5F7FA]'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-[#E5E7EB] p-3 space-y-1">
          <Link
            to="/"
            title={collapsed ? 'Store' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#344050] hover:bg-[#F5F7FA] transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <Store className="w-[17px] h-[17px] text-[#6C757D]" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-[17px] h-[17px]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-[18px] font-bold text-[#344050]">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA]">
              <ShoppingBag className="w-[18px] h-[18px]" />
            </Link>
            
            {/* ✅ Profile Dropdown with Image */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F5F7FA] transition-colors"
              >
                {/* ✅ Profile Image - Desktop */}
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-amber-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-semibold text-[#344050] leading-tight">{user?.name || 'User'}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8A94A6] hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50"
                  >
                    {/* ✅ Profile Image in Dropdown */}
                    <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-3">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-bold text-[#344050]">{user?.name}</p>
                        <p className="text-[11px] text-[#8A94A6] truncate">{user?.email}</p>
                      </div>
                    </div>

                    <Link to="/customer/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#344050] hover:bg-[#F5F7FA]">
                      <User className="w-4 h-4 text-[#6C757D]" /> Profile
                    </Link>
                    <Link to="/customer/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#344050] hover:bg-[#F5F7FA]">
                      <Settings className="w-4 h-4 text-[#6C757D]" /> Settings
                    </Link>
                    <div className="border-t border-[#E5E7EB] py-1">
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;