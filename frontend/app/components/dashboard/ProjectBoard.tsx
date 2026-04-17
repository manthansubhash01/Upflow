"use client";

export default function ProjectBoard({ projects }: any) {
    return (
        <article className="rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(104,73,160,0.12)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-500">
                Workspace
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                Active Projects
            </h3>
            </div>
            <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            {projects?.length ?? 0} total
            </span>
        </div>

        <div className="space-y-4">
            {projects?.map((project: any) => (
            <div
                key={project.id}
                className="flex flex-col gap-4 rounded-[22px] border border-slate-100 bg-slate-50/80 p-4 transition hover:border-violet-200 hover:bg-white md:flex-row md:items-center md:justify-between"
            >
                <div>
                <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-slate-900">
                    {project.title}
                    </h4>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    {project.tasks?.length ?? 0} tasks
                    </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {project.description}
                </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Deadline{" "}
                <span className="ml-1 font-semibold text-slate-800">
                    {new Date(project.deadline).toLocaleDateString()}
                </span>
                </div>
            </div>
            ))}
        </div>
        </article>
    );
}
