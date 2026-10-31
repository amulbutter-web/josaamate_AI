// ====================================================
// JOSAA MATE AI – Preference Builder Page
// Drag-and-drop programme preference list builder.
// ====================================================
import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  X,
  Plus,
  Check,
  Download,
  FileText,
  Search,
  Filter,
  ListOrdered,
  AlertCircle,
  BookOpen,
  Save,
  Info,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '../store/AppContext';
import { DEMO_CUTOFFS, DEMO_PROGRAMMES } from '../data/demoData';
import type { PreferenceItem, InstituteType, EligibilityStatus } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

type Strategy = 'college_first' | 'branch_first' | 'balanced' | 'custom';

interface StrategyMeta {
  label: string;
  description: string;
  color: string;
}

const STRATEGY_META: Record<Strategy, StrategyMeta> = {
  college_first: {
    label: 'College First',
    description:
      'Prioritises the prestige and ranking of the institute. All programmes at your preferred institute come before the same branch at a lower-ranked one.',
    color: 'bg-indigo-100 text-indigo-700',
  },
  branch_first: {
    label: 'Branch First',
    description:
      'Prioritises your preferred field of study. Your top branch at different institutes appears before your second-choice branch anywhere.',
    color: 'bg-violet-100 text-violet-700',
  },
  balanced: {
    label: 'Balanced',
    description:
      'Mix of college prestige and branch preference. Aim for top branches at top institutes and accept trade-offs thoughtfully.',
    color: 'bg-teal-100 text-teal-700',
  },
  custom: {
    label: 'Custom',
    description:
      'You have manually arranged this list based on your own research and priorities. The order is fully under your control.',
    color: 'bg-amber-100 text-amber-700',
  },
};

const ELIGIBILITY_BADGES: Record<EligibilityStatus, { label: string; className: string }> = {
  eligible: { label: 'Eligible', className: 'bg-green-100 text-green-700' },
  not_eligible: { label: 'Not Eligible', className: 'bg-red-100 text-red-700' },
  requires_verification: { label: 'Verify', className: 'bg-amber-100 text-amber-700' },
  insufficient_info: { label: 'Info Needed', className: 'bg-gray-100 text-gray-600' },
};

const INSTITUTE_TYPE_COLORS: Record<string, string> = {
  IIT: 'bg-[#5145CD] text-white',
  NIT: 'bg-[#806BFF] text-white',
  IIIT: 'bg-teal-500 text-white',
  GFTI: 'bg-gray-500 text-white',
};

// ─── Helper: lookup closing rank ────────────────────────────────────────────

function getClosingRank(
  instituteId: string,
  programName: string,
  seatPool: string,
  year = 2024,
): number | undefined {
  const record = DEMO_CUTOFFS.find(
    (c) =>
      c.instituteId === instituteId &&
      c.programName === programName &&
      c.seatPool === seatPool &&
      c.year === year,
  );
  return record?.closingRank;
}

// ─── SortableItem ─────────────────────────────────────────────────────────

interface SortableItemProps {
  item: PreferenceItem;
  onRemove: (id: string) => void;
  onNoteChange: (id: string, notes: string) => void;
}

