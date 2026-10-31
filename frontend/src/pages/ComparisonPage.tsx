import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Plus, X, ExternalLink, Search, Building2, MapPin, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../store/AppContext';
import { DEMO_PROGRAMMES, DEMO_CUTOFFS, DEMO_INSTITUTES } from '../data/demoData';
import type { InstituteType } from '../types';

const YEARS = [2021, 2022, 2023, 2024] as const;
const LINE_COLORS = ['#5145CD', '#806BFF', '#16A36A', '#F59E0B'];
const TYPE_COLORS: Record<string, string> = {
  IIT: 'bg-violet-100 text-violet-700',
  NIT: 'bg-blue-100 text-blue-700',
  IIIT: 'bg-green-100 text-green-700',
  GFTI: 'bg-amber-100 text-amber-700',
};

interface SelectedItem {
  key: string;
  instituteId: string;
  programName: string;
  instituteName: string;
  instituteType: InstituteType;
}

function getClosingRank(instituteId: string, programName: string, year: number) {
  const rec = DEMO_CUTOFFS.find(c =>
    c.instituteId === instituteId &&
    c.programName === programName &&
    c.year === year &&
    c.round === 6
  );
  return rec?.closingRank ?? null;
}

function getOpeningRank(instituteId: string, programName: string, year: number) {
  const rec = DEMO_CUTOFFS.find(c =>
    c.instituteId === instituteId &&
    c.programName === programName &&
    c.year === year &&
    c.round === 6
  );
  return rec?.openingRank ?? null;
}

const COMPARE_ROWS = [
  { label: 'Institute', key: 'instituteName' },
  { label: 'Programme', key: 'programName' },
  { label: 'Type', key: 'type' },
  { label: 'Location', key: 'location' },
  { label: 'Duration', key: 'duration' },
  { label: 'Degree', key: 'degree' },
  { label: 'Closing Rank 2021 (Demo)', key: 'cr2021' },
  { label: 'Closing Rank 2022 (Demo)', key: 'cr2022' },
  { label: 'Closing Rank 2023 (Demo)', key: 'cr2023' },
  { label: 'Closing Rank 2024 (Demo)', key: 'cr2024' },
  { label: 'Opening Rank 2024 (Demo)', key: 'or2024' },
  { label: 'Official Website', key: 'website' },
];

