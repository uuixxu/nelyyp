import React, { useState, useEffect } from 'react';
import { DevTrackerProvider, useDevTracker } from './context/DevTrackerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProgressionView } from './components/progression/ProgressionView';
import { TasksView } from './components/tasks/TasksView';
import { IdeasView } from './components/ideas/IdeasView';
import { BugsView } from './components/bugs/BugsView';
import { NotesView } from './components/notes/NotesView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ProjectSettingsModal } from './components/modals/ProjectSettingsModal';
import { ExportImportModal } from './components/modals/ExportImportModal';
import { AuthModal } from './components/modals/AuthModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setIsQuickAddOpen,
    syncError,
    setIsConfigModalOpen,
  } = useDevTracker();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-['Alexandria',sans-serif]">
      {/* Sidebar on the Left */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Content Area - Shifted for Left Sidebar on Desktop */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
        {/* Top Navbar */}
        <Navbar onOpenMobileMenu={() => setIsOpenMobile(true)} />

        {syncError && (
          <div className="bg-[#111114] border-b border-[#ef4444]/30 px-4 py-2 text-xs flex items-center justify-between gap-3 text-[#ef4444]">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0 text-[#ef4444]" />
              <span className="truncate">{syncError}</span>
            </div>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-[#f4f4f5] underline font-medium text-[11px] shrink-0 hover:text-white cursor-pointer"
            >
              عرض إعدادات Supabase وكود الـ SQL ←
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'progression' && <ProgressionView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'ideas' && <IdeasView />}
          {activeTab === 'bugs' && <BugsView />}
          {activeTab === 'notes' && <NotesView />}
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
