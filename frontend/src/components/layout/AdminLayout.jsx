import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Store,
  Settings,
  BarChart3,
  Star,
  Boxes,
  LogOut,
  Search,
  Bell,
  User,
  ChevronLeft,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import API from '../../api/axios';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({ products: false, orders: false });
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({ orders: 0, products: 0, customers: 0, reviews: 0 });
  const location = useLocation();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadOrderCount = async () => {
      try {
        const { data } = await API.get('/orders');
        const orders = data.orders || data.data || data || [];
        setBadgeCounts((prev) => ({ ...prev, orders: orders.length }));
      } catch (err) {
        console.error(err);
      }
    };
    loadOrderCount();
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    setOpenMenus((prev) => ({
      ...prev,
      products: path.startsWith('/admin/products') ? true : prev.products,
      orders: path.startsWith('/admin/orders') ? true : prev.orders,
    }));
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu) => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => setOpenMenus((prev) => ({ ...prev, [menu]: true })), 200);
    } else {
      setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isChildActive = (childPath) => {
    const [childBase, childQuery] = childPath.split('?');
    const childStatus = childQuery ? new URLSearchParams(childQuery).get('status') : null;
    const currentStatus = new URLSearchParams(location.search).get('status');
    return location.pathname === childBase && currentStatus === childStatus;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/products/add')) return 'Add Product';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/customers')) return 'Customers';
    if (path.includes('/reviews')) return 'Reviews';
    if (path.includes('/inventory')) return 'Inventory';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: 'CATALOG',
      items: [
        {
          name: 'Products',
          icon: Package,
          key: 'products',
          badge: null,
          children: [
            { name: 'All Products', path: '/admin/products' },
            { name: 'Add Product', path: '/admin/products/add' },
          ],
        },
        {
          name: 'Orders',
          icon: ShoppingBag,
          key: 'orders',
          badge: badgeCounts.orders,
          children: [
            { name: 'All Orders', path: '/admin/orders' },
            { name: 'Pending', path: '/admin/orders?status=pending' },
            { name: 'Processing', path: '/admin/orders?status=processing' },
            { name: 'Delivered', path: '/admin/orders?status=delivered' },
          ],
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Categories', path: '/admin/categories', icon: FolderTree, badge: null },
        { name: 'Customers', path: '/admin/customers', icon: Users, badge: null },
      ],
    },
    {
      title: 'MORE',
      items: [
        { name: 'Reviews', path: '/admin/reviews', icon: Star, badge: badgeCounts.reviews },
        { name: 'Inventory', path: '/admin/inventory', icon: Boxes, badge: null },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, badge: null },
        { name: 'Settings', path: '/admin/settings', icon: Settings, badge: null },
      ],
    },
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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300 ease-in-out shadow-sm lg:shadow-none ${
          collapsed ? 'w-17.5' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div
          className={`h-16 flex items-center border-b border-[#E5E7EB] shrink-0 ${
            collapsed ? 'justify-center px-2' : 'px-4'
          }`}
        >
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#344050] leading-tight tracking-tight">
                  ShopHub
                </span>
                <span className="text-[9px] text-[#8A94A6] uppercase tracking-widest font-semibold">
                  Admin
                </span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-1.5 rounded-md text-[#6C757D] hover:bg-[#F5F7FA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-2.5 text-[10px] font-bold text-[#8A94A6] uppercase tracking-widest mb-1.5">
                  {section.title}
                </h3>
              )}
              {collapsed && section.title !== 'MAIN' && (
                <div className="mx-2 mb-2 h-px bg-[#E5E7EB]" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  if (item.children) {
                    const isOpen = openMenus[item.key];
                    const hasActiveChild = item.children.some((c) =>
                      isActiveRoute(c.path.split('?')[0])
                    );
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => toggleMenu(item.key)}
                          title={collapsed ? item.name : undefined}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            hasActiveChild
                              ? 'bg-[#FFF3D6] text-[#D97706]'
                              : 'text-[#344050] hover:bg-[#F5F7FA]'
                          } ${collapsed ? 'justify-center' : ''}`}
                        >
                          <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.name}</span>
                              {item.badge > 0 && (
                                <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                  {item.badge}
                                </span>
                              )}
                              <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-[#8A94A6]" />
                              </motion.span>
                            </>
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && !collapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-[#E5E7EB] pl-3">
                                {item.children.map((child) => {
                                  const childActive = isChildActive(child.path);
                                  return (
                                    <Link
                                      key={child.name}
                                      to={child.path}
                                      className={`block px-2.5 py-1.5 rounded-md text-[12px] transition-colors ${
                                        childActive
                                          ? 'text-[#D97706] font-semibold bg-[#FFF3D6]/50'
                                          : 'text-[#6C757D] hover:text-[#344050] hover:bg-[#F5F7FA]'
                                      }`}
                                    >
                                      {child.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const active = isActiveRoute(item.path);
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        active
                          ? 'bg-[#FFF3D6] text-[#D97706]'
                          : 'text-[#344050] hover:bg-[#F5F7FA]'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge > 0 && (
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[#E5E7EB] bg-white">
          <Link
            to="/"
            title={collapsed ? 'View Store' : undefined}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#344050] hover:bg-[#F5F7FA] transition-colors border-b border-[#E5E7EB] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Store className="w-[17px] h-[17px] flex-shrink-0 text-[#6C757D]" />
            {!collapsed && <span>View Store</span>}
          </Link>

          <div className={`flex items-center gap-2.5 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#344050] truncate leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-[#8A94A6] truncate">
                  {user?.email || 'admin@shophub.com'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-[#E5E7EB] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-[#E5E7EB] hidden sm:block" />

            <div className="min-w-0 hidden sm:block">
              <nav className="flex items-center text-[12px] text-[#8A94A6]">
                <span className="hover:text-[#344050] cursor-pointer transition-colors">Home</span>
                <ChevronRight className="w-3 h-3 mx-1.5" />
                <span className="hover:text-[#344050] cursor-pointer transition-colors">Admin</span>
                <ChevronRight className="w-3 h-3 mx-1.5" />
                <span className="text-[#344050] font-semibold">{getPageTitle()}</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <div className="hidden md:flex items-center bg-[#F5F7FA] rounded-lg px-3 py-[6px] border border-transparent focus-within:border-[#F59E0B]/40 focus-within:bg-white focus-within:shadow-sm transition-all w-56">
              <Search className="w-3.5 h-3.5 text-[#8A94A6]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-[13px] text-[#344050] placeholder-[#8A94A6] ml-2 w-full"
              />
            </div>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#344050] transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-[#344050]">Notifications</h4>
                      <span className="text-[11px] text-[#8A94A6]">3 new</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {[
                        { title: 'New order received', desc: 'Order #1234 - $299.00', time: '2 min ago', color: 'bg-blue-500' },
                        { title: 'Product out of stock', desc: 'Wireless Headphones', time: '1 hour ago', color: 'bg-amber-500' },
                        { title: 'New review', desc: '5 stars on Running Shoes', time: '3 hours ago', color: 'bg-green-500' },
                      ].map((n, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors border-b border-[#F5F7FA] last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-[#344050]">{n.title}</p>
                              <p className="text-[11px] text-[#6C757D] truncate">{n.desc}</p>
                              <p className="text-[10px] text-[#8A94A6] mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-[#E5E7EB] text-center">
                      <button className="text-[12px] font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-[#E5E7EB] mx-1 hidden sm:block" />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F5F7FA] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#FFF3D6]">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[13px] font-semibold text-[#344050] leading-tight">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-[10px] text-[#8A94A6] truncate max-w-[120px]">
                    {user?.email || 'admin@shophub.com'}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8A94A6] hidden lg:block transition-transform duration-200 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F5F7FA]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white font-bold text-base">
                          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#344050]">
                            {user?.name || 'Admin'}
                          </p>
                          <p className="text-[11px] text-[#8A94A6] truncate">
                            {user?.email || 'admin@shophub.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#344050] hover:bg-[#F5F7FA] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#6C757D]" />
                        Settings
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#344050] hover:bg-[#F5F7FA] transition-colors"
                      >
                        <Store className="w-4 h-4 text-[#6C757D]" />
                        View Store
                      </Link>
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#344050] hover:bg-[#F5F7FA] transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-[#6C757D]" />
                        Help Center
                      </button>
                    </div>

                    <div className="border-t border-[#E5E7EB] py-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
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

export default AdminLayout;