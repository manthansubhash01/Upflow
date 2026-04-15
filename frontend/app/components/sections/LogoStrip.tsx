"use client";

const logos = ["Microsoft", "Notion", "Google", "Slack", "Square", "Zoom"];

export default function LogoStrip() {
  return (
    <section className="mb-8 rounded-3xl border border-white/80 bg-white/70 px-5 py-4 shadow-[0_16px_45px_rgba(104,73,160,0.08)] backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-4 text-center text-sm font-semibold text-slate-500 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => (
          <div key={logo} className="rounded-2xl bg-slate-50 px-3 py-2">
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}
