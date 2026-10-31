import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Search,
  TrendingUp,
  Scale,
  ListOrdered,
  ShieldAlert,
  History,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const [studioOpen, setStudioOpen] = useState<boolean>(true);

  const preferenceCount = state.preferenceList?.items?.length ?? 0;

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const mainNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
  ];

  const studioChildren: NavItem[] = [
    { label: 'Student Profile', path: '/studio/profile', icon: <User size={16} /> },
    { label: 'Explore Colleges', path: '/studio/explore', icon: <Search size={16} /> },
    { label: 'Rank & Cutoff Explorer', path: '/studio/cutoffs', icon: <TrendingUp size={16} /> },
    { label: 'College Comparison', path: '/studio/compare', icon: <Scale size={16} /> },
    {
      label: 'Preference List',
      path: '/studio/preferences',
      icon: <ListOrdered size={16} />,
      badge: preferenceCount,
    },
    { label: 'Mistake Detector', path: '/studio/mistakes', icon: <ShieldAlert size={16} /> },
    { label: 'Timeline Replay', path: '/studio/timeline', icon: <History size={16} /> },
    { label: 'Final Report', path: '/studio/report', icon: <FileText size={16} /> },
  ];

  const bottomNavItems: NavItem[] = [
    { label: 'Admin', path: '/admin', icon: <Settings size={18} /> },
  ];

  const baseItemClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 select-none';
  const activeClass = 'bg-indigo-50 text-indigo-700 font-semibold';
  const inactiveClass = 'text-gray-500 hover:bg-gray-50 hover:text-gray-700';

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out select-none ${
        state.sidebarOpen
          ? 'w-64 opacity-100'
          : 'w-0 border-r-0 opacity-0 pointer-events-none'
      }`}
      aria-label="Main Navigation"
    >
      <div className="w-64 h-full flex flex-col shrink-0 overflow-hidden">
        {/* Logo & Close Button */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 shrink-0">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-sm shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #5145CD 0%, #806BFF 100%)',
            }}
          >
            JM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 leading-tight tracking-wide truncate">
              JOSAA MATE AI
            </p>
            <p className="text-[10px] text-gray-400 leading-tight truncate mt-0.5">
              Your Rank. Your Choices. Your Future.
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false })}
            title="Close sidebar (Ctrl+B)"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors shrink-0 border border-gray-200 dark:border-slate-700"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* Collapse Button Bar */}
        <div className="pb-1.5">
          <button
            onClick={() => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false })}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all border border-dashed border-gray-200 dark:border-slate-700"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <span className="flex items-center gap-1.5">
              <PanelLeftClose size={14} />
              <span>Hide Sidebar</span>
            </span>
            <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
              Ctrl+B
            </span>
          </button>
        </div>
        {/* Main nav */}
        {mainNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full ${baseItemClass} ${isActive(item.path) ? activeClass : inactiveClass}`}
          >
            <span className={isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}

        {/* AI Assistant Quick Trigger in Sidebar */}
        <button
          onClick={() => dispatch({ type: 'SET_CHAT_OPEN', payload: true })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:from-indigo-500/20 hover:to-violet-500/20 transition-all shadow-xs my-2 group select-none"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-bold truncate">AI Counselling Chat</p>
            <p className="text-[10px] text-indigo-500/80 dark:text-indigo-400 truncate">Ask Cutoffs & Rules</p>
          </div>
          <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
            GROQ
          </span>
        </button>

        {/* Divider */}
        <div className="pt-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1">
            Intelligent Choice Studio
          </p>
        </div>

        {/* Studio collapsible */}
        <button
          onClick={() => setStudioOpen((prev) => !prev)}
          className={`w-full ${baseItemClass} ${
            location.pathname.startsWith('/studio') ? activeClass : inactiveClass
          }`}
        >
          <span
            className={
              location.pathname.startsWith('/studio') ? 'text-indigo-600' : 'text-gray-400'
            }
          >
            <Sparkles size={18} />
          </span>
          <span className="flex-1 text-left">Studio</span>
          <span className="text-gray-400 transition-transform duration-200">
            {studioOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>

        {/* Studio children */}
        <AnimatePresence initial={false}>
          {studioOpen && (
            <motion.div
              key="studio-children"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-3 border-l-2 border-indigo-100 space-y-0.5 py-1">
                {studioChildren.map((child) => (
                  <button
                    key={child.path}
                    onClick={() => navigate(child.path)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150 select-none ${
                      isActive(child.path)
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <span className={isActive(child.path) ? 'text-indigo-500' : 'text-gray-400'}>
                      {child.icon}
                    </span>
                    <span className="flex-1 text-left leading-tight">{child.label}</span>
                    {child.badge !== undefined && child.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        {child.badge > 99 ? '99+' : child.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-gray-100 px-3 py-3 space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full ${baseItemClass} ${isActive(item.path) ? activeClass : inactiveClass}`}
          >
            <span className={isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}

        {/* Day / Night Mode Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border border-gray-100"
          title="Toggle Day/Night mode"
        >
          <span className="flex items-center gap-2">
            {state.theme === 'dark' ? (
              <Sun size={15} className="text-amber-500" />
            ) : (
              <Moon size={15} className="text-indigo-600" />
            )}
            <span className="font-medium text-gray-700">
              {state.theme === 'dark' ? 'Day Mode' : 'Night Mode'}
            </span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {state.theme}
          </span>
        </button>

        {/* Disclaimer badge */}
        <div className="mx-1 mt-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <p className="text-[9px] leading-relaxed text-gray-400 text-center">
            Not affiliated with JoSAA, JAB or any government body. Data is illustrative only.
          </p>
        </div>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;

