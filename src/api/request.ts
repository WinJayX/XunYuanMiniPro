/**
 * API request module for mini-program
 * Adapted from web version using Taro.request
 */
import Taro from '@tarojs/taro';
import { getToken, setToken, removeToken } from '../utils/storage';

// API base URL - should be configured based on environment
const API_BASE_URL = process.env.TARO_APP_API_BASE_URL || 'https://your-domain.com/api';

// Request options type
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: Record<string, string>;
    showLoading?: boolean;
    showError?: boolean;
}

// Response type
interface ApiResponse<T> {
    code?: number;
    message?: string;
    data?: T;
}

/**
 * Generic request wrapper
 */
async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        data,
        header = {},
        showLoading = true,
        showError = true,
    } = options;

    const token = getToken();

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...header,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Show loading
    if (showLoading) {
        Taro.showLoading({ title: '加载中...', mask: true });
    }

    try {
        const response = await Taro.request<T>({
            url: `${API_BASE_URL}${endpoint}`,
            method,
            data,
            header: headers,
            timeout: 30000,
        });

        // Hide loading
        if (showLoading) {
            Taro.hideLoading();
        }

        // Check HTTP status
        if (response.statusCode >= 200 && response.statusCode < 300) {
            return response.data;
        }

        // Handle 401 Unauthorized
        if (response.statusCode === 401) {
            removeToken();
            Taro.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000,
            });
            // Redirect to login page after toast
            setTimeout(() => {
                Taro.reLaunch({ url: '/pages/login/index' });
            }, 2000);
            throw new Error('Unauthorized');
        }

        // Handle other errors
        const errorData = response.data as any;
        const errorMessage = errorData?.message || `请求失败 (${response.statusCode})`;

        if (showError) {
            Taro.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 2000,
            });
        }

        throw new Error(errorMessage);
    } catch (error: any) {
        // Hide loading
        if (showLoading) {
            Taro.hideLoading();
        }

        // Network error
        if (error.errMsg?.includes('request:fail')) {
            const networkError = '网络连接失败，请检查网络';
            if (showError) {
                Taro.showToast({
                    title: networkError,
                    icon: 'none',
                    duration: 2000,
                });
            }
            throw new Error(networkError);
        }

        throw error;
    }
}

export { request, setToken, removeToken, getToken, API_BASE_URL };
