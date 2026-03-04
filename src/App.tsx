import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomTabBar from './components/layout/BottomTabBar';
import LogPage from './pages/LogPage';
import HistoryPage from './pages/HistoryPage';
import DiagnosisDetailPage from './pages/DiagnosisDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-full flex flex-col bg-surface">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LogPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/diagnosis/:id" element={<DiagnosisDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomTabBar />
      </div>
    </BrowserRouter>
  );
}
