import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const STORAGE_CUSTOM_URL_KEY = 'roblox_dev_tracker_supabase_url';
const STORAGE_CUSTOM_KEY_KEY = 'roblox_dev_tracker_supabase_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const customUrl = localStorage.getItem(STORAGE_CUSTOM_URL_KEY) || '';
  const customKey = localStorage.getItem(STORAGE_CUSTOM_KEY_KEY) || '';

  const url = customUrl || envUrl;
  const anonKey = customKey || envKey;

  const isConfigured = Boolean(url && anonKey && url.includes('supabase.co'));

  return { url, anonKey, isConfigured };
};

export const saveSupabaseCustomConfig = (url: string, anonKey: string) => {
  if (url.trim()) {
    localStorage.setItem(STORAGE_CUSTOM_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
  }

  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_CUSTOM_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_CUSTOM_KEY_KEY);
  }

  // Reset cached client
  cachedClient = null;
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};

export const SUPABASE_SQL_SCHEMA = `-- 1. جدول حفظ بيانات مطور Roblox (Demonfall 2 وبقية المابات)
create table if not exists public.user_project_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  project_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. تفعيل نظام حماية البيانات (Row Level Security - RLS)
alter table public.user_project_data enable row level security;

-- 3. سياسات الأمان: كل مستخدم يقرأ ويعدل بياناته فقط
create policy "Users can view their own data"
  on public.user_project_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.user_project_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_project_data for update
  using (auth.uid() = user_id);

-- 4. تفعيل Supabase Realtime (ضروري للتحديث اللحظي بدون Refresh بين الجوال والكمبيوتر)
alter publication supabase_realtime add table public.user_project_data;
alter table public.user_project_data replica identity full;
`;

export const SUPABASE_ENABLE_REALTIME_SQL = `-- كود تفعيل الـ Realtime (إذا كان جدول user_project_data منشأ مسبقاً لديك):
alter publication supabase_realtime add table public.user_project_data;
alter table public.user_project_data replica identity full;
`;
