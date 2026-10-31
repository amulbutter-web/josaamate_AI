// ====================================================
// JOSAA MATE AI – Rank & Cutoff Explorer
// ⚠️ All data is DEMO DATA only. Fetch official data from josaa.nic.in/or-cr/
// ====================================================

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart2,
  Table2,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Info,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Minus,
} from 'lucide-react';
import { DEMO_CUTOFFS } from '../data/demoData';
import type { CutoffRecord, InstituteType, Quota, SeatPool, GenderPool } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const YEARS = [2021, 2022, 2023, 2024];
const ROUNDS = [1, 2, 3, 4, 5, 6] as const;
const PAGE_SIZE = 20;

const CHART_COLORS = ['#5145CD', '#806BFF', '#0EA5E9', '#F59E0B', '#10B981'];

const INSTITUTE_TYPES: Array<{ label: string; value: InstituteType | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'IIT', value: 'IIT' },
  { label: 'NIT', value: 'NIT' },
  { label: 'IIIT', value: 'IIIT' },
  { label: 'GFTI', value: 'GFTI' },
];

const QUOTA_OPTIONS: Array<{ label: string; value: Quota | 'ALL' }> = [
  { label: 'All Quotas', value: 'ALL' },
  { label: 'AI (All India)', value: 'AI' },
  { label: 'HS (Home State)', value: 'HS' },
  { label: 'OS (Other State)', value: 'OS' },
];

const SEAT_POOL_OPTIONS: Array<{ label: string; value: SeatPool | 'ALL' }> = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'OPEN', value: 'OPEN' },
  { label: 'OBC-NCL', value: 'OBC-NCL' },
  { label: 'SC', value: 'SC' },
  { label: 'ST', value: 'ST' },
  { label: 'EWS', value: 'EWS' },
  { label: 'OPEN-PwD', value: 'OPEN-PwD' },
  { label: 'OBC-NCL-PwD', value: 'OBC-NCL-PwD' },
  { label: 'SC-PwD', value: 'SC-PwD' },
  { label: 'ST-PwD', value: 'ST-PwD' },
  { label: 'EWS-PwD', value: 'EWS-PwD' },
];

const GENDER_POOL_OPTIONS: Array<{ label: string; value: GenderPool | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Gender-Neutral', value: 'Gender-Neutral' },
  { label: 'Female-only', value: 'Female-only' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'table' | 'chart';
type ChartMetric = 'closing' | 'opening' | 'both';
type SortField = keyof CutoffRecord;
type SortDir = 'asc' | 'desc';

interface Filters {
  instituteType: InstituteType | 'ALL';
  instituteName: string;
  programme: string;
  seatPool: SeatPool | 'ALL';
  quota: Quota | 'ALL';
  genderPool: GenderPool | 'ALL';
  year: number | 'ALL';
  round: number | 'ALL';
}

interface ChartSeries {
  id: string;
  label: string;
  instituteName: string;
  programName: string;
  quota: Quota;
  seatPool: SeatPool;
  genderPool: GenderPool;
  color: string;
}

// ─── Derived unique lists from demo data ──────────────────────────────────────

const ALL_INSTITUTE_NAMES = Array.from(new Set(DEMO_CUTOFFS.map((r) => r.instituteName))).sort();
const ALL_PROGRAMME_NAMES = Array.from(new Set(DEMO_CUTOFFS.map((r) => r.programName))).sort();

// ─── Helper utilities ─────────────────────────────────────────────────────────

function seriesId(c: {
  instituteName: string;
  programName: string;
  quota: Quota;
  seatPool: SeatPool;
  genderPool: GenderPool;
}): string {
  return `${c.instituteName}||${c.programName}||${c.quota}||${c.seatPool}||${c.genderPool}`;
}



function rankTrend(
  current: number,
  previous: number | undefined
): 'up' | 'down' | 'neutral' {
  if (previous === undefined) return 'neutral';
  // lower rank number = harder to get = rank "got harder" = ↑ in number
  if (current > previous) return 'up'; // harder
  if (current < previous) return 'down'; // easier
  return 'neutral';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
  className?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '', placeholder }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700
      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
      transition-colors ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// Searchable dropdown for series picker
interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())).slice(0, 50),
    [options, query]
  );

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm
          cursor-pointer focus-within:ring-2 focus-within:ring-indigo-400"
        onClick={() => setOpen((o) => !o)}
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400 min-w-0"
          placeholder={value || placeholder}
          value={open ? query : ''}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={(e) => e.stopPropagation()}
        />
        {value && !open && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
              max-h-48 overflow-y-auto text-sm"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-gray-400 italic">No matches</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt}
                  className={`px-3 py-2 cursor-pointer hover:bg-lavender transition-colors
                    ${opt === value ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-700'}`}
                  onClick={() => { onChange(opt); setOpen(false); setQuery(''); }}
                >
                  {opt}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number; dataKey: string; payload: Record<string, unknown> }>;
  label?: string;
}

const CustomChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm min-w-[200px]">
      <p className="font-semibold text-gray-800 mb-2">Year: {label}</p>
      {payload.map((entry) => {
        const seriesKey = entry.name; // e.g. "IIT Bombay – CSE [OPEN/AI] (Closing)"
        return (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 truncate max-w-[220px]">{seriesKey}</span>
            <span className="font-bold text-gray-900 ml-auto pl-2">{entry.value?.toLocaleString()}</span>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 mt-2 pt-1 border-t border-gray-100">
        Lower rank = higher merit
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CutoffExplorer: React.FC = () => {
  // ── View mode ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>({
    instituteType: 'ALL',
    instituteName: '',
    programme: '',
    seatPool: 'ALL',
    quota: 'ALL',
    genderPool: 'ALL',
    year: 'ALL',
    round: 6,
  });

  // ── Table sort / pagination ─────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // ── Chart state ─────────────────────────────────────────────────────────────
  const [chartMetric, setChartMetric] = useState<ChartMetric>('closing');
  const [chartSeries, setChartSeries] = useState<ChartSeries[]>([]);
  // Picker state for "Add Comparison"
  const [pickerInstitute, setPickerInstitute] = useState('');
  const [pickerProgramme, setPickerProgramme] = useState('');
  const [pickerQuota, setPickerQuota] = useState<Quota | ''>('');
  const [pickerSeatPool, setPickerSeatPool] = useState<SeatPool | ''>('');
  const [pickerGenderPool, setPickerGenderPool] = useState<GenderPool | ''>('');
  const [pickerError, setPickerError] = useState('');

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  // ── Filtered + sorted records ───────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let records = [...DEMO_CUTOFFS];

    if (filters.instituteType !== 'ALL') {
      records = records.filter((r) => r.instituteType === filters.instituteType);
    }
    if (filters.instituteName) {
      records = records.filter((r) =>
        r.instituteName.toLowerCase().includes(filters.instituteName.toLowerCase())
      );
    }
    if (filters.programme) {
      records = records.filter((r) =>
        r.programName.toLowerCase().includes(filters.programme.toLowerCase())
      );
    }
    if (filters.seatPool !== 'ALL') {
      records = records.filter((r) => r.seatPool === filters.seatPool);
    }
    if (filters.quota !== 'ALL') {
      records = records.filter((r) => r.quota === filters.quota);
    }
    if (filters.genderPool !== 'ALL') {
      records = records.filter((r) => r.genderPool === filters.genderPool);
    }
    if (filters.year !== 'ALL') {
      records = records.filter((r) => r.year === filters.year);
    }
    if (filters.round !== 'ALL') {
      records = records.filter((r) => r.round === filters.round);
    }

    // Sort
    records.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return records;
  }, [filters, sortField, sortDir]);

  // ── Trend lookup ────────────────────────────────────────────────────────────
  const trendMap = useMemo(() => {
    const map = new Map<string, number | undefined>();
    DEMO_CUTOFFS.forEach((r) => {
      const prevYear = r.year - 1;
      const prev = DEMO_CUTOFFS.find(
        (p) =>
          p.year === prevYear &&
          p.round === r.round &&
          p.instituteId === r.instituteId &&
          p.programName === r.programName &&
          p.quota === r.quota &&
          p.seatPool === r.seatPool &&
          p.genderPool === r.genderPool
      );
      map.set(r.id, prev?.closingRank);
    });
    return map;
  }, []);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pagedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Sort toggle ─────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  // ── Chart data construction ─────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (chartSeries.length === 0) return [];
    return YEARS.map((year) => {
      const entry: Record<string, unknown> = { year };
      chartSeries.forEach((series) => {
        const record = DEMO_CUTOFFS.find(
          (r) =>
            r.year === year &&
            r.round === 6 &&
            r.instituteName === series.instituteName &&
            r.programName === series.programName &&
            r.quota === series.quota &&
            r.seatPool === series.seatPool &&
            r.genderPool === series.genderPool
        );
        if (chartMetric === 'closing' || chartMetric === 'both') {
          entry[`${series.id}__closing`] = record?.closingRank ?? null;
        }
        if (chartMetric === 'opening' || chartMetric === 'both') {
          entry[`${series.id}__opening`] = record?.openingRank ?? null;
        }
      });
      return entry;
    });
  }, [chartSeries, chartMetric]);

  // ── Series management ───────────────────────────────────────────────────────
  const addSeries = useCallback(() => {
    if (!pickerInstitute || !pickerProgramme || !pickerQuota || !pickerSeatPool || !pickerGenderPool) {
      setPickerError('Please fill all fields before adding.');
      return;
    }
    if (chartSeries.length >= 4) {
      setPickerError('Maximum 4 series allowed.');
      return;
    }
    const id = seriesId({
      instituteName: pickerInstitute,
      programName: pickerProgramme,
      quota: pickerQuota as Quota,
      seatPool: pickerSeatPool as SeatPool,
      genderPool: pickerGenderPool as GenderPool,
    });
    if (chartSeries.find((s) => s.id === id)) {
      setPickerError('This series is already added.');
      return;
    }
    // Verify data exists
    const exists = DEMO_CUTOFFS.some(
      (r) =>
        r.instituteName === pickerInstitute &&
        r.programName === pickerProgramme &&
        r.quota === pickerQuota &&
        r.seatPool === pickerSeatPool &&
        r.genderPool === pickerGenderPool
    );
    if (!exists) {
      setPickerError('No data found for this combination in the demo dataset.');
      return;
    }
    setPickerError('');
    const colorIdx = chartSeries.length % CHART_COLORS.length;
    const newSeries: ChartSeries = {
      id,
      label: `${pickerInstitute} – ${pickerProgramme} [${pickerSeatPool}/${pickerQuota}]`,
      instituteName: pickerInstitute,
      programName: pickerProgramme,
      quota: pickerQuota as Quota,
      seatPool: pickerSeatPool as SeatPool,
      genderPool: pickerGenderPool as GenderPool,
      color: CHART_COLORS[colorIdx],
    };
    setChartSeries((prev) => [...prev, newSeries]);
  }, [pickerInstitute, pickerProgramme, pickerQuota, pickerSeatPool, pickerGenderPool, chartSeries]);

  const removeSeries = useCallback((id: string) => {
    setChartSeries((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Year-over-year movement for selected primary series ─────────────────────
  const primarySeries = chartSeries[0];
  const yoyData = useMemo(() => {
    if (!primarySeries) return [];
    return YEARS.map((year, i) => {
      const record = DEMO_CUTOFFS.find(
        (r) =>
          r.year === year &&
          r.round === 6 &&
          r.instituteName === primarySeries.instituteName &&
          r.programName === primarySeries.programName &&
          r.quota === primarySeries.quota &&
          r.seatPool === primarySeries.seatPool &&
          r.genderPool === primarySeries.genderPool
      );
      const prevRecord = i > 0
        ? DEMO_CUTOFFS.find(
            (r) =>
              r.year === YEARS[i - 1] &&
              r.round === 6 &&
              r.instituteName === primarySeries.instituteName &&
              r.programName === primarySeries.programName &&
              r.quota === primarySeries.quota &&
              r.seatPool === primarySeries.seatPool &&
              r.genderPool === primarySeries.genderPool
          )
        : undefined;

      const closingRank = record?.closingRank ?? null;
      const prevClosing = prevRecord?.closingRank ?? null;
      const change = closingRank !== null && prevClosing !== null ? closingRank - prevClosing : null;
      return { year, closingRank, change };
    });
  }, [primarySeries]);

  // ── Sort icon ───────────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Minus className="w-3.5 h-3.5 text-gray-300 inline ml-1" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    );
  };

  // ── Available institutes for picker filtered by selected programme ──────────
  const pickerInstituteOptions = useMemo(() => {
    let recs = DEMO_CUTOFFS;
    if (pickerProgramme) recs = recs.filter((r) => r.programName === pickerProgramme);
    return Array.from(new Set(recs.map((r) => r.instituteName))).sort();
  }, [pickerProgramme]);

  const pickerProgrammeOptions = useMemo(() => {
    let recs = DEMO_CUTOFFS;
    if (pickerInstitute) recs = recs.filter((r) => r.instituteName === pickerInstitute);
    return Array.from(new Set(recs.map((r) => r.programName))).sort();
  }, [pickerInstitute]);

  const pickerQuotaOptions = useMemo(() => {
    let recs = DEMO_CUTOFFS;
    if (pickerInstitute) recs = recs.filter((r) => r.instituteName === pickerInstitute);
    if (pickerProgramme) recs = recs.filter((r) => r.programName === pickerProgramme);
    return Array.from(new Set(recs.map((r) => r.quota))).sort();
  }, [pickerInstitute, pickerProgramme]);

  const pickerSeatPoolOptions = useMemo(() => {
    let recs = DEMO_CUTOFFS;
    if (pickerInstitute) recs = recs.filter((r) => r.instituteName === pickerInstitute);
    if (pickerProgramme) recs = recs.filter((r) => r.programName === pickerProgramme);
    if (pickerQuota) recs = recs.filter((r) => r.quota === pickerQuota);
    return Array.from(new Set(recs.map((r) => r.seatPool))).sort();
  }, [pickerInstitute, pickerProgramme, pickerQuota]);

  const pickerGenderPoolOptions = useMemo(() => {
    let recs = DEMO_CUTOFFS;
    if (pickerInstitute) recs = recs.filter((r) => r.instituteName === pickerInstitute);
    if (pickerProgramme) recs = recs.filter((r) => r.programName === pickerProgramme);
    if (pickerQuota) recs = recs.filter((r) => r.quota === pickerQuota);
    if (pickerSeatPool) recs = recs.filter((r) => r.seatPool === pickerSeatPool);
    return Array.from(new Set(recs.map((r) => r.genderPool))).sort();
  }, [pickerInstitute, pickerProgramme, pickerQuota, pickerSeatPool]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#101828]">Rank &amp; Cutoff Explorer</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Browse historical opening &amp; closing ranks from JoSAA counselling rounds
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${viewMode === 'table'
                    ? 'bg-white shadow-sm text-[#5145CD]'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Table2 className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${viewMode === 'chart'
                    ? 'bg-white shadow-sm text-[#5145CD]'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart2 className="w-4 h-4" />
                Chart
              </button>
            </div>
          </div>

          {/* ── Top-level disclaimer ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">⚠️ All data shown is DEMO DATA only.</span>{' '}
              Official opening and closing ranks must be imported from{' '}
              <a
                href="https://josaa.nic.in/or-cr/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                josaa.nic.in/or-cr/
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-[#5145CD]" />
            <span className="font-semibold text-gray-800 text-sm">Filters</span>
            <span className="ml-auto text-xs text-gray-400">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Institute type tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {INSTITUTE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter('instituteType', t.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
                  ${filters.instituteType === t.value
                    ? 'bg-[#5145CD] text-white border-[#5145CD]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#806BFF] hover:text-[#5145CD]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Institute name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Institute</label>
              <SearchableDropdown
                options={ALL_INSTITUTE_NAMES}
                value={filters.instituteName}
                onChange={(v) => setFilter('instituteName', v)}
                placeholder="All institutes"
                className="w-full"
              />
            </div>

            {/* Programme */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Programme</label>
              <SearchableDropdown
                options={ALL_PROGRAMME_NAMES}
                value={filters.programme}
                onChange={(v) => setFilter('programme', v)}
                placeholder="All programmes"
                className="w-full"
              />
            </div>

            {/* Category / Seat Pool */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <Select
                value={filters.seatPool}
                onChange={(v) => setFilter('seatPool', v as SeatPool | 'ALL')}
                options={SEAT_POOL_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                className="w-full"
              />
            </div>

            {/* Quota */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quota</label>
              <Select
                value={filters.quota}
                onChange={(v) => setFilter('quota', v as Quota | 'ALL')}
                options={QUOTA_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                className="w-full"
              />
            </div>

            {/* Gender pool */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gender Pool</label>
              <Select
                value={filters.genderPool}
                onChange={(v) => setFilter('genderPool', v as GenderPool | 'ALL')}
                options={GENDER_POOL_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                className="w-full"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
              <Select
                value={String(filters.year)}
                onChange={(v) => setFilter('year', v === 'ALL' ? 'ALL' : Number(v))}
                options={[
                  { label: 'All Years', value: 'ALL' },
                  ...YEARS.map((y) => ({ label: String(y), value: String(y) })),
                ]}
                className="w-full"
              />
            </div>

            {/* Round */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Round</label>
              <Select
                value={String(filters.round)}
                onChange={(v) => setFilter('round', v === 'ALL' ? 'ALL' : Number(v))}
                options={[
                  { label: 'All Rounds', value: 'ALL' },
                  ...ROUNDS.map((r) => ({ label: `Round ${r}`, value: String(r) })),
                ]}
                className="w-full"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    instituteType: 'ALL',
                    instituteName: '',
                    programme: '',
                    seatPool: 'ALL',
                    quota: 'ALL',
                    genderPool: 'ALL',
                    year: 'ALL',
                    round: 6,
                  });
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg
                  hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Table View ───────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Demo badge */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-[#F3F0FF]/40">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#806BFF]" />
                  <span className="text-xs text-[#5145CD] font-medium">
                    Showing illustrative demo data — {filteredRecords.length} records
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#806BFF] text-white px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {(
                        [
                          { label: 'Year', field: 'year' as SortField, minW: 'w-16' },
                          { label: 'Rd.', field: 'round' as SortField, minW: 'w-12' },
                          { label: 'Institute', field: 'instituteName' as SortField, minW: 'w-40' },
                          { label: 'Programme', field: 'programName' as SortField, minW: 'w-56' },
                          { label: 'Quota', field: 'quota' as SortField, minW: 'w-16' },
                          { label: 'Pool', field: 'seatPool' as SortField, minW: 'w-24' },
                          { label: 'Gender', field: 'genderPool' as SortField, minW: 'w-28' },
                          { label: 'Opening', field: 'openingRank' as SortField, minW: 'w-20' },
                          { label: 'Closing', field: 'closingRank' as SortField, minW: 'w-20' },
                          { label: 'Trend', field: null, minW: 'w-16' },
                        ] as Array<{ label: string; field: SortField | null; minW: string }>
                      ).map(({ label, field, minW }) => (
                        <th
                          key={label}
                          className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                            ${minW} ${field ? 'cursor-pointer select-none hover:text-[#5145CD]' : ''}`}
                          onClick={() => field && handleSort(field)}
                        >
                          {label}
                          {field && <SortIcon field={field} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-16 text-center text-gray-400">
                          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">No records match your filters</p>
                          <p className="text-xs mt-1">Try adjusting the filters above</p>
                        </td>
                      </tr>
                    ) : (
                      pagedRecords.map((record) => {
                        const prevClosing = trendMap.get(record.id);
                        const trend = rankTrend(record.closingRank, prevClosing);
                        return (
                          <tr key={record.id} className="hover:bg-[#F3F0FF]/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{record.year}</td>
                            <td className="px-4 py-3 text-gray-600">{record.round}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                                    ${record.instituteType === 'IIT' ? 'bg-blue-100 text-blue-700' :
                                      record.instituteType === 'NIT' ? 'bg-green-100 text-green-700' :
                                      record.instituteType === 'IIIT' ? 'bg-purple-100 text-purple-700' :
                                      'bg-gray-100 text-gray-600'}`}
                                >
                                  {record.instituteType}
                                </span>
                                <span className="text-gray-800 font-medium truncate max-w-[140px]">
                                  {record.instituteName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                              <span className="truncate block">{record.programName}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{record.quota}</td>
                            <td className="px-4 py-3">
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {record.seatPool}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{record.genderPool}</td>
                            <td className="px-4 py-3 text-gray-700 font-mono">
                              {record.openingRank.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-[#101828]">
                              {record.closingRank.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              {trend === 'up' && (
                                <span
                                  title="Harder to get (rank number increased)"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
                                >
                                  <TrendingUp className="w-3 h-3" /> ↑
                                </span>
                              )}
                              {trend === 'down' && (
                                <span
                                  title="Easier to get (rank number decreased)"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded"
                                >
                                  <TrendingDown className="w-3 h-3" /> ↓
                                </span>
                              )}
                              {trend === 'neutral' && (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRecords.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of{' '}
                    {filteredRecords.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm transition-colors
                            ${pageNum === page
                              ? 'bg-[#5145CD] text-white font-semibold'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Chart View ──────────────────────────────────────────────────────── */}
          {viewMode === 'chart' && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Chart panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#101828]">Rank Movement Analysis</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Round 6 closing ranks across counselling years
                    </p>
                  </div>
                  {/* Metric toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
                    {(
                      [
                        { label: 'Closing', value: 'closing' as ChartMetric },
                        { label: 'Opening', value: 'opening' as ChartMetric },
                        { label: 'Both', value: 'both' as ChartMetric },
                      ]
                    ).map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setChartMetric(m.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                          ${chartMetric === m.value
                            ? 'bg-white shadow-sm text-[#5145CD]'
                            : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Series picker */}
                <div className="bg-[#F3F0FF]/50 border border-[#806BFF]/20 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-[#5145CD] mb-3 uppercase tracking-wide">
                    Add Series to Chart (max 4)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
                    {/* Institute */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Institute</label>
                      <Select
                        value={pickerInstitute}
                        onChange={(v) => { setPickerInstitute(v); setPickerError(''); }}
                        options={[
                          { label: 'Select…', value: '' },
                          ...pickerInstituteOptions.map((n) => ({ label: n, value: n })),
                        ]}
                        className="w-full"
                      />
                    </div>
                    {/* Programme */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Programme</label>
                      <Select
                        value={pickerProgramme}
                        onChange={(v) => { setPickerProgramme(v); setPickerError(''); }}
                        options={[
                          { label: 'Select…', value: '' },
                          ...pickerProgrammeOptions.map((n) => ({ label: n, value: n })),
                        ]}
                        className="w-full"
                      />
                    </div>
                    {/* Quota */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quota</label>
                      <Select
                        value={pickerQuota}
                        onChange={(v) => { setPickerQuota(v as Quota | ''); setPickerError(''); }}
                        options={[
                          { label: 'Select…', value: '' },
                          ...pickerQuotaOptions.map((q) => ({ label: q, value: q })),
                        ]}
                        className="w-full"
                      />
                    </div>
                    {/* Seat Pool */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <Select
                        value={pickerSeatPool}
                        onChange={(v) => { setPickerSeatPool(v as SeatPool | ''); setPickerError(''); }}
                        options={[
                          { label: 'Select…', value: '' },
                          ...pickerSeatPoolOptions.map((s) => ({ label: s, value: s })),
                        ]}
                        className="w-full"
                      />
                    </div>
                    {/* Gender Pool */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Gender Pool</label>
                      <Select
                        value={pickerGenderPool}
                        onChange={(v) => { setPickerGenderPool(v as GenderPool | ''); setPickerError(''); }}
                        options={[
                          { label: 'Select…', value: '' },
                          ...pickerGenderPoolOptions.map((g) => ({ label: g, value: g })),
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {pickerError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {pickerError}
                    </p>
                  )}

                  <button
                    onClick={addSeries}
                    disabled={chartSeries.length >= 4}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#5145CD] hover:bg-[#4338b0]
                      disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {chartSeries.length === 0 ? 'Add Series' : 'Add Comparison'}
                  </button>
                </div>

                {/* Active series chips */}
                {chartSeries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chartSeries.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium"
                        style={{ borderColor: s.color, color: s.color, backgroundColor: `${s.color}15` }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="max-w-[200px] truncate">{s.label}</span>
                        <button
                          onClick={() => removeSeries(s.id)}
                          className="opacity-60 hover:opacity-100 transition-opacity ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chart or empty state */}
                {chartSeries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BarChart2 className="w-14 h-14 text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">Select a programme above to view rank trends</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You can compare up to 4 institute/programme combinations
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Note: Lower rank number = higher merit position (Y-axis is inverted)
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                          reversed
                          tickFormatter={(v: number) => v.toLocaleString()}
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: 'JoSAA Closing Rank',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                            style: { fontSize: 11, fill: '#9CA3AF' },
                          }}
                          width={80}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
                          formatter={(value: string) => (
                            <span className="text-gray-600 text-xs">{value}</span>
                          )}
                        />
                        {chartSeries.map((series, _si) => {
                          const color = series.color;
                          const altColor = `${color}99`;
                          return (
                            <React.Fragment key={series.id}>
                              {(chartMetric === 'closing' || chartMetric === 'both') && (
                                <Line
                                  type="monotone"
                                  dataKey={`${series.id}__closing`}
                                  name={`${series.label} (Closing)`}
                                  stroke={color}
                                  strokeWidth={2.5}
                                  dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 6 }}
                                  connectNulls={false}
                                />
                              )}
                              {(chartMetric === 'opening' || chartMetric === 'both') && (
                                <Line
                                  type="monotone"
                                  dataKey={`${series.id}__opening`}
                                  name={`${series.label} (Opening)`}
                                  stroke={altColor}
                                  strokeWidth={1.5}
                                  strokeDasharray="4 3"
                                  dot={{ r: 3, fill: altColor, strokeWidth: 1, stroke: '#fff' }}
                                  activeDot={{ r: 5 }}
                                  connectNulls={false}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>

              {/* ── Year-over-Year Movement Visualizer ──────────────────────────── */}
              {primarySeries && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#5145CD] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#101828]">Year-over-Year Rank Movement</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Primary series: <span className="font-medium text-[#5145CD]">{primarySeries.label}</span>
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
                            Year
                          </th>
                          <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Closing Rank
                          </th>
                          <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Change
                          </th>
                          <th className="py-2 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Direction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {yoyData.map(({ year, closingRank, change }) => (
                          <tr key={year} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-800">{year}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#101828]">
                              {closingRank !== null ? closingRank.toLocaleString() : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm">
                              {change === null ? (
                                <span className="text-gray-400">—</span>
                              ) : change === 0 ? (
                                <span className="text-gray-400">±0</span>
                              ) : change > 0 ? (
                                <span className="text-red-600 font-medium">+{change.toLocaleString()}</span>
                              ) : (
                                <span className="text-green-600 font-medium">{change.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {change === null ? (
                                <span className="text-gray-300 text-xs">Base year</span>
                              ) : change === 0 ? (
                                <span className="text-gray-400 text-xs">No change</span>
                              ) : change > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  <TrendingUp className="w-3 h-3" /> Harder
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <TrendingDown className="w-3 h-3" /> Easier
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Disclaimer note */}
                  <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                    <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Historical closing-rank movement is an indication of past counselling outcomes.{' '}
                      <strong>It does not guarantee future admission.</strong> Multiple factors including seat
                      matrix changes, exam difficulty, and candidate distribution influence each year's cutoffs.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CutoffExplorer;


