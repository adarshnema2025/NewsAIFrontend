import { useState, useRef, useEffect } from 'react';
import { useNotebooks } from '../../context/NotebookContext';
import Modal from './Modal';

export default function AddToNotebookDropdown({ article, onSuccess, onError }) {
    const { notebooks, createNotebook, addArticle } = useNotebooks();
    const [open, setOpen] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(null); // notebookId of the one loading
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleAdd = async (notebookId) => {
        setLoading(notebookId);
        try {
            await addArticle(notebookId, article);
            onSuccess?.('Article added to notebook! ✨');
            setOpen(false);
        } catch (err) {
            onError?.(err.response?.data?.message || 'Failed to add article');
        } finally {
            setLoading(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const nb = await createNotebook({ name: newName, description: newDesc, is_public: false });
            await handleAdd(nb.id);
            setShowCreate(false);
            setNewName(''); setNewDesc('');
        } catch (err) {
            onError?.(err.response?.data?.message || 'Failed to create notebook');
        }
    };

    return (
        <>
            {/* Wrapper is relative so the dropdown positions off this button */}
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="btn-outline text-xs py-1.5 px-3"
                >
                    📓 Add to Notebook
                </button>

                {open && (
                    <div className="absolute left-0 bottom-full mb-1 w-60 card py-1 text-sm z-50 animate-fade-in shadow-xl max-h-56 overflow-y-auto">
                        {notebooks.length === 0 ? (
                            <p className="px-4 py-2 text-slate-400 dark:text-slate-500 italic text-xs">No notebooks yet</p>
                        ) : (
                            notebooks.map((nb) => (
                                <button
                                    key={nb.id}
                                    onClick={() => handleAdd(nb.id)}
                                    disabled={loading === nb.id}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 truncate transition flex items-center justify-between"
                                >
                                    <span className="truncate">{nb.name}</span>
                                    {loading === nb.id && (
                                        <span className="w-4 h-4 border-2 border-accent/30 border-t-accent dark:border-t-accent-dark rounded-full animate-spin-slow inline-block flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                        <button
                            onClick={() => { setShowCreate(true); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-accent dark:text-accent-dark hover:bg-accent/5 dark:hover:bg-accent-dark/5 font-medium transition border-t border-slate-100 dark:border-slate-700"
                        >
                            ＋ Create New Notebook
                        </button>
                    </div>
                )}
            </div>

            {/* Create Notebook Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Notebook">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                            Notebook name
                        </label>
                        <input
                            className="input-field"
                            placeholder="e.g. UPSC Current Affairs"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                            Description <span className="text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            className="input-field resize-none"
                            rows={3}
                            placeholder="What is this notebook about?"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary">Create &amp; Add</button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
