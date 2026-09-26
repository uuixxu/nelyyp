import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Save,
  Gamepad2,
  Calendar,
  ExternalLink,
  Code2,
  Layers,
  Cloud,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    data,
    searchQuery,
    setSearchQuery,
    setIsQuickAddOpen,
    setIsProjectSettingsOpen,
    stats,
    user,
    syncStatus,
    setIsAuthModalOpen,
  } = useDevTracker();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d1117]/90 backdrop-blur-md border-b border-[#21262d] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Project indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-[#161b22] text-slate-300 hover:text-white hover:bg-[#21262d] transition-colors"
            aria-label="القائمة الجانبية"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">
                {data.project.name || 'ماب Roblox'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                {data.project.gameVersion || 'v0.1'}
              </span>
            </div>

            {data.project.placeId && (
              <a
                href={`https://www.roblox.com/games/${data.project.placeId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-red-400 transition-colors bg-[#161b22] px-2.5 py-1 rounded-md border border-[#21262d]"
                title="فتح صفحة اللعبة على موقع Roblox"
              >
                <Code2 size={13} />
                <span>Place ID: {data.project.placeId}</span>
                <ExternalLink size={11} className="opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Center / Right: Global Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المهام، الأفكار، والمشاكل..."
              className="w-full bg-[#161b22] border border-[#21262d] hover:border-slate-600 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 rounded-lg pr-9 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Supabase Cloud Sync / Auth Button */}
          {user ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-[#161f2e] hover:bg-[#1f2b3e] border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
              title="متصل بالسحابة - انقر لعرض تفاصيل الحساب"
            >
              <div className="relative">
                <Cloud size={14} className="text-emerald-400" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
              </div>
              <span className="hidden md:inline truncate max-w-[130px]">{user.email}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#161c27] hover:bg-[#202737] border border-[#2b3547] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="تسجيل الدخول لحفظ ومزامنة بيانات الماب في السحابة"
            >
              <Cloud size={14} className="text-red-400" />
              <span className="hidden sm:inline">تسجيل الدخول السحابي</span>
            </button>
          )}

          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm shadow-red-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">إضافة سريعة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
