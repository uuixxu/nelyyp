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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
              <FileJson size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">النسخ الاحتياطي (Export & Import)</h3>
              <p className="text-[11px] text-[#a1a1aa]">
                حفظ بيانات مشروع Demonfall 2 كملف JSON أو استرجاعها.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportImportOpen(false)}
            className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#18181b] rounded-md border border-[#27272a]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setImportStatus('idle');
            }}
            className={`py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <Download size={13} />
            <span>تصدير البيانات (Export)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setImportStatus('idle');
            }}
            className={`py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'bg-[#111114] text-[#f4f4f5] border border-[#27272a]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <Upload size={13} />
            <span>استيراد البيانات (Import)</span>
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-3.5 pt-1">
            {/* Summary Box */}
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs space-y-2">
              <span className="font-medium text-[#f4f4f5] block">ملخص بيانات الماب الحالية:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#a1a1aa] font-mono text-[11px]">
                <div className="bg-[#111114] p-2 rounded border border-[#27272a]">
                  <span className="text-[#71717a] block text-[10px]">المهام</span>
                  <span className="font-semibold text-[#f4f4f5] text-sm">{data.tasks.length}</span>
                </div>
                <div className="bg-[#111114] p-2 rounded border border-[#27272a]">
                  <span className="text-[#71717a] block text-[10px]">الأفكار</span>
                  <span className="font-semibold text-[#f4f4f5] text-sm">{data.ideas.length}</span>
                </div>
                <div className="bg-[#111114] p-2 rounded border border-[#27272a]">
                  <span className="text-[#71717a] block text-[10px]">المشاكل</span>
                  <span className="font-semibold text-[#f4f4f5] text-sm">{data.bugs.length}</span>
                </div>
                <div className="bg-[#111114] p-2 rounded border border-[#27272a]">
                  <span className="text-[#71717a] block text-[10px]">الملاحظات</span>
                  <span className="font-semibold text-[#f4f4f5] text-sm">{data.notes?.length || 0}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              يتم حفظ وتحديث بيانات الماب في سحابة Supabase تلقائياً، ويمكنك تنزيل ملف JSON كنسخة احتياطية محلية.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={exportDataJson}
                className="w-full sm:flex-1 py-2 px-3 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>تحميل ملف JSON</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="w-full sm:w-auto py-2 px-3 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#f4f4f5] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                <span>{copied ? 'تم النسخ!' : 'نسخ كود JSON'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Import Tab */
          <div className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                اختر ملف النسخة الاحتياطية (.json) من جهازك:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#a1a1aa] file:mr-0 file:ml-2.5 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#8b5cf6] file:text-white hover:file:bg-[#7c3aed] file:cursor-pointer cursor-pointer bg-[#18181b] border border-[#27272a] rounded-md p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
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
                className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono resize-none"
              />
            </div>

            {importStatus === 'success' && (
              <div className="p-2.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center gap-2 text-xs text-[#22c55e]">
                <CheckCircle2 size={14} />
                <span>تم استيراد كافة البيانات بنجاح وتحديث اللوحة!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="p-2.5 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center gap-2 text-xs text-[#ef4444]">
                <AlertCircle size={14} />
                <span>فشل الاستيراد: تأكد من صحة تنسيق ملف JSON الخاص بالتطبيق.</span>
              </div>
            )}

            <button
              onClick={handleManualImport}
              disabled={!jsonInput.trim()}
              className="w-full py-2 px-3 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>استيراد وتطبيق البيانات</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
