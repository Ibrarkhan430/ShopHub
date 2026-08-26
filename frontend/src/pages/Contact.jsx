import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    e.target.reset();

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-emerald-400 font-semibold mb-3">
            CUSTOMER SUPPORT
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have a question about your order, products, delivery, or anything
            else? Our support team is here to help.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Mail,
              title: "Email Us",
              text: "support@shophub.com",
            },
            {
              icon: Phone,
              title: "Call Us",
              text: "+92 305 8710669",
            },
            {
              icon: MapPin,
              title: "Visit Us",
              text: "Haripur, Pakistan",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-emerald-600" />
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">
                {title}
              </h3>

              <p className="text-slate-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Send us a message
            </h2>

            <p className="text-slate-500 mb-7">
              Fill out the form and our team will get back to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <input
                  required
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <input
                required
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <textarea
                required
                rows="6"
                placeholder="Write your message..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>

              {submitted && (
                <p className="text-emerald-600 text-sm font-medium">
                  Your message has been submitted successfully.
                </p>
              )}
            </form>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <Clock className="w-10 h-10 text-emerald-400 mb-6" />

            <h2 className="text-2xl font-bold mb-4">
              We're here to help
            </h2>

            <p className="text-slate-400 leading-relaxed mb-8">
              Whether you need help choosing a product, tracking an order,
              processing a return, or managing your account, our customer care
              team is ready to assist you.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-700 pb-3">
                <span className="text-slate-400">Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>

              <div className="flex justify-between border-b border-slate-700 pb-3">
                <span className="text-slate-400">Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}