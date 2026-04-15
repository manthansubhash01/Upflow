"use client";

const testimonials = [
  "Flowzy is a practical and polished project system for growing teams.",
  "It helped us move from messy chats to structured execution in one week.",
  "The risk signals helped us catch deadline issues before they escalated.",
];

export default function Testimonials() {
  return (
    <section className="rounded-4xl border border-white/80 bg-[#eaf5ff]/85 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.1)] backdrop-blur-xl">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
        Testimonials
      </p>
      <h3 className="mt-2 text-center text-4xl font-semibold tracking-[-0.05em] text-slate-900">
        Used by More Than 100+ Businesses
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {testimonials.map((quote, idx) => (
          <article key={quote} className="rounded-3xl bg-white/85 p-5">
            <p className="text-sm leading-7 text-slate-700">"{quote}"</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Reviewer {idx + 1}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