function SortableItem({ item, onRemove, onNoteChange }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const eligBadge = ELIGIBILITY_BADGES[item.eligibilityStatus];
  const typeColor = INSTITUTE_TYPE_COLORS[item.instituteType] ?? 'bg-gray-400 text-white';
  const closingRank = item.closingRank2024 ?? getClosingRank(item.instituteId, item.programName, item.seatPool);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-3 group transition-shadow
        ${isDragging ? 'shadow-xl ring-2 ring-[#806BFF]' : 'hover:shadow-md'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 flex items-center text-gray-300 cursor-grab active:cursor-grabbing hover:text-[#806BFF] transition-colors"
        title="Drag to reorder"
      >
        <GripVertical size={20} />
      </div>

      {/* Order Badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F0FF] text-[#5145CD] font-bold text-sm flex items-center justify-center">
        {item.order}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
            {item.instituteType}
          </span>
          <span className="font-semibold text-[#101828] text-sm truncate">{item.instituteName}</span>
        </div>

        <p className="text-sm text-gray-700 mb-2 leading-snug">{item.programName}</p>

        <div className="flex flex-wrap gap-2 text-xs mb-2">
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Pool: <strong>{item.seatPool}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Quota: <strong>{item.quota}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${eligBadge.className}`}>
            {eligBadge.label}
          </span>
          {closingRank !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              CR '24: <strong>{closingRank.toLocaleString()}</strong>
            </span>
          )}
        </div>

        {/* Inline Notes */}
        <input
          type="text"
          placeholder="Add a personal note (e.g. 'Top choice', 'Safety option')…"
          value={item.notes ?? ''}
          onChange={(e) => onNoteChange(item.id, e.target.value)}
          className="w-full text-xs text-gray-500 bg-[#F8F9FC] border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#806BFF] placeholder-gray-400"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 self-start p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Remove from list"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PreferenceBuilder() {
  const { state, dispatch } = useApp();

  // Local copy so the user must explicitly SAVE
  const [localItems, setLocalItems] = useState<PreferenceItem[]>(() =>
    [...state.preferenceList.items],
  );
  const [strategy, setStrategy] = useState<Strategy>(state.preferenceList.strategy);
  const [saved, setSaved] = useState(false);

  // Right panel state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InstituteType | 'ALL'>('ALL');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── DnD handler ─────────────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalItems((prev) => {
        const oldIdx = prev.findIndex((i) => i.id === active.id);
        const newIdx = prev.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(prev, oldIdx, newIdx).map((it, idx) => ({
          ...it,
          order: idx + 1,
        }));
        return reordered;
      });
    }
  }

  // ── Add / Remove / Note ─────────────────────────────────────────────────

  function handleAdd(prog: (typeof DEMO_PROGRAMMES)[0]) {
    const isDupe = localItems.some(
      (i) =>
        i.instituteId === prog.instituteId &&
        i.programName === prog.programName &&
        i.seatPool === (state.profile?.category ?? 'OPEN'),
    );
    if (isDupe) return;

    const seatPool = (state.profile?.category ?? 'OPEN') as PreferenceItem['seatPool'];
    const quota = prog.instituteType === 'IIT' ? 'AI' : 'OS';
    const closingRank = getClosingRank(prog.instituteId, prog.programName, seatPool);

    const newItem: PreferenceItem = {
      id: `${prog.id}-${Date.now()}`,
      order: localItems.length + 1,
      instituteId: prog.instituteId,
      instituteName: prog.instituteName,
      instituteType: prog.instituteType,
      programName: prog.programName,
      quota: quota as PreferenceItem['quota'],
      seatPool,
      genderPool: 'Gender-Neutral',
      eligibilityStatus: determineEligibility(prog.instituteType),
      closingRank2024: closingRank,
      notes: '',
    };
    setLocalItems((prev) => [...prev, newItem]);
  }

  function determineEligibility(instituteType: InstituteType): EligibilityStatus {
    const profile = state.profile;
    if (!profile) return 'insufficient_info';
    if (instituteType === 'IIT') {
      if (!profile.jeeAdvancedQualified) return 'not_eligible';
      if (!profile.jeeAdvancedRank) return 'requires_verification';
    }
    if (!profile.jeemainCRL) return 'insufficient_info';
    return 'eligible';
  }

  function handleRemove(id: string) {
    setLocalItems((prev) =>
      prev.filter((i) => i.id !== id).map((it, idx) => ({ ...it, order: idx + 1 })),
    );
  }

  function handleNoteChange(id: string, notes: string) {
    setLocalItems((prev) => prev.map((it) => (it.id === id ? { ...it, notes } : it)));
  }

  // ── Save ────────────────────────────────────────────────────────────────

  function handleSave() {
    dispatch({ type: 'REORDER_PREFERENCES', payload: localItems });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── CSV Export ───────────────────────────────────────────────────────────

  function handleExportCSV() {
    const header = 'Order,Institute,Programme,Pool,Quota,Closing Rank 2024\n';
    const rows = localItems
      .map(
        (it) =>
          `${it.order},"${it.instituteName}","${it.programName}",${it.seatPool},${it.quota},${it.closingRank2024 ?? 'N/A'}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'josaa_preference_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── PDF Export ───────────────────────────────────────────────────────────

  function handleExportPDF() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 20;
    let y = margin;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(16, 24, 40); // #101828
    doc.text('JOSAA MATE AI \u2013 My Preference List', margin, y);
    y += 8;

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`, margin, y);
    y += 6;

    // Student info
    const profile = state.profile;
    if (profile?.name) {
      doc.text(`Student: ${profile.name}`, margin, y);
      y += 5;
    }
    if (profile?.jeemainCRL) {
      doc.text(`JEE Main CRL: ${profile.jeemainCRL.toLocaleString()}`, margin, y);
      y += 5;
    }
    if (profile?.jeeAdvancedRank) {
      doc.text(`JEE Advanced Rank: ${profile.jeeAdvancedRank.toLocaleString()}`, margin, y);
      y += 5;
    }
    y += 4;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 210 - margin, y);
    y += 7;

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('#', margin, y);
    doc.text('Institute', margin + 10, y);
    doc.text('Programme', margin + 70, y);
    doc.text('CR 2024', 210 - margin - 15, y, { align: 'right' });
    y += 5;
    doc.line(margin, y, 210 - margin, y);
    y += 5;

    // Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    localItems.forEach((it) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.setTextColor(40, 40, 40);
      doc.text(String(it.order), margin, y);
      const instTrunc = it.instituteName.length > 25 ? it.instituteName.substring(0, 23) + '…' : it.instituteName;
      doc.text(instTrunc, margin + 10, y);
      const progTrunc = it.programName.length > 30 ? it.programName.substring(0, 28) + '…' : it.programName;
      doc.text(progTrunc, margin + 70, y);
      doc.text(it.closingRank2024 ? it.closingRank2024.toLocaleString() : '—', 210 - margin - 15, y, { align: 'right' });
      y += 7;
      if (it.notes) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text(`   Note: ${it.notes}`, margin + 10, y);
        doc.setFontSize(9);
        y += 5;
      }
    });

    // Disclaimer
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 210 - margin, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      'Disclaimer: This is a personal decision-support document. Not an official JoSAA submission.',
      margin,
      y,
    );
    y += 4;
    doc.text(
      'All cutoff data shown is illustrative demo data. Verify official cutoffs at josaa.nic.in.',
      margin,
      y,
    );

    doc.save('JOSAA_MATE_AI_Preference_List.pdf');
  }

  // ── Filtered programme list for right panel ───────────────────────────────

  const filteredProgrammes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return DEMO_PROGRAMMES.filter((p) => {
      const matchesType = typeFilter === 'ALL' || p.instituteType === typeFilter;
      const matchesSearch =
        !q ||
        p.instituteName.toLowerCase().includes(q) ||
        p.programName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [searchQuery, typeFilter]);

  const addedIds = useMemo(
    () =>
      new Set(
        localItems.map((i) => `${i.instituteId}||${i.programName}`),
      ),
    [localItems],
  );

  const isAdded = (p: (typeof DEMO_PROGRAMMES)[0]) =>
    addedIds.has(`${p.instituteId}||${p.programName}`);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#101828] flex items-center gap-2">
              <ListOrdered className="text-[#5145CD]" size={26} />
              Preference Builder
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Build and arrange your programme preference list. Drag to reorder.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#5145CD] hover:bg-[#4338ca] text-white'
              }`}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Saved!' : 'Save List'}
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:border-[#806BFF] hover:text-[#806BFF] transition-all"
            >
              <FileText size={15} />
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:border-[#806BFF] hover:text-[#806BFF] transition-all"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Autonomy Notice ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 pt-5">
        <div className="bg-[#F3F0FF] border border-[#806BFF]/30 rounded-xl px-4 py-3 flex gap-3 items-start">
          <Info size={18} className="text-[#5145CD] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#5145CD] font-medium leading-snug">
            <strong>Your preference order reflects YOUR priorities.</strong> The system will never
            automatically reorder your choices. Add all eligible programmes you genuinely want to
            consider.
          </p>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ════ LEFT PANEL (60%) ════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Strategy Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#101828]">My Preference List</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3F0FF] text-[#5145CD]">
                  {localItems.length} {localItems.length === 1 ? 'choice' : 'choices'}
                </span>
              </div>

              {/* Strategy dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Strategy:</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as Strategy)}
                  className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#806BFF]"
                >
                  {Object.entries(STRATEGY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Strategy description */}
            <div className={`text-xs rounded-lg px-3 py-2 ${STRATEGY_META[strategy].color}`}>
              <span className="font-semibold">{STRATEGY_META[strategy].label}: </span>
              {STRATEGY_META[strategy].description}
              {strategy !== 'custom' && (
                <span className="block mt-1 font-semibold">
                  Final order is always your choice — this label helps you reason about your list.
                </span>
              )}
            </div>
          </div>

          {/* DnD List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
            {localItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium mb-1">No choices added yet.</p>
                <p className="text-sm text-gray-400">
                  Search and add programmes from the right panel to build your list.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {localItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                        >
                          <SortableItem
                            item={item}
                            onRemove={handleRemove}
                            onNoteChange={handleNoteChange}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Strategy Info Box */}
          <div className="bg-[#101828] rounded-2xl p-5 text-white text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#806BFF]" />
              Understanding Strategies
            </h3>
            <ul className="space-y-1.5 text-gray-300 text-xs">
              <li>
                <span className="text-white font-medium">College First:</span> Rank by institute
                prestige. Great if brand/placement matters most.
              </li>
              <li>
                <span className="text-white font-medium">Branch First:</span> Rank by preferred
                subject. Great if you know your career path.
              </li>
              <li>
                <span className="text-white font-medium">Balanced:</span> Mix both. Recommended for
                most students.
              </li>
              <li>
                <span className="text-white font-medium">Custom:</span> Your manual order. Reflects
                your unique research and reasoning.
              </li>
            </ul>
            <p className="mt-3 text-[#806BFF] font-semibold text-xs">
              ⚠ Your final preference order is always under your complete control. JOSAA MATE AI
              never reorders your list automatically.
            </p>
          </div>
        </div>

        {/* ════ RIGHT PANEL (40%) ═══════════════════════════════════════════ */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-120px)] overflow-hidden">
            <div>
              <h2 className="text-lg font-bold text-[#101828] mb-1">Add Choices</h2>
              <p className="text-xs text-gray-400">
                Browse programmes and add them to your preference list.
              </p>
            </div>

            {/* Rank note */}
            {state.profile?.jeemainCRL && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                Comparing to your JEE Main CRL:{' '}
                <strong>{state.profile.jeemainCRL.toLocaleString()}</strong>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search institute or branch…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#806BFF] bg-[#F8F9FC]"
              />
            </div>

            {/* Type filter */}
            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'IIT', 'NIT', 'IIIT', 'GFTI'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                    typeFilter === t
                      ? 'bg-[#5145CD] text-white border-[#5145CD]'
                      : 'border-gray-200 text-gray-500 hover:border-[#806BFF] hover:text-[#806BFF]'
                  }`}
                >
                  {t}
                </button>
              ))}
              <Filter size={14} className="text-gray-300 self-center ml-auto" />
            </div>

            {/* Programme list */}
            <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-1">
              {filteredProgrammes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No programmes match your search.
                </div>
              ) : (
                filteredProgrammes.map((prog) => {
                  const added = isAdded(prog);
                  const cr = getClosingRank(prog.instituteId, prog.programName, state.profile?.category ?? 'OPEN');

                  return (
                    <motion.div
                      key={prog.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#806BFF]/40 hover:bg-[#F3F0FF]/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              INSTITUTE_TYPE_COLORS[prog.instituteType]
                            }`}
                          >
                            {prog.instituteType}
                          </span>
                          <span className="text-xs font-semibold text-[#101828] truncate">
                            {prog.instituteName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-snug">{prog.programName}</p>
                        {cr !== undefined && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            CR '24:{' '}
                            <span className="font-semibold text-gray-600">
                              {cr.toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => !added && handleAdd(prog)}
                        disabled={added}
                        className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          added
                            ? 'bg-green-50 text-green-600 cursor-default'
                            : 'bg-[#5145CD] text-white hover:bg-[#4338ca]'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check size={12} />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            Add
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
