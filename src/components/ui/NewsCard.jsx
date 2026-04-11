import { useState } from 'react';
import Modal from './Modal';
import AddToNotebookDropdown from './AddToNotebookDropdown';
import Toast from './Toast';
import { archiveService } from '../../services/archiveService';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

export default function NewsCard({ article }) {
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [archived, setArchived] = useState(false);
    const [archiveId, setArchiveId] = useState(null);
    const [archiving, setArchiving] = useState(false);

    const {
        title,
        description,
        image,
        source,
        author,
        publishedAt,
        url,
    } = article;

    const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const handleArchiveToggle = async () => {
        setArchiving(true);
        try {
            if (archived && archiveId) {
                await archiveService.remove(archiveId);
                setArchived(false);
                setArchiveId(null);
                setToast({ msg: 'Removed from archives', type: 'success' });
            } else {
                const res = await archiveService.add(article);
                if (res.alreadyArchived) {
                    setToast({ msg: 'Already in archives', type: 'success' });
                    setArchived(true);
                    setArchiveId(res.archive.id);
                } else {
                    setArchived(true);
                    setArchiveId(res.archive.id);
                    setToast({ msg: 'Saved to archives 📌', type: 'success' });
                }
            }
        } catch {
            setToast({ msg: 'Archive action failed', type: 'error' });
        } finally {
            setArchiving(false);
        }
    };

    return (
        <>
            {/* overflow-visible so the notebook dropdown is never clipped */}
            <article className="card overflow-visible flex flex-col group transition-transform hover:-translate-y-1 hover:shadow-lg">
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800 h-52 flex-shrink-0">
                    <img
                        src={image || FALLBACK_IMG}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = FALLBACK_IMG; }}
                    />
                    {source?.name && (
                        <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 text-xs font-medium px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 shadow">
                            {source.name}
                        </span>
                    )}
                    {/* Archive bookmark badge */}
                    <button
                        onClick={handleArchiveToggle}
                        disabled={archiving}
                        title={archived ? 'Remove from archives' : 'Save to archives'}
                        className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow transition-all ${archived
                                ? 'bg-amber-400 text-white hover:bg-amber-500'
                                : 'bg-white/90 dark:bg-slate-900/80 text-slate-400 hover:bg-amber-50 hover:text-amber-500'
                            } disabled:opacity-60`}
                    >
                        {archiving ? (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                        ) : (
                            <span className="text-sm">{archived ? '🔖' : '📌'}</span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-2">
                        {title}
                    </h2>

                    {description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                            {description}
                        </p>
                    )}

                    <div className="mt-auto space-y-3">
                        {/* Meta */}
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            {author ? `${author} · ` : ''}{date}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSummaryOpen(true)}
                                className="btn-primary text-xs py-1.5 px-3"
                            >
                                🤖 AI Summary
                            </button>

                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost text-xs py-1.5 px-3"
                            >
                                🔗 Read
                            </a>

                            <AddToNotebookDropdown
                                article={article}
                                onSuccess={(msg) => setToast({ msg, type: 'success' })}
                                onError={(msg) => setToast({ msg, type: 'error' })}
                            />
                        </div>
                    </div>
                </div>
            </article>

            {/* AI Summary Modal */}
            <Modal isOpen={summaryOpen} onClose={() => setSummaryOpen(false)} title="🤖 AI Summary">
                <div className="space-y-3">
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-sky-100 dark:border-sky-800">
                        <p className="font-medium text-sky-700 dark:text-sky-400 mb-2 text-xs uppercase tracking-wide">
                            Article Preview
                        </p>
                        <p className="font-semibold mb-2">{title}</p>
                        <p className="text-slate-600 dark:text-slate-300">{description || 'No description available.'}</p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        💡 Full AI-generated summary is created when you add this article to a notebook.
                    </p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full justify-center"
                    >
                        Read Full Article →
                    </a>
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
