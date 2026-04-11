import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import NotebookCard from '../components/ui/NotebookCard';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { useNotebooks } from '../context/NotebookContext';

export default function Dashboard() {
    const { notebooks, loading, createNotebook, fetchNotebooks } = useNotebooks();
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', is_public: false });
    const [toast, setToast] = useState(null);
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createNotebook(form);
            setToast({ msg: 'Notebook created!', type: 'success' });
            setShowCreate(false);
            setForm({ name: '', description: '', is_public: false });
        } catch (err) {
            setToast({ msg: err.response?.data?.message || 'Failed to create', type: 'error' });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Notebooks</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Organize and export your curated news collections
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        ＋ New Notebook
                    </button>
                </div>

                {/* Skeletons while loading */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card p-5 space-y-3">
                                <div className="skeleton h-4 w-2/3" />
                                <div className="skeleton h-3 w-full" />
                                <div className="skeleton h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : notebooks.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                        <p className="text-5xl mb-4">📚</p>
                        <p className="text-base font-medium">No notebooks yet.</p>
                        <p className="text-sm mt-1">Save articles and they&apos;ll end up here.</p>
                        <button onClick={() => setShowCreate(true)} className="btn-primary mt-6">
                            Create your first notebook
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {notebooks.map((nb) => (
                            <NotebookCard key={nb.id} notebook={nb} onUpdated={fetchNotebooks} />
                        ))}
                    </div>
                )}
            </main>

            {/* Create Notebook Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Notebook">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Name</label>
                        <input
                            className="input-field"
                            placeholder="UPSC Current Affairs"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            placeholder="What is this notebook for?"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {form.is_public ? '🌐 Public' : '🔒 Private'}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {form.is_public
                                    ? 'Visible to everyone in Knowledge Center'
                                    : 'Only you can see this notebook'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_public: !form.is_public })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.is_public ? 'bg-accent dark:bg-accent-dark' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_public ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
                        <button type="submit" disabled={creating} className="btn-primary">
                            {creating ? 'Creating…' : 'Create Notebook'}
                        </button>
                    </div>
                </form>
            </Modal>

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
