import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DevTrackerData,
  Task,
  ProgressionCategory,
  ProgressionItem,
  Idea,
  Bug,
  ProjectInfo,
  ActivityLog,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  IdeaStatus,
  IdeaImpact,
  BugSeverity,
  BugStatus,
} from '../types';
import { initialTrackerData } from '../data/initialData';

const STORAGE_KEY = 'roblox_dev_tracker_v1';

interface DevTrackerContextType {
  data: DevTrackerData;
  activeTab: 'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs';
  setActiveTab: (tab: 'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isProjectSettingsOpen: boolean;
  setIsProjectSettingsOpen: (open: boolean) => void;
  isExportImportOpen: boolean;
  setIsExportImportOpen: (open: boolean) => void;
  
  // Project Info
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  setActiveTask: (taskId: string | null) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  
  // Progression
  toggleProgressionItem: (categoryId: string, itemId: string) => void;
  addProgressionItem: (categoryId: string, title: string, notes?: string) => void;
  deleteProgressionItem: (categoryId: string, itemId: string) => void;
  addProgressionCategory: (category: Omit<ProgressionCategory, 'id' | 'items'>) => void;
  
  // Ideas
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToTask: (ideaId: string) => void;
  
  // Bugs
  addBug: (bug: Omit<Bug, 'id' | 'createdAt'>) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  toggleBugStatus: (id: string) => void;
  
  // Storage & Export/Import
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  resetToSampleData: () => void;
  clearAllData: () => void;
  
  // Calculated stats
  stats: {
    totalProgressPercentage: number;
    completedTasksCount: number;
    remainingTasksCount: number;
    inProgressTasksCount: number;
    openBugsCount: number;
    criticalBugsCount: number;
    totalIdeasCount: number;
    activeTask: Task | null;
    progressionStats: { [categoryId: string]: { total: number; completed: number; percentage: number } };
  };
}

const DevTrackerContext = createContext<DevTrackerContextType | undefined>(undefined);

export const DevTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DevTrackerData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return initialTrackerData;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  const addActivity = (type: ActivityLog['type'], message: string) => {
    const newActivity: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      activities: [newActivity, ...prev.activities.slice(0, 24)], // keep last 25 activities
    }));
  };

  // Project Info
  const updateProjectInfo = (info: Partial<ProjectInfo>) => {
    setData((prev) => ({
      ...prev,
      project: { ...prev.project, ...info },
    }));
  };

  const setActiveTask = (taskId: string | null) => {
    setData((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        currentActiveTaskId: taskId,
      },
    }));
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    addActivity('task_created', `تمت إضافة مهمة جديدة: ${newTask.title}`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
        project: {
          ...prev.project,
          currentActiveTaskId: prev.project.currentActiveTaskId === id ? null : prev.project.currentActiveTaskId,
        },
      };
    });
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      const isNowCompleted = status === 'completed';
      const updatedTasks = prev.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            }
          : t
      );

      // If active task completed, clear active or keep
      return {
        ...prev,
        tasks: updatedTasks,
      };
    });

    const target = data.tasks.find((t) => t.id === id);
    if (target && status === 'completed') {
      addActivity('task_completed', `تم إنجاز المهمة: ${target.title}`);
    }
  };

  // Progression
  const toggleProgressionItem = (categoryId: string, itemId: string) => {
    let completedNow = false;
    let itemTitle = '';

    setData((prev) => ({
      ...prev,
      progression: prev.progression.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            completedNow = !item.isCompleted;
            itemTitle = item.title;
            return {
              ...item,
              isCompleted: completedNow,
              updatedAt: new Date().toISOString(),
            };
          }),
        };
      }),
    }));

    if (completedNow && itemTitle) {
      addActivity('milestone_checked', `تم إكمال عنصر التطوير: ${itemTitle}`);
    }
  };

  const addProgressionItem = (categoryId: string, title: string, notes?: string) => {
    const newItem: ProgressionItem = {
      id: 'pitem-' + Date.now(),
      title,
      isCompleted: false,
      notes,
      updatedAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      progression: prev.progression.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      }),
    }));
  };

  const deleteProgressionItem = (categoryId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      progression: prev.progression.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      }),
    }));
  };

  const addProgressionCategory = (catData: Omit<ProgressionCategory, 'id' | 'items'>) => {
    const newCat: ProgressionCategory = {
      ...catData,
      id: 'cat-' + Date.now(),
      items: [],
    };
    setData((prev) => ({
      ...prev,
      progression: [...prev.progression, newCat],
    }));
  };

  // Ideas
  const addIdea = (ideaData: Omit<Idea, 'id' | 'createdAt'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: 'idea-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      ideas: [newIdea, ...prev.ideas],
    }));
    addActivity('idea_added', `تم حفظ فكرة جديدة: ${newIdea.title}`);
  };

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const deleteIdea = (id: string) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((item) => item.id !== id),
    }));
  };

  const convertIdeaToTask = (ideaId: string) => {
    const targetIdea = data.ideas.find((i) => i.id === ideaId);
    if (!targetIdea) return;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: targetIdea.title,
      description: targetIdea.description,
      status: 'todo',
      priority: targetIdea.impact === 'high' ? 'high' : targetIdea.impact === 'medium' ? 'medium' : 'low',
      category: 'gameplay',
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      ideas: prev.ideas.map((i) => (i.id === ideaId ? { ...i, status: 'planned' } : i)),
    }));

    addActivity('task_created', `تم تحويل الفكرة إلى مهمة: ${newTask.title}`);
  };

  // Bugs
  const addBug = (bugData: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bugData,
      id: 'bug-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      bugs: [newBug, ...prev.bugs],
    }));
    addActivity('bug_reported', `تم تسجيل مشكلة برمجية: ${newBug.title}`);
  };

  const updateBug = (id: string, updates: Partial<Bug>) => {
    setData((prev) => ({
      ...prev,
      bugs: prev.bugs.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBug = (id: string) => {
    setData((prev) => ({
      ...prev,
      bugs: prev.bugs.filter((b) => b.id !== id),
    }));
  };

  const toggleBugStatus = (id: string) => {
    let nowFixed = false;
    let bugTitle = '';

    setData((prev) => ({
      ...prev,
      bugs: prev.bugs.map((b) => {
        if (b.id !== id) return b;
        nowFixed = b.status === 'open';
        bugTitle = b.title;
        return {
          ...b,
          status: nowFixed ? 'fixed' : 'open',
          fixedAt: nowFixed ? new Date().toISOString() : undefined,
        };
      }),
    }));

    if (nowFixed && bugTitle) {
      addActivity('bug_fixed', `تم إصلاح المشكلة: ${bugTitle}`);
    }
  };

  // Export / Import
  const exportDataJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roblox-dev-tracker-${(data.project.name || 'project').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.project || !Array.isArray(parsed.progression) || !Array.isArray(parsed.tasks)) {
        return false;
      }
      setData(parsed);
      return true;
    } catch (e) {
      console.error('Import parse error:', e);
      return false;
    }
  };

  const resetToSampleData = () => {
    setData(initialTrackerData);
  };

  const clearAllData = () => {
    setData({
      project: {
        name: 'New Roblox Map Project',
        genre: 'Custom',
        targetReleaseDate: '',
        placeId: '',
        gameVersion: 'v0.1.0',
        currentActiveTaskId: null,
      },
      progression: [
        { id: 'map', name: 'Map & Environment', nameAr: 'الخريطة والبيئة', icon: 'MapPin', description: 'تصميم التضاريس والبيئة', items: [] },
        { id: 'gameplay', name: 'Gameplay & Mechanics', nameAr: 'أسلوب اللعب والميكانيكا', icon: 'Gamepad2', description: 'أنظمة وقواعد اللعب', items: [] },
        { id: 'ui', name: 'UI & Interfaces', nameAr: 'الواجهات وتجربة المستخدم', icon: 'Layout', description: 'واجهات اللعبة والقوائم', items: [] },
        { id: 'systems', name: 'Systems & Backend', nameAr: 'الأنظمة البرمجية والداتا', icon: 'Cpu', description: 'السيرفر وحفظ البيانات', items: [] },
      ],
      tasks: [],
      ideas: [],
      bugs: [],
      activities: [],
    });
  };

  // Statistics calculation
  const stats = useMemo(() => {
    // 1. Task counts
    const completedTasksCount = data.tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasksCount = data.tasks.filter((t) => t.status === 'in_progress').length;
    const remainingTasksCount = data.tasks.filter((t) => t.status !== 'completed').length;

    // 2. Progression stats
    let totalMilestones = 0;
    let completedMilestones = 0;
    const progressionStats: { [categoryId: string]: { total: number; completed: number; percentage: number } } = {};

    data.progression.forEach((cat) => {
      const total = cat.items.length;
      const completed = cat.items.filter((i) => i.isCompleted).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      progressionStats[cat.id] = { total, completed, percentage };
      totalMilestones += total;
      completedMilestones += completed;
    });

    // Weighted overall progress: 50% from progression milestones checklist, 50% from tasks
    let totalProgressPercentage = 0;
    const milestonesWeight = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const tasksWeight = data.tasks.length > 0 ? (completedTasksCount / data.tasks.length) * 100 : 0;

    if (totalMilestones > 0 && data.tasks.length > 0) {
      totalProgressPercentage = Math.round(milestonesWeight * 0.5 + tasksWeight * 0.5);
    } else if (totalMilestones > 0) {
      totalProgressPercentage = Math.round(milestonesWeight);
    } else if (data.tasks.length > 0) {
      totalProgressPercentage = Math.round(tasksWeight);
    }

    // 3. Bugs counts
    const openBugsCount = data.bugs.filter((b) => b.status === 'open').length;
    const criticalBugsCount = data.bugs.filter((b) => b.status === 'open' && (b.severity === 'critical' || b.severity === 'high')).length;

    // 4. Ideas count
    const totalIdeasCount = data.ideas.length;

    // 5. Active task lookup
    const activeTask =
      data.tasks.find((t) => t.id === data.project.currentActiveTaskId) ||
      data.tasks.find((t) => t.status === 'in_progress') ||
      null;

    return {
      totalProgressPercentage,
      completedTasksCount,
      remainingTasksCount,
      inProgressTasksCount,
      openBugsCount,
      criticalBugsCount,
      totalIdeasCount,
      activeTask,
      progressionStats,
    };
  }, [data]);

  return (
    <DevTrackerContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isProjectSettingsOpen,
        setIsProjectSettingsOpen,
        isExportImportOpen,
        setIsExportImportOpen,
        updateProjectInfo,
        setActiveTask,
        addTask,
        updateTask,
        deleteTask,
        setTaskStatus,
        toggleProgressionItem,
        addProgressionItem,
        deleteProgressionItem,
        addProgressionCategory,
        addIdea,
        updateIdea,
        deleteIdea,
        convertIdeaToTask,
        addBug,
        updateBug,
        deleteBug,
        toggleBugStatus,
        exportDataJson,
        importDataJson,
        resetToSampleData,
        clearAllData,
        stats,
      }}
    >
      {children}
    </DevTrackerContext.Provider>
  );
};

export const useDevTracker = () => {
  const context = useContext(DevTrackerContext);
  if (!context) {
    throw new Error('useDevTracker must be used within a DevTrackerProvider');
  }
  return context;
};
