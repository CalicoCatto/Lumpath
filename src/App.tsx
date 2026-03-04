import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomTabBar from './components/layout/BottomTabBar';
import Sidebar from './components/layout/Sidebar';
import LogPage from './pages/LogPage';
import HistoryPage from './pages/HistoryPage';
import DiagnosisDetailPage from './pages/DiagnosisDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-full flex flex-col md:flex-row bg-surface">
        <Sidebar />
        <main className="flex-1 overflow-y-auto md:ml-[4.5rem] lg:ml-64">
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
