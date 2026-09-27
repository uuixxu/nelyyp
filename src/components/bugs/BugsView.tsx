import React, { useState } from 'react';
import {
  Bug as BugIcon,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Bug, BugSeverity } from '../../types';

export const BugsView: React.FC = () => {
  const { data, addBug, updateBug, deleteBug, toggleBugStatus, searchQuery } = useDevTracker();

  const [statusTab, setStatusTab] = useState<'open' | 'fixed' | 'all'>('open');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBugId, setEditingBugId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [foundInVersion, setFoundInVersion] = useState(data.project.gameVersion || 'v0.0.1 Alpha');

  const openAddModal = () => {
    setEditingBugId(null);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setSeverity('medium');
    setFoundInVersion(data.project.gameVersion || 'v0.0.1 Alpha');
    setIsModalOpen(true);
  };

  const openEditModal = (bug: Bug) => {
    setEditingBugId(bug.id);
    setTitle(bug.title);
    setDescription(bug.description);
    setStepsToReproduce(bug.stepsToReproduce || '');
    setSeverity(bug.severity);
    setFoundInVersion(bug.foundInVersion || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingBugId) {
      updateBug(editingBugId, {
        title: title.trim(),
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim() || undefined,
        severity,
        foundInVersion: foundInVersion.trim() || undefined,
      });
    } else {
      addBug({
        title: title.trim(),
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim() || undefined,
        severity,
        status: 'open',
        foundInVersion: foundInVersion.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getSeverityBadge = (sev: BugSeverity) => {
    switch (sev) {
      case 'critical':
        return { label: 'حرجة جداً', color: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' };
      case 'high':
        return { label: 'عالية', color: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20' };
      case 'low':
        return { label: 'بسيطة / مظهرية', color: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]' };
    }
  };

  const filteredBugs = data.bugs.filter((bug) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        bug.title.toLowerCase().includes(q) ||
        bug.description.toLowerCase().includes(q) ||
        (bug.stepsToReproduce && bug.stepsToReproduce.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (statusTab !== 'all') {
      if (statusTab === 'open' && bug.status !== 'open') return false;
      if (statusTab === 'fixed' && bug.status !== 'fixed') return false;
    }

    if (severityFilter !== 'all' && bug.severity !== severityFilter) return false;

    return true;
  });

  const openCount = data.bugs.filter((b) => b.status === 'open').length;
  const fixedCount = data.bugs.filter((b) => b.status === 'fixed').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] flex items-center gap-2">
            <BugIcon className="text-[#ef4444]" size={22} />
            <span>سجل أخطاء ومشاكل الماب (Issue Tracker)</span>
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            متابعة استثناءات Luau، أخطاء السيرفر، ومشاكل Collisions وتكرار الأخطاء بدقة.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus size={14} />
          <span>تسجيل مشكلة</span>
        </button>
      </div>

      {/* Status Segmented Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-lg bg-[#111114] border border-[#27272a]">
        <div className="flex items-center gap-1 p-0.5 bg-[#18181b] rounded-md border border-[#27272a]">
          <button
            onClick={() => setStatusTab('open')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusTab === 'open'
                ? 'bg-[#111114] text-[#ef4444] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <span>مشاكل مفتوحة</span>
            <span className="font-mono text-[10px] px-1 rounded bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
              {openCount}
            </span>
          </button>

          <button
            onClick={() => setStatusTab('fixed')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusTab === 'fixed'
                ? 'bg-[#111114] text-[#22c55e] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <span>تم إصلاحها</span>
            <span className="font-mono text-[10px] px-1 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
              {fixedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusTab('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              statusTab === 'all'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            الكل ({data.bugs.length})
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <span>الخطورة:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
          >
            <option value="all">كافة المستويات</option>
            <option value="critical">حرجة جداً</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">بسيطة</option>
          </select>
        </div>
      </div>

      {/* Bugs List Cards */}
      <div className="space-y-2.5">
        {filteredBugs.length > 0 ? (
          filteredBugs.map((bug) => {
            const sevBadge = getSeverityBadge(bug.severity);
            const isFixed = bug.status === 'fixed';

            return (
              <div
                key={bug.id}
                className={`rounded-lg border p-4 transition-colors ${
                  isFixed
                    ? 'bg-[#111114]/50 border-[#27272a] opacity-75'
                    : 'bg-[#111114] border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Fixed or Open Badge */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-medium flex items-center gap-1 ${
                          isFixed
                            ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                            : 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20'
                        }`}
                      >
                        {isFixed ? <Check size={10} /> : <AlertTriangle size={10} />}
                        <span>{isFixed ? 'تم الإصلاح' : 'مفتوح'}</span>
                      </span>

                      {/* Severity Badge */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${sevBadge.color}`}
                      >
                        {sevBadge.label}
                      </span>

                      {bug.foundInVersion && (
                        <span className="text-[10px] font-mono text-[#71717a] bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
                          النسخة: {bug.foundInVersion}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-xs font-medium leading-snug ${
                        isFixed ? 'text-[#71717a] line-through' : 'text-[#f4f4f5]'
                      }`}
                    >
                      {bug.title}
                    </h3>

                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                      {bug.description}
                    </p>

                    {/* Reproduction steps if any */}
                    {bug.stepsToReproduce && (
                      <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-xs space-y-0.5 mt-1.5">
                        <span className="text-[10px] font-semibold text-[#a1a1aa] block font-mono">
                          خطوات تكرار المشكلة (Reproduction):
                        </span>
                        <p className="text-[#a1a1aa] text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                          {bug.stepsToReproduce}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => toggleBugStatus(bug.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isFixed
                          ? 'bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a]'
                          : 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-xs'
                      }`}
                    >
                      {isFixed ? (
                        <>
                          <RotateCcw size={12} />
                          <span>إعادة فتح</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} />
                          <span>تم الحل ✓</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(bug)}
                        className="p-1 text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => deleteBug(bug.id)}
                        className="p-1 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-[#a1a1aa] bg-[#111114] border border-[#27272a] rounded-lg">
            <CheckCircle2 size={30} className="mx-auto mb-2 text-[#22c55e]" />
            <p className="text-xs font-medium text-[#f4f4f5]">
              {statusTab === 'open'
                ? 'لا توجد مشاكل مفتوحة حالياً.'
                : 'لا توجد عناصر مطابقة للفلاتر المختارة.'}
            </p>
            <p className="text-[11px] text-[#71717a] mt-1">
              إذا واجهت أي خطأ برمجي في Studio أو أثناء تجربة اللعبة، سجله هنا لمتابعته.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Bug Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2">
                <BugIcon size={16} className="text-[#ef4444]" />
                <span>{editingBugId ? 'تعديل تقرير المشكلة' : 'تسجيل مشكلة برمجية جديدة'}</span>
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
                  عنوان المشكلة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خطأ في كود حفظ العملات عند خروج اللاعب فجأة"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  شرح المشكلة بالتفصيل
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ما الذي يحدث بالضبط؟ وما هي رسالة الخطأ في Output Console؟"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  خطوات تكرار المشكلة (How to reproduce)
                </label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. ادخل ساحة القتال 2. اضغط مفتاح Q 3. لاحظ تجمد الشخصية..."
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    درجة الخطورة
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
                  >
                    <option value="critical">حرجة جداً (توقف اللعبة كلياً)</option>
                    <option value="high">عالية (تأثير مباشر على اللاعبين)</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">بسيطة / مظهرية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    نسخة اللعبة
                  </label>
                  <input
                    type="text"
                    value={foundInVersion}
                    onChange={(e) => setFoundInVersion(e.target.value)}
                    placeholder="e.g. v0.0.1 Alpha"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                  />
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
                  حفظ التقرير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
