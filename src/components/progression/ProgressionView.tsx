import React, { useState } from 'react';
import {
  MapPin,
  Gamepad2,
  Layout,
  Cpu,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Info,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { ProgressionCategory } from '../../types';

export const ProgressionView: React.FC = () => {
  const {
    data,
    toggleProgressionItem,
    addProgressionItem,
    deleteProgressionItem,
    addProgressionCategory,
    searchQuery,
  } = useDevTracker();

  // State for adding item to category
  const [activeAddingCategory, setActiveAddingCategory] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  // State for creating new category
  const [isAddingCategoryModal, setIsAddingCategoryModal] = useState(false);
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'map':
      case 'mappin':
        return MapPin;
      case 'gameplay':
      case 'gamepad2':
        return Gamepad2;
      case 'ui':
      case 'layout':
        return Layout;
      case 'systems':
      case 'cpu':
        return Cpu;
      default:
        return Layers;
    }
  };

  const handleAddItem = (categoryId: string) => {
    if (!newItemTitle.trim()) return;
    addProgressionItem(categoryId, newItemTitle.trim(), newItemNotes.trim() || undefined);
    setNewItemTitle('');
    setNewItemNotes('');
    setActiveAddingCategory(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) return;
    addProgressionCategory({
      name: newCatNameEn.trim() || newCatNameAr.trim(),
      nameAr: newCatNameAr.trim(),
      icon: newCatIcon,
      description: newCatDesc.trim() || 'قسم تطوير مخصص للماب',
    });
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatDesc('');
    setIsAddingCategoryModal(false);
  };

  // Filter categories and items if search is active
  const filteredCategories = data.progression.map((cat) => {
    if (!searchQuery.trim()) return cat;
    const lower = searchQuery.toLowerCase();
    const matchesCat =
      cat.name.toLowerCase().includes(lower) ||
      cat.nameAr.toLowerCase().includes(lower) ||
      cat.description.toLowerCase().includes(lower);

    const filteredItems = cat.items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.notes && item.notes.toLowerCase().includes(lower))
    );

    return {
      ...cat,
      items: matchesCat ? cat.items : filteredItems,
      isVisible: matchesCat || filteredItems.length > 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="text-red-500" size={24} />
            <span>مراحل تقدم تطوير الماب (Progression)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            قسم مشروعك إلى أركان رئيسية (الخريطة، اللعب، الواجهات، الأنظمة)، وتتبع نسبة إنجاز كل ركن تلقائياً.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategoryModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161c27] hover:bg-[#202736] border border-[#2c3444] text-slate-200 text-xs font-medium transition-colors self-start sm:self-center cursor-pointer"
        >
          <FolderPlus size={15} className="text-red-400" />
          <span>+ إضافة قسم تطوير جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories
          .filter((cat) => (cat as any).isVisible !== false)
          .map((cat) => {
            const Icon = getCategoryIcon(cat.icon || cat.id);
            const total = cat.items.length;
            const completed = cat.items.filter((i) => i.isCompleted).length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isAddingHere = activeAddingCategory === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-[#12161f] border border-[#21262d] rounded-xl overflow-hidden flex flex-col shadow-sm"
              >
                {/* Category Header */}
                <div className="p-5 border-b border-[#21262d] bg-[#141a24]/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20">
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{cat.nameAr}</h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            {cat.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="font-mono text-lg font-extrabold text-white">
                        {percentage}%
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {completed} / {total} بند
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1b212c] h-2 rounded-full overflow-hidden mt-3 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage === 100
                          ? 'bg-emerald-400'
                          : percentage >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[380px]">
                  {cat.items.length > 0 ? (
                    cat.items.map((item) => (
                      <div
                        key={item.id}
                        className={`group flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                          item.isCompleted
                            ? 'bg-[#151c27]/40 border-emerald-950/40 opacity-75'
                            : 'bg-[#161c27] border-[#222938] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button
                            onClick={() => toggleProgressionItem(cat.id, item.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 size={17} className="text-emerald-400" />
                            ) : (
                              <Circle size={17} className="text-slate-500 group-hover:text-slate-300" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <span
                              onClick={() => toggleProgressionItem(cat.id, item.id)}
                              className={`text-xs block cursor-pointer select-none ${
                                item.isCompleted
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-200 font-medium'
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteProgressionItem(cat.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all shrink-0 cursor-pointer"
                          title="حذف هذا البند"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      لا توجد بنود تحت هذا القسم بعد. اضغط أدناه لإضافة ما تم إنجازه أو ما هو باقٍ.
                    </div>
                  )}

                  {/* Inline Add Item Form */}
                  {isAddingHere ? (
                    <div className="p-3 rounded-lg bg-[#18202d] border border-red-500/40 space-y-2 mt-2">
                      <input
                        type="text"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="عنوان البند (مثال: برمجة حركة السلاح، إضاءة اللوبي...)"
                        className="w-full bg-[#12161f] border border-[#2a3446] rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(cat.id);
                        }}
                      />
                      <input
                        type="text"
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                        placeholder="ملاحظات اختيارية (تفاصيل السكربت أو الموديل)"
                        className="w-full bg-[#12161f] border border-[#2a3446] rounded-md px-3 py-1.5 text-xs text-slate-300 placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAddingCategory(null);
                            setNewItemTitle('');
                            setNewItemNotes('');
                          }}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddItem(cat.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium cursor-pointer"
                        >
                          حفظ البند
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Footer Action */}
                {!isAddingHere && (
                  <div className="p-3 border-t border-[#21262d] bg-[#0f141d]">
                    <button
                      onClick={() => {
                        setActiveAddingCategory(cat.id);
                        setNewItemTitle('');
                        setNewItemNotes('');
                      }}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-[#2b3342] hover:border-red-500/50 hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>إضافة مهمة / بند جديد لهذا القسم</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modal: Add New Progression Category */}
      {isAddingCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus size={18} className="text-red-500" />
                <span>إضافة قسم تطوير مخصص</span>
              </h3>
              <button
                onClick={() => setIsAddingCategoryModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم القسم بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: المؤثرات الصوتية والموسيقى، المتجر، الأحداث"
                  className="w-full bg-[#18202d] border border-[#283244] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  الاسم بالإنجليزية (اختياري)
                </label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="e.g. Audio & SFX, Economy, Events"
                  className="w-full bg-[#18202d] border border-[#283244] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  وصف موجز لهذا القسم
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="ما الذي يشمله هذا القسم في تطوير ماب Roblox؟"
                  className="w-full bg-[#18202d] border border-[#283244] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setIsAddingCategoryModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  إنشاء القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
