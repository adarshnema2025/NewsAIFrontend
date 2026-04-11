import { useEffect } from 'react';

const ICONS = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
};

export default function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const colors = {
        success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
        error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300',
        info: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300',
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md text-sm font-medium animate-slide-up ${colors[type]}`}>
            <span>{ICONS[type]}</span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition">✕</button>
        </div>
    );
}
