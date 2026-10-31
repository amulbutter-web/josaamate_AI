import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Grid3X3, List, Plus, Check,
  MapPin, Building2, Info, SlidersHorizontal, X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { DEMO_PROGRAMMES, DEMO_CUTOFFS, CATEGORIES, INDIAN_STATES } from '../data/demoData';
import type { InstituteType, SeatPool } from '../types';

const TYPE_COLORS: Record<string, string> = {
  IIT: 'bg-violet-100 text-violet-700',
  NIT: 'bg-blue-100 text-blue-700',
  IIIT: 'bg-green-100 text-green-700',
  GFTI: 'bg-amber-100 text-amber-700',
};

const INSTITUTE_TYPES: Array<{ label: string; value: InstituteType | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'IITs', value: 'IIT' },
  { label: 'NITs', value: 'NIT' },
  { label: 'IIITs', value: 'IIIT' },
  { label: 'GFTIs', value: 'GFTI' },
];

function getClosingRank2024(instituteId: string, programName: string) {
  const rec = DEMO_CUTOFFS.find(
    c => c.instituteId === instituteId && c.programName === programName && c.year === 2024 && c.round === 6 && c.seatPool === 'OPEN'
  );
  return rec?.closingRank ?? null;
}

function uid() { return Math.random().toString(36).substr(2, 9); }

