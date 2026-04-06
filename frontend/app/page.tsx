"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/layout/AppShell";
import Navbar from "@/app/components/layout/Navbar";
import SectionTitle from "@/app/components/common/SectionTitle";
import StatsGrid from "@/app/components/dashboard/StatsGrid";
import ProjectBoard from "@/app/components/dashboard/ProjectBoard";
import Timeline from "@/app/components/dashboard/Timeline";
import { AIPanel, RiskPanel } from "@/app/components/dashboard/InsightPanels";
import FeatureSections from "@/app/components/sections/FeatureSections";
import PricingSection from "@/app/components/sections/PricingSection";
import Testimonials from "@/app/components/sections/Testimonials";
import FaqAndCta from "@/app/components/sections/FaqAndCta";
import dashboardImg from "@/public/Gemini_Generated_Image_ely3bmely3bmely3.png";
import Image from "next/image";
import { FeaturesIcon } from "@/app/components/common/Icons";

type DashboardOverview = {
  stats: {
    projects: number;
    tasks: number;
    completedTasks: number;
    progress: number;
  };
  activity: unknown[];
};

type ProjectOverview = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  tasks?: Array<Record<string, unknown>>;
};

type RiskOverview = {
  projectTitle: string;
  score: number;
  level: string;
  highlights: string[];
};

const demoFallback = {
  dashboard: {
    stats: {
      projects: 2,
      tasks: 4,
      completedTasks: 2,
      progress: 50,
    },
    activity: [],
  },
  projects: [
    {
      id: "proj-1",
      title: "AI Workspace Launch",
      description: "Build MVP for centralized project intelligence",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
      tasks: [{}, {}, {}],
    },
    {
      id: "proj-2",
      title: "Onboarding Automation",
      description: "Automate employee onboarding workflows",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(),
      tasks: [{}],
    },
  ],
  risk: {
    projectTitle: "AI Workspace Launch",
    score: 39,
    level: "LOW",
    highlights: [
      "2 pending tasks with 20 days to deadline.",
      "1/3 tasks completed.",
    ],
  },
  planner:
    'Plan: Break "Launch collaborative workspace MVP for startup teams" into discovery, build, test, and release milestones with weekly checkpoints.',
  chat: "Upflow AI: Based on current project context, focus on AI Workspace Launch first.",
};

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [risk, setRisk] = useState<RiskOverview | null>(null);
  const [plannerResult, setPlannerResult] = useState("");
  const [chatResult, setChatResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token || !user?.organizationId) {
          setDashboard(demoFallback.dashboard);
          setProjects(demoFallback.projects);
          setRisk(demoFallback.risk);
          setPlannerResult(demoFallback.planner);
          setChatResult(demoFallback.chat);
          return;
        }

        const authHeader = { Authorization: `Bearer ${token}` };
        const organizationId = user.organizationId;

        const [dashboardRes, projectsRes] = await Promise.all([
          fetch(`/api/dashboard/${organizationId}`, { headers: authHeader }),
          fetch(`/api/projects/${organizationId}`, { headers: authHeader }),
        ]);

        if (!dashboardRes.ok || !projectsRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const dashboardJson = await dashboardRes.json();
        const projectsJson = await projectsRes.json();

        setDashboard(dashboardJson.data);
        setProjects(projectsJson.data);

        if (projectsJson.data.length > 0) {
          const projectId = projectsJson.data[0].id;
          const riskRes = await fetch(`/api/ai/risk/${projectId}`, {
            headers: authHeader,
          });
          if (!riskRes.ok) {
            throw new Error("Failed to load risk insights.");
          }
          const riskJson = await riskRes.json();
          setRisk(riskJson.data);
        }

        const plannerRes = await fetch("/api/ai/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            organizationId,
            goal: "Launch collaborative workspace MVP for startup teams",
          }),
        });
        if (!plannerRes.ok) {
          throw new Error("Failed to generate AI plan.");
        }
        const plannerJson = await plannerRes.json();
        setPlannerResult(plannerJson.data.content);

        const chatRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            question: "Which project currently has the most pending work?",
          }),
        });
        if (!chatRes.ok) {
          throw new Error("Failed to get AI chat response.");
        }
        const chatJson = await chatRes.json();
        setChatResult(chatJson.data.content);
      } catch {
        setDashboard(demoFallback.dashboard);
        setProjects(demoFallback.projects);
        setRisk(demoFallback.risk);
        setPlannerResult(demoFallback.planner);
        setChatResult(demoFallback.chat);
        setError("Running in demo mode because backend is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, user?.organizationId]);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center text-lg font-medium text-slate-600">
          Loading Upflow...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Navbar user={user} onLogout={handleGetStarted} />
      {error ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {error}
        </div>
      ) : null}

      <section className="relative mb-8 px-6 py-10 sm:px-10 sm:py-12">
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/60 px-4 py-2 text-xs font-semibold text-violet-700">
            <FeaturesIcon className="h-3.5 w-3.5" />
            Updated &nbsp; Optimizing Workflow Better Than Ever
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[#2e2470] sm:text-6xl lg:text-7xl">
            The Fastest Way to
            <br />
            Rearrange Your Project
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Stay on top of your tasks and deadlines with our intuitive project
            management tool designed for teams of all sizes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="rounded-full bg-brand-700 px-8 py-3 text-base font-semibold text-white shadow-[0_16px_32px_rgba(47,29,111,0.35)] transition hover:bg-[#3d258f]"
            >
              Get Started →
            </button>
            <button className="rounded-full bg-white px-8 py-3 text-base font-semibold text-[#2e2470] shadow-sm transition hover:bg-violet-50">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <div className="mb-10">
        <Image
          src={dashboardImg.src}
          alt="dashboard image"
          width={1200}
          height={700}
        />
      </div>

      {/* <div className="mb-8">
        <LogoStrip />
      </div> */}

      <div className="mb-8">
        <StatsGrid stats={{ ...dashboard?.stats, riskLevel: risk?.level }} />
      </div>

      <section id="risk" className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="xl:col-span-2">
          <SectionTitle
            eyebrow="MVP Core"
            title="Projects, AI, and Risk Tracking"
            description="The MVP focuses on the core workflows that matter first: workspace overview, active projects, AI planning, and risk analysis."
          />
        </div>
        <ProjectBoard projects={projects} />
        <div className="grid gap-6">
          <AIPanel plannerResult={plannerResult} chatResult={chatResult} />
          <RiskPanel risk={risk} />
        </div>
      </section>

      <div id="workflow" className="mt-6">
        <div className="mb-5">
          <SectionTitle
            eyebrow="Workflow"
            title="How Upflow Works"
            description="A simple execution loop for organizations that need planning, visibility, and faster decisions."
          />
        </div>
        <Timeline />
      </div>

      <div id="features" className="mt-8">
        <FeatureSections />
      </div>

      <div className="mt-8">
        <PricingSection />
      </div>

      <div className="mt-8">
        <Testimonials />
      </div>

      <div id="faq" className="mt-8">
        <FaqAndCta />
      </div>
    </AppShell>
  );
}
