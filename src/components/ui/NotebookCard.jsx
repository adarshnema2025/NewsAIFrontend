import { useState } from 'react';
import { Link } from 'react-router-dom';
import { notebookService } from '../../services/notebookService';
import { useNotebooks } from '../../context/NotebookContext';
import Toast from './Toast';
import Modal from './Modal';

export default function NotebookCard({ notebook }) {
    const { updateNotebook, deleteNotebook } = useNotebooks();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editForm, setEditForm] = useState({
        name: notebook.name,
        description: notebook.description || '',
        is_public: notebook.is_public || false,
    });
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim()) return;
        setEditing(true);
        try {
            await updateNotebook(notebook.id, editForm);
            setToast({ msg: 'Notebook updated!', type: 'success' });
            setShowEdit(false);
        } catch {
            setToast({ msg: 'Failed to update notebook', type: 'error' });
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteNotebook(notebook.id);
            setShowDeleteConfirm(false);
        } catch {
            setToast({ msg: 'Failed to delete notebook', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const pageCount = notebook.Pages?.length ?? notebook.page_count ?? 0;
    const creatorName = notebook.User?.name;

    return (
        <>
            <div className="card p-5 flex flex-col gap-3 group hover:-translate-y-0.5 transition-transform">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
                            {notebook.name}
                        </h3>
                        {/* Creator name */}
                        {creatorName && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                by {creatorName}
                            </p>
                        )}
                        {notebook.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {notebook.description}
                            </p>
                        )}
                    </div>
                    {/* Public badge */}
                    <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${notebook.is_public
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                        {notebook.is_public ? '🌐 Public' : '🔒 Private'}
                    </span>
                </div>

                {/* Article count */}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    📄 {pageCount} article{pageCount !== 1 ? 's' : ''}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Link to={`/notebooks/${notebook.id}`} className="btn-primary text-xs py-1.5 px-3">
                        Open
                    </Link>
                    <button onClick={handlePDF} disabled={loading} className="btn-outline text-xs py-1.5 px-3">
                        {loading ? '⏳…' : '⬇️ PDF'}
                    </button>
                    <button
                        onClick={() => {
                            setEditForm({ name: notebook.name, description: notebook.description || '', is_public: notebook.is_public || false });
                            setShowEdit(true);
                        }}
                        className="btn-ghost text-xs py-1.5 px-3 text-slate-500 hover:text-accent dark:hover:text-accent-dark"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Notebook">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Name</label>
                        <input
                            className="input-field"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {editForm.is_public ? '🌐 Public' : '🔒 Private'}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {editForm.is_public
                                    ? 'Visible to everyone in Knowledge Center'
                                    : 'Only you can see this notebook'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, is_public: !editForm.is_public })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editForm.is_public ? 'bg-accent dark:bg-accent-dark' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editForm.is_public ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowEdit(false)} className="btn-ghost">Cancel</button>
                        <button type="submit" disabled={editing} className="btn-primary">
                            {editing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Notebook">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete <strong>{notebook.name}</strong>? This will permanently remove all {pageCount} saved article{pageCount !== 1 ? 's' : ''} in it.
                    </p>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">Cancel</button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
