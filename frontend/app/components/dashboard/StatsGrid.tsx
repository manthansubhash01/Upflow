"use client";

export default function StatsGrid({ stats }: any) {
    const statsMeta = [
        { label: "Total Projects", tone: "from-violet-500 to-fuchsia-500" },
        { label: "Total Tasks", tone: "from-sky-500 to-cyan-400" },
        { label: "Completion", tone: "from-emerald-500 to-lime-400" },
        { label: "Risk Level", tone: "from-amber-500 to-orange-400" },
    ];

    const values = [
        stats?.projects ?? 0,
        stats?.tasks ?? 0,
        `${stats?.progress ?? 0}%`,
        stats?.riskLevel ?? "LOW",
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsMeta.map((item, index) => (
            <article
            key={item.label}
            className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(104,73,160,0.1)] backdrop-blur"
            >
            <div
                className={`bg-linear-to-r mb-4 h-1.5 w-20 rounded-full ${item.tone}`}
            />
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {values[index]}
            </p>
            </article>
        ))}
        </div>
    );
}
