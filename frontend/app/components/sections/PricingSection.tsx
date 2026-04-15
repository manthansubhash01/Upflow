"use client";

const plans = [
  {
    name: "Basic",
    price: "$10",
    audience: "For Individuals",
    highlight: false,
  },
  { name: "Pro", price: "$25", audience: "For Startups", highlight: true },
  {
    name: "Enterprise",
    price: "$50",
    audience: "For Big Companies",
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section className="rounded-4xl border border-white/80 bg-[#f7effc]/85 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.1)] backdrop-blur-xl">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
        Pricing
      </p>
      <h3 className="mt-2 text-center text-4xl font-semibold tracking-[-0.05em] text-slate-900">
        Simple, Transparent Plan and Pricing
      </h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-5 ${plan.highlight ? "border-violet-300 bg-white shadow-[0_18px_50px_rgba(83,48,167,0.2)]" : "border-white/80 bg-white/80"}`}
          >
            <p className="text-sm text-slate-500">{plan.audience}</p>
            <h4 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
              {plan.name}
            </h4>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-900">
              {plan.price}
              <span className="text-base font-medium text-slate-500">
                /month
              </span>
            </p>
            <button
              className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold ${plan.highlight ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Contact Sales
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
