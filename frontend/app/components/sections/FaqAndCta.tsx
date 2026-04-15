"use client";

const faqs = [
  "Can I upgrade or downgrade my plan at any time?",
  "Is there a free trial available?",
  "How secure is my data?",
  "Can I integrate this tool with other software we use?",
];

export default function FaqAndCta() {
  return (
    <section className="rounded-4xl border border-white/80 bg-[#f7effc]/80 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.1)] backdrop-blur-xl">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
        FAQ
      </p>
      <h3 className="mt-2 text-center text-4xl font-semibold tracking-[-0.05em] text-slate-900">
        Frequently Asked Questions
      </h3>

      <div className="mx-auto mt-6 max-w-3xl space-y-3">
        {faqs.map((item) => (
          <details
            key={item}
            className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700"
          >
            <summary className="cursor-pointer font-semibold text-slate-800">
              {item}
            </summary>
            <p className="mt-2 leading-7 text-slate-600">
              Yes. This MVP keeps plan management and workspace setup flexible
              for teams of all sizes.
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-white/80 bg-white/85 px-6 py-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
          Take your journey
        </p>
        <h4 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
          Ready to Elevate Your Workflow?
        </h4>
        <button className="mt-5 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(47,29,111,0.35)]">
          Get Started
        </button>
      </div>
    </section>
  );
}
