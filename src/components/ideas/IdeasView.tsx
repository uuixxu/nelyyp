import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  ArrowUpRight,
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  CheckCircle2,
  HelpCircle,
  FileCheck,
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
        return { label: 'تأثير قوي على اللعبة', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
      case 'medium':
        return { label: 'تأثير متوسط', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' };
      case 'low':
        return { label: 'تأثير بسيط', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  const getStatusBadge = (st: IdeaStatus) => {
    switch (st) {
      case 'new':
        return { label: 'فكرة جديدة', color: 'text-sky-400 bg-sky-950/50 border-sky-800/50' };
      case 'planned':
        return { label: 'مجدولة للتنفيذ', color: 'text-amber-400 bg-amber-950/50 border-amber-800/50' };
      case 'in_review':
        return { label: 'قيد المراجعة', color: 'text-purple-400 bg-purple-950/50 border-purple-800/50' };
      case 'implemented':
        return { label: 'تم تطبيقها بالماب', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50' };
      case 'discarded':
        return { label: 'مستبعدة', color: 'text-slate-400 bg-slate-900 border-slate-700' };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Lightbulb className="text-indigo-400" size={24} />
            <span>بنك أفكار الماب (Ideas Backlog)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجل كل فكرة تخطر في بالك لمود اللعب، التحديثات المستقبلية، أو زيادة تفاعل اللاعبين وحولها لمهام عمل مباشرة.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-950/40 transition-all active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus size={15} />
          <span>+ إضافة فكرة جديدة</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#12161f] border border-[#21262d]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة الحالات</option>
              <option value="new">فكرة جديدة</option>
              <option value="planned">مجدولة للتنفيذ</option>
              <option value="in_review">قيد المراجعة</option>
              <option value="implemented">تم تطبيقها</option>
              <option value="discarded">مستبعدة</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>التأثير المتوقع:</span>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
            >
              <option value="all">كافة المستويات</option>
              <option value="high">تأثير قوي</option>
              <option value="medium">تأثير متوسط</option>
              <option value="low">تأثير بسيط</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          إجمالي الأفكار: <span className="text-white font-bold">{filteredIdeas.length}</span>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => {
            const impactBadge = getImpactBadge(idea.impact);
            const statusBadge = getStatusBadge(idea.status);

            return (
              <div
                key={idea.id}
                className="bg-[#12161f] border border-[#21262d] hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${impactBadge.color}`}
                    >
                      {impactBadge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{idea.title}</h3>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                    {idea.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Tag size={12} className="text-indigo-400" />
                    <span>{idea.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#21262d]/60">
                  <button
                    onClick={() => convertIdeaToTask(idea.id)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    title="إنشاء مهمة عمل في صفحة المهام بناءً على هذه الفكرة"
                  >
                    <Zap size={13} />
                    <span>تحويل لمهمة عمل</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(idea)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"
                      title="تعديل"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 bg-[#12161f] border border-[#21262d] rounded-xl">
            <Lightbulb size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">لا توجد أفكار مسجلة حالياً</p>
            <p className="text-xs text-slate-500 mt-1">
              اضغط على زر "إضافة فكرة جديدة" لبدء تدوين أفكار الماب وتحديثاته القادمة.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Idea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lightbulb size={18} className="text-indigo-400" />
                <span>{editingIdeaId ? 'تعديل الفكرة' : 'إضافة فكرة جديدة للماب'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان الفكرة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: نظام مواسم وتصفيات أسبوعية (Season Pass)"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  شرح الفكرة ومردودها على تجربة اللاعب
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="كيف ستعمل هذه الفكرة؟ ولماذا ستجعل الماب أكثر متعة ونجاحاً؟"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تصنيف الفكرة (التاج)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: Retention، Gameplay، Events، Monetization"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    حالة الفكرة
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="new">فكرة جديدة</option>
                    <option value="planned">مجدولة للتنفيذ</option>
                    <option value="in_review">قيد المراجعة</option>
                    <option value="implemented">تم تطبيقها</option>
                    <option value="discarded">مستبعدة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    مستوى التأثير
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as IdeaImpact)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="high">تأثير قوي (High Impact)</option>
                    <option value="medium">تأثير متوسط (Medium)</option>
                    <option value="low">تأثير بسيط (Low)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
