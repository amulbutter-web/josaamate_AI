import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Upload, Database, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';

const DATA_SOURCES = [
  { name: 'JoSAA Official', url: 'https://josaa.nic.in/', lastUpdated: null, status: 'demo', records: 0 },
  { name: 'Opening/Closing Ranks Archive', url: 'https://josaa.nic.in/or-cr/', lastUpdated: null, status: 'demo', records: 24 },
  { name: 'JEE Main (NTA)', url: 'https://jeemain.nta.nic.in/', lastUpdated: null, status: 'demo', records: 0 },
  { name: 'JEE Advanced', url: 'https://jeeadv.ac.in/', lastUpdated: null, status: 'demo', records: 0 },
  { name: 'NIRF Rankings', url: 'https://www.nirfindia.org/', lastUpdated: null, status: 'demo', records: 0 },
];

const IMPORT_CARDS = [
  {
    title: 'Institute Data', icon: '🏛️',
    description: 'Import the list of institutes participating in JoSAA counselling.',
    format: 'CSV columns: id, name, short_name, type (IIT/NIT/IIIT/GFTI), state, city, website',
    source: 'josaa.nic.in',
    lastUpdated: 'Not imported — using 16 demo institutes',
  },
  {
    title: 'Programme Data', icon: '📚',
    description: 'Import programmes offered by each institute.',
    format: 'CSV columns: id, institute_id, program_name, duration, degree, state, city',
    source: 'josaa.nic.in',
    lastUpdated: 'Not imported — using 23 demo programmes',
  },
  {
    title: 'Opening & Closing Ranks', icon: '📊',
    description: 'Import historical JoSAA opening and closing ranks by year, round, quota, seat pool.',
    format: 'CSV columns: year, round, institute_id, program_name, quota, seat_pool, gender_pool, opening_rank, closing_rank, rank_type',
    source: 'josaa.nic.in/or-cr/',
    lastUpdated: 'Not imported — using 24 demo cutoff records',
  },
  {
    title: 'Counselling Schedule', icon: '📅',
    description: 'Import the official JoSAA counselling schedule with phase dates.',
    format: 'CSV columns: year, phase_name, start_date, end_date, description',
    source: 'josaa.nic.in',
    lastUpdated: 'Not imported — using 2026 illustrative schedule',
  },
  {
    title: 'Eligibility Rules', icon: '⚖️',
    description: 'Import official eligibility rule overrides for specific years.',
    format: 'JSON format — see backend documentation',
    source: 'josaa.nic.in/document-category/business-rules/',
    lastUpdated: 'Not imported — using built-in rule engine',
  },
];

const QUALITY_STATS = [
  { label: 'Institutes', value: 16, note: '(demo)', color: 'text-indigo-600' },
  { label: 'Programmes', value: 23, note: '(demo)', color: 'text-indigo-600' },
  { label: 'Cutoff Records', value: 24, note: '(demo)', color: 'text-indigo-600' },
  { label: 'Schedule Entries', value: 11, note: '(demo)', color: 'text-indigo-600' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'sources' | 'quality'>('import');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={22} className="text-indigo-600" />
          <h1 className="section-heading">Admin – Data Management</h1>
        </div>
        <p className="section-subheading">Manage official JoSAA data imports, sources and quality for JOSAA MATE AI.</p>
      </div>

      <div className="card p-4 bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-800">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <span>This page is for authorised administrators only. Currently running on <strong>demo data</strong>. Import official data to enable full platform functionality.</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['import', 'Data Import'], ['sources', 'Data Sources'], ['quality', 'Data Quality']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{label}</button>
        ))}
      </div>

      {/* Import tab */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          {IMPORT_CARDS.map(card => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{card.description}</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 px-2 py-1 rounded-lg">{card.format}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Source: <a href={`https://${card.source}`} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline inline-flex items-center gap-0.5">
                        {card.source} <ExternalLink size={10} />
                      </a>
                    </p>
                    <p className="text-xs text-amber-600 mt-1">Status: {card.lastUpdated}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed select-none">
                    <Upload size={14} />
                    <span>Choose File</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">Backend API required</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sources tab */}
      {activeTab === 'sources' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Source', 'Official URL', 'Last Updated', 'Status', 'Records'].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map(src => (
                <tr key={src.name} className="table-row">
                  <td className="table-cell font-medium text-gray-800 px-4">{src.name}</td>
                  <td className="table-cell px-4">
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 text-xs hover:underline inline-flex items-center gap-1">
                      {src.url} <ExternalLink size={10} />
                    </a>
                  </td>
                  <td className="table-cell px-4 text-gray-400 text-xs">{src.lastUpdated ?? '—'}</td>
                  <td className="table-cell px-4">
                    <span className="badge badge-warning">⚠ Demo Data</span>
                  </td>
                  <td className="table-cell px-4">{src.records}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quality tab */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUALITY_STATS.map(s => (
              <div key={s.label} className="card text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-600 mt-1">{s.label}</p>
                <p className="text-xs text-amber-500 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
          <div className="card p-5 bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Database size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Currently running on demo data</p>
                <p className="text-amber-700 text-sm mt-1">
                  Import official JoSAA opening and closing ranks from{' '}
                  <a href="https://josaa.nic.in/or-cr/" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium">josaa.nic.in/or-cr/</a>{' '}
                  to enable accurate rank analysis. Use the Data Import tab above.
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4 bg-green-50 border border-green-100 flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={15} />
            <span>Database schema, API endpoints and import pipeline are ready. Connect official CSV exports to activate.</span>
          </div>
        </div>
      )}
    </div>
  );
}
