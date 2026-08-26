import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { useSettings } from "../../Context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setSubscribed(false);
    }, 3000);
  };

  const shopLinks = [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=new" },
    { label: "Best Sellers", href: "/products?sort=popular" },
    { label: "Deals & Offers", href: "/products?tag=sale" },
    { label: "Categories", href: "/categories" },
  ];

  const supportLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Track Order", href: "/account/orders" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Blog", href: "/blog" },
  ];

  const socialIcons = [
    { Icon: FaFacebookF, href: "#" },
    { Icon: FaInstagram, href: "#" },
    { Icon: FaXTwitter, href: "#" },
    { Icon: FaYoutube, href: "#" },
  ];

  return (
    <footer className="bg-slate-950 pb-4 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

        {/* =====================================================
            BRAND / CONTACT
        ====================================================== */}
        <div className="lg:col-span-4">

          <Link
            to="/"
            className="flex items-center gap-2 mb-4"
          >
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.storeName || "ShopHub"}
                className="w-9 h-9 rounded-lg object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {settings?.storeName?.charAt(0) || "S"}
                </span>
              </div>
            )}

            <span className="text-xl font-bold text-white tracking-tight">
              {settings?.storeName || "ShopHub"}
            </span>
          </Link>

          <p className="text-sm leading-relaxed text-slate-400 mb-6 max-w-sm">
            Your one-stop destination for quality products at unbeatable
            prices. Discover the latest trends and shop with confidence.
          </p>

          {/* CONTACT INFORMATION */}
          <div className="space-y-3">

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />

              <span>
                {settings?.storeAddress ||
                  "123 Market Street, Suite 400, Haripur, Pakistan"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />

              <a
                href={`tel:${
                  settings?.storePhone || "+923058710669"
                }`}
                className="hover:text-white transition-colors"
              >
                {settings?.storePhone || "+92 3058710669"}
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-orange-500 shrink-0" />

              <a
                href={`mailto:${
                  settings?.storeEmail || "support@shophub.com"
                }`}
                className="hover:text-white transition-colors"
              >
                {settings?.storeEmail || "support@shophub.com"}
              </a>
            </div>

          </div>

          {/* SOCIAL LINKS */}
          <div className="flex items-center gap-3 mt-6">
            {socialIcons.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                aria-label="social link"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 transition-colors text-slate-300 hover:text-white"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* =====================================================
            SHOP
        ====================================================== */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">
            Shop
          </h3>

          <ul className="space-y-3">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* =====================================================
            CUSTOMER CARE
        ====================================================== */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">
            Customer Care
          </h3>

          <ul className="space-y-3">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* =====================================================
            COMPANY
        ====================================================== */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">
            Company
          </h3>

          <ul className="space-y-3">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* =====================================================
            NEWSLETTER
        ====================================================== */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">
            Stay Updated
          </h3>

          <p className="text-sm text-slate-400 mb-4">
            Subscribe for exclusive deals and new arrivals.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-2"
          >
            <div className="relative">

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1.5 top-1.5 w-7 h-7 rounded-md bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

            </div>

            {subscribed && (
              <span className="text-xs text-emerald-400">
                Thanks for subscribing!
              </span>
            )}
          </form>
        </div>
      </div>

      {/* =====================================================
          BOTTOM
      ====================================================== */}
      <div className="border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()}{" "}
            {settings?.storeName || "ShopHub"}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">

            <img
              src="https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/visa.svg"
              alt="Visa"
              className="h-6 opacity-80"
            />

            <img
              src="https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/mastercard.svg"
              alt="Mastercard"
              className="h-6 opacity-80"
            />

            <img
              src="https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/paypal.svg"
              alt="PayPal"
              className="h-6 opacity-80"
            />

          </div>
        </div>
      </div>
    </footer>
  );
}