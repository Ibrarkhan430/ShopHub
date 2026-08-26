import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PromoGrid = () => {
  const banners = [
    {
      title: 'Trending Now',
      subtitle: 'The focus and accent on your spring collection',
      image: '/images/image copy 3.png',
      link: '/products',
    },
    {
      title: 'Clearance',
      subtitle: "It's on — up to 50% off",
      image: '/images/image.png',
      link: '/products',
    },
    {
      title: 'You Might Love',
      subtitle: "This Week's Most Wanted",
      image: '/images/ecomerace.png',
      link: '/products',
    },
    {
      title: 'The New Pretty',
      subtitle: 'How to Dress For Spring',
      image: '/images/image copy 2.png',
      link: '/products',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-4">

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/2 h-[280px] sm:h-[360px] lg:h-[520px]"
        >
          <Link to={banners[0].link} className="group block relative overflow-hidden rounded-md h-full">
            <img
              src={banners[0].image}
              alt={banners[0].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="text-amber-400 text-sm sm:text-base font-semibold">{banners[0].title}</span>
              <p className="text-white text-lg sm:text-2xl font-display font-bold mt-1 mb-3 max-w-xs">
                {banners[0].subtitle}
              </p>
              <span className="inline-block text-white text-sm font-medium border-b border-white/40 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
                Discover Now →
              </span>
            </div>
          </Link>
        </motion.div>

        
        <div className="lg:w-1/2 flex flex-col gap-4 lg:h-[520px]">

          {/* Wide banner - top half */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-[170px] sm:h-[175px] lg:h-1/2"
          >
            <Link to={banners[1].link} className="group block relative overflow-hidden rounded-md h-full">
              <img
                src={banners[1].image}
                alt={banners[1].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <span className="text-amber-400 text-xs sm:text-sm font-semibold">{banners[1].title}</span>
                <p className="text-white text-base sm:text-xl font-display font-bold mt-1 mb-2">
                  {banners[1].subtitle}
                </p>
                <span className="inline-block text-white text-xs sm:text-sm font-medium border-b border-white/40 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
                  Shop Now →
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Two small banners - bottom half, side by side */}
          <div className="flex flex-col sm:flex-row gap-4 h-[330px] sm:h-[170px] lg:h-1/2">
            {banners.slice(2).map((banner, i) => (
              <motion.div
                key={banner.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex-1 h-full"
              >
                <Link to={banner.link} className="group block relative overflow-hidden rounded-md h-full">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <span className="text-amber-400 text-xs font-semibold">{banner.title}</span>
                    <p className="text-white text-sm sm:text-base font-display font-bold mt-1">
                      {banner.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoGrid;