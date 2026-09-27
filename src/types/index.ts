export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'map' | 'gameplay' | 'ui' | 'systems' | 'audio' | 'misc';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedHours?: number;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

export interface ProgressionItem {
  id: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
  updatedAt: string;
}

export interface ProgressionCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  items: ProgressionItem[];
}

export type IdeaStatus = 'new' | 'planned' | 'in_review' | 'implemented' | 'discarded';
export type IdeaImpact = 'low' | 'medium' | 'high';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  impact: IdeaImpact;
  createdAt: string;
}

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'fixed';

export interface Bug {
  id: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  severity: BugSeverity;
  status: BugStatus;
  foundInVersion?: string;
  createdAt: string;
  fixedAt?: string;
}

export interface DevNote {
  id: string;
  title: string;
  content: string;
  category: 'architecture' | 'lua_snippet' | 'game_design' | 'changelog' | 'general';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'task_completed' | 'task_created' | 'bug_fixed' | 'bug_reported' | 'milestone_checked' | 'idea_added' | 'note_created';
  message: string;
  timestamp: string;
}

export interface ProjectInfo {
  name: string;
  genre: string;
  targetReleaseDate: string;
  placeId: string;
  gameVersion: string;
  currentActiveTaskId: string | null;
}

export interface DevTrackerData {
  project: ProjectInfo;
  progression: ProgressionCategory[];
  tasks: Task[];
  ideas: Idea[];
  bugs: Bug[];
  notes?: DevNote[];
  activities: ActivityLog[];
}
