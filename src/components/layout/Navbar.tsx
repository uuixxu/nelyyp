import React from 'react';
import {
  Menu,
  Search,
  Plus,
  ExternalLink,
  Code2,
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
    user,
    syncStatus,
    isRealtimeConnected,
    setIsAuthModalOpen,
  } = useDevTracker();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Project indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-md bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] border border-[#27272a] transition-colors"
            aria-label="القائمة الجانبية"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-[#f4f4f5] truncate max-w-[200px] md:max-w-[280px]">
                {data.project.name || 'Demonfall 2'}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                {data.project.gameVersion || 'v0.0.1 Alpha'}
              </span>
            </div>

            {data.project.placeId && (
              <a
                href={`https://www.roblox.com/games/${data.project.placeId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors bg-[#111114] px-2 py-0.5 rounded-md border border-[#27272a]"
                title="فتح صفحة اللعبة على موقع Roblox"
              >
                <Code2 size={12} className="text-[#8b5cf6]" />
                <span>Place ID: {data.project.placeId}</span>
                <ExternalLink size={10} className="opacity-50" />
              </a>
            )}
          </div>
        </div>

        {/* Center / Right: Minimal Global Search */}
        <div className="flex-1 max-w-sm mx-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المهام، البنود، والأكواد..."
              className="w-full bg-[#111114] border border-[#27272a] hover:border-[#3f3f46] focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30 rounded-md pr-8 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#71717a] hover:text-[#f4f4f5] px-1"
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
              className="flex items-center gap-2 text-xs font-mono px-2 py-1 rounded-md bg-[#111114] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              title="متصل بالسحابة - انقر لعرض تفاصيل الحساب"
            >
              <div className="relative flex items-center">
                <Cloud size={13} className={isRealtimeConnected ? 'text-[#8b5cf6]' : 'text-[#71717a]'} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'syncing'
                      ? 'bg-[#eab308] animate-ping'
                      : isRealtimeConnected
                      ? 'bg-[#22c55e]'
                      : 'bg-[#71717a]'
                  }`}
                />
              </div>
              <span className="hidden md:inline truncate max-w-[120px] text-[11px] text-[#f4f4f5]">{user.email}</span>
              {isRealtimeConnected && (
                <span className="hidden xl:inline text-[9px] font-mono text-[#22c55e] bg-[#22c55e]/10 px-1 rounded border border-[#22c55e]/20">
                  LIVE
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#111114] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            >
              <Cloud size={13} className="text-[#8b5cf6]" />
              <span className="hidden sm:inline">السحابة</span>
            </button>
          )}

          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs px-2.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">إضافة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
