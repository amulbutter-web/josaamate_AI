import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, X, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../store/AppContext';
import StudioBadge from '../ui/StudioBadge';

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  studio: 'Intelligent Choice Studio',
  profile: 'Student Profile',
  explore: 'Explore Colleges',
  cutoffs: 'Rank & Cutoff Explorer',
  compare: 'College Comparison',
  preferences: 'Preference List',
  mistakes: 'Mistake Detector',
  timeline: 'Timeline Replay',
  report: 'Final Report',
  admin: 'Admin',
};

const buildBreadcrumbs = (pathname: string): BreadcrumbSegment[] => {
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [];
  let accumulated = '';
  for (const seg of segments) {
    accumulated += '/' + seg;
    crumbs.push({
      label: PATH_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      path: accumulated,
    });
  }
  return crumbs;
};

const getInitials = (name: string | undefined | null): string => {
  if (!name || name.trim() === '') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const profileName: string | undefined = state.profile?.name;
  const initials = getInitials(profileName);

  const isProfileComplete: boolean =
    !!state.profile?.name &&
    !!state.profile?.jeemainCRL &&
    !!state.profile?.category;

  const showProfileBanner = !isProfileComplete && !bannerDismissed;

  return (
    <header className="sticky top-0 z-20 flex flex-col bg-white border-b border-gray-100 shrink-0 w-full shadow-xs">
      {/* Profile Completion Banner */}
      <AnimatePresence>
        {showProfileBanner && (
          <motion.div
            key="profile-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-6 py-2">
              <p className="text-xs text-amber-800 font-medium">
                ⚡ Complete your profile to get personalized results —{' '}
                <button
                  onClick={() => navigate('/studio/profile')}
                  className="underline underline-offset-2 font-semibold hover:text-amber-900 transition-colors"
                >
                  Go to Profile
                </button>
              </p>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-amber-500 hover:text-amber-700 transition-colors ml-4 flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header row */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
          {breadcrumbs.length === 0 ? (
            <span className="text-sm text-gray-400">JOSAA MATE AI</span>
          ) : (
            breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                  )}
                  {isLast ? (
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-[220px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="text-sm text-gray-400 hover:text-indigo-600 transition-colors truncate max-w-[160px]"
                    >
                      {crumb.label}
                    </button>
                  )}
                </React.Fragment>
              );
            })
          )}
        </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* AI Assistant Quick Pill */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
            title="Open JoSAA AI Chat (Powered by Groq)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all font-semibold text-xs border border-indigo-200 shadow-xs"
          >
            <Sparkles size={14} className="text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">AI Chat</span>
            <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">
              Groq
            </span>
          </button>

          {/* Day / Night Mode Toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            title={state.theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 border border-gray-200"
            aria-label="Toggle Theme"
          >
            {state.theme === 'dark' ? (
              <Sun size={17} className="text-amber-500" />
            ) : (
              <Moon size={17} className="text-indigo-600" />
            )}
          </button>

          {/* Demo Data Badge */}
          <StudioBadge />

          {/* Notification Bell */}
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 border border-gray-200"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {/* Unread dot */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white" />
          </button>

          {/* User Avatar */}
          <div
            title={profileName ?? 'No profile set'}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold cursor-pointer select-none flex-shrink-0"
            onClick={() => navigate('/studio/profile')}
            style={{
              background:
                initials === '?'
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #5145CD 0%, #806BFF 100%)',
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

