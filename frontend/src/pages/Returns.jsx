import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export default function Returns() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          CUSTOMER CARE
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Returns & Refunds
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto">
          Our return process is designed to make your shopping experience
          simple and convenient.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <RotateCcw className="w-10 h-10 text-emerald-600 mb-5" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Return Process
          </h2>

          <ol className="space-y-5">
            {[
              "Open your order from your customer dashboard.",
              "Select the eligible product you want to return.",
              "Submit your return request with the required information.",
              "Our team will review the request and provide the next steps.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {index + 1}
                </span>

                <span className="text-slate-600 pt-1">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <CheckCircle className="w-8 h-8 text-emerald-600 mb-4" />

            <h3 className="font-bold text-xl mb-4">
              Eligible Returns
            </h3>

            <ul className="space-y-3 text-slate-500">
              <li>• Product is eligible according to the return policy.</li>
              <li>• Product is returned in acceptable condition.</li>
              <li>• Return request is submitted within the applicable period.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <XCircle className="w-8 h-8 text-red-500 mb-4" />

            <h3 className="font-bold text-xl mb-4">
              Non-Eligible Returns
            </h3>

            <ul className="space-y-3 text-slate-500">
              <li>• Products outside the applicable return period.</li>
              <li>• Products damaged through improper use.</li>
              <li>• Products excluded from the return policy.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}