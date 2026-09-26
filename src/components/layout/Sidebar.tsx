import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  CheckSquare,
  Lightbulb,
  Bug,
  Settings,
  Download,
  Flame,
  Gamepad2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
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
    setIsQuickAddOpen,
  } = useDevTracker();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      sublabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'progression',
      label: 'مراحل التقدم',
      sublabel: 'Progression',
      icon: Layers,
      badge: `${stats.totalProgressPercentage}%`,
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    },
    {
      id: 'tasks',
      label: 'إدارة المهام',
      sublabel: 'Tasks & Sprints',
      icon: CheckSquare,
      badge: stats.remainingTasksCount > 0 ? `${stats.remainingTasksCount}` : null,
      badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-800/50',
    },
    {
      id: 'ideas',
      label: 'بنك الأفكار',
      sublabel: 'Ideas Backlog',
      icon: Lightbulb,
      badge: stats.totalIdeasCount > 0 ? `${stats.totalIdeasCount}` : null,
      badgeColor: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/50',
    },
    {
      id: 'bugs',
      label: 'سجل الأخطاء',
      sublabel: 'Bugs & Issues',
      icon: Bug,
      badge: stats.openBugsCount > 0 ? `${stats.openBugsCount}` : null,
      badgeColor: stats.criticalBugsCount > 0 ? 'text-rose-400 bg-rose-950/70 border-rose-800/70' : 'text-slate-300 bg-slate-800/70 border-slate-700/60',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container - Positioned on the Left as requested */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0e131b] border-r border-[#21262d] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-rose-700 p-0.5 shadow-lg shadow-red-900/30 flex items-center justify-center">
              {/* Roblox-inspired tilt square icon */}
              <div className="w-4 h-4 bg-white rounded-xs transform rotate-12 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-2xs transform rotate-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">Roblox Dev</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-red-500/15 text-red-400 border border-red-500/30">
                  Tracker
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[140px] font-medium">
                {data.project.name || 'ماب روبلوكس'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Project Mini Status Card */}
        <div className="px-4 py-3 border-b border-[#21262d]/60 bg-[#121822]/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">جاهزية الماب الإجمالية</span>
            <span className="font-mono font-semibold text-emerald-400">
              {stats.totalProgressPercentage}%
            </span>
          </div>
          <div className="w-full bg-[#1c2331] h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, stats.totalProgressPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#21262d]/40 text-[11px] text-slate-400">
            <span className="font-mono text-slate-300">{data.project.gameVersion || 'v0.1'}</span>
            <span className="text-slate-400 truncate max-w-[110px]">{data.project.genre}</span>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => {
              setIsQuickAddOpen(true);
              setIsOpenMobile(false);
            }}
            className="w-full group flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md shadow-red-950/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
            <span>+ إضافة سريعة</span>
            <span className="text-[10px] opacity-75 font-mono px-1 rounded-sm bg-black/25">Quick</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-red-600/15 text-white font-semibold border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161c27]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div className="text-right">
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                      item.badgeColor || 'text-slate-300 bg-slate-800 border-slate-700'
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
          <div className="mx-3 mb-2 p-2.5 rounded-lg bg-[#141b26] border border-amber-500/25">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>جاري العمل في Studio الآن</span>
            </div>
            <p className="text-xs text-slate-200 line-clamp-1 font-medium">
              {stats.activeTask.title}
            </p>
          </div>
        )}

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#21262d] bg-[#0c1017] space-y-1">
          <button
            onClick={() => setIsProjectSettingsOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-[#161c27] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings size={15} />
              <span>إعدادات الماب والمشروع</span>
            </div>
          </button>

          <button
            onClick={() => setIsExportImportOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-[#161c27] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download size={15} />
              <span>نسخ احتياطي / تصدير واستيراد</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
