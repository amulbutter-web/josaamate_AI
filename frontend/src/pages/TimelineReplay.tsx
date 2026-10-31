import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight, Info, AlertTriangle, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

interface TimelineRound {
  round: number;
  label: string;
  date: string;
  allottedInstitute?: string;
  allottedProgramme?: string;
  preferencePosition?: number;
  action?: 'freeze' | 'float' | 'slide' | 'withdraw' | 'not_allotted';
  actionLabel?: string;
  explanation: string;
  isUpgrade?: boolean;
}

const ILLUSTRATIVE_ROUNDS: TimelineRound[] = [
  {
    round: 1, label: 'Round 1', date: '25 June 2026 (illustrative)',
    allottedInstitute: 'NIT Warangal', allottedProgramme: 'Electronics and Communication Engineering',
    preferencePosition: 8, action: 'float', actionLabel: 'Float',
    explanation: 'You were allotted your 8th preference — NIT Warangal ECE. Since higher preferences are still available, you chose to "Float" to remain in the queue for an upgrade in subsequent rounds.',
  },
  {
    round: 2, label: 'Round 2', date: '2 July 2026 (illustrative)',
    allottedInstitute: 'NIT Trichy', allottedProgramme: 'Computer Science and Engineering',
    preferencePosition: 5, action: 'float', actionLabel: 'Float', isUpgrade: true,
    explanation: 'You received an upgrade to your 5th preference — NIT Trichy CS, which is higher in your list. You chose to continue floating as IIT Hyderabad CS (preference #3) is still possible.',
  },
  {
    round: 3, label: 'Round 3', date: '8 July 2026 (illustrative)',
    allottedInstitute: 'NIT Trichy', allottedProgramme: 'Computer Science and Engineering',
    preferencePosition: 5, action: 'float', actionLabel: 'Float',
    explanation: 'No upgrade in Round 3. Your allotment remains NIT Trichy CS. You continue floating for preference #3.',
  },
  {
    round: 4, label: 'Round 4', date: '13 July 2026 (illustrative)',
    allottedInstitute: 'IIT Hyderabad', allottedProgramme: 'Computer Science and Engineering',
    preferencePosition: 3, action: 'freeze', actionLabel: 'Freeze', isUpgrade: true,
    explanation: 'You received an upgrade to your 3rd preference — IIT Hyderabad CS! You chose to "Freeze" this allotment, locking in IIT Hyderabad and withdrawing from further upgrade consideration.',
  },
  {
    round: 5, label: 'Round 5', date: '17 July 2026 (illustrative)',
    allottedInstitute: 'IIT Hyderabad', allottedProgramme: 'Computer Science and Engineering',
    preferencePosition: 3, action: 'freeze', actionLabel: 'Frozen',
    explanation: 'Your seat is frozen at IIT Hyderabad CS. No further changes.',
  },
  {
    round: 6, label: 'Final Round', date: '22 July 2026 (illustrative)',
    allottedInstitute: 'IIT Hyderabad', allottedProgramme: 'Computer Science and Engineering',
    preferencePosition: 3, action: 'freeze', actionLabel: 'Final Allotment',
    explanation: 'Final allotment confirmed: IIT Hyderabad — Computer Science and Engineering. Report to the institute with original documents.',
  },
];

const ACTION_COLORS: Record<string, string> = {
  freeze: 'bg-green-50 text-green-700 border-green-200',
  float: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  slide: 'bg-blue-50 text-blue-700 border-blue-200',
  withdraw: 'bg-red-50 text-red-700 border-red-200',
  not_allotted: 'bg-gray-50 text-gray-500 border-gray-200',
};

const CONCEPTS = [
  { term: 'Float', def: 'Keep your current allotment but remain eligible for a higher-preference allotment in the next round. If no upgrade occurs, you retain the current seat.' },
  { term: 'Freeze', def: 'Accept your current allotment permanently. You will not be considered for further upgrades, but your seat is secured.' },
  { term: 'Slide', def: 'Keep the same institute but be considered for a different (higher-preference) programme within that institute.' },
  { term: 'Upgrade', def: 'Receiving an allotment to a higher-preference programme/institute in a later round, replacing your earlier allotment.' },
  { term: 'Withdraw', def: 'Voluntarily exit the counselling process. You lose your current allotment and are not considered further.' },
];

