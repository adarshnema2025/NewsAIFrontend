import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { notebookService } from '../services/notebookService';
import Toast from '../components/ui/Toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

// ── Single public notebook card ──
function PublicNotebookCard({ notebook }) {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const pageCount = notebook.Pages?.length ?? 0;
    const creatorName = notebook.User?.name || 'Unknown';
    const date = notebook.createdAt
        ? new Date(notebook.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    const handlePDF = async () => {
        setLoading(true);
        try {
            const blob = await notebookService.downloadPDF(notebook.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${notebook.name || 'notebook'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            setToast({ msg: 'PDF downloaded!', type: 'success' });
        } catch {
            setToast({ msg: 'Failed to download PDF', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="card p-5 flex flex-col gap-3 group hover:-translate-y-1 hover:shadow-lg transition-all">
                {/* Decorative top strip */}
                <div className="h-1.5 -mx-5 -mt-5 rounded-t-2xl bg-gradient-to-r from-accent/70 via-sky-400/60 to-emerald-400/50 mb-1" />

                {/* Badge row */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
                        🌐 Public
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
                </div>

                {/* Title */}
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2">
                        {notebook.name}
                    </h3>
                    <p className="text-xs text-accent dark:text-accent-dark font-medium mt-0.5">
                        by {creatorName}
                    </p>
                </div>

                {/* Description */}
                {notebook.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notebook.description}
                    </p>
                )}

                {/* Article count */}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    📄 {pageCount} article{pageCount !== 1 ? 's' : ''}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Link
                        to={`/notebooks/${notebook.id}`}
                        className="btn-primary text-xs py-1.5 px-3 flex-1 text-center"
                    >
                        📖 Open
                    </Link>
                    <button
                        onClick={handlePDF}
                        disabled={loading}
                        className="btn-outline text-xs py-1.5 px-3"
                    >
                        {loading ? '⏳' : '⬇️ PDF'}
                    </button>
                </div>
            </div>

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ── Page ──
export default function KnowledgeCenter() {
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchPublic = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await notebookService.getPublic();
            setNotebooks(res.notebooks || []);
        } catch {
            setError('Could not load public notebooks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPublic(); }, []);

    const filtered = notebooks.filter((nb) =>
        nb.name.toLowerCase().includes(search.toLowerCase()) ||
        (nb.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (nb.User?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Hero header */}
                <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-accent to-emerald-500 p-8 text-white shadow-lg">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,#fff_0%,transparent_60%)]" />
                    <div className="relative z-10">
                        <p className="text-3xl mb-2">🌐</p>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Knowledge Center</h1>
                        <p className="text-white/80 text-sm max-w-xl">
                            Explore curated news notebooks shared by the community. Open any notebook to read articles and notes, or download as PDF.
                        </p>
                        <div className="mt-5 max-w-sm">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-white/60">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by title, description, or creator…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                {!loading && !error && (
                    <div className="flex items-center gap-4 mb-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filtered.length} public notebook{filtered.length !== 1 ? 's' : ''}
                            {search && ` matching "${search}"`}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-xs text-accent dark:text-accent-dark hover:underline"
                            >
                                × Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        {error}
                        <button onClick={fetchPublic} className="ml-3 underline">Retry</button>
                    </div>
                )}

                {/* Loading skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card p-5 space-y-3">
                                <div className="skeleton h-1.5 w-full rounded-full" />
                                <div className="skeleton h-4 w-1/2" />
                                <div className="skeleton h-5 w-3/4" />
                                <div className="skeleton h-3 w-full" />
                                <div className="skeleton h-3 w-2/3" />
                                <div className="skeleton h-8 w-full rounded-xl mt-2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && filtered.length === 0 && !error && (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                        <p className="text-5xl mb-4">{search ? '🔍' : '📚'}</p>
                        <p className="text-base font-medium">
                            {search ? `No notebooks match "${search}"` : 'No public notebooks yet'}
                        </p>
                        <p className="text-sm mt-1">
                            {search
                                ? 'Try a different search term.'
                                : 'Be the first to share! Set any notebook to Public in your Dashboard.'}
                        </p>
                        {!search && (
                            <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
                                Go to My Dashboard →
                            </Link>
                        )}
                    </div>
                )}

                {/* Notebooks grid */}
                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((nb) => (
                            <PublicNotebookCard key={nb.id} notebook={nb} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
