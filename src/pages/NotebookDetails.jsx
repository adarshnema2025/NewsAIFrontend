import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Navbar from '../components/layout/Navbar';
import { notebookService } from '../services/notebookService';
import Toast from '../components/ui/Toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

const QUILL_TOOLBAR = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
];

// ── Quill Editor wrapped in a plain div (React 19 compatible) ──
function QuillEditor({ initialValue, onChange }) {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!containerRef.current || quillRef.current) return;
        const q = new Quill(containerRef.current, {
            theme: 'snow',
            modules: { toolbar: QUILL_TOOLBAR },
            placeholder: 'Write your notes, highlights, or key points here…',
        });
        quillRef.current = q;
        if (initialValue) {
            q.root.innerHTML = initialValue;
        }
        q.on('text-change', () => {
            onChangeRef.current(q.root.innerHTML);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} />;
}

// ── Article card with full detail + notes editor + delete ──
function ArticleCard({ page, index, notebookId, onDelete }) {
    const { NewsArticle } = page;
    const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved' | 'error'
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const debounceRef = useRef(null);

    const saveNotes = useCallback(async (html) => {
        setSaveStatus('saving');
        try {
            await notebookService.updateNotes(notebookId, page.id, html);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2500);
        } catch {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    }, [notebookId, page.id]);

    const handleChange = useCallback((html) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => saveNotes(html), 700);
    }, [saveNotes]);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await notebookService.deletePage(notebookId, page.id);
            onDelete(page.id);
        } catch {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const sourceLabel = NewsArticle?.source_name
        || (typeof NewsArticle?.source === 'string' ? NewsArticle.source : NewsArticle?.source?.name)
        || null;

    return (
        <article className="card overflow-hidden animate-fade-in">
            {/* Image */}
            <div className="relative h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                    src={NewsArticle?.image_url || NewsArticle?.image || FALLBACK_IMG}
                    alt={NewsArticle?.title || 'Article'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-white/70 text-xs font-medium">
                    Article {index + 1}
                </span>
                {sourceLabel && (
                    <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-xs font-medium px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-200 shadow">
                        {sourceLabel}
                    </span>
                )}
            </div>

            <div className="p-6 space-y-4">
                {/* Heading + delete button */}
                <div className="flex items-start gap-3">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug flex-1">
                        {NewsArticle?.title || 'Untitled'}
                    </h2>
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="flex-shrink-0 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove from notebook"
                        >
                            🗑️ Remove
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-500">Sure?</span>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                            >
                                {deleting ? '…' : 'Yes'}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                No
                            </button>
                        </div>
                    )}
                </div>

                {/* Description */}
                {NewsArticle?.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {NewsArticle.description}
                    </p>
                )}

                {/* Read link */}
                {NewsArticle?.url && (
                    <a
                        href={NewsArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent dark:text-accent-dark hover:underline font-medium"
                    >
                        🔗 Read original article →
                    </a>
                )}

                {/* AI Summary */}
                {NewsArticle?.ai_summary && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800">
                        <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mb-2">
                            🤖 AI Summary
                        </p>
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {NewsArticle.ai_summary}
                        </pre>
                    </div>
                )}

                {/* Notes */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            📝 My Notes
                        </p>
                        {saveStatus === 'saving' && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="w-3 h-3 border border-slate-300 border-t-accent rounded-full animate-spin inline-block" />
                                Saving…
                            </span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="text-xs text-green-500 font-medium">✓ Saved</span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-xs text-red-500 font-medium">⚠ Save failed</span>
                        )}
                    </div>
                    <div className="quill-wrapper rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <QuillEditor
                            key={page.id}
                            initialValue={page.notes || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}

// ── Page ──
export default function NotebookDetails() {
    const { id } = useParams();
    const [notebook, setNotebook] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await notebookService.getOne(id);
                setNotebook(data.notebook);
                setPages(data.notebook.Pages || []);
            } catch {
                setError('Could not load notebook. It may not exist or you may not have access.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleDeletePage = (pageId) => {
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        setToast({ msg: 'Article removed from notebook', type: 'success' });
    };

    const handlePDF = async () => {
        setPdfLoading(true);
        try {
            const blob = await notebookService.downloadPDF(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${notebook?.name || 'notebook'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            setToast({ msg: 'PDF downloaded!', type: 'success' });
        } catch {
            setToast({ msg: 'PDF export failed', type: 'error' });
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <>
            {/* Quill dark-mode overrides */}
            <style>{`
                .dark .ql-toolbar { background: #1e293b !important; border-color: #334155 !important; }
                .dark .ql-container { background: #0f172a !important; border-color: #334155 !important; }
                .dark .ql-editor { color: #e2e8f0; }
                .dark .ql-editor.ql-blank::before { color: #64748b; }
                .dark .ql-stroke { stroke: #94a3b8 !important; }
                .dark .ql-fill { fill: #94a3b8 !important; }
                .dark .ql-picker-label { color: #94a3b8 !important; }
                .dark .ql-picker-options { background: #1e293b !important; border-color: #334155 !important; }
                .dark .ql-picker-item { color: #cbd5e1; }
                .dark button:hover .ql-stroke { stroke: #38bdf8 !important; }
                .dark button:hover .ql-fill { fill: #38bdf8 !important; }
                .ql-editor { min-height: 130px; font-family: 'Inter', sans-serif; font-size: 0.9rem; line-height: 1.7; }
                .quill-wrapper .ql-toolbar { border-radius: 0; border-left: none; border-right: none; border-top: none; }
                .quill-wrapper .ql-container { border: none; }
            `}</style>

            <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
                <Navbar />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="skeleton h-7 w-1/3" />
                            <div className="skeleton h-4 w-2/3" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="card p-5 space-y-3">
                                    <div className="skeleton h-52 w-full rounded-xl" />
                                    <div className="skeleton h-6 w-3/4" />
                                    <div className="skeleton h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-slate-500">
                            <p className="text-4xl mb-3">🔒</p>
                            <p>{error}</p>
                            <Link to="/dashboard" className="btn-primary mt-4 inline-flex">← Back to Dashboard</Link>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8 gap-4">
                                <div>
                                    <Link to="/dashboard" className="text-xs text-slate-400 hover:text-accent dark:hover:text-accent-dark transition mb-2 block">
                                        ← Dashboard
                                    </Link>
                                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{notebook.name}</h1>
                                    {notebook.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notebook.description}</p>
                                    )}
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        {pages.length} article{pages.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handlePDF}
                                    disabled={pdfLoading}
                                    className="btn-outline flex-shrink-0"
                                >
                                    {pdfLoading ? '⏳ Exporting…' : '⬇️ Export PDF'}
                                </button>
                            </div>

                            {/* Articles */}
                            {pages.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                                    <p className="text-4xl mb-3">📄</p>
                                    <p>This notebook is empty. Add articles from the home feed.</p>
                                    <Link to="/" className="btn-primary mt-4 inline-flex">Browse News →</Link>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {pages.map((page, index) => (
                                        <ArticleCard
                                            key={page.id}
                                            page={page}
                                            index={index}
                                            notebookId={id}
                                            onDelete={handleDeletePage}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </>
    );
}
