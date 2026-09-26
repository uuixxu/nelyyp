import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    supabaseConfig,
    setIsConfigModalOpen,
    syncStatus,
  } = useDevTracker();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'فشل إنشاء الحساب');
        } else if (result.confirmationRequired) {
          setSuccessMsg('تم إرسال رابط تأكيد إلى بريدك الإلكتروني! يرجى تأكيده ثم تسجيل الدخول.');
        } else {
          setSuccessMsg('تم إنشاء الحساب بنجاح وتم تسجيل دخولك ومزامنة بياناتك!');
          setTimeout(() => {
            setIsAuthModalOpen(false);
          }, 1200);
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'بيانات الدخول غير صحيحة');
        } else {
          setSuccessMsg('تم تسجيل الدخول بنجاح! جاري مزامنة بيانات الماب...');
          setTimeout(() => {
            setIsAuthModalOpen(false);
          }, 1000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/15 text-red-400 border border-red-500/25">
              <Cloud size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {user ? 'حساب مطور Roblox' : mode === 'signin' ? 'تسجيل الدخول السحابي' : 'إنشاء حساب مطور جديد'}
              </h3>
              <p className="text-[11px] text-slate-400">
                مزامنة بيانات مابك تلقائياً بين الكمبيوتر والجوال عبر Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* If user is already logged in, show user info and logout option */}
        {user ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-[#161d28] border border-[#263346] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">البريد الإلكتروني المسجل:</span>
                <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>متصل بالسحابة</span>
                </span>
              </div>
              <div className="text-sm font-semibold text-white font-mono bg-[#11151e] p-2.5 rounded-lg border border-[#202737] break-all">
                {user.email}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                أي تعديل تقوم به على المهام أو أقسام التقدم أو المشاكل يتم حفظه تلقائياً في حسابك في Supabase ومزامنته مع أي جهاز تفتحه منه.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(true)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                إعدادات اتصال Supabase
              </button>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setIsAuthModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4">
            {!supabaseConfig.isConfigured && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">لم يتم إدخال مفاتيح Supabase بعد</p>
                  <p className="text-amber-400/90 text-[11px]">
                    يمكنك إضافتها عبر ملف <code className="bg-black/40 px-1 rounded">.env</code> أو إدخالها مباشرة بالنقر أدناه.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setIsConfigModalOpen(true);
                    }}
                    className="text-xs font-bold text-amber-200 underline mt-1 block"
                  >
                    فتح نافذة ربط Supabase ←
                  </button>
                </div>
              </div>
            )}

            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#161c27] rounded-xl border border-[#263143]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn size={14} />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={14} />
                <span>إنشاء حساب</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18202d] border border-[#2a3446] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141a24] border border-[#222c3d] text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>حماية البيانات والخصوصية:</span>
                </div>
                <p>
                  نظام Row Level Security (RLS) يضمن أنك الوحيد القادر على الوصول إلى ماباتك وبياناتك البرمجية.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {loading ? (
                  <span>جاري المعالجة...</span>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={15} />
                    <span>دخول ومزامنة البيانات</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>إنشاء الحساب وبدء المزامنة</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsConfigModalOpen(true);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                ⚙️ إعداد أو تغيير رابط ومفتاح Supabase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
