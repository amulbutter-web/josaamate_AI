// ====================================================
// JOSAA MATE AI – Dashboard Page
// Personalized counselling command centre
// ====================================================

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { StudioProgress } from '../types';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  BookOpen,
  BarChart3,
  ListOrdered,
  GitCompare,
  ShieldAlert,
  FileDown,
  ChevronRight,
  Trophy,
  Star,
  Sparkles,
  TrendingUp,
  Flag,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { DEMO_SCHEDULE } from '../data/demoData';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { scale: 1.018, boxShadow: '0 8px 30px rgba(81,69,205,0.12)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string as a local Date (no timezone shift). */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Determine phase status relative to today (fixed: 2026-10-30). */
function evaluatePhases(schedule: typeof DEMO_SCHEDULE) {
  const today = new Date(2026, 9, 30); // 2026-10-30 local

  const phases = schedule.phases.map((phase) => {
    const start = parseLocalDate(phase.startDate);
    const end = parseLocalDate(phase.endDate);
    const isPast = end < today;
    const isActive = start <= today && today <= end;
    return { ...phase, isPast, isActive };
  });

  const activePhase = phases.find((p) => p.isActive) ?? null;
  const nextPhase = phases.find((p) => !p.isPast && !p.isActive) ?? null;
  const allPast = phases.every((p) => p.isPast);

  return { phases, activePhase, nextPhase, allPast };
}

/** Return the next 3 deadline items from schedule phases. */
function getUpcomingDeadlines(phases: ReturnType<typeof evaluatePhases>['phases']) {
  const today = new Date(2026, 9, 30);
  const upcoming = phases
    .filter((p) => parseLocalDate(p.endDate) >= today)
    .slice(0, 3);
  return upcoming;
}

/** Format a date string for display */
function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Days until a date */
function daysUntil(dateStr: string): number {
  const today = new Date(2026, 9, 30);
  const target = parseLocalDate(dateStr);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Quick Action Card Config ─────────────────────────────────────────────────

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  gradient: string;
  iconBg: string;
  badgeCount?: number;
}

// ─── Progress Step Config ─────────────────────────────────────────────────────

interface ProgressStep {
  key: keyof StudioProgress;
  label: string;
  description: string;
  route: string;
  actionLabel: string;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    key: 'profileComplete',
    label: 'Profile Setup',
    description: 'Enter your JEE ranks, category, and preferences.',
    route: '/studio/profile',
    actionLabel: 'Complete Profile',
  },
  {
    key: 'eligibilityVerified',
    label: 'Eligibility Check',
    description: 'Verify your eligibility for JoSAA counselling.',
    route: '/studio/explore',
    actionLabel: 'Check Eligibility',
  },
  {
    key: 'collegesExplored',
    label: 'College Exploration',
    description: 'Browse institutes and programmes matching your rank.',
    route: '/studio/explore',
    actionLabel: 'Explore Colleges',
  },
  {
    key: 'preferenceListCreated',
    label: 'Preference List',
    description: 'Build and rank your choice list strategically.',
    route: '/studio/preferences',
    actionLabel: 'Build Choices',
  },
  {
    key: 'preferenceAuditDone',
    label: 'Audit & Review',
    description: 'Run AI audit to detect mistakes in your list.',
    route: '/studio/mistakes',
    actionLabel: 'Run Audit',
  },
  {
    key: 'reportGenerated',
    label: 'Download Report',
    description: 'Generate and download your final counselling report.',
    route: '/studio/report',
    actionLabel: 'Generate Report',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Horizontal timeline of phases */
function PhaseTimeline({ phases }: { phases: ReturnType<typeof evaluatePhases>['phases'] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-max">
        {phases.map((phase, idx) => {
          const isLast = idx === phases.length - 1;


          const dotColor = phase.isActive
            ? 'bg-indigo-600 ring-4 ring-indigo-100'
            : phase.isPast
            ? 'bg-slate-400'
            : 'bg-slate-200';

          return (
            <div key={phase.name} className="flex items-start">
              <div className="flex flex-col items-center" style={{ minWidth: 120, maxWidth: 140 }}>
                {/* Dot */}
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${dotColor}`} />
                {/* Label */}
                <p
                  className={`text-center mt-1.5 text-xs font-medium leading-tight px-1 ${
                    phase.isActive
                      ? 'text-indigo-700'
                      : phase.isPast
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {phase.name}
                </p>
                <p className={`text-center mt-0.5 text-[10px] ${phase.isPast ? 'text-slate-300' : 'text-slate-400'}`}>
                  {formatDate(phase.startDate)}
                  {phase.startDate !== phase.endDate ? ` – ${formatDate(phase.endDate)}` : ''}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 mt-2 flex-shrink-0 ${phase.isPast ? 'bg-slate-300' : 'bg-slate-100'}`}
                  style={{ width: 20 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Single quick action card */
function QuickActionCard({ action, onClick }: { action: QuickAction; onClick: () => void }) {
  const Icon = action.icon;
  return (
    <motion.button
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      className="relative flex flex-col gap-3 p-5 rounded-2xl border border-slate-100 bg-white text-left w-full cursor-pointer group transition-colors hover:border-indigo-100"
    >
      {/* Badge */}
      {action.badgeCount !== undefined && action.badgeCount > 0 && (
        <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {action.badgeCount}
        </span>
      )}
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.iconBg}`}>
        <Icon size={20} className="text-white" />
      </div>
      {/* Text */}
      <div>
        <p className="font-semibold text-slate-800 text-sm leading-snug">{action.label}</p>
        <p className="text-slate-500 text-xs mt-0.5 leading-snug">{action.description}</p>
      </div>
      {/* Arrow */}
      <ChevronRight
        size={16}
        className="absolute bottom-4 right-4 text-slate-300 group-hover:text-indigo-400 transition-colors"
      />
    </motion.button>
  );
}

/** Single progress step row */
function ProgressStepRow({
  step,
  done,
  isNext,
  index,
}: {
  step: ProgressStep;
  done: boolean;
  isNext: boolean;
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
        isNext ? 'bg-indigo-50 border border-indigo-100' : done ? 'opacity-70' : 'opacity-50'
      }`}
    >
      {/* Step number / check */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          done
            ? 'bg-emerald-100 text-emerald-600'
            : isNext
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        {done ? <CheckCircle2 size={18} className="text-emerald-600" /> : index + 1}
      </div>
      {/* Label */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            done ? 'text-slate-500 line-through' : isNext ? 'text-indigo-800' : 'text-slate-600'
          }`}
        >
          {step.label}
        </p>
        {isNext && <p className="text-xs text-indigo-600 mt-0.5">{step.description}</p>}
      </div>
      {done && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
      {isNext && <Star size={14} className="text-indigo-400 flex-shrink-0" />}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  const { profile, preferenceList, progress } = state;

  // ── Schedule computations ──
  const { phases, activePhase, nextPhase, allPast } = useMemo(
    () => evaluatePhases(DEMO_SCHEDULE),
    []
  );
  const upcomingDeadlines = useMemo(() => getUpcomingDeadlines(phases), [phases]);

  // ── Progress computations ──
  const progressPercent = Math.round((progress.completedSteps / progress.totalSteps) * 100);

  const progressStepsWithStatus = PROGRESS_STEPS.map((step) => ({
    ...step,
    done: !!progress[step.key],
  }));

  const nextStepIndex = progressStepsWithStatus.findIndex((s) => !s.done);
  const nextStep = nextStepIndex !== -1 ? progressStepsWithStatus[nextStepIndex] : null;

  // ── Quick actions ──
  const quickActions: QuickAction[] = [
    {
      label: 'Explore Colleges',
      description: 'Browse all JoSAA institutes & programmes',
      icon: GraduationCap,
      path: '/studio/explore',
      gradient: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-600',
    },
    {
      label: 'Rank Explorer',
      description: 'View historical cutoffs & trends',
      icon: BarChart3,
      path: '/studio/cutoffs',
      gradient: 'from-violet-500 to-purple-700',
      iconBg: 'bg-violet-600',
    },
    {
      label: 'My Choices',
      description: 'Manage your preference list',
      icon: ListOrdered,
      path: '/studio/preferences',
      gradient: 'from-emerald-500 to-green-700',
      iconBg: 'bg-emerald-600',
      badgeCount: preferenceList.items.length,
    },
    {
      label: 'College Comparison',
      description: 'Compare institutes side-by-side',
      icon: GitCompare,
      path: '/studio/compare',
      gradient: 'from-orange-500 to-amber-600',
      iconBg: 'bg-orange-500',
    },
    {
      label: 'Mistake Detector',
      description: 'AI audit of your choice list',
      icon: ShieldAlert,
      path: '/studio/mistakes',
      gradient: 'from-rose-500 to-red-700',
      iconBg: 'bg-rose-600',
    },
    {
      label: 'Download Report',
      description: 'Export your counselling report',
      icon: FileDown,
      path: '/studio/report',
      gradient: 'from-slate-500 to-slate-700',
      iconBg: 'bg-slate-600',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8F9FC] px-4 py-8 md:px-8 lg:px-10 max-w-7xl mx-auto space-y-8"
    >
      {/* ── 1. HERO SECTION ───────────────────────────────────────────── */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-[#101828] p-8 md:p-10">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#5145CD] opacity-20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-[#806BFF] opacity-15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-[#5145CD] opacity-10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: heading + subtext */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-violet-400 text-sm font-medium tracking-wide uppercase">
                JoSAA Mate AI
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-white via-[#c4bbff] to-[#806BFF] bg-clip-text text-transparent">
                Your admission
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-[#c4bbff] to-[#806BFF] bg-clip-text text-transparent">
                journey starts here.
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed">
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}. Here is your
              counselling overview for JoSAA {DEMO_SCHEDULE.year}.
            </p>
          </div>

          {/* Right: rank stat card */}
          {profile?.jeemainCRL ? (
            <div className="flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 min-w-[180px] text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy size={14} className="text-amber-400" />
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">JEE Main CRL</p>
              </div>
              <p className="text-4xl font-extrabold text-white mt-1">
                {profile.jeemainCRL.toLocaleString('en-IN')}
              </p>
              {profile.jeeAdvancedRank && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">JEE Advanced</p>
                  <p className="text-2xl font-bold text-violet-300 mt-0.5">
                    {profile.jeeAdvancedRank.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              {profile.category && profile.category !== 'OPEN' && (
                <span className="mt-3 inline-block bg-indigo-600/60 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
                  {profile.category}
                </span>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              onClick={() => navigate('/studio/profile')}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-3 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 transition-colors rounded-2xl p-6 min-w-[180px] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600/40 flex items-center justify-center">
                <Trophy size={22} className="text-indigo-300" />
              </div>
              <p className="text-slate-300 text-sm font-medium text-center">
                Add your JEE rank to get started
              </p>
              <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
                Setup Profile <ArrowRight size={12} />
              </span>
            </motion.button>
          )}
        </div>

        {/* Progress bar strip */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs font-medium">
              Journey Progress — {progress.completedSteps}/{progress.totalSteps} steps complete
            </p>
            <span className="text-violet-300 text-xs font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-[#5145CD] to-[#806BFF]"
            />
          </div>
        </div>
      </motion.section>

      {/* ── 2. COUNSELLING STATUS CARD ──────────────────────────────────── */}
      <motion.section variants={itemVariants}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Calendar size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Counselling Status</h2>
                <p className="text-slate-500 text-sm">JoSAA {DEMO_SCHEDULE.year} Schedule</p>
              </div>
            </div>
            {/* Status badge */}
            {allPast ? (
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Flag size={12} />
                Concluded
              </span>
            ) : activePhase ? (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Clock size={12} />
                Upcoming
              </span>
            )}
          </div>

          {/* Current / Next phase highlight */}
          {allPast ? (
            <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-3">
              <Info size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700">Counselling Completed for 2026</p>
                <p className="text-slate-500 text-sm mt-0.5">
                  All JoSAA {DEMO_SCHEDULE.year} counselling rounds and document verification have
                  concluded. Stay tuned for JoSAA 2027 schedule announcements.
                </p>
              </div>
            </div>
          ) : activePhase ? (
            <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-semibold text-indigo-900">
                  Currently Active: {activePhase.name}
                </p>
                <p className="text-indigo-700 text-sm mt-0.5">{activePhase.description}</p>
                <p className="text-indigo-500 text-xs mt-1.5 font-medium">
                  Ends {formatDate(activePhase.endDate)}
                </p>
              </div>
            </div>
          ) : nextPhase ? (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
              <Clock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">
                  Next: {nextPhase.name}
                </p>
                <p className="text-amber-700 text-sm mt-0.5">{nextPhase.description}</p>
                <p className="text-amber-600 text-xs mt-1.5 font-medium">
                  Starts {formatDate(nextPhase.startDate)} · in {daysUntil(nextPhase.startDate)} days
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-slate-500 text-sm">Schedule not configured.</p>
            </div>
          )}

          {/* Horizontal phase timeline */}
          <PhaseTimeline phases={phases} />
        </div>
      </motion.section>

      {/* ── 3. IMPORTANT DEADLINES ──────────────────────────────────────── */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Important Deadlines
          </h2>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <Calendar size={26} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">Counselling 2026 has concluded.</p>
            <p className="text-slate-500 text-sm mt-1">Stay tuned for JoSAA 2027 schedule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((phase, _phase_idx) => {
              const daysLeft = daysUntil(phase.endDate);
              const urgency = daysLeft <= 2 ? 'red' : daysLeft <= 7 ? 'amber' : 'indigo';
              const urgencyClasses = {
                red: 'border-red-100 bg-red-50',
                amber: 'border-amber-100 bg-amber-50',
                indigo: 'border-indigo-50 bg-white',
              };
              const badgeClasses = {
                red: 'bg-red-100 text-red-700',
                amber: 'bg-amber-100 text-amber-700',
                indigo: 'bg-indigo-50 text-indigo-700',
              };
              return (
                <motion.div
                  key={phase.name}
                  variants={itemVariants}
                  className={`rounded-2xl border shadow-sm p-5 ${urgencyClasses[urgency]}`}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{phase.name}</p>
                    <span
                      className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${badgeClasses[urgency]}`}
                    >
                      {daysLeft === 0 ? 'Today' : daysLeft < 0 ? 'Past' : `${daysLeft}d`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">{phase.description}</p>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Calendar size={12} />
                    <span>
                      {phase.startDate !== phase.endDate
                        ? `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}`
                        : formatDate(phase.endDate)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ── 4. QUICK ACTION CARDS ───────────────────────────────────────── */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <motion.div key={action.label} variants={itemVariants}>
              <QuickActionCard action={action} onClick={() => navigate(action.path)} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── 5 & 6. BOTTOM GRID: Progress Tracker + Choices Preview ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── 5. MY PROGRESS TRACKER ──────────────────────────────────── */}
        <motion.section
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <BookOpen size={20} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Progress Tracker</h2>
              <p className="text-slate-500 text-xs">
                {progress.completedSteps} of {progress.totalSteps} steps completed
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">Overall Progress</span>
              <span className="text-xs font-bold text-violet-600">{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 mb-5">
            {progressStepsWithStatus.map((step, idx) => (
              <ProgressStepRow
                key={step.key}
                step={step}
                done={step.done}
                isNext={idx === nextStepIndex}
                index={idx}
              />
            ))}
          </div>

          {/* "Your Next Step" action card */}
          {nextStep ? (
            <div className="rounded-xl bg-gradient-to-br from-[#5145CD] to-[#806BFF] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">
                    Your Next Step
                  </p>
                  <p className="text-white font-bold text-base">{nextStep.label}</p>
                  <p className="text-indigo-200 text-sm mt-1 leading-snug">{nextStep.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <ArrowRight size={18} className="text-white" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(nextStep.route)}
                className="mt-4 w-full bg-white text-indigo-700 font-bold text-sm py-2.5 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                Continue My Journey
                <ArrowRight size={16} />
              </motion.button>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-emerald-800">All Steps Complete!</p>
              <p className="text-emerald-600 text-sm mt-0.5">
                You're fully prepared for JoSAA counselling.
              </p>
            </div>
          )}
        </motion.section>

        {/* ── 6. MY CHOICES PREVIEW ───────────────────────────────────── */}
        <motion.section
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ListOrdered size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Choices</h2>
                <p className="text-slate-500 text-xs">
                  {preferenceList.items.length} choice{preferenceList.items.length !== 1 ? 's' : ''} added
                </p>
              </div>
            </div>
            {preferenceList.items.length > 0 && (
              <button
                onClick={() => navigate('/studio/preferences')}
                className="text-indigo-600 text-xs font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors"
              >
                View All <ExternalLink size={12} />
              </button>
            )}
          </div>

          {preferenceList.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <ListOrdered size={28} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-600 text-sm">No choices added yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-[180px] leading-relaxed">
                Start building your preference list to see them here.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => navigate('/studio/preferences')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                Build My List <ArrowRight size={14} />
              </motion.button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2.5">
              {preferenceList.items.slice(0, 5).map((item, _idx) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors"
                >
                  {/* Rank badge */}
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {_idx + 1}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-slate-800 text-xs font-semibold leading-snug truncate">
                      {item.instituteName}
                    </p>
                    <p className="text-slate-500 text-[11px] leading-snug mt-0.5 truncate">
                      {item.programName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {item.seatPool}
                      </span>
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {item.quota}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Show more footer */}
              {preferenceList.items.length > 5 && (
                <button
                  onClick={() => navigate('/studio/preferences')}
                  className="mt-1 text-center text-indigo-600 hover:text-indigo-800 text-xs font-semibold py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  +{preferenceList.items.length - 5} more choices · View All →
                </button>
              )}

              {/* CTA */}
              <div className="mt-auto pt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/studio/preferences')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all"
                >
                  <ListOrdered size={15} />
                  Manage Preference List
                </motion.button>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Footer note ───────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="text-center text-slate-400 text-xs pb-4 flex items-center justify-center gap-1.5"
      >
        <Info size={12} />
        All schedule data is illustrative. Always verify dates on{' '}
        <a
          href="https://josaa.nic.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:underline font-medium"
        >
          josaa.nic.in
        </a>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;



