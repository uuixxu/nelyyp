import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
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
  DevNote,
} from '../types';
import { initialTrackerData } from '../data/initialData';
import {
  getSupabaseClient,
  getSupabaseConfig,
  saveSupabaseCustomConfig,
  SupabaseConfig,
  DEFAULT_DEV_EMAIL,
  DEFAULT_DEV_PASSWORD,
} from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'roblox_dev_tracker_v1';
const STORAGE_PENDING_MIGRATION_KEY = 'roblox_dev_tracker_pending_migration';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'not_configured' | 'anonymous';

interface DevTrackerContextType {
  data: DevTrackerData;
  activeTab: 'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs' | 'notes';
  setActiveTab: (tab: 'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs' | 'notes') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isProjectSettingsOpen: boolean;
  setIsProjectSettingsOpen: (open: boolean) => void;
  isExportImportOpen: boolean;
  setIsExportImportOpen: (open: boolean) => void;
  
  // Supabase Auth & Cloud Sync
  user: User | null;
  session: Session | null;
  isAuthLoading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  isRealtimeConnected: boolean;
  supabaseConfig: SupabaseConfig;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  signUpWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInAsDefaultUser: () => Promise<void>;
  defaultEmail: string;
  signOut: () => Promise<void>;
  updateSupabaseCredentials: (url: string, key: string) => void;
  forceSyncToCloud: () => Promise<void>;
  migrateLocalDataToSupabase: () => Promise<void>;
  hasLocalDataToMigrate: boolean;

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

  // Notes
  addNote: (note: Omit<DevNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<DevNote>) => void;
  deleteNote: (id: string) => void;
  
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
    totalNotesCount: number;
    activeTask: Task | null;
    progressionStats: { [categoryId: string]: { total: number; completed: number; percentage: number } };
  };
}

const DevTrackerContext = createContext<DevTrackerContextType | undefined>(undefined);

