"use client";

export function AIPanel({ plannerResult, chatResult }: any) {
    return (
        <article className="rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.12)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-500">
            AI Desk
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
            AI Smart Planner
        </h3>
        <p className="mt-4 rounded-[22px] bg-violet-50 p-4 text-sm leading-7 text-slate-700">
            {plannerResult}
        </p>
        <h4 className="mt-6 text-lg font-semibold text-slate-900">
            AI Chat Insight
        </h4>
        <p className="mt-3 rounded-[22px] bg-sky-50 p-4 text-sm leading-7 text-slate-700">
            {chatResult}
        </p>
        </article>
    );
}

export function RiskPanel({ risk }: any) {
    return (
        <article className="rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.12)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-500">
            Analyzer
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
            Progress & Risk Analyzer
        </h3>
        <div className="mt-4 rounded-3xl bg-linear-to-r from-violet-100 to-sky-100 p-4">
            <p className="text-sm font-medium text-slate-600">
            {risk?.projectTitle ?? "No project selected"}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
            {risk?.score ?? 0}
            <span className="text-base font-medium text-slate-500">/100</span>
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700">
            {risk?.level ?? "LOW"} risk
            </p>
        </div>

        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            {(risk?.highlights ?? []).map((line: string) => (
            <li key={line} className="rounded-2xl bg-slate-50 px-4 py-3">
                {line}
            </li>
            ))}
        </ul>
        </article>
    );
}
