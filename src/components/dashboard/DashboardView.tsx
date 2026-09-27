import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Gamepad2,
  Layout,
  Cpu,
  Bug,
  Calendar,
  Layers,
  ListTodo,
  Lightbulb,
  FileText,
  Radio,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Task } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    data,
    stats,
    setActiveTab,
    setTaskStatus,
    isRealtimeConnected,
  } = useDevTracker();

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'map':
        return MapPin;
      case 'gameplay':
        return Gamepad2;
      case 'ui':
        return Layout;
      case 'systems':
        return Cpu;
      default:
        return Layers;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return { label: 'حرجة', color: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' };
      case 'high':
        return { label: 'عالية', color: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20' };
      case 'low':
        return { label: 'منخفضة', color: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Obsidian Developer Overview */}
      <div className="rounded-lg bg-[#111114] border border-[#27272a] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>
                <span>Roblox Dev Tracker</span>
              </span>
              <span className="text-[11px] text-[#71717a] font-mono">
                {data.project.gameVersion || 'v0.0.1 Alpha'}
              </span>
              {isRealtimeConnected && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center gap-1">
                  <Radio size={9} />
                  <span>Realtime Synced</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] tracking-tight">
              {data.project.name || 'Demonfall 2'}
            </h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              منصة تتبع وتوثيق أنظمة اللعبة، بنية السيرفرات، المهام وسجل التحديثات الحية.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#a1a1aa]">
              <span className="flex items-center gap-1.5 bg-[#18181b] px-2 py-0.5 rounded-md border border-[#27272a] text-[11px] font-mono">
                <Gamepad2 size={12} className="text-[#8b5cf6]" />
                <span className="text-[#f4f4f5]">{data.project.genre}</span>
              </span>
              {data.project.targetReleaseDate && (
                <span className="flex items-center gap-1.5 bg-[#18181b] px-2 py-0.5 rounded-md border border-[#27272a] text-[11px] font-mono">
                  <Calendar size={12} className="text-[#a1a1aa]" />
                  <span>إطلاق مستهدف: {data.project.targetReleaseDate}</span>
                </span>
              )}
            </div>
          </div>

          {/* Overall Progress Gauge Widget (Obsidian Minimal) */}
          <div className="flex items-center gap-3.5 bg-[#18181b] p-3.5 rounded-lg border border-[#27272a] self-start md:self-auto min-w-[220px]">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#27272a]"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#8b5cf6] transition-all duration-500 ease-out"
                  strokeDasharray={`${stats.totalProgressPercentage}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold text-[#f4f4f5] font-mono">
                  {stats.totalProgressPercentage}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#a1a1aa]">جاهزية الماب</div>
              <div className="text-xs font-semibold text-[#f4f4f5]">
                {stats.totalProgressPercentage >= 80
                  ? 'جاهز للإطلاق'
                  : stats.totalProgressPercentage >= 40
                  ? 'مرحلة التطوير النشط'
                  : 'مرحلة البناء الأولية'}
              </div>
              <button
                onClick={() => setActiveTab('progression')}
                className="text-[11px] text-[#8b5cf6] hover:text-[#7c3aed] font-medium flex items-center gap-1 mt-1 transition-colors cursor-pointer"
              >
                <span>تفاصيل الأقسام</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Completed Tasks */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
            <span className="text-xs font-medium">المهام المنجزة</span>
            <div className="p-1 rounded bg-[#22c55e]/10 text-[#22c55e]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold font-mono text-[#f4f4f5]">
              {stats.completedTasksCount}
            </span>
            <span className="text-[11px] text-[#71717a]">من أصل {data.tasks.length}</span>
          </div>
          <div className="w-full bg-[#18181b] h-1 rounded-full overflow-hidden mt-2.5">
            <div
              className="bg-[#22c55e] h-full rounded-full"
              style={{
                width: `${
                  data.tasks.length > 0
                    ? Math.round((stats.completedTasksCount / data.tasks.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
            <span className="text-xs font-medium">المهام المتبقية</span>
            <div className="p-1 rounded bg-[#8b5cf6]/10 text-[#8b5cf6]">
              <Clock size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold font-mono text-[#f4f4f5]">
              {stats.remainingTasksCount}
            </span>
            <span className="text-[11px] text-[#71717a]">مهمة عمل</span>
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-[11px] text-[#8b5cf6] font-mono">
            <span>{stats.inProgressTasksCount} قيد التنفيذ الآن</span>
          </div>
        </div>

        {/* Open Bugs */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
            <span className="text-xs font-medium">أخطاء ومشاكل</span>
            <div
              className={`p-1 rounded ${
                stats.openBugsCount > 0
                  ? 'bg-[#ef4444]/10 text-[#ef4444]'
                  : 'bg-[#22c55e]/10 text-[#22c55e]'
              }`}
            >
              <Bug size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-semibold font-mono ${
                stats.openBugsCount > 0 ? 'text-[#ef4444]' : 'text-[#f4f4f5]'
              }`}
            >
              {stats.openBugsCount}
            </span>
            <span className="text-[11px] text-[#71717a]">مشكلة مفتوحة</span>
          </div>
          <div className="mt-2.5 text-[11px] text-[#a1a1aa]">
            {stats.criticalBugsCount > 0 ? (
              <span className="text-[#ef4444] font-medium font-mono">
                {stats.criticalBugsCount} حرجة
              </span>
            ) : (
              <span className="text-[#71717a]">لا توجد كراشات</span>
            )}
          </div>
        </div>

        {/* Notes & Ideas */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
            <span className="text-xs font-medium">الملاحظات والأكواد</span>
            <div className="p-1 rounded bg-[#18181b] text-[#a1a1aa]">
              <FileText size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold font-mono text-[#f4f4f5]">
              {stats.totalNotesCount}
            </span>
            <span className="text-[11px] text-[#71717a]">وثيقة برمجية</span>
          </div>
          <button
            onClick={() => setActiveTab('notes')}
            className="mt-2.5 text-[11px] text-[#8b5cf6] hover:text-[#7c3aed] font-medium text-right transition-colors cursor-pointer"
          >
            فتح محرر الملاحظات ←
          </button>
        </div>
      </div>

      {/* Current Active Task in Studio (المهمة الحالية) */}
      <div className="rounded-lg border border-[#27272a] bg-[#111114] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" />
              <span className="text-[11px] font-mono text-[#eab308] uppercase tracking-wider font-medium">
                Active Studio Focus (التركيز الحالي في Studio)
              </span>
            </div>

            {stats.activeTask ? (
              <div>
                <h3 className="text-sm font-semibold text-[#f4f4f5]">{stats.activeTask.title}</h3>
                <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-2xl leading-relaxed">
                  {stats.activeTask.description || 'لا يوجد وصف إضافي.'}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="font-mono text-[#71717a]">
                    القسم: {stats.activeTask.category}
                  </span>
                  <span aria-hidden="true" className="text-[#3f3f46]">·</span>
                  <span className="font-mono text-[#71717a]">
                    الأولوية: {getPriorityBadge(stats.activeTask.priority).label}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-medium text-[#a1a1aa]">
                  لا توجد مهمة نشطة محددة حالياً
                </h3>
                <p className="text-[11px] text-[#71717a] mt-0.5">
                  حدد مهمة كـ "قيد التنفيذ" من جدول المهام للتركيز عليها.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {stats.activeTask && (
              <button
                onClick={() => setTaskStatus(stats.activeTask!.id, 'completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>إتمام المهمة</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] text-xs font-medium transition-colors cursor-pointer"
            >
              <ListTodo size={13} />
              <span>جدول المهام</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progression Modules Overview (Map, Gameplay, UI, Systems) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#8b5cf6]" />
            <h2 className="text-xs font-semibold text-[#f4f4f5]">مراحل تقدم الأقسام (Progression Modules)</h2>
          </div>
          <button
            onClick={() => setActiveTab('progression')}
            className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors flex items-center gap-1"
          >
            <span>عرض البنود</span>
            <ArrowUpRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.progression.map((category) => {
            const Icon = getCategoryIcon(category.id);
            const catStats = stats.progressionStats[category.id] || {
              total: 0,
              completed: 0,
              percentage: 0,
            };

            return (
              <div
                key={category.id}
                onClick={() => setActiveTab('progression')}
                className="group cursor-pointer bg-[#111114] border border-[#27272a] hover:border-[#3f3f46] rounded-lg p-3.5 transition-all text-right"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-1.5 rounded-md bg-[#18181b] text-[#a1a1aa] group-hover:text-[#8b5cf6] border border-[#27272a] transition-colors">
                    <Icon size={15} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#f4f4f5]">
                    {catStats.percentage}%
                  </span>
                </div>

                <h3 className="font-medium text-xs text-[#f4f4f5] group-hover:text-[#8b5cf6] transition-colors">
                  {category.nameAr}
                </h3>
                <div className="text-[10px] text-[#71717a] font-mono mb-2.5">
                  {category.name}
                </div>

                <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#8b5cf6] rounded-full transition-all duration-300"
                    style={{ width: `${catStats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#71717a] font-mono">
                  <span>
                    {catStats.completed} / {catStats.total} بند
                  </span>
                  <span className="text-[#8b5cf6]">استعراض ←</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Accomplishments vs Urgent Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Accomplishments (آخر الإنجازات) */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#22c55e]" />
              <h2 className="text-xs font-semibold text-[#f4f4f5]">آخر الإنجازات المسجلة</h2>
            </div>
            <span className="text-[11px] font-mono text-[#71717a]">سجل النشاط</span>
          </div>

          <div className="space-y-2">
            {data.activities.length > 0 ? (
              data.activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-xs"
                >
                  <div className="p-0.5 rounded-full text-[#22c55e] mt-0.5 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[#f4f4f5] leading-snug font-medium text-xs">{act.message}</p>
                    <div className="text-[10px] text-[#71717a] font-mono">
                      {new Date(act.timestamp).toLocaleDateString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#71717a]">
                لم يتم تسجيل إنجازات بعد.
              </div>
            )}
          </div>
        </div>

        {/* Priority Focus Tasks & Open Bugs */}
        <div className="bg-[#111114] border border-[#27272a] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#eab308]" />
              <h2 className="text-xs font-semibold text-[#f4f4f5]">المهام ذات الأولوية العالية</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2">
            {data.tasks
              .filter((t) => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high'))
              .slice(0, 4)
              .map((task) => {
                const priorityInfo = getPriorityBadge(task.priority);
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3 hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${priorityInfo.color}`}
                        >
                          {priorityInfo.label}
                        </span>
                        <span className="text-[10px] text-[#71717a] font-mono">
                          {task.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-[#f4f4f5] truncate">
                        {task.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => setTaskStatus(task.id, 'completed')}
                      className="p-1 rounded text-[#71717a] hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors shrink-0"
                      title="إكمال المهمة"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  </div>
                );
              })}

            {data.tasks.filter(
              (t) => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high')
            ).length === 0 && (
              <div className="py-8 text-center text-xs text-[#71717a]">
                لا توجد مهام ذات أولوية عالية متبقية.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
