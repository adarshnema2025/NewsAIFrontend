import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { archiveService } from '../services/archiveService';
import Toast from '../components/ui/Toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

export default function Archives() {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    const fetchArchives = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await archiveService.getAll();
            setArchives(res.archives || []);
        } catch (err) {
            setError('Could not load archived articles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArchives(); }, []);

    const handleUnarchive = async (archiveId) => {
        try {
            await archiveService.remove(archiveId);
            setArchives((prev) => prev.filter((a) => a.id !== archiveId));
            setToast({ msg: 'Removed from archives', type: 'success' });
        } catch {
            setToast({ msg: 'Failed to remove from archives', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📌 Archives</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Articles you&apos;ve bookmarked for later reading
                        </p>
                    </div>
                    {archives.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                            {archives.length} saved
                        </span>
                    )}
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        {error}
                        <button onClick={fetchArchives} className="ml-3 underline">Retry</button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card overflow-hidden">
                                <div className="h-44 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && archives.length === 0 && !error && (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                        <p className="text-5xl mb-4">📌</p>
                        <p className="text-base font-medium">No archived articles yet</p>
                        <p className="text-sm mt-1 max-w-sm mx-auto">
                            Click the 📌 bookmark button on any news card to save it here for later.
                        </p>
                    </div>
                )}

                {/* Archive grid */}
                {!loading && archives.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {archives.map((item) => {
                            const article = item.NewsArticle || {};
                            const date = article.published_at
                                ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '';
                            return (
                                <div
                                    key={item.id}
                                    className="card overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    {/* Image */}
                                    <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                        <img
                                            src={article.image_url || FALLBACK_IMG}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => { e.target.src = FALLBACK_IMG; }}
                                        />
                                        {article.source_name && (
                                            <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-medium px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 shadow">
                                                {article.source_name}
                                            </span>
                                        )}
                                        {/* Un-archive button */}
                                        <button
                                            onClick={() => handleUnarchive(item.id)}
                                            title="Remove from archives"
                                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-amber-400 text-white hover:bg-red-500 shadow transition-colors"
                                        >
                                            🔖
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-4">
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-1">
                                            {article.title || 'Untitled'}
                                        </p>
                                        {article.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                                {article.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto pt-2 gap-2 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-400">{date}</span>
                                            {article.url && (
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-accent dark:text-accent-dark hover:underline font-medium"
                                                >
                                                    Read →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
