import { ShieldCheck, Heart, Users, Award } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Shopping",
    text: "We focus on providing a secure and reliable shopping experience.",
  },
  {
    icon: Heart,
    title: "Customer First",
    text: "Our goal is to make every part of your shopping journey simple.",
  },
  {
    icon: Users,
    title: "Growing Community",
    text: "We are building a community of customers who value quality and convenience.",
  },
  {
    icon: Award,
    title: "Quality Products",
    text: "We aim to offer carefully selected products across different categories.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-24 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          ABOUT SHOPHUB
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-5">
          Shopping Made Simple
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          ShopHub brings quality products, convenient shopping, and a
          customer-focused experience together in one place.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-5">
            Our Mission
          </h2>

          <p className="text-slate-600 leading-8">
            Our mission is to create a modern and convenient online shopping
            platform where customers can discover products, compare options,
            manage their orders, and shop with confidence.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <Icon className="w-9 h-9 text-emerald-600 mb-5" />

              <h3 className="font-bold text-lg text-slate-900 mb-3">
                {title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}