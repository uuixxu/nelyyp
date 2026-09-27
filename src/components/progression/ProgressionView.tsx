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
  FolderPlus,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] flex items-center gap-2">
            <Layers className="text-[#8b5cf6]" size={22} />
            <span>مراحل تقدم تطوير الماب (Progression)</span>
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            تتبع أركان المشروع الرئيسية (الخريطة، اللعب، الواجهات، الأنظمة) وحساب الجاهزية تلقائياً.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategoryModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] text-xs font-medium transition-colors self-start sm:self-center cursor-pointer"
        >
          <FolderPlus size={14} className="text-[#8b5cf6]" />
          <span>+ قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                className="bg-[#111114] border border-[#27272a] rounded-lg overflow-hidden flex flex-col"
              >
                {/* Category Header */}
                <div className="p-4 border-b border-[#27272a] bg-[#18181b]/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs text-[#f4f4f5]">{cat.nameAr}</h3>
                          <span className="text-[10px] font-mono text-[#71717a]">
                            {cat.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a1a1aa] mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="font-mono text-sm font-semibold text-[#f4f4f5]">
                        {percentage}%
                      </div>
                      <div className="text-[10px] text-[#71717a] font-mono">
                        {completed}/{total} بند
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentage === 100 ? 'bg-[#22c55e]' : 'bg-[#8b5cf6]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3 flex-1 space-y-1.5 overflow-y-auto max-h-[380px]">
                  {cat.items.length > 0 ? (
                    cat.items.map((item) => (
                      <div
                        key={item.id}
                        className={`group flex items-start justify-between gap-2.5 p-2 rounded-md border transition-colors ${
                          item.isCompleted
                            ? 'bg-[#18181b]/30 border-[#27272a] opacity-75'
                            : 'bg-[#111114] border-[#27272a] hover:border-[#3f3f46]'
                        }`}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <button
                            onClick={() => toggleProgressionItem(cat.id, item.id)}
                            className="mt-0.5 text-[#71717a] hover:text-[#22c55e] transition-colors shrink-0 cursor-pointer"
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 size={15} className="text-[#22c55e]" />
                            ) : (
                              <Circle size={15} className="text-[#71717a] hover:text-[#f4f4f5]" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <span
                              onClick={() => toggleProgressionItem(cat.id, item.id)}
                              className={`text-xs block cursor-pointer select-none ${
                                item.isCompleted
                                  ? 'text-[#71717a] line-through'
                                  : 'text-[#f4f4f5] font-normal'
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-[#71717a] mt-0.5 line-clamp-1 font-mono">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteProgressionItem(cat.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#71717a] hover:text-[#ef4444] rounded transition-all shrink-0 cursor-pointer"
                          title="حذف هذا البند"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[#71717a]">
                      لا توجد بنود مسجلة بعد.
                    </div>
                  )}

                  {/* Inline Add Item Form */}
                  {isAddingHere && (
                    <div className="p-2.5 rounded-md bg-[#18181b] border border-[#27272a] space-y-2 mt-2">
                      <input
                        type="text"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="عنوان البند (مثال: برمجة حركة السلاح، الإضاءة...)"
                        className="w-full bg-[#111114] border border-[#27272a] rounded px-2.5 py-1 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(cat.id);
                        }}
                      />
                      <input
                        type="text"
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                        placeholder="ملاحظات توثيقية اختيارية"
                        className="w-full bg-[#111114] border border-[#27272a] rounded px-2.5 py-1 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAddingCategory(null);
                            setNewItemTitle('');
                            setNewItemNotes('');
                          }}
                          className="px-2 py-0.5 text-xs text-[#71717a] hover:text-[#f4f4f5]"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddItem(cat.id)}
                          className="px-2.5 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded text-xs font-medium cursor-pointer"
                        >
                          حفظ البند
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                {!isAddingHere && (
                  <div className="p-2.5 border-t border-[#27272a] bg-[#09090b]">
                    <button
                      onClick={() => {
                        setActiveAddingCategory(cat.id);
                        setNewItemTitle('');
                        setNewItemNotes('');
                      }}
                      className="w-full py-1.5 px-2 rounded border border-dashed border-[#27272a] hover:border-[#8b5cf6]/50 text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>إضافة بند لهذا القسم</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modal: Add New Progression Category */}
      {isAddingCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-md p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2">
                <FolderPlus size={16} className="text-[#8b5cf6]" />
                <span>إضافة قسم تطوير مخصص</span>
              </h3>
              <button
                onClick={() => setIsAddingCategoryModal(false)}
                className="text-[#71717a] hover:text-[#f4f4f5] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  اسم القسم بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: المؤثرات الصوتية والموسيقى، المتجر، الأحداث"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  الاسم بالإنجليزية (اختياري)
                </label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="e.g. Audio & SFX, Economy, Events"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  وصف موجز لهذا القسم
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="ما الذي يشمله هذا القسم في تطوير الماب؟"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsAddingCategoryModal(false)}
                  className="px-3 py-1 text-xs text-[#a1a1aa] hover:text-[#f4f4f5]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded text-xs font-medium transition-colors cursor-pointer"
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
