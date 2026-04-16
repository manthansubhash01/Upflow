"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

type ProjectProgressChartProps = {
  backlogTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
};

const SEGMENT_COLORS = {
  Backlog: "#64748b",
  Todo: "#3b82f6",
  "In Progress": "#f59e0b",
  Completed: "#22c55e",
} as const;

export default function ProjectProgressChart({
  backlogTasks,
  todoTasks,
  inProgressTasks,
  completedTasks,
}: ProjectProgressChartProps) {
  const totalTasks =
    backlogTasks + todoTasks + inProgressTasks + completedTasks;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const chartData = [
    { name: "Backlog", value: backlogTasks },
    { name: "Todo", value: todoTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Completed", value: completedTasks },
  ];

  if (totalTasks === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
        No tasks yet. Create tasks to see project progress.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Progress chart</p>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {completionPercentage}% done
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.3fr_0.7fr]">
        <div className="min-h-[260px] w-full min-w-0 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(95,59,214,0.05),rgba(255,255,255,0.95))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={66}
                outerRadius={96}
                stroke="none"
                paddingAngle={3}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      SEGMENT_COLORS[entry.name as keyof typeof SEGMENT_COLORS]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      SEGMENT_COLORS[item.name as keyof typeof SEGMENT_COLORS],
                  }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
          <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
            Total tasks: {totalTasks}
          </div>
        </div>
      </div>
    </div>
  );
}