// ── Card View ────────────────────────────────────────────────
function ProgrammeCard({ prog, isAdded, onAdd }: {
  prog: typeof DEMO_PROGRAMMES[0];
  isAdded: boolean;
  onAdd: () => void;
}) {
  const cr = getClosingRank2024(prog.instituteId, prog.programName);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge text-xs ${TYPE_COLORS[prog.instituteType] ?? 'badge-gray'}`}>{prog.instituteType}</span>
            <span className="badge badge-gray text-xs">{prog.degree} · {prog.duration}</span>
          </div>
          <p className="font-semibold text-gray-800 text-sm leading-snug">{prog.instituteName}</p>
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{prog.programName}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin size={11} />
        <span>{prog.city}, {prog.state}</span>
      </div>
      {cr !== null && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-500">Closing Rank 2024</span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-indigo-700 text-sm">{cr.toLocaleString()}</span>
            <span className="badge badge-warning text-[9px]">Demo</span>
          </div>
        </div>
      )}
      <button
        onClick={onAdd}
        disabled={isAdded}
        className={`w-full justify-center text-sm py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
          isAdded
            ? 'bg-green-50 text-green-700 cursor-default'
            : 'btn-primary'
        }`}
      >
        {isAdded ? <><Check size={13} /> Added to List</> : <><Plus size={13} /> Add to Preference List</>}
      </button>
    </motion.div>
  );
}

// ── Table Row ────────────────────────────────────────────────
function ProgrammeRow({ prog, isAdded, onAdd, idx }: {
  prog: typeof DEMO_PROGRAMMES[0];
  isAdded: boolean;
  onAdd: () => void;
  idx: number;
}) {
  const cr = getClosingRank2024(prog.instituteId, prog.programName);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        className="table-row cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="table-cell px-4 font-medium text-gray-400 text-center w-10">{idx + 1}</td>
        <td className="table-cell px-4">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{prog.instituteName}</p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <MapPin size={10} />{prog.city}, {prog.state}
            </p>
          </div>
        </td>
        <td className="table-cell px-4 text-gray-700 text-sm">{prog.programName}</td>
        <td className="table-cell px-4">
          <span className={`badge text-xs ${TYPE_COLORS[prog.instituteType] ?? 'badge-gray'}`}>
            {prog.instituteType}
          </span>
        </td>
        <td className="table-cell px-4">
          {cr !== null ? (
            <div className="flex items-center gap-1">
              <span className="font-bold text-indigo-700">{cr.toLocaleString()}</span>
              <span className="badge badge-warning text-[9px]">Demo</span>
            </div>
          ) : <span className="text-gray-300">—</span>}
        </td>
        <td className="table-cell px-4">
          <button
            onClick={e => { e.stopPropagation(); onAdd(); }}
            disabled={isAdded}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              isAdded ? 'bg-green-50 text-green-700' : 'btn-primary'
            }`}
          >
            {isAdded ? <><Check size={11} />Added</> : <><Plus size={11} />Add</>}
          </button>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={6} className="px-4 pb-3 pt-0 bg-gray-50">
              <div className="flex gap-6 text-xs text-gray-600 py-2">
                <span><span className="font-medium text-gray-700">Degree:</span> {prog.degree}</span>
                <span><span className="font-medium text-gray-700">Duration:</span> {prog.duration}</span>
                <span><span className="font-medium text-gray-700">State:</span> {prog.state}</span>
                <span className="text-amber-600 font-medium">⚠ Ranks are demo data only</span>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function ExplorePage() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<InstituteType | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SeatPool | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const addedIds = useMemo(
    () => new Set(state.preferenceList.items.map(i => `${i.instituteId}||${i.programName}`)),
    [state.preferenceList.items]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DEMO_PROGRAMMES.filter(p => {
      const matchesType = selectedType === 'ALL' || p.instituteType === selectedType;
      const matchesState = !selectedState || p.state === selectedState;
      const matchesSearch = !q || p.instituteName.toLowerCase().includes(q) ||
        p.programName.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
      return matchesType && matchesState && matchesSearch;
    });
  }, [search, selectedType, selectedState, selectedCategory]);

  function handleAdd(prog: typeof DEMO_PROGRAMMES[0]) {
    const cr = getClosingRank2024(prog.instituteId, prog.programName);
    const pool = (state.profile?.category?.replace('-PwD', '') || 'OPEN') as SeatPool;
    dispatch({
      type: 'ADD_PREFERENCE',
      payload: {
        id: uid(),
        order: 0,
        instituteId: prog.instituteId,
        instituteName: prog.instituteName,
        instituteType: prog.instituteType,
        programName: prog.programName,
        quota: prog.instituteType === 'IIT' ? 'AI' : 'OS',
        seatPool: pool,
        genderPool: 'Gender-Neutral',
        eligibilityStatus: 'requires_verification',
        closingRank2024: cr ?? undefined,
        notes: `${prog.degree} · ${prog.duration}`,
      },
    });
    // Mark colleges as explored
    dispatch({ type: 'UPDATE_PROGRESS', payload: { collegesExplored: true } });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={22} className="text-indigo-600" />
          <h1 className="section-heading">Explore Colleges & Programmes</h1>
        </div>
        <p className="section-subheading">
          Discover eligible programmes from IITs, NITs, IIITs and GFTIs. Add them directly to your preference list.
        </p>
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <Info size={13} className="shrink-0" />
        <span>
          <strong>⚠ Demo Data:</strong> All closing ranks are illustrative only. Import official data from{' '}
          <a href="https://josaa.nic.in/or-cr/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            josaa.nic.in/or-cr/
          </a>{' '}
          for accurate analysis.
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="card p-4 space-y-3">
        {/* Search + view toggle */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search institute or programme…"
              className="input-field pl-8 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`btn-outline text-sm gap-1.5 ${showFilters ? 'border-indigo-400 text-indigo-600' : ''}`}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['table', 'card'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`p-1.5 rounded-lg transition-all ${viewMode === m ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {m === 'table' ? <List size={15} /> : <Grid3X3 size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 flex-wrap">
          {INSTITUTE_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedType === t.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                  <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="select-field text-sm">
                    <option value="">All States</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category / Seat Pool</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as SeatPool | 'ALL')}
                    className="select-field text-sm"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setSelectedState(''); setSelectedCategory('ALL'); setSearch(''); setSelectedType('ALL'); }}
                    className="btn-ghost text-sm w-full justify-center"
                  >
                    <X size={13} /> Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> programme{filtered.length !== 1 ? 's' : ''}
          {selectedType !== 'ALL' && <span> in <span className="font-medium">{selectedType}s</span></span>}
          {search && <span> matching "<span className="font-medium">{search}</span>"</span>}
        </p>
        <div className="flex items-center gap-2">
          <span className="badge badge-indigo">{state.preferenceList.items.length} in list</span>
          <span className="badge badge-warning">⚠ Demo Data</span>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card py-14 empty-state">
          <div className="empty-state-icon"><Search size={20} className="text-gray-400" /></div>
          <h3 className="font-semibold text-gray-700 mb-1">No programmes found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          <button className="mt-3 btn-outline text-sm" onClick={() => { setSearch(''); setSelectedType('ALL'); setSelectedState(''); }}>
            <X size={13} /> Clear All Filters
          </button>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Institute', 'Programme', 'Type', 'Closing Rank 2024', 'Action'].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((prog, i) => {
                  const key = `${prog.instituteId}||${prog.programName}`;
                  return (
                    <ProgrammeRow
                      key={key}
                      prog={prog}
                      isAdded={addedIds.has(key)}
                      onAdd={() => handleAdd(prog)}
                      idx={i}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(prog => {
            const key = `${prog.instituteId}||${prog.programName}`;
            return (
              <ProgrammeCard
                key={key}
                prog={prog}
                isAdded={addedIds.has(key)}
                onAdd={() => handleAdd(prog)}
              />
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 flex items-start gap-1.5 mt-2">
        <Info size={11} className="mt-0.5 shrink-0" />
        <span>
          Eligibility shown as "Requires Verification" until your profile is complete and official eligibility rules are applied.
          Always verify at <a href="https://josaa.nic.in" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">josaa.nic.in</a>.
        </span>
      </div>
    </div>
  );
}
