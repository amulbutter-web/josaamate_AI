import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import CutoffExplorer from './pages/CutoffExplorer';
import ComparisonPage from './pages/ComparisonPage';
import PreferenceBuilder from './pages/PreferenceBuilder';
import MistakeDetector from './pages/MistakeDetector';
import TimelineReplay from './pages/TimelineReplay';
import ReportPage from './pages/ReportPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="studio" element={<Studio />} />
            <Route path="studio/profile" element={<ProfilePage />} />
            <Route path="studio/explore" element={<ExplorePage />} />
            <Route path="studio/cutoffs" element={<CutoffExplorer />} />
            <Route path="studio/compare" element={<ComparisonPage />} />
            <Route path="studio/preferences" element={<PreferenceBuilder />} />
            <Route path="studio/mistakes" element={<MistakeDetector />} />
            <Route path="studio/timeline" element={<TimelineReplay />} />
            <Route path="studio/report" element={<ReportPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
