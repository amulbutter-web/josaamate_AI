import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Info,
  RefreshCcw, Check, X, ArrowRight, ListOrdered, User, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { AuditWarning, AuditReport } from '../types';

// ── helpers ──────────────────────────────────────────────────
function runAuditLogic(items: any[], profile: any): AuditReport {
  const warnings: AuditWarning[] = [];
  let wid = 0;

  if (items.length === 0) {
    warnings.push({
      id: `w${wid++}`, type: 'missing_choice', severity: 'warning',
      title: 'Preference list is empty',
      description: 'You have not added any programme choices.',
      reason: 'An empty preference list means you cannot be allotted a seat.',
      suggestion: 'Add eligible programmes from the Explore Colleges section.',
      confidence: 'high',
    });
  }

  // duplicates
  const seen: Record<string, boolean> = {};
  items.forEach(item => {
    const key = `${item.instituteId}-${item.programName}-${item.seatPool}`;
    if (seen[key]) {
      warnings.push({
        id: `w${wid++}`, type: 'duplicate', severity: 'error',
        title: 'Duplicate choice detected',
        description: `${item.instituteName} – ${item.programName} (${item.seatPool}) appears more than once.`,
        reason: 'Duplicate entries waste preference slots.',
        suggestion: 'Remove the duplicate entry.',
        confidence: 'high',
      });
    }
    seen[key] = true;
  });

  // IIT without JEE Advanced
  const iitItems = items.filter(i => i.instituteType === 'IIT');
  if (iitItems.length > 0 && !profile?.jeeAdvancedQualified) {
    warnings.push({
      id: `w${wid++}`, type: 'eligibility_error', severity: 'error',
      title: 'IIT choices without JEE Advanced qualification',
      description: `You have ${iitItems.length} IIT choice(s) but have not indicated JEE Advanced qualification.`,
      reason: 'IIT admission requires JEE Advanced qualification.',
      suggestion: 'Update your profile or remove IIT choices if not qualified.',
      confidence: 'high',
    });
  }

  // no backup
  const types = new Set(items.map(i => i.instituteType));
  if (items.length > 0 && types.size === 1 && types.has('IIT')) {
    warnings.push({
      id: `w${wid++}`, type: 'missing_backup', severity: 'warning',
      title: 'No backup choices from NITs / IIITs',
      description: 'All your choices are IITs, which have very competitive cutoffs.',
      reason: 'Having no backup could leave you without any allotment.',
      suggestion: 'Consider adding NIT or IIIT programmes as backup options.',
      confidence: 'medium',
    });
  }

  // incomplete profile
  const missingFields: string[] = [];
  if (!profile?.homeState) missingFields.push('Home State');
  if (!profile?.category) missingFields.push('Category');
  if (!profile?.jeemainCRL && !profile?.jeeAdvancedRank) missingFields.push('JEE Rank');
  if (missingFields.length > 0) {
    warnings.push({
      id: `w${wid++}`, type: 'eligibility_error', severity: 'warning',
      title: 'Incomplete profile information',
      description: `Missing: ${missingFields.join(', ')}`,
      reason: 'Incomplete profile prevents accurate eligibility verification.',
      suggestion: 'Complete your profile in the Student Profile section.',
      confidence: 'high',
    });
  }

  const errors = warnings.filter(w => w.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;
  const score = Math.max(0, 100 - errors * 20 - warningCount * 8);

  return {
    id: `audit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    totalPreferences: items.length,
    validatedPreferences: items.length - warnings.filter(w => w.type === 'duplicate').length,
    eligibilityWarnings: warnings.filter(w => w.type === 'eligibility_error').length,
    duplicateChoices: warnings.filter(w => w.type === 'duplicate').length,
    missingEligibleChoices: warnings.filter(w => w.type === 'missing_choice').length,
    orderingWarnings: warnings.filter(w => w.type === 'ordering_issue').length,
    missingProfileInfo: missingFields.length,
    auditCompletion: score,
    warnings,
  };
}

const severityConfig = {
  error:   { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',   badge: 'badge-error',   label: 'Error' },
  warning: { icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'badge-warning', label: 'Warning' },
  info:    { icon: Info,          color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  badge: 'badge-blue',    label: 'Info' },
};

// ── Score Ring ────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 44; const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? '#16A36A' : score >= 50 ? '#F59E0B' : '#DC4545';
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
      <motion.circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 55 55)" />
      <text x="55" y="55" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="20" fontWeight="700">{score}</text>
      <text x="55" y="72" textAnchor="middle" fill="#9ca3af" fontSize="9">/ 100</text>
    </svg>
  );
}

// ── Warning Card ──────────────────────────────────────────────
function WarningCard({ w, onAccept, onIgnore }: {
  w: AuditWarning & { accepted?: boolean; ignored?: boolean };
  onAccept: () => void; onIgnore: () => void;
}) {
  const cfg = severityConfig[w.severity];
  const Icon = cfg.icon;
  if (w.ignored) return (
    <div className="opacity-40 card p-4 flex items-center gap-3 text-sm text-gray-400">
      <X size={14} /> <span>Warning ignored: {w.title}</span>
    </div>
  );
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`card p-5 border ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg}`}>
          <Icon size={15} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
            <span className={`badge badge-gray`}>{w.confidence} confidence</span>
            {w.accepted && <span className="badge badge-success"><Check size={10} />Accepted</span>}
          </div>
          <p className="font-semibold text-gray-800 text-sm">{w.title}</p>
          <p className="text-gray-500 text-xs mt-0.5">{w.description}</p>
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs space-y-1">
            <p><span className="font-medium text-gray-700">Reason:</span> {w.reason}</p>
            <p><span className="font-medium text-gray-700">Suggestion:</span> {w.suggestion}</p>
          </div>
          {!w.accepted && (
            <div className="flex gap-2 mt-3">
              <button onClick={onAccept} className="btn-secondary text-xs px-3 py-1.5 gap-1">
                <Check size={12} /> Accept Suggestion
              </button>
              <button onClick={onIgnore} className="btn-ghost text-xs px-3 py-1.5 gap-1">
                <X size={12} /> Ignore
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function MistakeDetector() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [warningStates, setWarningStates] = useState<Record<string, { accepted?: boolean; ignored?: boolean }>>({});

  const items = state.preferenceList.items;

  async function handleRunAudit() {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 1800));
    const result = runAuditLogic(items, state.profile);
    setReport(result);
    dispatch({ type: 'SET_AUDIT_REPORT', payload: result });
    setWarningStates({});
    setIsRunning(false);
  }

  function acceptWarning(id: string) {
    setWarningStates(s => ({ ...s, [id]: { ...s[id], accepted: true } }));
  }
  function ignoreWarning(id: string) {
    setWarningStates(s => ({ ...s, [id]: { ...s[id], ignored: true } }));
  }

  const statsItems = report ? [
    { label: 'Total Preferences', value: report.totalPreferences, color: 'text-gray-800' },
    { label: 'Validated', value: report.validatedPreferences, color: 'text-green-600' },
    { label: 'Eligibility Warnings', value: report.eligibilityWarnings, color: 'text-red-600' },
    { label: 'Duplicates', value: report.duplicateChoices, color: 'text-red-600' },
    { label: 'Missing Backup', value: report.missingEligibleChoices, color: 'text-amber-600' },
    { label: 'Profile Gaps', value: report.missingProfileInfo, color: 'text-amber-600' },
  ] : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={22} className="text-indigo-600" />
          <h1 className="section-heading">Counselling Mistake Detector</h1>
        </div>
        <p className="section-subheading">Review your saved preference list and identify potential issues before finalising it.</p>
      </div>

      {/* Notice */}
      <div className="card p-4 bg-indigo-50 border border-indigo-100 text-sm text-indigo-700 flex items-start gap-2">
        <Info size={15} className="mt-0.5 shrink-0" />
        <span>Warnings are <strong>suggestions only</strong>. Your final preference order remains entirely under your control. The system will never change your list automatically.</span>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="card py-16 empty-state">
          <div className="empty-state-icon"><ListOrdered size={22} className="text-gray-400" /></div>
          <h3 className="font-semibold text-gray-700 mb-1">No preferences to audit</h3>
          <p className="text-gray-500 text-sm mb-4">Build your preference list first, then run the audit.</p>
          <button className="btn-primary" onClick={() => navigate('/studio/preferences')}>
            <ArrowRight size={15} /> Build Preference List
          </button>
        </div>
      )}

      {/* Incomplete profile warning */}
      {!state.profile?.name && items.length > 0 && (
        <div className="card p-4 bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={15} />
            <span>Complete your profile for more accurate eligibility checks.</span>
          </div>
          <button className="btn-outline text-xs px-3 py-1" onClick={() => navigate('/studio/profile')}>
            Complete Profile
          </button>
        </div>
      )}

      {/* Run button */}
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={handleRunAudit} disabled={isRunning}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
            {isRunning ? (
              <><RefreshCcw size={15} className="animate-spin" /> Running Audit…</>
            ) : (
              <><ShieldAlert size={15} /> {report ? 'Re-run Full Audit' : 'Run Full Audit'}</>
            )}
          </button>
          <span className="text-gray-400 text-xs">{items.length} choice{items.length !== 1 ? 's' : ''} in your list</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {report && !isRunning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Score + Stats */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center">
                  <ScoreRing score={report.auditCompletion} />
                  <p className="text-xs text-gray-500 mt-1">Audit Score</p>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {statsItems.map(s => (
                    <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warning list */}
            {report.warnings.length === 0 ? (
              <div className="card py-12 empty-state">
                <CheckCircle2 size={36} className="text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-800">No issues detected!</h3>
                <p className="text-gray-500 text-sm mt-1">Your preference list looks good. Always verify eligibility at josaa.nic.in.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  {report.warnings.length} issue{report.warnings.length !== 1 ? 's' : ''} found
                </h2>
                {report.warnings.map(w => (
                  <WarningCard key={w.id}
                    w={{ ...w, ...(warningStates[w.id] || {}) }}
                    onAccept={() => acceptWarning(w.id)}
                    onIgnore={() => ignoreWarning(w.id)}
                  />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="card p-4 bg-gray-50 text-xs text-gray-500 border border-gray-100">
              <span className="font-medium">Disclaimer:</span> This audit is based on limited profile data and demo cutoff information.
              Always verify eligibility and ranks at{' '}
              <a href="https://josaa.nic.in" target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 underline">josaa.nic.in</a>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
