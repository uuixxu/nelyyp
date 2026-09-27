import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Bug,
  Settings,
  Download,
  Layers,
  FileText,
  Cloud,
  Database,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const {
    activeTab,
    setActiveTab,
    data,
    stats,
    setIsProjectSettingsOpen,
    setIsExportImportOpen,
    user,
    setIsAuthModalOpen,
    setIsConfigModalOpen,
  } = useDevTracker();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      sublabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'progression',
      label: 'مراحل التقدم',
      sublabel: 'Progression',
      icon: Layers,
      badge: `${stats.totalProgressPercentage}%`,
      badgeColor: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20',
    },
    {
      id: 'tasks',
      label: 'إدارة المهام',
      sublabel: 'Tasks & Sprints',
      icon: CheckSquare,
      badge: stats.remainingTasksCount > 0 ? `${stats.remainingTasksCount}` : null,
      badgeColor: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20',
    },
    {
      id: 'notes',
      label: 'الملاحظات البرمجية',
      sublabel: 'Notes & Docs',
      icon: FileText,
      badge: stats.totalNotesCount > 0 ? `${stats.totalNotesCount}` : null,
      badgeColor: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]',
    },
    {
      id: 'ideas',
      label: 'بنك الأفكار',
      sublabel: 'Backlog',
      icon: Lightbulb,
      badge: stats.totalIdeasCount > 0 ? `${stats.totalIdeasCount}` : null,
      badgeColor: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]',
    },
    {
      id: 'bugs',
      label: 'سجل الأخطاء',
      sublabel: 'Issue Tracker',
      icon: Bug,
      badge: stats.openBugsCount > 0 ? `${stats.openBugsCount}` : null,
      badgeColor: stats.criticalBugsCount > 0
        ? 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20'
        : 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#111114] border-r border-[#27272a] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#8b5cf6]">
              <Terminal size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-[#f4f4f5] tracking-tight">Roblox Dev</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
                  Tracker
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] truncate max-w-[130px] font-mono">
                {data.project.name || 'Demonfall 2'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b]"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Project Mini Stats Bar */}
        <div className="px-4 py-2.5 border-b border-[#27272a] bg-[#09090b]/50">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[#a1a1aa]">جاهزية الماب</span>
            <span className="font-mono font-medium text-[#22c55e]">
              {stats.totalProgressPercentage}%
            </span>
          </div>
          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8b5cf6] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(4, stats.totalProgressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors group cursor-pointer ${
                  isActive
                    ? 'bg-[#18181b] text-[#f4f4f5] font-medium border border-[#27272a]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b]/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={15}
                    className={`transition-colors ${
                      isActive ? 'text-[#8b5cf6]' : 'text-[#71717a] group-hover:text-[#a1a1aa]'
                    }`}
                  />
                  <span className="leading-tight">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${
                      item.badgeColor || 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Studio Active Status Bar */}
        {stats.activeTask && (
          <div className="mx-2.5 mb-2 p-2 rounded-md bg-[#18181b] border border-[#27272a]">
            <div className="flex items-center gap-1.5 text-[10px] text-[#eab308] font-medium mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
              <span>قيد العمل في Studio:</span>
            </div>
            <p className="text-[11px] text-[#f4f4f5] line-clamp-1 font-medium">
              {stats.activeTask.title}
            </p>
          </div>
        )}

        {/* Sidebar Footer Controls */}
        <div className="p-2.5 border-t border-[#27272a] bg-[#09090b] space-y-1">
          {/* Cloud User Status */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer bg-[#111114] hover:bg-[#18181b] border border-[#27272a]"
          >
            <div className="flex items-center gap-2 truncate">
              <Cloud size={13} className={user ? 'text-[#22c55e]' : 'text-[#71717a]'} />
              <span className={`truncate text-[11px] font-mono ${user ? 'text-[#f4f4f5]' : 'text-[#a1a1aa]'}`}>
                {user ? user.email : 'تسجيل دخول السحابة'}
              </span>
            </div>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                user ? 'bg-[#22c55e]' : 'bg-[#71717a]'
              }`}
            />
          </button>

          <button
            onClick={() => setIsProjectSettingsOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings size={13} />
              <span>إعدادات المشروع</span>
            </div>
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Database size={13} />
              <span>قاعدة بيانات Supabase</span>
            </div>
          </button>

          <button
            onClick={() => setIsExportImportOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download size={13} />
              <span>نسخ احتياطي / JSON</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
