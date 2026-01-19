/**
 * Storage utilities for mini-program
 * Wrapper around Taro storage API
 */
import Taro from '@tarojs/taro';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Get token from storage
export function getToken(): string | null {
    try {
        return Taro.getStorageSync(TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

// Set token to storage
export function setToken(token: string): void {
    try {
        Taro.setStorageSync(TOKEN_KEY, token);
    } catch (error) {
        console.error('Failed to save token:', error);
    }
}

// Remove token from storage
export function removeToken(): void {
    try {
        Taro.removeStorageSync(TOKEN_KEY);
    } catch (error) {
        console.error('Failed to remove token:', error);
    }
}

// Get user from storage
export function getUser<T>(): T | null {
    try {
        const userStr = Taro.getStorageSync(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
}

// Set user to storage
export function setUser<T>(user: T): void {
    try {
        Taro.setStorageSync(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Failed to save user:', error);
    }
}

// Remove user from storage
export function removeUser(): void {
    try {
        Taro.removeStorageSync(USER_KEY);
    } catch (error) {
        console.error('Failed to remove user:', error);
    }
}

// Clear all auth related storage
export function clearAuth(): void {
    removeToken();
    removeUser();
}
