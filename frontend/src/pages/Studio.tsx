// ====================================================
// JOSAA MATE AI – Intelligent Choice Studio Overview
// Entry point to all studio sub-features.
// ====================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Search,
  TrendingUp,
  Scale,
  ListOrdered,
  ShieldAlert,
  History,
  FileText,
  Bot,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Sparkles,
  BarChart3,
  BookOpen,
  GraduationCap,
  Layers,
  RotateCcw,
  Download,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

type ModuleStatus = 'complete' | 'in_progress' | 'not_started';

interface StudioModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  status: ModuleStatus;
  accentColor: string;
  bgGradient: string;
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  route: string;
  color: string;
}

// ─── Rule-based AI Responses ──────────────────────────────────────────────────

function getRuleBasedResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('closing rank')) {
    return (
      'The **Closing Rank** is the rank of the last candidate who received a seat allotment in a ' +
      'particular programme, institute, quota, and seat-pool combination during a specific JoSAA round. ' +
      'If your rank is numerically ≤ the closing rank, you are within the cutoff for that option. ' +
      'Closing ranks generally improve (decrease) in later rounds as seats fill up.'
    );
  }

  if (q.includes('home state') || q.includes('hs quota') || q.includes('os quota')) {
    return (
      '**Home State (HS) vs. Other State (OS) Quota** applies only to NITs, IIITs, and GFTIs. ' +
      '50% of seats are reserved under HS quota for students who have passed Class 12 from the same ' +
      'state as the institute. The remaining 50% are filled under OS quota from all other states. ' +
      'IITs use an All India (AI) quota — there is no HS/OS distinction for IIT seats.'
    );
  }

  if (q.includes('rank trend') || q.includes('trend rising') || q.includes('trend falling')) {
    return (
      'A **rising rank trend** (closing rank increasing year-over-year) means fewer students are ' +
      'choosing that programme, or seat intake has grown — generally indicating lower competition. ' +
      'A **falling rank trend** (closing rank decreasing) signals growing demand. When analysing cutoffs, ' +
      'look at the 3–4 year trend rather than a single year to avoid outlier effects. ' +
      'Use the Rank & Cutoff Explorer to plot trend charts interactively.'
    );
  }

  if (q.includes('complete next') || q.includes('what should i') || q.includes('next step')) {
    return (
      'Based on your studio progress, here is the recommended sequence:\n' +
      '1. **Complete your profile** — enter ranks, category, and home state.\n' +
      '2. **Verify eligibility** — check which programmes you qualify for.\n' +
      '3. **Explore colleges** — filter institutes by type, branch, and state.\n' +
      '4. **Analyse rank cutoffs** — understand where your rank falls historically.\n' +
      '5. **Build preference list** — drag-and-drop your ranked choices.\n' +
      '6. **Run the audit** — detect errors and ordering issues.\n' +
      '7. **Generate your report** — download a personalised counselling summary.'
    );
  }

  if (q.includes('opening rank')) {
    return (
      'The **Opening Rank** is the rank of the first candidate who was allotted a seat in a ' +
      'given programme and round. It is typically much lower (better) than the closing rank. ' +
      'The opening rank gives you a sense of the best-ranked candidates who chose that option, ' +
      'while the closing rank tells you the practical cutoff.'
    );
  }

  if (q.includes('float') || q.includes('freeze') || q.includes('slide')) {
    return (
      'After each JoSAA allotment round, you choose an action:\n' +
      '• **Float** — accept the current seat but remain in contention for a higher-priority choice in the next round.\n' +
      '• **Freeze** — finalise your current allotment and exit further rounds.\n' +
      '• **Slide** — similar to Float but only for a different programme within the same institute.\n' +
      '• **Withdraw** — give up your seat entirely (forfeits the seat acceptance fee).\n\n' +
      'Use the Counselling Timeline Replay module to explore these decisions visually.'
    );
  }

  if (q.includes('pwd') || q.includes('person with disability') || q.includes('disability')) {
    return (
      '**PwD (Person with Disability)** candidates get a horizontal reservation of 5% across all ' +
      'categories (OPEN-PwD, OBC-NCL-PwD, SC-PwD, ST-PwD, EWS-PwD). They compete against each other ' +
      'within their category\'s PwD pool. The disability must be certified and meet the minimum 40% ' +
      'disability threshold as per government norms. Make sure to select the correct PwD seat pool ' +
      'in your profile for accurate eligibility checks.'
    );
  }

  return (
    'That\'s a great question. For authoritative and up-to-date counselling information, please ' +
    'consult the official JoSAA website at **josaa.nic.in**. ' +
    'You can also explore specific topics using the Studio modules — the Rank & Cutoff Explorer, ' +
    'College Comparison, and Counselling Timeline Replay are great places to start.'
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STAGGER_PARENT = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const STAGGER_CHILD = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// Status badge component
function StatusBadge({ status }: { status: ModuleStatus }) {
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      <div className="w-2 h-2 rounded-full bg-slate-400" />
      Not Started
    </span>
  );
}

