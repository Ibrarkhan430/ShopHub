import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div
        className="relative  overflow-hidden bg-cover bg-center py-14 sm:py-20 px-4"
        style={{ backgroundImage: "url('/images/spacejoy-RqO6kwm4tZY-unsplash.jpg')" }}
      >
        <div className="absolute inset-0 bg-navy/20" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-amber-500 rounded-full mb-4">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Sign up & get 25% off your first order
          </h3>
          <p className="text-slate-200 text-sm sm:text-base mt-2 max-w-sm">
            Subscribe for exclusive deals, new arrivals, and style tips.
          </p>

          {subscribed ? (
            <p className="text-amber-400 font-semibold text-sm sm:text-base mt-6">
              Thanks for subscribing! 
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row w-full max-w-md gap-2 sm:gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-2.5 sm:py-3 outline-none text-slate-800 bg-white w-full text-sm sm:text-base rounded-lg sm:rounded-r-none sm:rounded-l-lg"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-navy font-semibold text-sm sm:text-base rounded-lg sm:rounded-l-none sm:rounded-r-lg transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;