import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Play,
  Flame,
  LayoutGrid,
  List,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Pin,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';

export const TasksView: React.FC = () => {
  const {
    data,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    setActiveTask,
    searchQuery,
    setSearchQuery,
  } = useDevTracker();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State for Add / Edit Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formCategory, setFormCategory] = useState<TaskCategory>('gameplay');
  const [formDueDate, setFormDueDate] = useState('');
  const [formEstimatedHours, setFormEstimatedHours] = useState<number | undefined>(undefined);

  const openAddModal = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus(defaultStatus);
    setFormPriority('medium');
    setFormCategory('gameplay');
    setFormDueDate('');
    setFormEstimatedHours(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate || '');
    setFormEstimatedHours(task.estimatedHours);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        status: formStatus,
        priority: formPriority,
        category: formCategory,
        dueDate: formDueDate || undefined,
        estimatedHours: formEstimatedHours,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        status: formStatus,
        priority: formPriority,
        category: formCategory,
        dueDate: formDueDate || undefined,
        estimatedHours: formEstimatedHours,
      });
    }

    setIsModalOpen(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
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

  const getCategoryLabel = (category: TaskCategory) => {
    switch (category) {
      case 'map':
        return 'الخريطة والبيئة';
      case 'gameplay':
        return 'أسلوب اللعب';
      case 'ui':
        return 'واجهات المستخدم';
      case 'systems':
        return 'الأنظمة والسيرفر';
      case 'audio':
        return 'الصوتيات';
      case 'misc':
        return 'متنوع';
    }
  };

  // Filter tasks
  const filteredTasks = data.tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  const columns: { status: TaskStatus; label: string; icon: any; countColor: string }[] = [
    { status: 'todo', label: 'قيد الانتظار (To Do)', icon: Clock, countColor: 'text-slate-300' },
    { status: 'in_progress', label: 'قيد التنفيذ (In Progress)', icon: Play, countColor: 'text-amber-400' },
    { status: 'completed', label: 'مكتملة (Completed)', icon: CheckCircle2, countColor: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <CheckSquare className="text-red-500" size={24} />
            <span>إدارة مهام الماب (Tasks)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            نظم مهام البرمجة والبناء والتصميم مع تحديد الأولويات وحالات التنفيذ.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#141a24] p-1 rounded-lg border border-[#21262d]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض كانبان (أعمدة)"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض القائمة"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => openAddModal('todo')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md shadow-red-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#12161f] border border-[#21262d]">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter size={14} />
          <span>الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="all">كافة الحالات</option>
            <option value="todo">قيد الانتظار (To Do)</option>
            <option value="in_progress">قيد التنفيذ (In Progress)</option>
            <option value="completed">مكتملة (Completed)</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>الأولوية:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="all">كافة الأولويات</option>
            <option value="critical">حرجة</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>القسم:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#18202d] border border-[#2a3446] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="all">كافة الأقسام</option>
            <option value="map">الخريطة والبيئة</option>
            <option value="gameplay">أسلوب اللعب</option>
            <option value="ui">واجهات المستخدم</option>
            <option value="systems">الأنظمة والسيرفر</option>
            <option value="audio">الصوتيات</option>
            <option value="misc">متنوع</option>
          </select>
        </div>

        {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-red-400 hover:text-red-300 mr-auto transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Main Task Display: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            const Icon = col.icon;

            return (
              <div
                key={col.status}
                className="bg-[#0f141d] border border-[#21262d] rounded-xl flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#21262d] flex items-center justify-between bg-[#131923]">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={col.countColor} />
                    <h3 className="font-semibold text-xs text-slate-200">{col.label}</h3>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#1b2230] ${col.countColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => {
                      const priority = getPriorityBadge(task.priority);
                      const isCurrentActive = data.project.currentActiveTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`group rounded-xl p-3.5 border transition-all duration-200 shadow-sm relative ${
                            isCurrentActive
                              ? 'bg-[#18212e] border-amber-500/50 ring-1 ring-amber-500/30'
                              : 'bg-[#141a24] border-[#222938] hover:border-slate-600'
                          }`}
                        >
                          {/* Active Tag */}
                          {isCurrentActive && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mb-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              <span>التركيز الحالي في Studio</span>
                            </div>
                          )}

                          {/* Header of card: Priority + Category */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${priority.color}`}
                            >
                              {priority.label}
                            </span>

                            <span className="text-[10px] font-mono text-slate-400 bg-[#1a212f] px-2 py-0.5 rounded">
                              {getCategoryLabel(task.category)}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-semibold text-white leading-relaxed mb-1.5">
                            {task.title}
                          </h4>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                              {task.description}
                            </p>
                          )}

                          {/* Footer Info: Due Date / Hours */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#21262d]/60">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1 font-mono text-slate-400">
                                <Calendar size={12} />
                                {task.dueDate}
                              </span>
                            ) : (
                              <span></span>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {/* Set as active studio task */}
                              {task.status !== 'completed' && (
                                <button
                                  onClick={() =>
                                    setActiveTask(isCurrentActive ? null : task.id)
                                  }
                                  className={`p-1 rounded transition-colors cursor-pointer ${
                                    isCurrentActive
                                      ? 'text-amber-400 hover:text-amber-300'
                                      : 'text-slate-500 hover:text-amber-400'
                                  }`}
                                  title={
                                    isCurrentActive
                                      ? 'إلغاء تعيينها كمهمة نشطة'
                                      : 'تعيين كمهمة نشطة في Studio'
                                  }
                                >
                                  <Pin size={13} className={isCurrentActive ? 'fill-current' : ''} />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                                title="تعديل المهمة"
                              >
                                <Edit3 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="حذف المهمة"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Quick Status Changers */}
                          <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-[#21262d]/40">
                            {task.status !== 'todo' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'todo')}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#18202d] hover:bg-[#202939] transition-colors"
                              >
                                ← للانتظار
                              </button>
                            )}

                            {task.status !== 'in_progress' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'in_progress')}
                                className="text-[10px] text-amber-400/90 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/40 transition-colors"
                              >
                                قيد التنفيذ
                              </button>
                            )}

                            {task.status !== 'completed' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'completed')}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 transition-colors"
                              >
                                تم الإنجاز ✓
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      لا توجد مهام في هذه الخانة
                    </div>
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-3 border-t border-[#21262d] bg-[#111620]">
                  <button
                    onClick={() => openAddModal(col.status)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 rounded hover:bg-[#1a212e] transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>إضافة مهمة جديدة هنا</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#161c27] text-slate-400 border-b border-[#21262d]">
                <tr>
                  <th className="py-3 px-4 font-medium">الحالة</th>
                  <th className="py-3 px-4 font-medium">المهمة</th>
                  <th className="py-3 px-4 font-medium">القسم</th>
                  <th className="py-3 px-4 font-medium">الأولوية</th>
                  <th className="py-3 px-4 font-medium">الموعد المستهدف</th>
                  <th className="py-3 px-4 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]/60">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const priority = getPriorityBadge(task.priority);
                    const isCurrentActive = data.project.currentActiveTaskId === task.id;

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-[#161c27]/60 transition-colors ${
                          isCurrentActive ? 'bg-amber-950/15' : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              setTaskStatus(
                                task.id,
                                task.status === 'completed'
                                  ? 'todo'
                                  : task.status === 'todo'
                                  ? 'in_progress'
                                  : 'completed'
                              )
                            }
                            className="cursor-pointer"
                          >
                            {task.status === 'completed' ? (
                              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                                <CheckCircle2 size={15} />
                                <span>مكتملة</span>
                              </span>
                            ) : task.status === 'in_progress' ? (
                              <span className="flex items-center gap-1.5 text-amber-400 font-mono">
                                <Play size={15} />
                                <span>قيد التنفيذ</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                                <Clock size={15} />
                                <span>قيد الانتظار</span>
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                          {getCategoryLabel(task.category)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${priority.color}`}
                          >
                            {priority.label}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                          {task.dueDate || '-'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveTask(isCurrentActive ? null : task.id)}
                              className={`p-1 rounded cursor-pointer ${
                                isCurrentActive ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                              }`}
                              title="التركيز في Studio"
                            >
                              <Pin size={14} className={isCurrentActive ? 'fill-current' : ''} />
                            </button>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      لا توجد مهام مطابقة للبحث أو الفلتر
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-red-500" />
                <span>{editingTaskId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: برمجة نظام ضربات السيوف وتأثيرات الدمج"
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تفاصيل المهمة / متطلبات السكربت أو الموديل
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب ملاحظات تفصيلية أو الخطوات اللازمة لإنجازها..."
                  className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="todo">قيد الانتظار (To Do)</option>
                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتملة (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    الأولوية
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="low">منخفضة (Low)</option>
                    <option value="medium">متوسطة (Medium)</option>
                    <option value="high">عالية (High)</option>
                    <option value="critical">حرجة جداً (Critical)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    القسم
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
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
                    الموعد النهائي المستهدف
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-mono"
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  {editingTaskId ? 'حفظ التعديلات' : 'إضافة المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
