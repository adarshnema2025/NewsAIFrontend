import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'health', 'science'];

export default function Navbar({ onCategoryChange, activeCategory }) {
    const { user, logout } = useAuth();
    const { dark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <span className="text-xl font-bold text-accent dark:text-accent-dark tracking-tight">
                        News<span className="text-slate-700 dark:text-slate-200">AI</span>
                    </span>
                </Link>

                {/* Category Tabs (hidden on mobile) */}
                {location.pathname === '/' && (
                    <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => onCategoryChange?.(cat)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeCategory === cat
                                    ? 'bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Right side actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        title="Toggle theme"
                        className="btn-ghost px-2.5 py-2 rounded-lg"
                    >
                        {dark ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Profile dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen((o) => !o)}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
                        >
                            {initials}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 card py-1 text-sm animate-fade-in">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                </div>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                                >
                                    📊 Dashboard
                                </Link>
                                <Link
                                    to="/knowledge-center"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                                >
                                    🌐 Knowledge Center
                                </Link>
                                <Link
                                    to="/archives"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                                >
                                    📌 Archives
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile category scroll */}
            {location.pathname === '/' && (
                <div className="md:hidden flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange?.(cat)}
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${activeCategory === cat
                                ? 'bg-accent text-white dark:bg-accent-dark'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
}
