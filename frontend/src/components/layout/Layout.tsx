import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PanelLeftOpen } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import AiChatBox from '../chat/AiChatBox';
import { useApp } from '../../store/AppContext';

export default function Layout() {
  const { state, dispatch } = useApp();

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-background dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden relative">
      {/* Mobile backdrop for sidebar */}
      {state.sidebarOpen && (
        <div
          onClick={() => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false })}
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Floating edge tab when sidebar is closed */}
      {!state.sidebarOpen && (
        <button
          onClick={() => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: true })}
          title="Open Sidebar (Ctrl+B)"
          className="fixed left-0 top-20 z-30 flex items-center gap-1.5 px-3 py-2 rounded-r-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all text-xs font-semibold group cursor-pointer"
        >
          <PanelLeftOpen size={16} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Sidebar</span>
        </button>
      )}

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin dark:bg-slate-950">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Chat Assistant (Amazon Rufus Style) */}
      <AiChatBox />
    </div>
  );
}
