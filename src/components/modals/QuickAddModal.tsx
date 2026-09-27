import React, { useState } from 'react';
import {
  CheckSquare,
  Bug as BugIcon,
  Lightbulb,
  FileText,
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
    addNote,
    data,
  } = useDevTracker();

  const [activeType, setActiveType] = useState<'task' | 'bug' | 'idea' | 'note'>('task');
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
        foundInVersion: data.project.gameVersion || 'v0.0.1 Alpha',
      });
    } else if (activeType === 'idea') {
      addIdea({
        title: title.trim(),
        description: description.trim(),
        category: 'Quick Thought',
        status: 'new',
        impact: ideaImpact,
      });
    } else if (activeType === 'note') {
      addNote({
        title: title.trim(),
        content: description.trim() || '-- Luau snippet / note',
        category: 'general',
        tags: ['Quick'],
      });
    }

    // Reset and close
    setTitle('');
    setDescription('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
              <Zap size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">إضافة سريعة (Quick Add)</h3>
              <p className="text-[11px] text-[#a1a1aa]">
                سجل أفكارك أو مهامك أو المشاكل بسرعة دون مقاطعة تركيزك في التطوير.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Type Selector (Task / Bug / Idea / Note) */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#18181b] rounded-md border border-[#27272a]">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeType === 'task'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <CheckSquare size={13} className="text-[#8b5cf6]" />
            <span>مهمة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('bug')}
            className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeType === 'bug'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <BugIcon size={13} className="text-[#ef4444]" />
            <span>مشكلة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('idea')}
            className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeType === 'idea'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <Lightbulb size={13} className="text-[#eab308]" />
            <span>فكرة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('note')}
            className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeType === 'note'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <FileText size={13} className="text-[#a1a1aa]" />
            <span>ملاحظة</span>
          </button>
        </div>

        {/* Quick Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
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
                  : activeType === 'idea'
                  ? 'مثال: إضافة نظام تصفيات ومواسم شهرية'
                  : 'مثال: دالة حساب نسبة ضرر الضربات الحرجة'
              }
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
              ملاحظات أو تفاصيل موجزة
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب أية تفاصيل سريعة..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none"
            />
          </div>

          {/* Type specific quick controls */}
          {activeType === 'task' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  القسم
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
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
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  الأولوية
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
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
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                درجة الخطورة
              </label>
              <select
                value={bugSeverity}
                onChange={(e) => setBugSeverity(e.target.value as BugSeverity)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
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
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                مستوى التأثير المتوقع
              </label>
              <select
                value={ideaImpact}
                onChange={(e) => setIdeaImpact(e.target.value as IdeaImpact)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
              >
                <option value="high">تأثير قوي (High Impact)</option>
                <option value="medium">تأثير متوسط</option>
                <option value="low">تأثير بسيط</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              حفظ فوري
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
