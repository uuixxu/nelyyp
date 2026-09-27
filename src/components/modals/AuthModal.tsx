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
  Terminal,
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
    signInAsDefaultUser,
    defaultEmail,
    supabaseConfig,
    setIsConfigModalOpen,
  } = useDevTracker();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(defaultEmail || 'uuixxu@gmail.com');
  const [password, setPassword] = useState('uuixxu@gmail.com');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-md p-5 shadow-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
              <Cloud size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                {user ? 'حساب مطور Roblox' : mode === 'signin' ? 'تسجيل الدخول السحابي' : 'إنشاء حساب مطور'}
              </h3>
              <p className="text-[11px] text-[#a1a1aa]">
                مزامنة بيانات مشروعك تلقائياً عبر سحابة Supabase و Realtime
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* If user is already logged in, show user info and logout option */}
        {user ? (
          <div className="space-y-3.5 pt-1">
            <div className="p-3.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a1a1aa]">البريد الإلكتروني المسجل:</span>
                <span className="text-xs font-mono font-medium text-[#22c55e] flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  <span>متصل بالسحابة</span>
                </span>
              </div>
              <div className="text-xs font-mono font-medium text-[#f4f4f5] bg-[#111114] p-2.5 rounded border border-[#27272a] break-all">
                {user.email}
              </div>
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                أي تعديل على المهام أو البنود أو الملاحظات يتم حفظه ومزامنته في الوقت الحقيقي مع قاعدة بيانات Supabase.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(true)}
                className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                إعدادات Supabase
              </button>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setIsAuthModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#ef4444]/30 text-[#ef4444] text-xs font-medium transition-colors cursor-pointer"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-3.5">
            {!supabaseConfig.isConfigured && (
              <div className="p-2.5 rounded-md bg-[#18181b] border border-[#eab308]/40 flex items-start gap-2 text-xs text-[#eab308]">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium">لم يتم إدخال مفاتيح Supabase بعد</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setIsConfigModalOpen(true);
                    }}
                    className="text-[11px] font-medium text-[#f4f4f5] underline cursor-pointer"
                  >
                    فتح نافذة ربط Supabase ←
                  </button>
                </div>
              </div>
            )}

            {/* Quick Auto Login Button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await signInAsDefaultUser();
                setLoading(false);
                setIsAuthModalOpen(false);
              }}
              disabled={loading}
              className="w-full py-2 px-3 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal size={13} className="text-[#8b5cf6]" />
              <span>تسجيل الدخول التلقائي ({defaultEmail})</span>
            </button>

            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#18181b] rounded-md border border-[#27272a]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <LogIn size={13} />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <UserPlus size={13} />
                <span>إنشاء حساب</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center gap-2 text-xs text-[#ef4444]">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center gap-2 text-xs text-[#22c55e]">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md pr-9 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md pr-9 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-3 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span>جاري المعالجة...</span>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={14} />
                    <span>دخول ومزامنة البيانات</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>إنشاء الحساب وبدء المزامنة</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsConfigModalOpen(true);
                }}
                className="text-[11px] text-[#71717a] hover:text-[#a1a1aa] transition-colors cursor-pointer"
              >
                إعداد أو فحص رابط ومفتاح Supabase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
