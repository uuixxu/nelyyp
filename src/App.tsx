import React, { useState, useEffect } from 'react';
import { DevTrackerProvider, useDevTracker } from './context/DevTrackerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProgressionView } from './components/progression/ProgressionView';
import { TasksView } from './components/tasks/TasksView';
import { IdeasView } from './components/ideas/IdeasView';
import { BugsView } from './components/bugs/BugsView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ProjectSettingsModal } from './components/modals/ProjectSettingsModal';
import { ExportImportModal } from './components/modals/ExportImportModal';
import { AuthModal } from './components/modals/AuthModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { Cloud, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setIsQuickAddOpen,
    user,
    setIsAuthModalOpen,
    syncStatus,
    syncError,
    setIsConfigModalOpen,
  } = useDevTracker();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  // Global keyboard shortcut: Press 'q' or 'Q' to open quick add if no input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (!isInput && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsQuickAddOpen]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf3] flex flex-col font-['Alexandria',sans-serif]">
      {/* Sidebar on the Left */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Content Area - Shifted for Left Sidebar on Desktop */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar onOpenMobileMenu={() => setIsOpenMobile(true)} />

        {/* Cloud Sync Alert Banner if not logged in or error */}
        {!dismissBanner && !user && (
          <div className="bg-gradient-to-r from-red-950/40 via-[#181d28] to-[#12161f] border-b border-red-500/20 px-4 py-2 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cloud size={14} className="text-red-400 shrink-0" />
              <span className="text-slate-300">
                أنت تستخدم الحفظ المؤقت في المتصفح. <strong>سجّل دخولك بـ Email + Password</strong> لحفظ وتزامن بيانات مابك تلقائياً في Supabase بين جميع أجهزتك.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer"
              >
                تسجيل الدخول الآن
              </button>
              <button
                onClick={() => setDismissBanner(true)}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
                title="إخفاء التنبيه"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {syncError && (
          <div className="bg-rose-950/60 border-b border-rose-800/50 px-4 py-2 text-xs flex items-center justify-between gap-3 text-rose-300">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0 text-rose-400" />
              <span className="truncate">{syncError}</span>
            </div>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-rose-200 underline font-semibold text-[11px] shrink-0 hover:text-white"
            >
              عرض إعدادات Supabase وكود الـ SQL ←
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'progression' && <ProgressionView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'ideas' && <IdeasView />}
          {activeTab === 'bugs' && <BugsView />}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal />
      <ProjectSettingsModal />
      <ExportImportModal />
      <AuthModal />
      <SupabaseConfigModal />
    </div>
  );
};

export default function App() {
  return (
    <DevTrackerProvider>
      <AppContent />
    </DevTrackerProvider>
  );
}
