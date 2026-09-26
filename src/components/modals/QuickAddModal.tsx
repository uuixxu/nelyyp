import React, { useState } from 'react';
import {
  CheckSquare,
  Bug as BugIcon,
  Lightbulb,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { TaskCategory, TaskPriority, BugSeverity, IdeaImpact } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    addTask,
    addBug,
    addIdea,
    data,
  } = useDevTracker();

  const [activeType, setActiveType] = useState<'task' | 'bug' | 'idea'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('gameplay');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [bugSeverity, setBugSeverity] = useState<BugSeverity>('medium');
  const [ideaImpact, setIdeaImpact] = useState<IdeaImpact>('high');

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (activeType === 'task') {
      addTask({
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        priority,
        category,
      });
    } else if (activeType === 'bug') {
      addBug({
        title: title.trim(),
        description: description.trim(),
        severity: bugSeverity,
        status: 'open',
        foundInVersion: data.project.gameVersion || 'v0.1.0',
      });
    } else if (activeType === 'idea') {
      addIdea({
        title: title.trim(),
        description: description.trim(),
        category: 'Quick Thought',
        status: 'new',
        impact: ideaImpact,
      });
    }

    // Reset and close
    setTitle('');
    setDescription('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600/15 text-red-400">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إضافة سريعة (Quick Add)</h3>
              <p className="text-[11px] text-slate-400">
                سجل أفكارك أو مهامك أو المشاكل بسرعة دون مقاطعة تركيزك.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Selector (Task / Bug / Idea) */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#161c27] rounded-xl border border-[#263143]">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeType === 'task'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare size={14} />
            <span>مهمة (Task)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('bug')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeType === 'bug'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BugIcon size={14} />
            <span>مشكلة (Bug)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('idea')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeType === 'idea'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb size={14} />
            <span>فكرة (Idea)</span>
          </button>
        </div>

        {/* Quick Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              العنوان *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeType === 'task'
                  ? 'مثال: ربط صوت القفز مع أنيميشن القفز'
                  : activeType === 'bug'
                  ? 'مثال: اختفاء سلاح اللاعب بعد الموت'
                  : 'مثال: إضافة صناديق هدايا مجانية كل 10 دقائق'
              }
              className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              ملاحظات أو تفاصيل موجزة
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب أية تفاصيل سريعة..."
              className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 resize-none"
            />
          </div>

          {/* Type specific quick controls */}
          {activeType === 'task' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  القسم
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
                >
                  <option value="gameplay">أسلوب اللعب (Gameplay)</option>
                  <option value="map">الخريطة والبيئة (Map)</option>
                  <option value="ui">الواجهات (UI)</option>
                  <option value="systems">الأنظمة والداتا (Systems)</option>
                  <option value="audio">الصوتيات (Audio)</option>
                  <option value="misc">متنوع (Misc)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  الأولوية
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="critical">حرجة</option>
                </select>
              </div>
            </div>
          )}

          {activeType === 'bug' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                درجة الخطورة
              </label>
              <select
                value={bugSeverity}
                onChange={(e) => setBugSeverity(e.target.value as BugSeverity)}
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="critical">حرجة جداً (توقف الماب)</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">بسيطة</option>
              </select>
            </div>
          )}

          {activeType === 'idea' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                مستوى التأثير المتوقع
              </label>
              <select
                value={ideaImpact}
                onChange={(e) => setIdeaImpact(e.target.value as IdeaImpact)}
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="high">تأثير قوي (High Impact)</option>
                <option value="medium">تأثير متوسط</option>
                <option value="low">تأثير بسيط</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              حفظ فوري
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