export default function TimelineReplay() {
  const [mode, setMode] = useState<'illustrative' | 'historical'>('illustrative');
  const [selectedRound, setSelectedRound] = useState(0);

  const current = ILLUSTRATIVE_ROUNDS[selectedRound];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <History size={22} className="text-indigo-600" />
          <h1 className="section-heading">Counselling Timeline Replay</h1>
        </div>
        <p className="section-subheading">Explore how counselling rounds and preference upgrades work through illustrative scenarios.</p>
      </div>

      {/* Disclaimer banner */}
      <div className="card p-4 bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-800">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <span>
          <strong>Educational Simulation Only.</strong> This does not replicate the official JoSAA algorithm and does not predict actual seat allotment.
          Always refer to <a href="https://josaa.nic.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">josaa.nic.in</a> for official information.
        </span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['illustrative', 'historical'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}>
            {m === 'illustrative' ? '✦ Illustrative Simulation' : '📁 Historical Replay'}
          </button>
        ))}
      </div>

      {mode === 'historical' && (
        <div className="card py-12 text-center space-y-3">
          <BookOpen size={32} className="text-gray-300 mx-auto" />
          <h3 className="font-semibold text-gray-700">Historical Data Not Yet Imported</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Verified historical candidate-level allotment data has not been imported yet.
            Import official data via the <strong>Admin → Data Import</strong> section to enable this feature.
          </p>
          <p className="text-xs text-gray-400">Source: <a href="https://josaa.nic.in" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">josaa.nic.in</a></p>
        </div>
      )}

      {mode === 'illustrative' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Timeline steps */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">Round Progression</h2>
            {ILLUSTRATIVE_ROUNDS.map((r, i) => (
              <button key={r.round} onClick={() => setSelectedRound(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                  selectedRound === i
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  selectedRound === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{r.round}</div>
                <div>
                  <p className="font-medium">{r.label}</p>
                  {r.isUpgrade && <span className="text-xs text-green-600 font-semibold">↑ Upgrade</span>}
                </div>
                {selectedRound === i && <ChevronRight size={14} className="ml-auto text-indigo-500" />}
              </button>
            ))}
          </div>

          {/* Right: Round detail */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={selectedRound}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                className="space-y-4">

                {/* Round card */}
                <div className="card p-6">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-indigo">{current.label}</span>
                        <span className="badge badge-warning text-xs">Illustrative Example</span>
                        {current.isUpgrade && (
                          <span className="badge badge-success"><CheckCircle2 size={10} /> Upgrade Received</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{current.date}</p>
                    </div>
                    {current.action && (
                      <span className={`badge border text-xs font-semibold px-3 py-1 ${ACTION_COLORS[current.action]}`}>
                        Action: {current.actionLabel}
                      </span>
                    )}
                  </div>

                  {current.allottedInstitute ? (
                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                      <p className="text-xs text-gray-500 mb-1">Allotted Programme</p>
                      <p className="font-bold text-gray-800 text-base">{current.allottedInstitute}</p>
                      <p className="text-gray-600 text-sm">{current.allottedProgramme}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-gray text-xs">Preference #{current.preferencePosition}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl mb-4 text-gray-500 text-sm">
                      Not allotted in this round.
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    <p>{current.explanation}</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  {selectedRound > 0 && (
                    <button className="btn-outline text-sm" onClick={() => setSelectedRound(s => s - 1)}>
                      ← Previous Round
                    </button>
                  )}
                  {selectedRound < ILLUSTRATIVE_ROUNDS.length - 1 && (
                    <button className="btn-primary text-sm ml-auto" onClick={() => setSelectedRound(s => s + 1)}>
                      Next Round <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Key Concepts */}
      {mode === 'illustrative' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" /> Key Counselling Concepts
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPTS.map(c => (
              <div key={c.term} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-indigo-700 text-sm mb-1">{c.term}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{c.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
