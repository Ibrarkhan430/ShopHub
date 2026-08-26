import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse our products, open the product you want, add it to your cart, and proceed to checkout. Follow the checkout steps to complete your purchase.",
  },
  {
    question: "Do I need an account to purchase?",
    answer:
      "Yes. You need to sign in or create an account before completing your purchase.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can track your order from your account dashboard under the Orders section.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes. Eligible products can be returned according to our return policy. Please contact customer support if you need assistance.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location and the selected shipping option. You can check the available shipping information during checkout.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact our support team through the Contact Us page or email us at support@shophub.com.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          SUPPORT CENTER
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked Questions
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto">
          Find quick answers to the most common questions about ShopHub.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-6"
                >
                  <span className="font-semibold text-slate-900">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-500 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}