// Stat card in summary bar
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <motion.div
      variants={STAGGER_CHILD}
      className="flex-1 min-w-[140px] bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-none mb-1 truncate">
          {label}
        </p>
        <p className="text-base font-bold text-[#101828] leading-tight truncate">{value}</p>
      </div>
    </motion.div>
  );
}

// Module card
function ModuleCard({
  module,
  onOpen,
}: {
  module: StudioModule;
  onOpen: (route: string) => void;
}) {
  const Icon = module.icon;
  return (
    <motion.div
      variants={STAGGER_CHILD}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(81,69,205,0.12)' }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(module.route)}
    >
      {/* Top accent strip */}
      <div className={`h-1.5 w-full ${module.bgGradient}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Icon + status */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${module.accentColor}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <StatusBadge status={module.status} />
        </div>

        {/* Title + description */}
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-[#101828] leading-snug mb-1.5">
            {module.title}
          </h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">{module.description}</p>
        </div>

        {/* Open button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(module.route);
          }}
          className="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F3F0FF] text-[#5145CD] text-sm font-semibold hover:bg-[#5145CD] hover:text-white transition-all duration-200 group-hover:bg-[#5145CD] group-hover:text-white"
        >
          Open
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// Quick action button
function QuickActionBtn({
  action,
  onNavigate,
}: {
  action: QuickAction;
  onNavigate: (route: string) => void;
}) {
  const Icon = action.icon;
  return (
    <motion.button
      variants={STAGGER_CHILD}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(action.route)}
      className={`flex flex-col items-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[96px] group`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-[11.5px] font-semibold text-[#101828] text-center leading-tight">
        {action.label}
      </span>
    </motion.button>
  );
}

// Chat message bubble
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? 'bg-[#5145CD]' : 'bg-gradient-to-br from-[#806BFF] to-[#5145CD]'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#5145CD] text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'
        }`}
        dangerouslySetInnerHTML={{
          __html: message.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>'),
        }}
      />
    </motion.div>
  );
}

