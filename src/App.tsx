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

const AppContent: React.FC = () => {
  const { activeTab, setIsQuickAddOpen } = useDevTracker();
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
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf3] flex flex-col font-['Alexandria',sans-serif]">
      {/* Sidebar on the Left */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Content Area - Shifted for Left Sidebar on Desktop */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar onOpenMobileMenu={() => setIsOpenMobile(true)} />

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
