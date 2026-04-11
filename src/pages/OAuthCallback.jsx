import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCallback
 * 
 * The backend redirects here after a successful Google OAuth login:
 *   /auth/callback?token=<JWT>
 * 
 * This component reads the token, persists it, updates AuthContext,
 * and redirects the user to the home page.
 */
export default function OAuthCallback() {
    const navigate = useNavigate();
    const { handleOAuthToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error || !token) {
            navigate('/login?error=oauth_failed', { replace: true });
            return;
        }

        handleOAuthToken(token);
        navigate('/', { replace: true });
    }, [navigate, handleOAuthToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
            <div className="text-center animate-fade-in">
                <div className="inline-block w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Signing you in…</p>
            </div>
        </div>
    );
}
