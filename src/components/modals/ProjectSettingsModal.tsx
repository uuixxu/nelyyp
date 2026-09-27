import React, { useState } from 'react';
import {
  Settings,
  X,
  RotateCcw,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

export const ProjectSettingsModal: React.FC = () => {
  const {
    isProjectSettingsOpen,
    setIsProjectSettingsOpen,
    data,
    updateProjectInfo,
    resetToSampleData,
  } = useDevTracker();

  const [name, setName] = useState(data.project.name || '');
  const [genre, setGenre] = useState(data.project.genre || '');
  const [targetReleaseDate, setTargetReleaseDate] = useState(data.project.targetReleaseDate || '');
  const [placeId, setPlaceId] = useState(data.project.placeId || '');
  const [gameVersion, setGameVersion] = useState(data.project.gameVersion || '');

  if (!isProjectSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectInfo({
      name: name.trim() || 'Demonfall 2',
      genre: genre.trim() || 'Action / RPG',
      targetReleaseDate: targetReleaseDate.trim(),
      placeId: placeId.trim(),
      gameVersion: gameVersion.trim() || 'v0.0.1 Alpha',
    });
    setIsProjectSettingsOpen(false);
  };

  const genresList = [
    'Action / RPG / Story / Adventure',
    'Simulator / Grinding',
    'Action / RPG',
    'Battlegrounds / Fighting',
    'Obby / Parkour',
    'Tycoon / Management',
    'Horror / Survival',
    'Shooter / FPS',
    'Racing / Vehicles',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
              <Settings size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">إعدادات الماب والمشروع</h3>
              <p className="text-[11px] text-[#a1a1aa]">
                تعديل بيانات التجربة ومعرف Roblox Studio.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProjectSettingsOpen(false)}
            className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
              اسم الماب / التجربة (Game Title) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Demonfall 2"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                تصنيف اللعبة (Genre)
              </label>
              <input
                type="text"
                list="genres"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="اختر أو اكتب التصنيف"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
              />
              <datalist id="genres">
                {genresList.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                الإصدار الحالي (Version)
              </label>
              <input
                type="text"
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
                placeholder="مثال: v0.0.1 Alpha"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                موعد الإطلاق المستهدف
              </label>
              <input
                type="date"
                value={targetReleaseDate}
                onChange={(e) => setTargetReleaseDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                Roblox Place ID (اختياري)
              </label>
              <input
                type="text"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="e.g. 133815254397626"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من استعادة البيانات النموذجية الافتراضية؟')) {
                    resetToSampleData();
                    setIsProjectSettingsOpen(false);
                  }
                }}
                className="px-2 py-1 rounded text-xs text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="استعادة البيانات النموذجية"
              >
                <RotateCcw size={12} />
                <span>استعادة الافتراضي</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsProjectSettingsOpen(false)}
                className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
