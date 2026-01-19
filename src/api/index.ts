/**
 * API modules for mini-program
 * Auth, Families, Upload, Feedback APIs
 */
import { request, setToken, removeToken } from './request';
import type { User, FamilyListItem, FamilyData } from '../types/family';

// ============================================
// Auth API
// ============================================
export const authApi = {
    // Send verification code
    sendCode: (data: { email: string; type?: string }) =>
        request<{ message: string }>('/auth/send-code', {
            method: 'POST',
            data,
        }),

    // Register
    register: (data: {
        email: string;
        password: string;
        nickname: string;
        phone: string;
        verificationCode: string;
    }) =>
        request<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            data,
        }),

    // Login
    login: (data: { emailOrUsername: string; password: string }) =>
        request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            data,
        }),

    // Get current user profile
    getProfile: () => request<User>('/auth/profile'),

    // Update user profile
    updateProfile: (data: { nickname?: string; phone?: string; avatar?: string }) =>
        request<User>('/auth/profile', {
            method: 'PUT',
            data,
        }),
};

// ============================================
// Families API
// ============================================
export const familiesApi = {
    // Get all families for current user
    getAll: () => request<FamilyListItem[]>('/families'),

    // Get single family with full data
    getOne: (id: string) => request<FamilyData>(`/families/${id}`),

    // Create new family
    create: (data: { name: string; subtitle?: string; hometown?: string; theme?: string }) =>
        request<FamilyListItem>('/families', {
            method: 'POST',
            data,
        }),

    // Update family
    update: (id: string, data: any) =>
        request<FamilyListItem>(`/families/${id}`, {
            method: 'PUT',
            data,
        }),

    // Delete family 
    delete: (id: string) =>
        request<any>(`/families/${id}`, {
            method: 'DELETE',
        }),

    // Import family data
    import: (id: string, data: any) =>
        request<any>(`/families/${id}/import`, {
            method: 'POST',
            data,
        }),

    // Update genealogy content
    updateGenealogyContent: (id: string, data: any) =>
        request<any>(`/families/${id}/content`, {
            method: 'PUT',
            data,
        }),

    // ---- Generations ----
    addGeneration: (familyId: string, data: { name: string; atTop?: boolean }) =>
        request<any>(`/families/${familyId}/generations`, {
            method: 'POST',
            data,
        }),

    updateGeneration: (id: string, data: { name?: string; order?: number }) =>
        request<any>(`/families/generations/${id}`, {
            method: 'PUT',
            data,
        }),

    deleteGeneration: (id: string) =>
        request<any>(`/families/generations/${id}`, {
            method: 'DELETE',
        }),

    // ---- Members ----
    addMember: (generationId: string, data: any) =>
        request<any>(`/families/generations/${generationId}/members`, {
            method: 'POST',
            data,
        }),

    updateMember: (id: string, data: any) =>
        request<any>(`/families/members/${id}`, {
            method: 'PUT',
            data,
        }),

    deleteMember: (id: string) =>
        request<any>(`/families/members/${id}`, {
            method: 'DELETE',
        }),
};

// ============================================
// Feedback API (for regular users)
// ============================================
export const feedbackApi = {
    create: (data: { title: string; content: string; type?: string }) =>
        request<any>('/feedback', {
            method: 'POST',
            data,
        }),

    getMyFeedbacks: () => request<any[]>('/feedback'),

    getFeedback: (id: string) => request<any>(`/feedback/${id}`),

    delete: (id: string) =>
        request<any>(`/feedback/${id}`, {
            method: 'DELETE',
        }),
};

// Re-export token methods
export { setToken, removeToken };
