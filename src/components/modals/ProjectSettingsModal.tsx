import React, { useState } from 'react';
import {
  Settings,
  X,
  Save,
  RotateCcw,
  Trash2,
  Gamepad2,
  Calendar,
  Code2,
  Sparkles,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

export const ProjectSettingsModal: React.FC = () => {
  const {
    isProjectSettingsOpen,
    setIsProjectSettingsOpen,
    data,
    updateProjectInfo,
    resetToSampleData,
    clearAllData,
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
      name: name.trim() || 'Roblox Map Project',
      genre: genre.trim() || 'Custom',
      targetReleaseDate: targetReleaseDate.trim(),
      placeId: placeId.trim(),
      gameVersion: gameVersion.trim() || 'v0.1.0',
    });
    setIsProjectSettingsOpen(false);
  };

  const genresList = [
    'Simulator / Grinding',
    'Action / RPG',
    'Battlegrounds / Fighting',
    'Obby / Parkour',
    'Tycoon / Management',
    'Horror / Survival',
    'Story / Adventure',
    'Shooter / FPS',
    'Racing / Vehicles',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600/15 text-red-400">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إعدادات الماب والمشروع</h3>
              <p className="text-[11px] text-slate-400">
                خصص بيانات لعبتك ومعرف Roblox Studio.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProjectSettingsOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              اسم الماب / التجربة (Game Title) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Blox Battlegrounds, Speed Legends..."
              className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                تصنيف اللعبة (Genre)
              </label>
              <input
                type="text"
                list="genres"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="اختر أو اكتب التصنيف"
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
              />
              <datalist id="genres">
                {genresList.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                الإصدار الحالي (Version)
              </label>
              <input
                type="text"
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
                placeholder="مثال: v0.5.2 Alpha"
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                موعد الإطلاق المستهدف
              </label>
              <input
                type="date"
                value={targetReleaseDate}
                onChange={(e) => setTargetReleaseDate(e.target.value)}
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Roblox Place ID (اختياري)
              </label>
              <input
                type="text"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="e.g. 13984729104"
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من استعادة البيانات النموذجية الافتراضية؟')) {
                    resetToSampleData();
                    setIsProjectSettingsOpen(false);
                  }
                }}
                className="px-2.5 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="استعادة البيانات النموذجية"
              >
                <RotateCcw size={13} />
                <span>استعادة النموذج الافتراضي</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsProjectSettingsOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
