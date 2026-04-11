import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notebookService } from '../services/notebookService';
import { useAuth } from './AuthContext';

const NotebookContext = createContext(null);

export function NotebookProvider({ children }) {
    const { user } = useAuth();
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotebooks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await notebookService.getAll();
            setNotebooks(Array.isArray(data) ? data : []);
        } catch {
            setNotebooks([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotebooks();
    }, [fetchNotebooks]);

    const createNotebook = async (data) => {
        const nb = await notebookService.create(data);
        setNotebooks((prev) => [nb, ...prev]);
        return nb;
    };

    const updateNotebook = async (id, data) => {
        const res = await notebookService.update(id, data);
        setNotebooks((prev) => prev.map((nb) => (nb.id === id ? { ...nb, ...res.notebook } : nb)));
        return res;
    };

    const deleteNotebook = async (id) => {
        await notebookService.delete(id);
        setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    };

    const addArticle = async (notebookId, article, notes) => {
        return notebookService.addArticle(notebookId, article, notes);
    };

    return (
        <NotebookContext.Provider value={{ notebooks, loading, fetchNotebooks, createNotebook, updateNotebook, deleteNotebook, addArticle }}>
            {children}
        </NotebookContext.Provider>
    );
}

export const useNotebooks = () => useContext(NotebookContext);

