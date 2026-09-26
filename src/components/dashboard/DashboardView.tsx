import React from 'react';
import {
  CheckSquare,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Gamepad2,
  Layout,
  Cpu,
  Sparkles,
  Bug,
  Plus,
  Calendar,
  Layers,
  ListTodo,
  Lightbulb,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Task } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    data,
    stats,
    setActiveTab,
    setTaskStatus,
    setActiveTask,
    setIsQuickAddOpen,
    setIsProjectSettingsOpen,
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
        return { label: 'حرجة', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
      case 'high':
        return { label: 'عالية', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-sky-400 bg-sky-950/60 border-sky-800/60' };
      case 'low':
        return { label: 'منخفضة', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Project Meta */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#161c27] via-[#12161f] to-[#0f131a] border border-[#21262d] p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                <span>Roblox Studio Dev Tracker</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {data.project.gameVersion || 'v1.0.0'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {data.project.name || 'ماب Roblox'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              تتبع بناء البيئات والسكربتات وواجهات المستخدم ومشاكل التشغيل في مكان واحد منظم.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-[#1a212e] px-2.5 py-1 rounded-md border border-[#2a3243]">
                <Gamepad2 size={13} className="text-red-400" />
                <span className="text-slate-300">{data.project.genre}</span>
              </span>
              {data.project.targetReleaseDate && (
                <span className="flex items-center gap-1.5 bg-[#1a212e] px-2.5 py-1 rounded-md border border-[#2a3243]">
                  <Calendar size={13} className="text-amber-400" />
                  <span>موعد الإطلاق المستهدف: {data.project.targetReleaseDate}</span>
                </span>
              )}
            </div>
          </div>

          {/* Overall Progress Gauge Widget */}
          <div className="flex items-center gap-4 bg-[#141a24]/90 p-4 rounded-xl border border-[#262f3f] self-start md:self-auto min-w-[240px]">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${stats.totalProgressPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-extrabold text-white font-mono">
                  {stats.totalProgressPercentage}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium">جاهزية اللعبة</div>
              <div className="text-sm font-bold text-slate-200">
                {stats.totalProgressPercentage >= 80
                  ? 'جاهز للإطلاق التجريبي'
                  : stats.totalProgressPercentage >= 50
                  ? 'مرحلة متقدمة من البناء'
                  : 'مرحلة التطوير الأولية'}
              </div>
              <button
                onClick={() => setActiveTab('progression')}
                className="text-[11px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1 mt-1 transition-colors"
              >
                <span>استعراض الأقسام</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completed Tasks */}
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">المهام المكتملة</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.completedTasksCount}
            </span>
            <span className="text-xs text-slate-400">منجز بالكامل</span>
          </div>
          <div className="w-full bg-[#1b212c] h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-400 h-full rounded-full"
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
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">المهام المتبقية</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.remainingTasksCount}
            </span>
            <span className="text-xs text-slate-400">تحت العمل والانتظار</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-amber-400/90 font-mono">
            <span>{stats.inProgressTasksCount} قيد التنفيذ الآن</span>
          </div>
        </div>

        {/* Open Bugs */}
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">أخطاء ومشاكل</span>
            <div
              className={`p-1.5 rounded-lg ${
                stats.openBugsCount > 0
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <Bug size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                stats.openBugsCount > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {stats.openBugsCount}
            </span>
            <span className="text-xs text-slate-400">مشكلة مفتوحة</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {stats.criticalBugsCount > 0 ? (
              <span className="text-rose-400 font-medium">
                {stats.criticalBugsCount} بحاجة لحل عاجل
              </span>
            ) : (
              <span>لا توجد أخطاء حرجة</span>
            )}
          </div>
        </div>

        {/* Ideas Backlog */}
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">أفكار ومقترحات</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Lightbulb size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.totalIdeasCount}
            </span>
            <span className="text-xs text-slate-400">فكرة محفوظة</span>
          </div>
          <button
            onClick={() => setActiveTab('ideas')}
            className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium text-right transition-colors"
          >
            تصفح بنك الأفكار ←
          </button>
        </div>
      </div>

      {/* Current Active Task in Studio (المهمة الحالية) */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#161a22] to-[#12161f] p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                المهمة الحالية (Active Studio Focus)
              </span>
            </div>

            {stats.activeTask ? (
              <div>
                <h3 className="text-lg font-bold text-white">{stats.activeTask.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {stats.activeTask.description || 'لا يوجد وصف تفصيلي لهذه المهمة.'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="font-mono text-slate-400">
                    القسم: {stats.activeTask.category}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-slate-400">
                    الأولوية: {getPriorityBadge(stats.activeTask.priority).label}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-semibold text-slate-300">
                  لا توجد مهمة نشطة محددة حالياً
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختر مهمة من قائمة المهام وضعها كـ "قيد العمل" للتركيز عليها داخل Roblox Studio.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {stats.activeTask ? (
              <button
                onClick={() => setTaskStatus(stats.activeTask!.id, 'completed')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>إتمام المهمة الآن</span>
              </button>
            ) : null}

            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-200 text-xs font-medium transition-colors"
            >
              <ListTodo size={14} />
              <span>جدول المهام</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progression Modules Overview (Map, Gameplay, UI, Systems) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-red-400" />
            <h2 className="text-base font-bold text-white">مراحل التقدم حسب الأقسام (Progression)</h2>
          </div>
          <button
            onClick={() => setActiveTab('progression')}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>عرض كافة البنود</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="group cursor-pointer bg-[#12161f] border border-[#21262d] hover:border-red-500/40 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#1a212e] text-slate-300 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-200 group-hover:text-white">
                    {catStats.percentage}%
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white group-hover:text-red-400 transition-colors">
                  {category.nameAr}
                </h3>
                <div className="text-[11px] text-slate-400 font-mono mb-3">
                  {category.name}
                </div>

                <div className="w-full bg-[#1b212c] h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 group-hover:bg-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${catStats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {catStats.completed} من {catStats.total} مكتمل
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-300">تعديل ←</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Accomplishments vs Urgent Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accomplishments (آخر الإنجازات) */}
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h2 className="text-base font-bold text-white">آخر الإنجازات المكتملة</h2>
            </div>
            <span className="text-xs text-slate-400">سجل النشاط</span>
          </div>

          <div className="space-y-3">
            {data.activities.length > 0 ? (
              data.activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#161c27]/70 border border-[#21262d]/60 text-xs"
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-slate-200 leading-snug font-medium">{act.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleDateString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                لم يتم تسجيل إنجازات بعد. ابدأ بإكمال المهام وعناصر التطوير!
              </div>
            )}
          </div>
        </div>

        {/* Priority Focus Tasks & Open Bugs */}
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-amber-400" />
              <h2 className="text-base font-bold text-white">المهام ذات الأولوية العالية</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2.5">
            {data.tasks
              .filter((t) => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high'))
              .slice(0, 4)
              .map((task) => {
                const priorityInfo = getPriorityBadge(task.priority);
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-[#161c27]/70 border border-[#21262d]/70 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${priorityInfo.color}`}
                        >
                          {priorityInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate">
                        {task.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => setTaskStatus(task.id, 'completed')}
                      className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors shrink-0"
                      title="إكمال المهمة"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                );
              })}

            {data.tasks.filter(
              (t) => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high')
            ).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                ممتاز! لا توجد مهام ذات أولوية حرجة أو عالية متبقية.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
