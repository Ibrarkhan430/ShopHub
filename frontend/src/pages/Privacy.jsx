export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Privacy Policy
        </h1>

        <p className="text-slate-400">
          Your privacy and security matter to us.
        </p>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Information We Collect
            </h2>
            <p>
              We may collect information such as your name, email address,
              contact information, shipping details, and order information
              when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How We Use Information
            </h2>
            <p>
              Information may be used to process orders, provide customer
              support, improve our services, and communicate important account
              or order updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Account Security
            </h2>
            <p>
              We take reasonable measures to protect account information and
              encourage users to keep their passwords secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Contact
            </h2>
            <p>
              If you have questions about this privacy policy, please contact
              our support team.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}