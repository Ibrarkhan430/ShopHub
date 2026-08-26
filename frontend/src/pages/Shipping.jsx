import { Truck, Package, Clock, MapPin } from "lucide-react";

const shippingOptions = [
  {
    icon: Truck,
    title: "Standard Delivery",
    description:
      "Reliable delivery for everyday orders across supported locations.",
    time: "3–7 business days",
  },
  {
    icon: Package,
    title: "Order Processing",
    description:
      "Orders are carefully prepared and packed before shipment.",
    time: "1–2 business days",
  },
  {
    icon: Clock,
    title: "Delivery Updates",
    description:
      "Track your order status through your customer account.",
    time: "Real-time updates",
  },
  {
    icon: MapPin,
    title: "Delivery Coverage",
    description:
      "We deliver to supported locations shown during checkout.",
    time: "Location dependent",
  },
];

export default function Shipping() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          DELIVERY INFORMATION
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Shipping Information
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto">
          Everything you need to know about order processing and delivery.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingOptions.map(
            ({ icon: Icon, title, description, time }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>

                <h3 className="font-bold text-slate-900 mb-2">
                  {title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  {description}
                </p>

                <span className="text-sm font-semibold text-emerald-600">
                  {time}
                </span>
              </div>
            )
          )}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            Shipping Guidelines
          </h2>

          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Please make sure your shipping address and contact information
              are correct before completing your order.
            </p>

            <p>
              Delivery times may vary depending on location, product
              availability, holidays, and unexpected courier delays.
            </p>

            <p>
              Once your order has been shipped, tracking information will be
              available through your account when supported.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}