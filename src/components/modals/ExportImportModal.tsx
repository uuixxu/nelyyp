import React, { useState } from 'react';
import {
  Download,
  Upload,
  X,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';

export const ExportImportModal: React.FC = () => {
  const {
    isExportImportOpen,
    setIsExportImportOpen,
    exportDataJson,
    importDataJson,
    data,
  } = useDevTracker();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  if (!isExportImportOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        const success = importDataJson(content);
        setImportStatus(success ? 'success' : 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!jsonInput.trim()) return;
    const success = importDataJson(jsonInput);
    setImportStatus(success ? 'success' : 'error');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#12161f] border border-[#21262d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600/15 text-red-400">
              <FileJson size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">النسخ الاحتياطي (Export & Import)</h3>
              <p className="text-[11px] text-slate-400">
                احفظ بيانات مشروعك كملف JSON أو استرجعها في أي جهاز آخر.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportImportOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#161c27] rounded-xl border border-[#263143]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setImportStatus('idle');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download size={14} />
            <span>تصدير البيانات (Export)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setImportStatus('idle');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={14} />
            <span>استيراد البيانات (Import)</span>
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-4 pt-1">
            {/* Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#161d28] border border-[#263346] text-xs space-y-2">
              <span className="font-semibold text-white block">ملخص بيانات الماب الحالية:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
                <div className="bg-[#12161f] p-2 rounded border border-[#222c3d]">
                  <span className="text-slate-400 block text-[10px]">المهام</span>
                  <span className="font-bold text-white text-sm">{data.tasks.length}</span>
                </div>
                <div className="bg-[#12161f] p-2 rounded border border-[#222c3d]">
                  <span className="text-slate-400 block text-[10px]">الأفكار</span>
                  <span className="font-bold text-white text-sm">{data.ideas.length}</span>
                </div>
                <div className="bg-[#12161f] p-2 rounded border border-[#222c3d]">
                  <span className="text-slate-400 block text-[10px]">المشاكل</span>
                  <span className="font-bold text-white text-sm">{data.bugs.length}</span>
                </div>
                <div className="bg-[#12161f] p-2 rounded border border-[#222c3d]">
                  <span className="text-slate-400 block text-[10px]">الأقسام</span>
                  <span className="font-bold text-white text-sm">{data.progression.length}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              يتم حفظ البيانات تلقائياً في متصفحك. يمكنك تنزيل ملف JSON لحفظ نسخة على جهازك ومشاركتها مع فريق تطوير الماب.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={exportDataJson}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>تحميل ملف JSON الآن</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-[#161c27] hover:bg-[#202737] border border-[#2c3749] text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'تم النسخ!' : 'نسخ كود JSON'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Import Tab */
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                اختر ملف النسخة الاحتياطية (.json) من جهازك:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer cursor-pointer bg-[#18202d] border border-[#263143] rounded-xl p-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                أو الصق محتوى ملف JSON هنا مباشرة:
              </label>
              <textarea
                rows={4}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setImportStatus('idle');
                }}
                placeholder='الصق كود الـ JSON هنا {"project": ...}'
                className="w-full bg-[#18202d] border border-[#2a3446] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 font-mono resize-none"
              />
            </div>

            {importStatus === 'success' && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={16} />
                <span>تم استيراد كافة البيانات بنجاح وتحديث اللوحة!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-xs text-rose-400">
                <AlertCircle size={16} />
                <span>فشل الاستيراد: تأكد من صحة تنسيق ملف JSON الخاص بالتطبيق.</span>
              </div>
            )}

            <button
              onClick={handleManualImport}
              disabled={!jsonInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Upload size={15} />
              <span>استيراد وتطبيق البيانات</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
