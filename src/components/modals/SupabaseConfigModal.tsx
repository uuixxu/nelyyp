import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Code2,
  UploadCloud,
  Zap,
  Radio,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { SUPABASE_SQL_SCHEMA, SUPABASE_ENABLE_REALTIME_SQL } from '../../lib/supabase';

export const SupabaseConfigModal: React.FC = () => {
  const {
    isConfigModalOpen,
    setIsConfigModalOpen,
    supabaseConfig,
    updateSupabaseCredentials,
    syncStatus,
    syncError,
    user,
    isRealtimeConnected,
    migrateLocalDataToSupabase,
    setIsAuthModalOpen,
  } = useDevTracker();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedRealtimeSql, setCopiedRealtimeSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState(false);

  if (!isConfigModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url.trim(), anonKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyRealtimeSql = () => {
    navigator.clipboard.writeText(SUPABASE_ENABLE_REALTIME_SQL);
    setCopiedRealtimeSql(true);
    setTimeout(() => setCopiedRealtimeSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 shadow-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
              <Database size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">إعداد وربط قاعدة بيانات Supabase Realtime</h3>
              <p className="text-[11px] text-[#a1a1aa]">
                مزامنة فورية بدون Refresh بين الكمبيوتر والجوال
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(false)}
            className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Connection Status Indicator */}
        <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-[#22c55e]'
                  : syncStatus === 'syncing'
                  ? 'bg-[#eab308] animate-spin'
                  : syncStatus === 'not_configured'
                  ? 'bg-[#71717a]'
                  : 'bg-[#ef4444]'
              }`}
            />
            <div>
              <span className="font-medium text-[#f4f4f5] block">
                {syncStatus === 'synced'
                  ? 'متصل ومتزامن بنجاح مع Supabase'
                  : syncStatus === 'syncing'
                  ? 'جاري المزامنة مع السحابة...'
                  : syncStatus === 'not_configured'
                  ? 'بانتظار إدخال بيانات Supabase'
                  : syncStatus === 'anonymous'
                  ? 'تم ربط Supabase، بانتظار تسجيل الدخول'
                  : 'تنبيه: يتطلب فحص الاتصال أو إنشاء الجدول'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-[#a1a1aa]">
                  {user ? `الحساب: ${user.email}` : 'غير مسجل الدخول'}
                </span>
                <span aria-hidden="true" className="text-[#3f3f46]">·</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                    isRealtimeConnected
                      ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                      : 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20'
                  }`}
                >
                  <Radio size={9} className={isRealtimeConnected ? 'animate-pulse' : ''} />
                  <span>{isRealtimeConnected ? 'Realtime: LIVE' : 'Realtime: Waiting'}</span>
                </span>
              </div>
            </div>
          </div>

          {!user && supabaseConfig.isConfigured && (
            <button
              onClick={() => {
                setIsConfigModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
            >
              تسجيل الدخول
            </button>
          )}
        </div>

        {syncError && (
          <div className="p-2.5 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-2 text-xs text-[#ef4444]">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-medium block">ملاحظة من قاعدة البيانات:</span>
              <p className="text-[11px] leading-relaxed">{syncError}</p>
            </div>
          </div>
        )}

        {/* Realtime Quick Activation Notice (For existing database) */}
        <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#8b5cf6]" />
              <span className="text-xs font-medium text-[#f4f4f5]">
                تفعيل الـ Realtime للجدول الحالي في Supabase (خطوة واحدة فقط)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRealtimeSql}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111114] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] text-[11px] font-mono transition-colors cursor-pointer"
            >
              {copiedRealtimeSql ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
              <span>{copiedRealtimeSql ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
            إذا كان الجدول موجوداً لديك، قم بنسخ هذا السطر وتشغيله في <strong>SQL Editor</strong> في Supabase لتمكين المزامنة الحية بدون Refresh:
          </p>

          <pre
            className="p-2 rounded bg-[#09090b] border border-[#27272a] text-[#22c55e] text-[11px] font-mono overflow-x-auto leading-snug"
            dir="ltr"
          >
            {SUPABASE_ENABLE_REALTIME_SQL}
          </pre>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#a1a1aa]">
                Project URL (رابط المشروع)
              </label>
              <span className="text-[10px] text-[#71717a] font-mono">
                أو عبر VITE_SUPABASE_URL في .env
              </span>
            </div>
            <div className="relative">
              <Globe
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
              />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md pr-9 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#a1a1aa]">
                Anon API Key (المفتاح العام)
              </label>
              <span className="text-[10px] text-[#71717a] font-mono">
                أو عبر VITE_SUPABASE_ANON_KEY في .env
              </span>
            </div>
            <div className="relative">
              <Key
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
              />
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md pr-9 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess ? (
              <span className="text-xs text-[#22c55e] font-medium flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>تم حفظ إعدادات الاتصال بنجاح!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              حفظ وتطبيق الاتصال
            </button>
          </div>
        </form>

        {/* Full SQL Script Box */}
        <div className="space-y-2 pt-2 border-t border-[#27272a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Code2 size={14} className="text-[#8b5cf6]" />
              <span className="text-xs font-medium text-[#f4f4f5]">
                كود إنشاء جدول البيانات الكامل مع Realtime (SQL Schema)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] text-[11px] font-mono transition-colors cursor-pointer border border-[#27272a]"
            >
              {copiedSql ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
              <span>{copiedSql ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
            إذا كنت تنشئ مشروعاً جديداً، انسخ هذا الكود بالكامل ونفذه في <strong>SQL Editor</strong> في Supabase:
          </p>

          <pre
            className="p-2.5 rounded-md bg-[#09090b] border border-[#27272a] text-[#a1a1aa] text-[11px] font-mono overflow-x-auto max-h-32 leading-snug"
            dir="ltr"
          >
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* Migrate Local Data to Cloud */}
        {user && (
          <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-medium text-[#f4f4f5] block">
                رفع بيانات مابك الحالية إلى السحابة
              </span>
              <p className="text-[11px] text-[#a1a1aa]">
                حفظ التعديلات المحلية فوراً في حسابك في Supabase.
              </p>
              {migrationSuccess && (
                <p className="text-[11px] text-[#22c55e] font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>تم رفع البيانات بنجاح!</span>
                </p>
              )}
            </div>
            <button
              onClick={async () => {
                await migrateLocalDataToSupabase();
                setMigrationSuccess(true);
                setTimeout(() => setMigrationSuccess(false), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-medium text-xs cursor-pointer shrink-0 transition-colors"
            >
              <UploadCloud size={13} className="text-[#8b5cf6]" />
              <span>مزامنة فورية</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
