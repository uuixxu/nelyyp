import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Play,
  LayoutGrid,
  List,
  Calendar,
  Pin,
  X,
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
        return { label: 'حرجة', color: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' };
      case 'high':
        return { label: 'عالية', color: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20' };
      case 'low':
        return { label: 'منخفضة', color: 'text-[#a1a1aa] bg-[#18181b] border-[#27272a]' };
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  const columns: { status: TaskStatus; label: string; icon: any; countColor: string; activeColor: string }[] = [
    { status: 'todo', label: 'قيد الانتظار (To Do)', icon: Clock, countColor: 'text-[#a1a1aa]', activeColor: 'border-[#27272a]' },
    { status: 'in_progress', label: 'قيد التنفيذ (In Progress)', icon: Play, countColor: 'text-[#8b5cf6]', activeColor: 'border-[#8b5cf6]/40' },
    { status: 'completed', label: 'مكتملة (Completed)', icon: CheckCircle2, countColor: 'text-[#22c55e]', activeColor: 'border-[#22c55e]/40' },
  ];

  return (
    <div className="space-y-5">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] flex items-center gap-2">
            <CheckSquare className="text-[#8b5cf6]" size={22} />
            <span>إدارة مهام الماب (Tasks)</span>
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            تنسيق وجدولة مهام Luau، بناء البيئات، وتتبع الأولويات في مسار إنتاج Demonfall 2.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#111114] p-0.5 rounded-md border border-[#27272a]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
              title="عرض كانبان (أعمدة)"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
              title="عرض القائمة"
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={() => openAddModal('todo')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-lg bg-[#111114] border border-[#27272a]">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <Filter size={13} />
          <span>الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
          >
            <option value="all">كافة الحالات</option>
            <option value="todo">قيد الانتظار (To Do)</option>
            <option value="in_progress">قيد التنفيذ (In Progress)</option>
            <option value="completed">مكتملة (Completed)</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <span>الأولوية:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
          >
            <option value="all">كافة الأولويات</option>
            <option value="critical">حرجة</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <span>القسم:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
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
            className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] mr-auto transition-colors cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Main Task Display: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            const Icon = col.icon;

            return (
              <div
                key={col.status}
                className="bg-[#111114] border border-[#27272a] rounded-lg flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/30">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={col.countColor} />
                    <h3 className="font-medium text-xs text-[#f4f4f5]">{col.label}</h3>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded border bg-[#18181b] ${col.countColor} border-[#27272a]`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="p-2.5 flex-1 space-y-2 overflow-y-auto">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => {
                      const priority = getPriorityBadge(task.priority);
                      const isCurrentActive = data.project.currentActiveTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`group rounded-lg p-3 border transition-colors ${
                            isCurrentActive
                              ? 'bg-[#18181b] border-[#eab308]/50'
                              : 'bg-[#111114] border-[#27272a] hover:border-[#3f3f46]'
                          }`}
                        >
                          {/* Active Tag */}
                          {isCurrentActive && (
                            <div className="flex items-center gap-1.5 text-[10px] text-[#eab308] font-mono mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse"></span>
                              <span>التركيز الحالي في Studio</span>
                            </div>
                          )}

                          {/* Header of card: Priority + Category */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${priority.color}`}
                            >
                              {priority.label}
                            </span>

                            <span className="text-[10px] font-mono text-[#71717a]">
                              {getCategoryLabel(task.category)}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-medium text-[#f4f4f5] leading-snug mb-1">
                            {task.title}
                          </h4>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-relaxed mb-2">
                              {task.description}
                            </p>
                          )}

                          {/* Footer Info: Due Date / Hours */}
                          <div className="flex items-center justify-between text-[11px] text-[#71717a] pt-1.5 border-t border-[#27272a]">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-[#a1a1aa]">
                                <Calendar size={11} />
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
                                      ? 'text-[#eab308]'
                                      : 'text-[#71717a] hover:text-[#eab308]'
                                  }`}
                                  title={
                                    isCurrentActive
                                      ? 'إلغاء تعيينها كمهمة نشطة'
                                      : 'تعيين كمهمة نشطة في Studio'
                                  }
                                >
                                  <Pin size={12} className={isCurrentActive ? 'fill-current' : ''} />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                                title="تعديل المهمة"
                              >
                                <Edit3 size={12} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
                                title="حذف المهمة"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Quick Status Changers */}
                          <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-[#27272a]">
                            {task.status !== 'todo' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'todo')}
                                className="text-[10px] text-[#a1a1aa] hover:text-[#f4f4f5] px-1.5 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] transition-colors cursor-pointer"
                              >
                                ← للانتظار
                              </button>
                            )}

                            {task.status !== 'in_progress' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'in_progress')}
                                className="text-[10px] text-[#8b5cf6] hover:text-[#7c3aed] px-1.5 py-0.5 rounded bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 border border-[#8b5cf6]/20 transition-colors cursor-pointer"
                              >
                                قيد التنفيذ
                              </button>
                            )}

                            {task.status !== 'completed' && (
                              <button
                                onClick={() => setTaskStatus(task.id, 'completed')}
                                className="text-[10px] text-[#22c55e] hover:text-[#16a34a] px-1.5 py-0.5 rounded bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/20 transition-colors cursor-pointer"
                              >
                                تم الإنجاز ✓
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-[#71717a]">
                      لا توجد مهام في هذه الخانة
                    </div>
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-2.5 border-t border-[#27272a] bg-[#18181b]/20">
                  <button
                    onClick={() => openAddModal(col.status)}
                    className="w-full py-1 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center justify-center gap-1 rounded hover:bg-[#18181b] transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>إضافة مهمة جديدة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#111114] border border-[#27272a] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#18181b] text-[#a1a1aa] border-b border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">الحالة</th>
                  <th className="py-2.5 px-3 font-medium">المهمة</th>
                  <th className="py-2.5 px-3 font-medium">القسم</th>
                  <th className="py-2.5 px-3 font-medium">الأولوية</th>
                  <th className="py-2.5 px-3 font-medium">الموعد المستهدف</th>
                  <th className="py-2.5 px-3 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const priority = getPriorityBadge(task.priority);
                    const isCurrentActive = data.project.currentActiveTaskId === task.id;

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-[#18181b]/50 transition-colors ${
                          isCurrentActive ? 'bg-[#18181b]/80' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
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
                              <span className="flex items-center gap-1.5 text-[#22c55e] font-mono text-[11px]">
                                <CheckCircle2 size={14} />
                                <span>مكتملة</span>
                              </span>
                            ) : task.status === 'in_progress' ? (
                              <span className="flex items-center gap-1.5 text-[#8b5cf6] font-mono text-[11px]">
                                <Play size={14} />
                                <span>قيد التنفيذ</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[#71717a] font-mono text-[11px]">
                                <Clock size={14} />
                                <span>قيد الانتظار</span>
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-[#f4f4f5]">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-[#a1a1aa] line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[#71717a]">
                          {getCategoryLabel(task.category)}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${priority.color}`}
                          >
                            {priority.label}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[#71717a]">
                          {task.dueDate || '-'}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveTask(isCurrentActive ? null : task.id)}
                              className={`p-1 rounded cursor-pointer ${
                                isCurrentActive ? 'text-[#eab308]' : 'text-[#71717a] hover:text-[#eab308]'
                              }`}
                              title="التركيز في Studio"
                            >
                              <Pin size={13} className={isCurrentActive ? 'fill-current' : ''} />
                            </button>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 text-[#71717a] hover:text-[#f4f4f5] cursor-pointer"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-[#71717a] hover:text-[#ef4444] cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#71717a]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2">
                <CheckSquare size={16} className="text-[#8b5cf6]" />
                <span>{editingTaskId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717a] hover:text-[#f4f4f5] p-1 rounded hover:bg-[#18181b] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: برمجة نظام ضربات السيوف وتأثيرات الدمج"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  تفاصيل المهمة / متطلبات السكربت أو الموديل
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب ملاحظات تفصيلية أو الخطوات اللازمة لإنجازها..."
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    الحالة
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
                  >
                    <option value="todo">قيد الانتظار (To Do)</option>
                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتملة (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    الأولوية
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
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
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    القسم
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
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
                    الموعد النهائي المستهدف
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
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
