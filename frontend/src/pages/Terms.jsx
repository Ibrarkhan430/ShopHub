export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Terms of Service
        </h1>

        <p className="text-slate-400">
          Please review the terms that apply when using ShopHub.
        </p>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Using ShopHub
            </h2>
            <p>
              By using this website, you agree to use the platform responsibly
              and provide accurate information when creating an account or
              placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Orders
            </h2>
            <p>
              Product availability, pricing, and order information may change.
              Orders are subject to successful processing and confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for activity performed through your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Support
            </h2>
            <p>
              If you have questions regarding these terms, contact the ShopHub
              support team.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}