export const DevTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage fallback to Demonfall 2
  const [data, setData] = useState<DevTrackerData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.project?.name && parsed.project.name !== 'Anime Strike Simulator X') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return initialTrackerData;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'progression' | 'tasks' | 'ideas' | 'bugs' | 'notes'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Supabase Auth and Sync State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('not_configured');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [hasLocalDataToMigrate, setHasLocalDataToMigrate] = useState(false);

  // Unique client ID to distinguish sender from receivers in realtime broadcasts
  const clientId = useRef<string>('c_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));

  // Sync ref flags to prevent circular updates
  const isSyncingFromCloudRef = useRef(false);
  const syncTimeoutRef = useRef<any>(null);
  const realtimeChannelRef = useRef<any>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);

  // Helper to ensure data integrity and prevent any duplicate tasks, ideas, bugs, or progression items
  const sanitizeAndDeduplicate = useCallback((incoming: DevTrackerData): DevTrackerData => {
    if (!incoming || !incoming.project) return incoming;

    // Deduplicate tasks by unique id
    const taskMap = new Map<string, Task>();
    (incoming.tasks || []).forEach((t) => {
      if (t && t.id) taskMap.set(t.id, t);
    });

    // Deduplicate ideas by unique id
    const ideaMap = new Map<string, Idea>();
    (incoming.ideas || []).forEach((i) => {
      if (i && i.id) ideaMap.set(i.id, i);
    });

    // Deduplicate bugs by unique id
    const bugMap = new Map<string, Bug>();
    (incoming.bugs || []).forEach((b) => {
      if (b && b.id) bugMap.set(b.id, b);
    });

    // Deduplicate notes by unique id
    const noteMap = new Map<string, DevNote>();
    (incoming.notes || []).forEach((n) => {
      if (n && n.id) noteMap.set(n.id, n);
    });

    // Deduplicate progression items by category and item id
    const prog = (incoming.progression || []).map((cat) => {
      const itemMap = new Map<string, ProgressionItem>();
      (cat.items || []).forEach((item) => {
        if (item && item.id) itemMap.set(item.id, item);
      });
      return {
        ...cat,
        items: Array.from(itemMap.values()),
      };
    });

    // Deduplicate activities by id
    const actMap = new Map<string, ActivityLog>();
    (incoming.activities || []).forEach((act) => {
      if (act && act.id) actMap.set(act.id, act);
    });

    return {
      ...incoming,
      tasks: Array.from(taskMap.values()),
      ideas: Array.from(ideaMap.values()),
      bugs: Array.from(bugMap.values()),
      notes: Array.from(noteMap.values()),
      progression: prog,
      activities: Array.from(actMap.values()).slice(0, 30),
    };
  }, []);

  // Always keep localStorage updated as offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Check if there is distinct local data that can be migrated
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && user) {
        setHasLocalDataToMigrate(true);
      }
    } catch (e) {
      setHasLocalDataToMigrate(false);
    }
  }, [user]);

  // Initialize Supabase Auth listener
  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseConfig(config);

    if (!config.isConfigured) {
      setSyncStatus('not_configured');
      setIsAuthLoading(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setSyncStatus('not_configured');
      setIsAuthLoading(false);
      return;
    }

    // Helper to auto-sign in default user if not logged in
    const ensureDefaultUserSignedIn = async (supabaseClient: any) => {
      try {
        setIsAuthLoading(true);
        console.log('[Auth] Auto-signing in default user:', DEFAULT_DEV_EMAIL);

        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: DEFAULT_DEV_EMAIL,
          password: DEFAULT_DEV_PASSWORD,
        });

        if (signInData?.session?.user) {
          setSession(signInData.session);
          setUser(signInData.session.user);
          setIsAuthLoading(false);
          await fetchUserDataFromCloud(signInData.session.user.id);
          return;
        }

        // If user doesn't exist yet, attempt signup
        if (signInError) {
          console.log('[Auth] Default user not found, attempting registration...');
          const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
            email: DEFAULT_DEV_EMAIL,
            password: DEFAULT_DEV_PASSWORD,
          });

          if (signUpData?.session?.user) {
            setSession(signUpData.session);
            setUser(signUpData.session.user);
            setIsAuthLoading(false);
            await fetchUserDataFromCloud(signUpData.session.user.id);
            return;
          }

          // Try signing in again if signup was created
          const { data: retrySignIn } = await supabaseClient.auth.signInWithPassword({
            email: DEFAULT_DEV_EMAIL,
            password: DEFAULT_DEV_PASSWORD,
          });

          if (retrySignIn?.session?.user) {
            setSession(retrySignIn.session);
            setUser(retrySignIn.session.user);
            setIsAuthLoading(false);
            await fetchUserDataFromCloud(retrySignIn.session.user.id);
            return;
          }

          if (signUpError) {
            console.warn('[Auth] Auto signup note:', signUpError.message);
          }
        }
      } catch (err) {
        console.error('[Auth] Error during auto sign-in:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    // Get current session or auto-sign in
    client.auth.getSession().then(async ({ data: sessionData, error }) => {
      if (error) {
        console.error('Error fetching Supabase session:', error);
      }
      if (sessionData?.session?.user) {
        setSession(sessionData.session);
        setUser(sessionData.session.user);
        setIsAuthLoading(false);
        await fetchUserDataFromCloud(sessionData.session.user.id);
      } else {
        // Automatically sign in for everyone with default project credentials
        await ensureDefaultUserSignedIn(client);
      }
    });

    // Listen to Auth State changes
    const { data: authListener } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAuthLoading(false);

      if (newSession?.user) {
        // User logged in: fetch project data from Supabase
        await fetchUserDataFromCloud(newSession.user.id);
      } else {
        setSyncStatus('anonymous');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from Supabase table `user_project_data`
  const fetchUserDataFromCloud = async (userId: string) => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      setSyncStatus('syncing');
      setSyncError(null);

      const { data: row, error } = await client
        .from('user_project_data')
        .select('project_data, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user_project_data:', error);
        // If table doesn't exist, show informative message
        if (error.code === '42P01' || error.message.includes('relation "public.user_project_data" does not exist')) {
          setSyncError('جدول user_project_data غير موجود بعد في قاعدة بياناتك. يرجى إنشاء الجدول عبر سكريبت SQL.');
          setSyncStatus('error');
          return;
        }
        setSyncError(error.message);
        setSyncStatus('error');
        return;
      }

      if (row && row.project_data && row.project_data.project) {
        // Data exists on cloud! Load it into state
        isSyncingFromCloudRef.current = true;
        setData(row.project_data as DevTrackerData);
        setLastSyncedAt(new Date(row.updated_at || Date.now()));
        setSyncStatus('synced');
        setTimeout(() => {
          isSyncingFromCloudRef.current = false;
        }, 500);
      } else {
        // New user or no row yet: upload current local state to cloud!
        await pushDataToCloud(userId, data);
      }
    } catch (err: any) {
      console.error('Failed to load cloud data:', err);
      setSyncError(err.message || 'خطأ في الاتصال بقاعدة البيانات');
      setSyncStatus('offline');
    }
  };

  // Push data to Supabase table
  const pushDataToCloud = async (userId: string, trackerData: DevTrackerData) => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      setSyncStatus('syncing');
      setSyncError(null);

      const now = new Date().toISOString();
      const { error } = await client.from('user_project_data').upsert(
        {
          user_id: userId,
          project_data: trackerData,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error('Error saving to user_project_data:', error);
        if (error.code === '42P01' || error.message.includes('relation "public.user_project_data" does not exist')) {
          setSyncError('جدول user_project_data غير موجود بعد. انسخ كود الـ SQL من إعدادات الربط ونفذه في Supabase.');
          setSyncStatus('error');
          return;
        }
        setSyncError(error.message);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        setSyncError(null);
      }
    } catch (err: any) {
      console.error('Network error pushing to Supabase:', err);
      setSyncError(err.message || 'خطأ أثناء المزامنة مع السحابة');
      setSyncStatus('offline');
    }
  };

  // Auto-sync debounced when state changes + immediate realtime broadcast to other devices and tabs
  useEffect(() => {
    if (!user || isSyncingFromCloudRef.current) return;

    const client = getSupabaseClient();
    if (!client) return;

    // 1. Instantly broadcast to other open tabs in the same browser (0ms delay)
    if (localBroadcastRef.current) {
      try {
        localBroadcastRef.current.postMessage({
          senderId: clientId.current,
          projectData: data,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        // BroadcastChannel send error ignored
      }
    }

    // 2. Instantly broadcast to other devices over Supabase Realtime WebSocket channel (< 50ms)
    if (realtimeChannelRef.current && isRealtimeConnected) {
      try {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'PROJECT_UPDATED',
          payload: {
            senderId: clientId.current,
            projectData: data,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (e) {
        // channel send error ignored
      }
    }

    // 3. Debounce to push authoritative state into Postgres database
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setSyncStatus('syncing');
    syncTimeoutRef.current = setTimeout(() => {
      pushDataToCloud(user.id, data);
    }, 500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [data, user, isRealtimeConnected]);

  // Listen to Realtime updates from other tabs / devices
  useEffect(() => {
    if (!user) {
      setIsRealtimeConnected(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) return;

    // A. Inter-tab broadcast channel for instant zero-latency sync in the same browser
    let localBroadcast: BroadcastChannel | null = null;
    try {
      localBroadcast = new BroadcastChannel('roblox_dev_tracker_intertab_' + user.id);
      localBroadcast.onmessage = (event) => {
        if (
          event.data &&
          event.data.senderId !== clientId.current &&
          event.data.projectData
        ) {
          isSyncingFromCloudRef.current = true;
          const sanitized = sanitizeAndDeduplicate(event.data.projectData as DevTrackerData);
          setData(sanitized);
          setLastSyncedAt(new Date(event.data.updatedAt || Date.now()));
          setSyncStatus('synced');
          setTimeout(() => {
            isSyncingFromCloudRef.current = false;
          }, 300);
        }
      };
      localBroadcastRef.current = localBroadcast;
    } catch (e) {
      // BroadcastChannel might not be supported in some embedded iframes
    }

    // B. Supabase Realtime Channel for cross-device live synchronization
    const channelTopic = `user_project_realtime:${user.id}`;
    const channel = client.channel(channelTopic, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    channel
      // 1. Listen to Postgres table changes (INSERT, UPDATE, DELETE from WAL replication)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_project_data',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('[Supabase Realtime] postgres_changes received:', payload.eventType);

          // Handle DELETE event
          if (payload.eventType === 'DELETE') {
            isSyncingFromCloudRef.current = true;
            setData(initialTrackerData);
            setTimeout(() => {
              isSyncingFromCloudRef.current = false;
            }, 300);
            return;
          }

          // Handle INSERT or UPDATE event
          if (payload.new && payload.new.project_data) {
            isSyncingFromCloudRef.current = true;
            const sanitized = sanitizeAndDeduplicate(payload.new.project_data as DevTrackerData);
            setData(sanitized);
            setLastSyncedAt(new Date(payload.new.updated_at || Date.now()));
            setSyncStatus('synced');
            setTimeout(() => {
              isSyncingFromCloudRef.current = false;
            }, 300);
          }
        }
      )
      // 2. Listen to WebSocket peer broadcast for immediate live response across devices
      .on('broadcast', { event: 'PROJECT_UPDATED' }, (msg: any) => {
        const payload = msg.payload;
        if (
          payload &&
          payload.senderId !== clientId.current &&
          payload.projectData
        ) {
          console.log('[Supabase Realtime] Live broadcast update received from other device');
          isSyncingFromCloudRef.current = true;
          const sanitized = sanitizeAndDeduplicate(payload.projectData as DevTrackerData);
          setData(sanitized);
          setLastSyncedAt(new Date(payload.updatedAt || Date.now()));
          setSyncStatus('synced');
          setTimeout(() => {
            isSyncingFromCloudRef.current = false;
          }, 300);
        }
      })
      .subscribe((status, err) => {
        console.log('[Supabase Realtime] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          setIsRealtimeConnected(false);
          if (err) {
            console.warn('[Supabase Realtime] Subscription issue:', err);
          }
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (localBroadcast) {
        localBroadcast.close();
        localBroadcastRef.current = null;
      }
      client.removeChannel(channel);
      realtimeChannelRef.current = null;
      setIsRealtimeConnected(false);
    };
  }, [user, sanitizeAndDeduplicate]);

  // Auth Functions
  const signUpWithEmail = async (email: string, pass: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'لم يتم إعداد رابط أو مفتاح Supabase بعد.' };
    }

    try {
      const { data: authData, error } = await client.auth.signUp({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.user) {
        // If email confirmation required
        const confirmationRequired = authData.user.identities && authData.user.identities.length === 0;
        return { success: true, confirmationRequired };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء التسجيل' };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'لم يتم إعداد رابط أو مفتاح Supabase بعد.' };
    }

    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل تسجيل الدخول' };
    }
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setSyncStatus('anonymous');
  };

  const signInAsDefaultUser = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      setIsAuthLoading(true);
      const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
        email: DEFAULT_DEV_EMAIL,
        password: DEFAULT_DEV_PASSWORD,
      });

      if (signInData?.session?.user) {
        setSession(signInData.session);
        setUser(signInData.session.user);
        await fetchUserDataFromCloud(signInData.session.user.id);
        return;
      }

      if (signInError) {
        await client.auth.signUp({
          email: DEFAULT_DEV_EMAIL,
          password: DEFAULT_DEV_PASSWORD,
        });
        const { data: retry } = await client.auth.signInWithPassword({
          email: DEFAULT_DEV_EMAIL,
          password: DEFAULT_DEV_PASSWORD,
        });
        if (retry?.session?.user) {
          setSession(retry.session);
          setUser(retry.session.user);
          await fetchUserDataFromCloud(retry.session.user.id);
        }
      }
    } catch (e) {
      console.error('Error signing in as default user:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const updateSupabaseCredentials = (url: string, key: string) => {
    saveSupabaseCustomConfig(url, key);
    const updated = getSupabaseConfig();
    setSupabaseConfig(updated);

    if (updated.isConfigured) {
      const client = getSupabaseClient();
      if (client) {
        client.auth.getSession().then(({ data: sData }) => {
          setSession(sData?.session ?? null);
          setUser(sData?.session?.user ?? null);
          if (sData?.session?.user) {
            fetchUserDataFromCloud(sData.session.user.id);
          } else {
            setSyncStatus('anonymous');
          }
        });
      }
    } else {
      setSyncStatus('not_configured');
    }
  };

  const forceSyncToCloud = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await pushDataToCloud(user.id, data);
  };

  const migrateLocalDataToSupabase = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await pushDataToCloud(user.id, data);
    setHasLocalDataToMigrate(false);
  };

  const addActivity = (type: ActivityLog['type'], message: string) => {
    const newActivity: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      activities: [newActivity, ...prev.activities.slice(0, 24)],
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
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
      project: {
        ...prev.project,
        currentActiveTaskId: prev.project.currentActiveTaskId === id ? null : prev.project.currentActiveTaskId,
      },
    }));
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    setData((prev) => {
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

  // Notes
  const addNote = (noteData: Omit<DevNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: DevNote = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])],
    }));
    addActivity('note_created', `تم حفظ ملاحظة برمجية جديدة: ${newNote.title}`);
  };

  const updateNote = (id: string, updates: Partial<DevNote>) => {
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      notes: (prev.notes || []).map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((n) => n.id !== id),
    }));
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
        name: 'Demonfall 2',
        genre: 'Action / RPG',
        targetReleaseDate: '',
        placeId: '',
        gameVersion: 'v0.0.1 Alpha',
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
    const completedTasksCount = data.tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasksCount = data.tasks.filter((t) => t.status === 'in_progress').length;
    const remainingTasksCount = data.tasks.filter((t) => t.status !== 'completed').length;

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

    const openBugsCount = data.bugs.filter((b) => b.status === 'open').length;
    const criticalBugsCount = data.bugs.filter((b) => b.status === 'open' && (b.severity === 'critical' || b.severity === 'high')).length;
    const totalIdeasCount = data.ideas.length;
    const totalNotesCount = (data.notes || []).length;

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
      totalNotesCount,
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
        user,
        session,
        isAuthLoading,
        syncStatus,
        lastSyncedAt,
        syncError,
        isRealtimeConnected,
        supabaseConfig,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        signUpWithEmail,
        signInWithEmail,
        signInAsDefaultUser,
        defaultEmail: DEFAULT_DEV_EMAIL,
        signOut,
        updateSupabaseCredentials,
        forceSyncToCloud,
        migrateLocalDataToSupabase,
        hasLocalDataToMigrate,
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
        addNote,
        updateNote,
        deleteNote,
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
