// ====================================================
// JOSAA MATE AI – App Store (Global State)
// Using React Context + useReducer
// ====================================================
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { StudentProfile, PreferenceList, PreferenceItem, AuditReport, StudioProgress } from '../types';

interface AppState {
  profile: StudentProfile | null;
  preferenceList: PreferenceList;
  auditReport: AuditReport | null;
  progress: StudioProgress;
  activeView: string;
  isProfileComplete: boolean;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  chatOpen: boolean;
}

type AppAction =
  | { type: 'SET_PROFILE'; payload: StudentProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<StudentProfile> }
  | { type: 'ADD_PREFERENCE'; payload: PreferenceItem }
  | { type: 'REMOVE_PREFERENCE'; payload: string }
  | { type: 'REORDER_PREFERENCES'; payload: PreferenceItem[] }
  | { type: 'SET_AUDIT_REPORT'; payload: AuditReport }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<StudioProgress> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_CHAT_OPEN'; payload: boolean };

const defaultProfile: StudentProfile = {
  name: '',
  email: '',
  jeemainCRL: null,
  jeemainCategoryRank: null,
  jeeAdvancedRank: null,
  jeeAdvancedCategoryRank: null,
  jeeAdvancedQualified: false,
  category: 'OPEN',
  isPwD: false,
  gender: 'Male',
  homeState: '',
  nationality: 'Indian',
  class12Percentage: null,
  class12Year: null,
  preferredInstitutes: ['ALL'],
  preferredBranches: [],
  preferredStates: [],
  institutePriority: 'balanced',
  branchPriority: [],
};

const defaultPreferenceList: PreferenceList = {
  id: 'default',
  name: 'My Preference List',
  strategy: 'balanced',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProgress: StudioProgress = {
  profileComplete: false,
  eligibilityVerified: false,
  collegesExplored: false,
  preferenceListCreated: false,
  preferenceAuditDone: false,
  reportGenerated: false,
  totalSteps: 6,
  completedSteps: 0,
};

function calcProgress(state: AppState): StudioProgress {
  const p = { ...state.progress };
  const profile = state.profile;
  p.profileComplete = !!(profile && profile.name && profile.jeemainCRL && profile.homeState && profile.category);
  p.preferenceListCreated = state.preferenceList.items.length > 0;
  p.preferenceAuditDone = !!state.auditReport;
  p.completedSteps = [p.profileComplete, p.eligibilityVerified, p.collegesExplored, p.preferenceListCreated, p.preferenceAuditDone, p.reportGenerated].filter(Boolean).length;
  return p;
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, isProfileComplete: true };
    case 'UPDATE_PROFILE':
      return { ...state, profile: state.profile ? { ...state.profile, ...action.payload } : { ...defaultProfile, ...action.payload } };
    case 'ADD_PREFERENCE': {
      const exists = state.preferenceList.items.find(i => i.instituteId === action.payload.instituteId && i.programName === action.payload.programName && i.seatPool === action.payload.seatPool);
      if (exists) return state;
      const newItems = [...state.preferenceList.items, { ...action.payload, order: state.preferenceList.items.length + 1 }];
      const newList = { ...state.preferenceList, items: newItems, updatedAt: new Date().toISOString() };
      const newState = { ...state, preferenceList: newList };
      return { ...newState, progress: calcProgress(newState) };
    }
    case 'REMOVE_PREFERENCE': {
      const newItems = state.preferenceList.items.filter(i => i.id !== action.payload).map((it, idx) => ({ ...it, order: idx + 1 }));
      return { ...state, preferenceList: { ...state.preferenceList, items: newItems, updatedAt: new Date().toISOString() } };
    }
    case 'REORDER_PREFERENCES': {
      const reordered = action.payload.map((it, idx) => ({ ...it, order: idx + 1 }));
      return { ...state, preferenceList: { ...state.preferenceList, items: reordered, updatedAt: new Date().toISOString() } };
    }
    case 'SET_AUDIT_REPORT':
      return { ...state, auditReport: action.payload, progress: { ...state.progress, preferenceAuditDone: true, completedSteps: state.progress.completedSteps + (state.progress.preferenceAuditDone ? 0 : 1) } };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_CHAT':
      return { ...state, chatOpen: !state.chatOpen };
    case 'SET_CHAT_OPEN':
      return { ...state, chatOpen: action.payload };
    default:
      return state;
  }
}

const STORAGE_KEY = 'josaa_mate_ai_state';

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profile: state.profile,
      preferenceList: state.preferenceList,
      sidebarOpen: state.sidebarOpen,
      theme: state.theme,
    }));
  } catch { /* ignore */ }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = loadState();
  const initial: AppState = {
    profile: saved.profile ?? null,
    preferenceList: saved.preferenceList ?? defaultPreferenceList,
    auditReport: null,
    progress: defaultProgress,
    activeView: 'dashboard',
    isProfileComplete: false,
    sidebarOpen: saved.sidebarOpen !== undefined ? saved.sidebarOpen : true,
    theme: saved.theme ?? 'light',
    chatOpen: false,
  };

  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { defaultProfile };
