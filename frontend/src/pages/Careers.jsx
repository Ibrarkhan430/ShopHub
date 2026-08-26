import { Briefcase, Users, Rocket } from "lucide-react";

export default function Careers() {
  const jobs = [
    {
      title: "Frontend Developer",
      type: "Full Time",
      location: "Remote",
    },
    {
      title: "Customer Support Specialist",
      type: "Full Time",
      location: "Remote",
    },
    {
      title: "Marketing Associate",
      type: "Full Time",
      location: "Remote",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20 text-center">
        <p className="text-emerald-400 font-semibold mb-3">
          JOIN OUR TEAM
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Careers at ShopHub
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto">
          Help us build a better and more convenient online shopping
          experience.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Users,
              title: "Great Team",
              text: "Work with people who care about building useful products.",
            },
            {
              icon: Rocket,
              title: "Grow With Us",
              text: "Learn, contribute, and grow with an evolving ecommerce platform.",
            },
            {
              icon: Briefcase,
              title: "Meaningful Work",
              text: "Build features that directly improve the customer experience.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 p-7"
            >
              <Icon className="w-9 h-9 text-emerald-600 mb-5" />

              <h3 className="font-bold text-xl mb-3">
                {title}
              </h3>

              <p className="text-slate-500">
                {text}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Open Positions
        </h2>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {job.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {job.type} · {job.location}
                </p>
              </div>

              <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}