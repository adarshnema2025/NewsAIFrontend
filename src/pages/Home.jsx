import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import NewsCard from '../components/ui/NewsCard';
import NewsCardSkeleton from '../components/ui/NewsCardSkeleton';
import { newsService } from '../services/newsService';

const CATEGORIES = ['general', 'world', 'nation', 'business'];
const ITEMS_PER_PAGE = 10;

export default function Home() {
    const [category, setCategory] = useState('general');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const fetchNews = useCallback(async (cat) => {
        setLoading(true);
        setError('');
        try {
            const data = await newsService.getTopHeadlines({ category: cat });
            setArticles(data.articles || []);
            setPage(1); // reset to first page on new category
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch news. Please try again.');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNews(category); }, [category, fetchNews]);

    const handleCategory = (cat) => {
        setCategory(cat);
    };

    // Pagination calculations
    const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
    const paginatedArticles = articles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <Navbar onCategoryChange={handleCategory} activeCategory={category} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                            {category} News
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Latest headlines for your studies and prep
                        </p>
                    </div>
                    {!loading && articles.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                            {articles.length} articles
                        </span>
                    )}
                </div>

                {/* Error state */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        {error}
                        <button onClick={() => fetchNews(category)} className="ml-3 underline">Retry</button>
                    </div>
                )}

                {/* News Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <NewsCardSkeleton key={i} />)
                        : paginatedArticles.map((article, i) => (
                            <NewsCard key={article.url || i} article={article} />
                        ))
                    }
                </div>

                {/* Empty state */}
                {!loading && articles.length === 0 && !error && (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                        <p className="text-4xl mb-3">📰</p>
                        <p className="text-base">No articles found for <strong>{category}</strong>.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page === 1}
                            className="btn-outline text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Prev
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page
                                            ? 'bg-accent text-white dark:bg-accent-dark'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page === totalPages}
                            className="btn-outline text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Page label */}
                {!loading && totalPages > 1 && (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                        Page {page} of {totalPages} · showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, articles.length)} of {articles.length} articles
                    </p>
                )}
            </main>
        </div>
    );
}
