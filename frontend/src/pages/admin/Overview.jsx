import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import API from '../../api/axios';

const Overview = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          API.get('/products?limit=1'),
          API.get('/orders'),
        ]);

        const orders = ordersRes.data;
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const pending = orders.filter((o) => o.status === 'pending').length;

        setStats({
          products: productsRes.data.total,
          orders: orders.length,
          revenue,
          pending,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Orders', value: stats.pending, icon: Clock, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-1">
        Dashboard Overview
      </h1>
      <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-8">
        Welcome back! Here's what's happening with your store.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5"
          >
            <div className={`inline-flex p-2 sm:p-2.5 rounded-lg mb-3 sm:mb-4 ${card.color}`}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mb-1">{card.label}</p>
            <p className="font-display font-bold text-navy text-lg sm:text-2xl">
              {loading ? '—' : card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Overview;