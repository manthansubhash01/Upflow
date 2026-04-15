"use client";

function FeatureCard({ title, description, bullets, tone }: any) {
  return (
    <article
      className={`rounded-4xl border border-white/80 p-6 shadow-[0_20px_60px_rgba(104,73,160,0.1)] backdrop-blur-xl ${tone}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
        Features
      </p>
      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {bullets.map((item: any) => (
          <div key={item.title} className="rounded-3xl bg-white/75 p-4">
            <p className="font-semibold text-slate-800">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function FeatureSections() {
  return (
    <section className="space-y-6">
      <FeatureCard
        title="Task Management for Streamlined Workflows"
        description="Automatically structure work, assign owners, and keep projects moving with clear priorities."
        tone="bg-[#f6efff]/80"
        bullets={[
          { title: "Automated Task", text: "Auto-generate tasks from goals." },
          {
            title: "Smart Routing",
            text: "Route tasks to the right teammate.",
          },
          {
            title: "Conditional Triggers",
            text: "Trigger actions when rules match.",
          },
          { title: "Integration Autos", text: "Automate repetitive handoffs." },
        ]}
      />

      <FeatureCard
        title="Interactive Workspaces for Team Collaboration"
        description="Centralize updates, comments, files, and context so teams move fast without losing alignment."
        tone="bg-[#ecf6ff]/85"
        bullets={[
          {
            title: "Drag-and-Drop",
            text: "Reorder and prioritize tasks quickly.",
          },
          {
            title: "Task Filters",
            text: "Switch views by assignee or status.",
          },
          {
            title: "Inline Attachments",
            text: "Review docs next to each task.",
          },
          { title: "Board Activity", text: "Monitor project momentum daily." },
        ]}
      />
    </section>
  );
}
