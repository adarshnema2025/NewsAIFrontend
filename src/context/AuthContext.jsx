import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('newsai_token'));
    const [loading, setLoading] = useState(true);

    // Decode user info from JWT and supplement with stored profile
    const decodeToken = useCallback((jwt) => {
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            // JWT now includes: { id, name, email }
            // Fallback to localStorage-cached profile for old tokens
            const cached = JSON.parse(localStorage.getItem('newsai_user') || '{}');
            return {
                id: payload.id,
                name: payload.name || cached.name || 'User',
                email: payload.email || cached.email || '',
            };
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setUser(decoded);
            } else {
                logout();
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token, decodeToken]);

    const login = async (credentials) => {
        // POST /api/auth/login → { token }
        const data = await authService.login(credentials);
        localStorage.setItem('newsai_token', data.token);
        setToken(data.token);

        // Eagerly cache name+email from the form (in case of old JWTs without those fields)
        const profile = { name: credentials.email, email: credentials.email };
        localStorage.setItem('newsai_user', JSON.stringify(profile));

        return data;
    };

    const register = async (credentials) => {
        // POST /api/auth/register → user object
        const data = await authService.register(credentials);
        // Cache name for UX
        localStorage.setItem('newsai_user', JSON.stringify({ name: credentials.name, email: credentials.email }));
        return data;
    };

    // Called by OAuthCallback page after Google OAuth redirect
    const handleOAuthToken = useCallback((jwt) => {
        localStorage.setItem('newsai_token', jwt);
        setToken(jwt);
        const decoded = decodeToken(jwt);
        if (decoded) {
            localStorage.setItem('newsai_user', JSON.stringify({ name: decoded.name, email: decoded.email }));
            setUser(decoded);
        }
    }, [decodeToken]);

    const logout = () => {
        localStorage.removeItem('newsai_token');
        localStorage.removeItem('newsai_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, handleOAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

