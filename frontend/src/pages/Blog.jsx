import { Calendar, ArrowRight } from "lucide-react";

const posts = [
  {
    title: "How to Choose the Right Product Online",
    category: "Shopping Guide",
    date: "August 20, 2026",
    description:
      "Learn how to compare products, check important details, and make better purchasing decisions.",
  },
  {
    title: "Smart Shopping Tips for Better Deals",
    category: "Tips",
    date: "August 15, 2026",
    description:
      "Discover simple strategies to find useful products and make the most of special offers.",
  },
  {
    title: "Why Customer Reviews Matter",
    category: "Shopping Guide",
    date: "August 10, 2026",
    description:
      "Customer reviews can help you understand product quality and make more confident decisions.",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          SHOPHUB BLOG
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Insights & Shopping Tips
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto">
          Helpful guides, shopping tips, and the latest updates from ShopHub.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((post) => (
            <article
              key={post.title}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="h-48 bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                <span className="text-white text-5xl font-bold">
                  S
                </span>
              </div>

              <div className="p-6">
                <span className="text-xs font-semibold text-emerald-600">
                  {post.category}
                </span>

                <h2 className="text-xl font-bold text-slate-900 mt-3 mb-3">
                  {post.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  {post.description}
                </p>

                <button className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}