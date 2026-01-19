/**
 * Auth Context for mini-program
 * Global state management for user authentication
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { authApi, setToken, removeToken } from '../api';
import { getToken, setUser, getUser, clearAuth } from '../utils/storage';
import type { User } from '../types/family';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (email: string, password: string, nickname: string, phone: string, verificationCode: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = getToken();
        if (token) {
            try {
                const profile = await authApi.getProfile();
                setUserState(profile);
                setUser(profile);
            } catch {
                // Token invalid, remove it
                clearAuth();
            }
        }
        setIsLoading(false);
    };

    const login = async (emailOrUsername: string, password: string) => {
        const { user: userData, token } = await authApi.login({ emailOrUsername, password });
        setToken(token);
        setUser(userData);
        setUserState(userData);
    };

    const register = async (
        email: string,
        password: string,
        nickname: string,
        phone: string,
        verificationCode: string
    ) => {
        const { user: userData, token } = await authApi.register({
            email,
            password,
            nickname,
            phone,
            verificationCode,
        });
        setToken(token);
        setUser(userData);
        setUserState(userData);
    };

    const logout = () => {
        clearAuth();
        setUserState(null);
        // Navigate to login page
        Taro.reLaunch({ url: '/pages/login/index' });
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUserState(updatedUser);
            setUser(updatedUser);
        }
    };

    const refreshUser = async () => {
        try {
            const profile = await authApi.getProfile();
            setUserState(profile);
            setUser(profile);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateUser,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