export default function ComparisonPage() {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return DEMO_PROGRAMMES.slice(0, 20);
    const q = search.toLowerCase();
    return DEMO_PROGRAMMES.filter(p =>
      p.instituteName.toLowerCase().includes(q) ||
      p.programName.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q)
    );
  }, [search]);

  function addProgramme(p: typeof DEMO_PROGRAMMES[0]) {
    if (selected.length >= 4) return;
    const key = `${p.instituteId}||${p.programName}`;
    if (selected.find(s => s.key === key)) return;
    setSelected(prev => [...prev, {
      key, instituteId: p.instituteId, programName: p.programName,
      instituteName: p.instituteName, instituteType: p.instituteType,
    }]);
    setShowSearch(false);
    setSearch('');
  }

  function removeProgramme(key: string) {
    setSelected(prev => prev.filter(s => s.key !== key));
  }

  function getCellValue(item: SelectedItem, rowKey: string): string {
    const prog = DEMO_PROGRAMMES.find(p => p.instituteId === item.instituteId && p.programName === item.programName);
    const inst = DEMO_INSTITUTES.find(i => i.id === item.instituteId);
    switch (rowKey) {
      case 'instituteName': return item.instituteName;
      case 'programName': return item.programName;
      case 'type': return item.instituteType;
      case 'location': return prog ? `${prog.city}, ${prog.state}` : '—';
      case 'duration': return prog?.duration ?? '—';
      case 'degree': return prog?.degree ?? '—';
      case 'cr2021': return getClosingRank(item.instituteId, item.programName, 2021)?.toLocaleString() ?? 'N/A';
      case 'cr2022': return getClosingRank(item.instituteId, item.programName, 2022)?.toLocaleString() ?? 'N/A';
      case 'cr2023': return getClosingRank(item.instituteId, item.programName, 2023)?.toLocaleString() ?? 'N/A';
      case 'cr2024': return getClosingRank(item.instituteId, item.programName, 2024)?.toLocaleString() ?? 'N/A';
      case 'or2024': return getOpeningRank(item.instituteId, item.programName, 2024)?.toLocaleString() ?? 'N/A';
      case 'website': return inst?.website ?? '—';
      default: return '—';
    }
  }

  // Chart data
  const chartData = useMemo(() => YEARS.map(year => {
    const pt: Record<string, unknown> = { year };
    selected.forEach(item => {
      const cr = getClosingRank(item.instituteId, item.programName, year);
      pt[item.key] = cr;
    });
    return pt;
  }), [selected]);

  function addToPreference(item: SelectedItem) {
    const prog = DEMO_PROGRAMMES.find(p => p.instituteId === item.instituteId && p.programName === item.programName);
    const cr = getClosingRank(item.instituteId, item.programName, 2024);
    dispatch({
      type: 'ADD_PREFERENCE',
      payload: {
        id: Math.random().toString(36).substr(2, 9),
        order: 0,
        instituteId: item.instituteId,
        instituteName: item.instituteName,
        instituteType: item.instituteType,
        programName: item.programName,
        quota: 'OS',
        seatPool: 'OPEN',
        genderPool: 'Gender-Neutral',
        eligibilityStatus: 'requires_verification',
        closingRank2024: cr ?? undefined,
        notes: prog?.degree ?? '',
      },
    });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Scale size={22} className="text-indigo-600" />
          <h1 className="section-heading">College Comparison</h1>
        </div>
        <p className="section-subheading">Compare up to 4 programmes side-by-side on historical ranks, location and details.</p>
      </div>

      {/* Demo notice */}
      <div className="card p-3 bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
        <Info size={13} /> All rank data shown is <strong>DEMO DATA only</strong>. Import official data from josaa.nic.in/or-cr/ for accurate comparison.
      </div>

      {/* Selector */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Selected Programmes ({selected.length}/4)</h2>
          {selected.length < 4 && (
            <button onClick={() => setShowSearch(s => !s)} className="btn-primary text-sm">
              <Plus size={14} /> Add Programme
            </button>
          )}
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: LINE_COLORS[i] }} />
              <span className="font-medium text-gray-700">{s.instituteName}</span>
              <span className="text-gray-400">–</span>
              <span className="text-gray-600 truncate max-w-[140px]">{s.programName}</span>
              <button onClick={() => removeProgramme(s.key)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          {selected.length === 0 && (
            <p className="text-gray-400 text-sm">No programmes selected. Click "Add Programme" to start.</p>
          )}
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search institute or programme…"
                    className="input-field pl-8 text-sm" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                  {filtered.map(p => {
                    const key = `${p.instituteId}||${p.programName}`;
                    const isSelected = selected.find(s => s.key === key);
                    return (
                      <button key={key} disabled={!!isSelected || selected.length >= 4}
                        onClick={() => addProgramme(p)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          isSelected ? 'opacity-40 cursor-not-allowed bg-gray-50'
                            : 'hover:bg-indigo-50 hover:text-indigo-700'
                        }`}>
                        <div>
                          <span className="font-medium">{p.instituteName}</span>
                          <span className="text-gray-400 mx-1">–</span>
                          <span className="text-gray-600">{p.programName}</span>
                        </div>
                        <span className={`badge text-xs ${TYPE_COLORS[p.instituteType] || 'badge-gray'}`}>{p.instituteType}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comparison table */}
      {selected.length > 0 && (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header text-left px-4 py-3 w-40">Attribute</th>
                {selected.map((s, i) => (
                  <th key={s.key} className="table-header text-left px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: LINE_COLORS[i] }} />
                      <span className="truncate max-w-[160px]" title={`${s.instituteName} – ${s.programName}`}>
                        {s.instituteName}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(row => (
                <tr key={row.key} className="table-row">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{row.label}</td>
                  {selected.map(item => {
                    const val = getCellValue(item, row.key);
                    if (row.key === 'type') return (
                      <td key={item.key} className="px-4 py-3">
                        <span className={`badge ${TYPE_COLORS[val] || 'badge-gray'}`}>{val}</span>
                      </td>
                    );
                    if (row.key === 'website') return (
                      <td key={item.key} className="px-4 py-3">
                        {val !== '—' ? (
                          <a href={val} target="_blank" rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                            Visit <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                    );
                    if (row.key === 'location') return (
                      <td key={item.key} className="px-4 py-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{val}</span>
                      </td>
                    );
                    if (row.key === 'instituteName') return (
                      <td key={item.key} className="px-4 py-3 text-sm font-semibold text-gray-800">{val}</td>
                    );
                    return (
                      <td key={item.key} className="px-4 py-3 text-sm text-gray-700">{val}</td>
                    );
                  })}
                </tr>
              ))}
              {/* Add to preferences row */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</td>
                {selected.map(item => (
                  <td key={item.key} className="px-4 py-3">
                    <button onClick={() => addToPreference(item)} className="btn-secondary text-xs py-1 px-3">
                      <Plus size={11} /> Add to List
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Rank trend chart */}
      {selected.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-gray-800">Closing Rank Trend (2021–2024)</h2>
            <span className="badge badge-warning text-xs">Demo Data</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Note: Lower rank number = higher merit position. Y-axis is inverted.</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis reversed tick={{ fontSize: 11 }} label={{ value: 'Closing Rank', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip formatter={(val: number) => [val?.toLocaleString(), 'Closing Rank']} />
              <Legend />
              {selected.map((item, i) => (
                <Line key={item.key} type="monotone" dataKey={item.key}
                  name={`${item.instituteName} – ${item.programName}`}
                  stroke={LINE_COLORS[i]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}
                  connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
            <Building2 size={11} /> Source: DEMO DATA only — not official JoSAA data
          </p>
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && !showSearch && (
        <div className="card py-16 empty-state">
          <div className="empty-state-icon"><Scale size={22} className="text-gray-400" /></div>
          <h3 className="font-semibold text-gray-700 mb-1">No programmes selected</h3>
          <p className="text-gray-500 text-sm mb-4">Select up to 4 programmes to compare side-by-side.</p>
          <button className="btn-primary" onClick={() => setShowSearch(true)}>
            <Plus size={14} /> Add First Programme
          </button>
        </div>
      )}
    </div>
  );
}
