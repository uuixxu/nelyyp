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
  RefreshCw,
  ExternalLink,
  Code2,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabase';

export const SupabaseConfigModal: React.FC = () => {
  const {
    isConfigModalOpen,
    setIsConfigModalOpen,
    supabaseConfig,
    updateSupabaseCredentials,
    syncStatus,
    syncError,
    user,
    migrateLocalDataToSupabase,
    hasLocalDataToMigrate,
    setIsAuthModalOpen,
  } = useDevTracker();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/25">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إعداد وربط قاعدة بيانات Supabase</h3>
              <p className="text-[11px] text-slate-400">
                حفظ بيانات Demonfall 2 ومزامنتها لحظياً في السحابة
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connection Status Indicator */}
        <div className="p-3.5 rounded-xl bg-[#161d28] border border-[#263346] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-400 animate-pulse'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-400 animate-spin'
                  : syncStatus === 'not_configured'
                  ? 'bg-slate-500'
                  : 'bg-rose-400'
              }`}
            />
            <div>
              <span className="font-semibold text-white block">
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
              <span className="text-[11px] text-slate-400">
                {user ? `المستخدم الحالي: ${user.email}` : 'لم يتم تسجيل الدخول بعد'}
              </span>
            </div>
          </div>

          {!user && supabaseConfig.isConfigured && (
            <button
              onClick={() => {
                setIsConfigModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-xs cursor-pointer"
            >
              تسجيل الدخول
            </button>
          )}
        </div>

        {syncError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">ملاحظة من قاعدة البيانات:</span>
              <p className="text-[11px] leading-relaxed">{syncError}</p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Project URL (رابط المشروع)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                أو عبر VITE_SUPABASE_URL في .env
              </span>
            </div>
            <div className="relative">
              <Globe
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Anon API Key (المفتاح العام)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                أو عبر VITE_SUPABASE_ANON_KEY في .env
              </span>
            </div>
            <div className="relative">
              <Key
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>تم حفظ إعدادات الاتصال بنجاح!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              حفظ وتطبيق الاتصال
            </button>
          </div>
        </form>

        {/* SQL Script Box */}
        <div className="space-y-2 pt-2 border-t border-[#21262d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-white">
                كود إنشاء جدول البيانات (SQL Schema)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c2331] hover:bg-[#252f42] text-slate-200 text-[11px] font-mono transition-colors cursor-pointer"
            >
              {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedSql ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            انسخ هذا الكود والصقه في <strong>SQL Editor</strong> داخل لوحة تحكم مشروعك في Supabase واضغط Run لإنشاء الجدول مع تفعيل حماية RLS تلقائياً:
          </p>

          <pre
            className="p-3 rounded-xl bg-[#0b0e14] border border-[#21262d] text-slate-300 text-[11px] font-mono overflow-x-auto max-h-40 leading-snug"
            dir="ltr"
          >
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* Migrate Local Data to Cloud */}
        {user && (
          <div className="p-3.5 rounded-xl bg-[#161d28] border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">
                رفع بيانات مابك الحالية إلى السحابة
              </span>
              <p className="text-[11px] text-slate-400">
                إذا قمت بأي تعديلات محلية وتريد حفظها فوراً في حسابك في Supabase.
              </p>
            </div>
            <button
              onClick={async () => {
                await migrateLocalDataToSupabase();
                alert('تمت مزامنة ورفع البيانات إلى Supabase بنجاح!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer shrink-0"
            >
              <UploadCloud size={14} />
              <span>مزامنة فورية</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