// Progress ring
function ProgressRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? completed / total : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <svg width="60" height="60" className="-rotate-90">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#F3F0FF" strokeWidth="5" />
      <motion.circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="#5145CD"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
      {/* Text */}
      <text
        x="30"
        y="30"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        style={{ transform: 'rotate(90deg)', transformOrigin: '30px 30px', fontSize: '11px', fontWeight: 700, fill: '#101828' }}
      >
        {completed}/{total}
      </text>
    </svg>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function Studio() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { profile, progress, preferenceList, auditReport } = state;

  // ── Chat state ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I\'m your AI Counselling Assistant. Ask me anything about JoSAA counselling, cutoffs, quotas, or how to use this studio. Try one of the example questions below to get started.',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  // ── Derived values ──
  const rankDisplay =
    profile?.jeeAdvancedRank
      ? `JEE-Adv: ${profile.jeeAdvancedRank.toLocaleString('en-IN')}`
      : profile?.jeemainCRL
      ? `JEE-Main CRL: ${profile.jeemainCRL.toLocaleString('en-IN')}`
      : 'Not set';

  const isProfileEligible =
    !!(profile?.name && profile?.homeState && profile?.category && (profile?.jeemainCRL || profile?.jeeAdvancedRank));

  const auditWarnings = auditReport?.warnings.length ?? 0;

  // ── Determine module statuses ──
  function deriveStatus(key: keyof typeof progress): ModuleStatus {
    const val = progress[key];
    if (val === true) return 'complete';
    return 'not_started';
  }

  const modules: StudioModule[] = [
    {
      id: 'profile',
      title: 'Student Profile & Eligibility',
      description:
        'Enter your JEE ranks, category, home state and preferences to unlock personalised results.',
      icon: User,
      route: '/studio/profile',
      status: progress.profileComplete ? 'complete' : profile?.name ? 'in_progress' : 'not_started',
      accentColor: 'bg-[#5145CD]',
      bgGradient: 'bg-gradient-to-r from-[#5145CD] to-[#806BFF]',
    },
    {
      id: 'explore',
      title: 'Explore Colleges & Programmes',
      description:
        'Discover IITs, NITs, IIITs and GFTIs. Filter by institute type, branch, state and category.',
      icon: Search,
      route: '/studio/explore',
      status: deriveStatus('collegesExplored'),
      accentColor: 'bg-indigo-500',
      bgGradient: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    },
    {
      id: 'cutoffs',
      title: 'Rank & Cutoff Explorer',
      description:
        'Analyse historical opening and closing ranks with interactive charts and filters.',
      icon: TrendingUp,
      route: '/studio/cutoffs',
      status: 'not_started',
      accentColor: 'bg-violet-600',
      bgGradient: 'bg-gradient-to-r from-violet-600 to-purple-500',
    },
    {
      id: 'compare',
      title: 'College Comparison',
      description:
        'Compare up to 4 programmes side-by-side on ranks, location and details.',
      icon: Scale,
      route: '/studio/compare',
      status: 'not_started',
      accentColor: 'bg-sky-500',
      bgGradient: 'bg-gradient-to-r from-sky-500 to-cyan-500',
    },
    {
      id: 'preferences',
      title: 'Preference List Builder',
      description:
        'Build your JoSAA preference list with drag-and-drop ordering.',
      icon: ListOrdered,
      route: '/studio/preferences',
      status:
        preferenceList.items.length > 0
          ? progress.preferenceListCreated
            ? 'complete'
            : 'in_progress'
          : 'not_started',
      accentColor: 'bg-emerald-600',
      bgGradient: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    },
    {
      id: 'audit',
      title: 'Counselling Mistake Detector',
      description:
        'Audit your preference list for eligibility errors, duplicates and ordering issues.',
      icon: ShieldAlert,
      route: '/studio/mistakes',
      status: deriveStatus('preferenceAuditDone'),
      accentColor: 'bg-rose-600',
      bgGradient: 'bg-gradient-to-r from-rose-600 to-pink-500',
    },
    {
      id: 'timeline',
      title: 'Counselling Timeline Replay',
      description:
        'Understand how rounds and upgrades work through historical data and illustrative scenarios.',
      icon: History,
      route: '/studio/timeline',
      status: 'not_started',
      accentColor: 'bg-amber-600',
      bgGradient: 'bg-gradient-to-r from-amber-600 to-orange-500',
    },
    {
      id: 'report',
      title: 'Final Counselling Report',
      description:
        'Generate and download your complete personalised counselling report.',
      icon: FileText,
      route: '/studio/report',
      status: deriveStatus('reportGenerated'),
      accentColor: 'bg-slate-700',
      bgGradient: 'bg-gradient-to-r from-slate-700 to-slate-500',
    },
  ];

  const quickActions: QuickAction[] = [
    { label: 'Complete Profile', icon: User, route: '/studio/profile', color: 'bg-[#5145CD]' },
    { label: 'Explore Colleges', icon: Search, route: '/studio/explore', color: 'bg-indigo-500' },
    { label: 'Analyse Rank', icon: BarChart3, route: '/studio/cutoffs', color: 'bg-violet-600' },
    { label: 'Build Preferences', icon: ListOrdered, route: '/studio/preferences', color: 'bg-emerald-600' },
    { label: 'Detect Mistakes', icon: ShieldAlert, route: '/studio/mistakes', color: 'bg-rose-600' },
    { label: 'Replay Counselling', icon: RotateCcw, route: '/studio/timeline', color: 'bg-amber-600' },
    { label: 'Generate Report', icon: Download, route: '/studio/report', color: 'bg-slate-700' },
  ];

  const exampleQuestions = [
    'What does closing rank mean?',
    'Explain Home State quota',
    'Why is my rank trend rising?',
    'What should I complete next?',
  ];

  // ── Chat send handler ──
  async function handleSendMessage(text?: string) {
    const msgText = (text ?? chatInput).trim();
    if (!msgText) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: msgText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    // Simulate a brief typing delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const reply = getRuleBasedResponse(msgText);
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: reply,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, botMsg]);
    setIsBotTyping(false);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-[#101828] via-[#1a2340] to-[#2d1f6e] px-6 md:px-10 pt-10 pb-14 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#806BFF] opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-40 rounded-full bg-[#5145CD] opacity-10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#806BFF]" />
            <span className="text-[#806BFF] text-xs font-semibold uppercase tracking-widest">
              JOSAA MATE AI
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
            Intelligent Choice Studio
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Your centralised counselling workspace. Explore colleges, analyse cutoffs, build your
            preference list and detect mistakes — all in one place.
          </p>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-8 pb-16 space-y-8">

        {/* ── 1. Studio Summary Bar ── */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-3"
        >
          <StatCard
            label="Student Rank"
            value={rankDisplay}
            icon={GraduationCap}
            accent="bg-[#5145CD]"
          />
          <StatCard
            label="Eligibility Profile"
            value={isProfileEligible ? 'Complete' : 'Incomplete'}
            icon={isProfileEligible ? CheckCircle2 : XCircle}
            accent={isProfileEligible ? 'bg-emerald-500' : 'bg-rose-500'}
          />
          <StatCard
            label="Programmes Explored"
            value={progress.collegesExplored ? 'Yes' : 'Not yet'}
            icon={Search}
            accent={progress.collegesExplored ? 'bg-indigo-500' : 'bg-slate-400'}
          />
          <StatCard
            label="Saved Preferences"
            value={preferenceList.items.length}
            icon={ListOrdered}
            accent="bg-emerald-600"
          />
          <StatCard
            label="Audit Warnings"
            value={auditWarnings}
            icon={auditWarnings > 0 ? AlertTriangle : ShieldAlert}
            accent={auditWarnings > 0 ? 'bg-amber-500' : 'bg-slate-400'}
          />

          {/* Overall Progress with ring */}
          <motion.div
            variants={STAGGER_CHILD}
            className="flex-1 min-w-[160px] bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200"
          >
            <ProgressRing
              completed={progress.completedSteps}
              total={progress.totalSteps}
            />
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-none mb-1">
                Overall Progress
              </p>
              <p className="text-base font-bold text-[#101828]">
                {progress.completedSteps}/{progress.totalSteps} steps
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {Math.round((progress.completedSteps / progress.totalSteps) * 100)}% complete
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── 2. Quick Actions ── */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#5145CD]" />
            <h2 className="text-sm font-bold text-[#101828] uppercase tracking-wide">
              Quick Actions
            </h2>
          </div>
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-3"
          >
            {quickActions.map((action) => (
              <QuickActionBtn
                key={action.route}
                action={action}
                onNavigate={navigate}
              />
            ))}
          </motion.div>
        </motion.section>

        {/* ── 3. Studio Modules Grid ── */}
        <motion.section initial="hidden" animate="show" variants={FADE_UP}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#5145CD]" />
            <h2 className="text-sm font-bold text-[#101828] uppercase tracking-wide">
              Studio Modules
            </h2>
          </div>
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {modules.map((mod) => (
              <ModuleCard key={mod.id} module={mod} onOpen={navigate} />
            ))}
          </motion.div>
        </motion.section>

        {/* ── 4. AI Assistant Preview Card ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#101828] to-[#2d1f6e] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#806BFF]/20 border border-[#806BFF]/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#806BFF]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">AI Counselling Assistant</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Powered by rule-based knowledge · Always verify with josaa.nic.in
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-4">
            {/* Description */}
            <p className="text-slate-500 text-sm leading-relaxed">
              Ask questions about your eligibility, rank trends, preference order or counselling
              process. The assistant provides informational guidance only.
            </p>

            {/* Example chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1.5 rounded-full border border-[#5145CD]/30 bg-[#F3F0FF] text-[#5145CD] text-[12.5px] font-medium hover:bg-[#5145CD] hover:text-white hover:border-[#5145CD] transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div className="border border-slate-100 rounded-xl bg-[#F8F9FC] overflow-hidden flex flex-col">
              {/* Messages */}
              <div className="h-56 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-200">
                {chatMessages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isBotTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2.5 items-center"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#806BFF] to-[#5145CD] flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="px-4 py-2.5 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#806BFF]"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Input bar */}
              <div className="border-t border-slate-100 bg-white px-3 py-2.5 flex gap-2 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about cutoffs, quotas, eligibility…"
                  className="flex-1 bg-transparent text-sm text-[#101828] placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isBotTyping}
                  className="w-8 h-8 rounded-xl bg-[#5145CD] disabled:bg-slate-200 flex items-center justify-center transition-colors duration-200 hover:bg-[#806BFF] shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── 5. Demo Data Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 text-sm font-semibold leading-snug">
              Demo Data Disclaimer
            </p>
            <p className="text-amber-700 text-sm mt-0.5 leading-relaxed">
              ⚠️ All cutoff data shown is illustrative demo data only. Import official opening and
              closing ranks from{' '}
              <a
                href="https://josaa.nic.in/or-cr/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-amber-900 transition-colors"
              >
                josaa.nic.in/or-cr/
              </a>{' '}
              for accurate analysis.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

