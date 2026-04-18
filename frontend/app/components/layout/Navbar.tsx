"use client";

import {
  DashboardIcon,
  FeaturesIcon,
  HelpIcon,
  PlannerIcon,
  RiskIcon,
} from "@/app/components/common/Icons";

interface NavbarProps {
  user?: {
    name?: string;
  } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const tabs = [
    { label: "Features", icon: FeaturesIcon, href: "#features" },
    { label: "Planner", icon: PlannerIcon, href: "#workflow" },
    { label: "Risk Analyzer", icon: RiskIcon, href: "#risk" },
    { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
    { label: "FAQ", icon: HelpIcon, href: "#faq" },
  ];

  return (
    <header className="mb-8 rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_20px_60px_rgba(122,80,180,0.12)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-violet-300/40">
            <span className="text-lg font-semibold">U</span>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-500">
              Upflow
            </p>
            <p className="text-sm text-slate-500">
              Project intelligence workspace
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          {tabs.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <p className="text-sm font-medium text-slate-600">{user.name}</p>
          ) : null}
          <button
            onClick={onLogout}
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(47,29,111,0.35)] transition hover:-translate-y-px hover:bg-[#3d258f]"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
