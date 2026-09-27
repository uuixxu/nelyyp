import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  Zap,
  Tag,
  X,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Idea, IdeaImpact, IdeaStatus } from '../../types';

export const IdeasView: React.FC = () => {
  const { data, addIdea, updateIdea, deleteIdea, convertIdeaToTask, searchQuery } = useDevTracker();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('new');
  const [impact, setImpact] = useState<IdeaImpact>('high');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');

  const openAddModal = () => {
    setEditingIdeaId(null);
    setTitle('');
    setDescription('');
    setCategory('Gameplay & Retention');
    setStatus('new');
    setImpact('high');
    setIsModalOpen(true);
  };

  const openEditModal = (idea: Idea) => {
    setEditingIdeaId(idea.id);
    setTitle(idea.title);
    setDescription(idea.description);
    setCategory(idea.category);
    setStatus(idea.status);
    setImpact(idea.impact);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingIdeaId) {
      updateIdea(editingIdeaId, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        status,
        impact,
      });
    } else {
      addIdea({
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        status,
        impact,
      });
    }

    setIsModalOpen(false);
  };

  const getImpactBadge = (imp: IdeaImpact) => {
    switch (imp) {
      case 'high':
        return { label: 'تأثير قوي', color: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' };
      case 'medium':
        return { label: 'تأثير متوسط', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20' };
      case 'low':
        return { label: 'تأثير بسيط', color: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]' };
    }
  };

  const getStatusBadge = (st: IdeaStatus) => {
    switch (st) {
      case 'new':
        return { label: 'فكرة جديدة', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20' };
      case 'planned':
        return { label: 'مجدولة للتنفيذ', color: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' };
      case 'in_review':
        return { label: 'قيد المراجعة', color: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]' };
      case 'implemented':
        return { label: 'تم تطبيقها', color: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' };
      case 'discarded':
        return { label: 'مستبعدة', color: 'text-[#71717a] bg-[#18181b] border-[#27272a]' };
    }
  };

  const filteredIdeas = data.ideas.filter((idea) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && idea.status !== statusFilter) return false;
    if (impactFilter !== 'all' && idea.impact !== impactFilter) return false;

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] flex items-center gap-2">
            <Lightbulb className="text-[#8b5cf6]" size={22} />
            <span>بنك أفكار الماب (Ideas Backlog)</span>
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            توثيق الأفكار، أنظمة اللعب، والتحديثات المقترحة مع إمكانية تحويلها لمهام عمل تنفيذية.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus size={14} />
          <span>فكرة جديدة</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-lg bg-[#111114] border border-[#27272a]">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
            <span>الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
            >
              <option value="all">كافة الحالات</option>
              <option value="new">فكرة جديدة</option>
              <option value="planned">مجدولة للتنفيذ</option>
              <option value="in_review">قيد المراجعة</option>
              <option value="implemented">تم تطبيقها</option>
              <option value="discarded">مستبعدة</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
            <span>التأثير:</span>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
            >
              <option value="all">كافة المستويات</option>
              <option value="high">تأثير قوي</option>
              <option value="medium">تأثير متوسط</option>
              <option value="low">تأثير بسيط</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-[#a1a1aa]">
          إجمالي الأفكار: <span className="text-[#f4f4f5] font-semibold">{filteredIdeas.length}</span>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => {
            const impactBadge = getImpactBadge(idea.impact);
            const statusBadge = getStatusBadge(idea.status);

            return (
              <div
                key={idea.id}
                className="bg-[#111114] border border-[#27272a] hover:border-[#3f3f46] rounded-lg p-4 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${impactBadge.color}`}
                    >
                      {impactBadge.label}
                    </span>
                  </div>

                  <h3 className="text-xs font-medium text-[#f4f4f5] leading-snug">{idea.title}</h3>

                  <p className="text-[11px] text-[#a1a1aa] leading-relaxed min-h-[44px]">
                    {idea.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] font-mono">
                    <Tag size={11} className="text-[#8b5cf6]" />
                    <span>{idea.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#27272a]">
                  <button
                    onClick={() => convertIdeaToTask(idea.id)}
                    className="flex items-center gap-1.5 text-[11px] text-[#8b5cf6] hover:text-[#7c3aed] font-medium bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    title="تحويل الفكرة إلى مهمة عمل في جدول المهام"
                  >
                    <Zap size={12} />
                    <span>تحويل لمهمة عمل</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(idea)}
                      className="p-1 text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="p-1 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-[#a1a1aa] bg-[#111114] border border-[#27272a] rounded-lg">
            <Lightbulb size={28} className="mx-auto mb-2 text-[#71717a]" />
            <p className="text-xs font-medium text-[#f4f4f5]">لا توجد أفكار مسجلة حالياً</p>
            <p className="text-[11px] text-[#71717a] mt-1">
              اضغط على زر "فكرة جديدة" لبدء تدوين أفكار الماب وتحديثاته القادمة.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Idea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-md p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2">
                <Lightbulb size={16} className="text-[#8b5cf6]" />
                <span>{editingIdeaId ? 'تعديل الفكرة' : 'إضافة فكرة جديدة للماب'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717a] hover:text-[#f4f4f5] p-1 rounded hover:bg-[#18181b] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  عنوان الفكرة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: نظام مواسم وتصفيات أسبوعية (Season Pass)"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  شرح الفكرة ومردودها على تجربة اللاعب
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="كيف ستعمل هذه الفكرة؟ ولماذا ستجعل الماب أكثر متعة ونجاحاً؟"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  تصنيف الفكرة (التاج)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: Retention، Gameplay، Events، Monetization"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    حالة الفكرة
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
                  >
                    <option value="new">فكرة جديدة</option>
                    <option value="planned">مجدولة للتنفيذ</option>
                    <option value="in_review">قيد المراجعة</option>
                    <option value="implemented">تم تطبيقها</option>
                    <option value="discarded">مستبعدة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    مستوى التأثير
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as IdeaImpact)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
                  >
                    <option value="high">تأثير قوي (High Impact)</option>
                    <option value="medium">تأثير متوسط (Medium)</option>
                    <option value="low">تأثير بسيط (Low)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  حفظ الفكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
