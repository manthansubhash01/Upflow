"use client";

const steps = [
    {
        title: "Create Workspace",
        description:
        "Owners set the organization, invite members, and define project scope.",
    },
    {
        title: "Plan with AI",
        description:
        "Generate milestones, tasks, and deadlines from a simple business goal.",
    },
    {
        title: "Execute & Track",
        description:
        "Manage assignments, task status, and delivery progress in one place.",
    },
    {
        title: "Analyze Risk",
        description:
        "Detect delays early and surface project risk before it affects delivery.",
    },
    ];

    export default function Timeline() {
    return (
        <section className="rounded-4xl border border-white/80 bg-white/70 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.1)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-500">
            Workflow
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
            How Upflow Works
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
            <article key={step.title} className="rounded-3xl bg-slate-50 p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-700 text-sm font-semibold text-white shadow-lg shadow-violet-300/40">
                {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-slate-900">
                {step.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.description}
                </p>
            </article>
            ))}
        </div>
        </section>
    );
}
