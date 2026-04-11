import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
                <div className="w-8 h-8 border-4 border-accent/30 border-t-accent dark:border-accent-dark/30 dark:border-t-accent-dark rounded-full animate-spin-slow" />
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}
