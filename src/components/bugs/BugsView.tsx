import React, { useState } from 'react';
import {
  Bug as BugIcon,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Check,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Bug, BugSeverity, BugStatus } from '../../types';

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
  const [foundInVersion, setFoundInVersion] = useState(data.project.gameVersion || 'v0.1.0');

  const openAddModal = () => {
    setEditingBugId(null);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setSeverity('medium');
    setFoundInVersion(data.project.gameVersion || 'v0.1.0');
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
        return { label: 'حرجة جداً (توقف اللعبة)', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
      case 'high':
        return { label: 'عالية', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-sky-400 bg-sky-950/60 border-sky-800/60' };
      case 'low':
        return { label: 'بسيطة / مظهرية', color: 'text-slate-400 bg-slate-900 border-slate-700' };
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
    if (statusTab !== 'all' && bug.status !== statusTab) return false;
    if (severityFilter !== 'all' && bug.severity !== severityFilter) return false;
    return true;
  });

  const openCount = data.bugs.filter((b) => b.status === 'open').length;
  const fixedCount = data.bugs.filter((b) => b.status === 'fixed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BugIcon className="text-rose-500" size={24} />
            <span>سجل الأخطاء والمشاكل (Bugs Tracker)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجل مشاكل السكربتات (Luau Errors)، كراشات السيرفر، ومشاكل الـ Collisions والفيزياء.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 transition-all active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus size={15} />
          <span>+ تسجيل مشكلة جديدة</span>
        </button>
      </div>

      {/* Status Segmented Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#12161f] border border-[#21262d]">
        <div className="flex items-center gap-1.5 p-1 bg-[#18202d] rounded-lg border border-[#263143]">
          <button
            onClick={() => setStatusTab('open')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusTab === 'open'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>مشاكل مفتوحة</span>
            <span className="font-mono px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {openCount}
            </span>
          </button>

          <button
            onClick={() => setStatusTab('fixed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusTab === 'fixed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>تم إصلاحها</span>
            <span className="font-mono px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {fixedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusTab === 'all'
                ? 'bg-[#293448] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({data.bugs.length})
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>الخطورة:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
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
      <div className="space-y-3">
        {filteredBugs.length > 0 ? (
          filteredBugs.map((bug) => {
            const sevBadge = getSeverityBadge(bug.severity);
            const isFixed = bug.status === 'fixed';

            return (
              <div
                key={bug.id}
                className={`rounded-xl border p-4.5 transition-all ${
                  isFixed
                    ? 'bg-[#12161f]/50 border-emerald-900/30 opacity-75'
                    : 'bg-[#12161f] border-[#21262d] hover:border-rose-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Fixed or Open Badge */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${
                          isFixed
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                            : 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                        }`}
                      >
                        {isFixed ? <Check size={11} /> : <AlertTriangle size={11} />}
                        <span>{isFixed ? 'تم الإصلاح' : 'مفتوح / جاري الفحص'}</span>
                      </span>

                      {/* Severity Badge */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${sevBadge.color}`}
                      >
                        {sevBadge.label}
                      </span>

                      {bug.foundInVersion && (
                        <span className="text-[10px] font-mono text-slate-400 bg-[#171e2b] px-2 py-0.5 rounded">
                          النسخة: {bug.foundInVersion}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold leading-snug ${
                        isFixed ? 'text-slate-300 line-through' : 'text-white'
                      }`}
                    >
                      {bug.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {bug.description}
                    </p>

                    {/* Reproduction steps if any */}
                    {bug.stepsToReproduce && (
                      <div className="p-2.5 rounded-lg bg-[#161e2b] border border-[#253043] text-xs space-y-1 mt-2">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          خطوات تكرار المشكلة (Reproduction Steps):
                        </span>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                          {bug.stepsToReproduce}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => toggleBugStatus(bug.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isFixed
                          ? 'bg-[#1a2332] text-slate-300 hover:text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {isFixed ? (
                        <>
                          <RotateCcw size={13} />
                          <span>إعادة فتح المشكلة</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>تم الحل والإصلاح ✓</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(bug)}
                        className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"
                        title="تعديل"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteBug(bug.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 bg-[#12161f] border border-[#21262d] rounded-xl">
            <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-medium text-slate-200">
              {statusTab === 'open'
                ? 'رائع! لا توجد مشاكل مفتوحة حالياً.'
                : 'لا توجد عناصر مطابقة للفلاتر المختارة.'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              إذا واجهت أي خطأ برمجي في Studio أو أثناء تجربة اللعبة، سجله هنا لمتابعته.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Bug Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BugIcon size={18} className="text-rose-500" />
                <span>{editingBugId ? 'تعديل تقرير المشكلة' : 'تسجيل مشكلة برمجية جديدة'}</span>
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
                  عنوان المشكلة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خطأ في كود حفظ العملات عند خروج اللاعب فجأة"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  شرح المشكلة بالتفصيل
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ما الذي يحدث بالضبط؟ وما هي رسالة الخطأ في Output Console؟"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  خطوات تكرار المشكلة (How to reproduce)
                </label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. ادخل ساحة القتال 2. اضغط مفتاح Q 3. لاحظ تجمد الشخصية..."
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    درجة الخطورة
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="critical">حرجة جداً (توقف اللعبة كلياً)</option>
                    <option value="high">عالية (تأثير مباشر على اللاعبين)</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">بسيطة / مظهرية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نسخة اللعبة
                  </label>
                  <input
                    type="text"
                    value={foundInVersion}
                    onChange={(e) => setFoundInVersion(e.target.value)}
                    placeholder="e.g. v0.5.1 Alpha"
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
                  />
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
