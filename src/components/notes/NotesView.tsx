import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Terminal,
  Code2,
  BookOpen,
  Search,
  Tag,
  Clock,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { useDevTracker } from '../../context/DevTrackerContext';
import { DevNote } from '../../types';

export const NotesView: React.FC = () => {
  const { data, addNote, updateNote, deleteNote, searchQuery } = useDevTracker();

  const notes = data.notes || [];
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Editor states for currently selected note
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  // New Note Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DevNote['category']>('architecture');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addNote({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent || '-- Lua / Markdown workspace',
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreating(false);
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInsertSnippet = () => {
    if (!selectedNote) return;
    const snippetTemplate = `\n-- [Luau Service Pattern]\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal Players = game:GetService("Players")\n\nlocal Service = {}\nService.__index = Service\n\nfunction Service.Init()\n    print("[Demonfall 2] Service Initialized")\nend\n\nreturn Service\n`;
    updateNote(selectedNote.id, {
      content: selectedNote.content + snippetTemplate,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    const term = (localSearch || searchQuery).trim().toLowerCase();
    if (term) {
      const match =
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term) ||
        n.tags.some((t) => t.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const getCategoryLabel = (cat: DevNote['category']) => {
    switch (cat) {
      case 'architecture':
        return 'بنية وسيرفر (Architecture)';
      case 'lua_snippet':
        return 'أكواد Luau (Snippets)';
      case 'game_design':
        return 'تصميم اللعبة (Game Design)';
      case 'changelog':
        return 'سجل التحديثات (Changelog)';
      default:
        return 'ملاحظات عامة (General)';
    }
  };

  // Line count and stats for the active note
  const editorStats = useMemo(() => {
    if (!selectedNote?.content) return { lines: 1, words: 0, chars: 0 };
    const lines = selectedNote.content.split('\n').length;
    const words = selectedNote.content.trim().split(/\s+/).filter(Boolean).length;
    const chars = selectedNote.content.length;
    return { lines, words, chars };
  }, [selectedNote?.content]);

  // Generate line numbers for the editor gutter
  const lineNumbers = useMemo(() => {
    const totalLines = Math.max(editorStats.lines, 18);
    return Array.from({ length: totalLines }, (_, i) => i + 1);
  }, [editorStats.lines]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              <span>Obsidian Vault · Luau & Docs</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f4f4f5] tracking-tight">
            الملاحظات البرمجية والأرشيف (Notes)
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            مساحة تدوين بنية السيرفرات، توثيق أكواد Luau، وملاحظات التوازن الحسابية لماب Demonfall 2.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          <Plus size={14} />
          <span>ملاحظة جديدة</span>
        </button>
      </div>

      {/* Main Obsidian Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-[620px]">
        {/* Left/Sidebar: Notes Navigation List (4 cols) */}
        <div className="lg:col-span-4 bg-[#111114] border border-[#27272a] rounded-lg p-3 flex flex-col space-y-3">
          {/* Note Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="البحث في الملاحظات والأكواد..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md pr-8 pl-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              الكل ({notes.length})
            </button>
            <button
              onClick={() => setSelectedCategory('architecture')}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'architecture'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              بنية الأنظمة
            </button>
            <button
              onClick={() => setSelectedCategory('lua_snippet')}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'lua_snippet'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              Luau
            </button>
            <button
              onClick={() => setSelectedCategory('game_design')}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'game_design'
                  ? 'bg-[#18181b] text-[#f4f4f5] border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
            >
              تصميم اللعبة
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[500px] pr-0.5">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-2.5 rounded-md border transition-colors cursor-pointer text-right group ${
                      isSelected
                        ? 'bg-[#18181b] border-[#8b5cf6]/50 text-[#f4f4f5]'
                        : 'bg-[#111114] border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#111114] text-[#a1a1aa] border border-[#27272a]">
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717a]">
                        {new Date(note.updatedAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-medium line-clamp-1 ${
                        isSelected ? 'text-[#f4f4f5]' : 'text-[#e4e4e7]'
                      }`}
                    >
                      {note.title}
                    </h4>

                    <p className="text-[11px] text-[#71717a] line-clamp-2 mt-0.5 font-mono">
                      {note.content.substring(0, 70)}...
                    </p>

                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {note.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#18181b] text-[#71717a] border border-[#27272a]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-[#71717a]">
                لا توجد ملاحظات مسجلة في هذا التصنيف.
              </div>
            )}
          </div>
        </div>

        {/* Right: Obsidian-style Code & Note Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-[#111114] border border-[#27272a] rounded-lg p-4 flex flex-col justify-between">
          {selectedNote ? (
            <div className="space-y-3.5 flex-1 flex flex-col">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#27272a] gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] text-[#8b5cf6] border border-[#27272a]">
                      {getCategoryLabel(selectedNote.category)}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717a]">
                      آخر تحديث: {new Date(selectedNote.updatedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {savedFeedback && (
                      <span className="text-[10px] font-mono text-[#22c55e] flex items-center gap-1">
                        <Check size={11} />
                        <span>تم الحفظ</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                    className="text-base sm:text-lg font-semibold text-[#f4f4f5] bg-transparent border-none focus:outline-hidden w-full placeholder-[#71717a]"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <button
                    onClick={handleInsertSnippet}
                    className="p-1.5 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] border border-[#27272a] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="إدراج قالب كود Luau Service"
                  >
                    <Code2 size={13} className="text-[#8b5cf6]" />
                    <span className="text-[11px]">+ Luau Template</span>
                  </button>

                  <button
                    onClick={() => handleCopyContent(selectedNote.content)}
                    className="p-1.5 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] border border-[#27272a] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="نسخ المحتوى"
                  >
                    {copiedCode ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                    <span className="text-[11px]">{copiedCode ? 'تم النسخ' : 'نسخ'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
                        deleteNote(selectedNote.id);
                        setSelectedNoteId(null);
                      }
                    }}
                    className="p-1.5 rounded-md text-[#71717a] hover:text-[#ef4444] hover:bg-[#18181b] border border-[#27272a] text-xs transition-colors cursor-pointer"
                    title="حذف الملاحظة"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Tags & Metadata Bar */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Tag size={12} className="text-[#71717a]" />
                {selectedNote.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Editor Workspace (Code & Markdown dark editor area) */}
              <div className="flex-1 min-h-[380px] relative bg-[#09090b] rounded-md border border-[#27272a] overflow-hidden flex flex-col">
                {/* Editor Tab Bar */}
                <div className="px-3 py-1.5 bg-[#111114] border-b border-[#27272a] flex items-center justify-between text-[11px] font-mono text-[#71717a]">
                  <span className="flex items-center gap-1.5 text-[#f4f4f5]">
                    <Terminal size={12} className="text-[#8b5cf6]" />
                    <span>script.luau</span>
                    <span className="text-[#71717a]">·</span>
                    <span className="text-[10px] text-[#71717a]">Obsidian Canvas</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span>{editorStats.lines} سطور</span>
                    <span>·</span>
                    <span>{editorStats.words} كلمات</span>
                    <span>·</span>
                    <span className="text-[#22c55e]">Auto-saved</span>
                  </div>
                </div>

                {/* Line Numbers Gutter + Editor Textarea */}
                <div className="flex-1 flex overflow-hidden">
                  <div
                    className="w-10 py-3 pr-2 pl-1 select-none font-mono text-[11px] text-[#3f3f46] text-right bg-[#09090b] border-r border-[#27272a] overflow-hidden hidden sm:block shrink-0 leading-relaxed"
                    aria-hidden="true"
                  >
                    {lineNumbers.map((num) => (
                      <div key={num}>{num}</div>
                    ))}
                  </div>

                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                    placeholder="اكتب ملاحظاتك، توثيق الأنظمة، أو كود الـ Luau هنا..."
                    className="flex-1 p-3 bg-transparent text-xs text-[#f4f4f5] placeholder-[#52525b] font-mono leading-relaxed focus:outline-hidden resize-none selection:bg-[#8b5cf6]/30 overflow-y-auto"
                    dir="ltr"
                    spellCheck={false}
                  />
                </div>

                {/* Editor Footer Bar */}
                <div className="px-3 py-1 bg-[#111114] border-t border-[#27272a] flex items-center justify-between text-[10px] font-mono text-[#71717a]">
                  <span>Luau 5.1 / UTF-8</span>
                  <span>Spaces: 2 · Realtime Synced</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-[#71717a]">
              <FileText size={32} className="mb-2 opacity-40 text-[#a1a1aa]" />
              <p className="text-sm font-medium text-[#f4f4f5]">لا توجد ملاحظة محددة</p>
              <p className="text-xs text-[#71717a] mt-1 max-w-sm">
                اختر ملاحظة من القائمة الجانبية أو اضغط على زر "ملاحظة جديدة" لتدوين كود أو خطة تطوير.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Note */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111114] border border-[#27272a] rounded-lg w-full max-w-lg p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2">
                <FileText size={16} className="text-[#8b5cf6]" />
                <span>إنشاء وثيقة أو كود جديد</span>
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#71717a] hover:text-[#f4f4f5] p-1 rounded hover:bg-[#18181b] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  عنوان الملاحظة / اسم السكربت *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: خوارزمية حساب نقاط الخبرة (Leveling Math)"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    التصنيف
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DevNote['category'])}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-hidden focus:border-[#8b5cf6]"
                  >
                    <option value="architecture">بنية وسيرفر (Architecture)</option>
                    <option value="lua_snippet">أكواد Luau (Snippets)</option>
                    <option value="game_design">تصميم اللعبة (Game Design)</option>
                    <option value="changelog">سجل التحديثات (Changelog)</option>
                    <option value="general">عام (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    الوسوم (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Luau, Math, Netcode"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-hidden focus:border-[#8b5cf6] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                  المحتوى / الكود البرمجي
                </label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="اكتب التوثيق أو كود Luau هنا..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md p-3 text-xs text-[#f4f4f5] placeholder-[#52525b] focus:outline-hidden focus:border-[#8b5cf6] font-mono resize-none leading-relaxed"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] rounded hover:bg-[#18181b] transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  حفظ في الملاحظات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
