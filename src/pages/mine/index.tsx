/**
 * Mine Page - 个人中心页面
 */
import { useState } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/auth';
import { authApi, feedbackApi } from '../../api';
import './index.scss';

export default function MinePage() {
    const { user, isAuthenticated, logout, updateUser, isLoading } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Edit form
    const [editNickname, setEditNickname] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Feedback form
    const [feedbackTitle, setFeedbackTitle] = useState('');
    const [feedbackContent, setFeedbackContent] = useState('');

    // Open edit modal
    const openEditModal = () => {
        if (user) {
            setEditNickname(user.nickname || '');
            setEditPhone(user.phone || '');
            setShowEditModal(true);
        }
    };

    // Save profile
    const handleSaveProfile = async () => {
        if (!editNickname.trim()) {
            Taro.showToast({ title: '请输入昵称', icon: 'none' });
            return;
        }

        try {
            const updatedUser = await authApi.updateProfile({
                nickname: editNickname.trim(),
                phone: editPhone.trim() || undefined,
            });
            updateUser(updatedUser);
            Taro.showToast({ title: '保存成功', icon: 'success' });
            setShowEditModal(false);
        } catch (error: any) {
            Taro.showToast({ title: error.message || '保存失败', icon: 'none' });
        }
    };

    // Submit feedback
    const handleSubmitFeedback = async () => {
        if (!feedbackTitle.trim() || !feedbackContent.trim()) {
            Taro.showToast({ title: '请填写完整信息', icon: 'none' });
            return;
        }

        try {
            await feedbackApi.create({
                title: feedbackTitle.trim(),
                content: feedbackContent.trim(),
                type: 'suggestion',
            });
            Taro.showToast({ title: '反馈提交成功', icon: 'success' });
            setShowFeedbackModal(false);
            setFeedbackTitle('');
            setFeedbackContent('');
        } catch (error: any) {
            Taro.showToast({ title: error.message || '提交失败', icon: 'none' });
        }
    };

    // Handle logout
    const handleLogout = async () => {
        const res = await Taro.showModal({
            title: '退出登录',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            confirmColor: '#f44336',
        });

        if (res.confirm) {
            logout();
        }
    };

    // Not authenticated
    if (!isAuthenticated && !isLoading) {
        return (
            <View className="mine-page">
                <View className="not-logged-in">
                    <Text className="login-icon">👤</Text>
                    <Text className="login-title">未登录</Text>
                    <Button
                        className="login-btn"
                        onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
                    >
                        立即登录
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View className="mine-page">
            {/* User Header */}
            <View className="user-header">
                <View className="avatar-container">
                    {user?.avatar ? (
                        <Image className="user-avatar" src={user.avatar} mode="aspectFill" />
                    ) : (
                        <View className="avatar-placeholder">
                            <Text className="avatar-text">{user?.nickname?.[0] || '?'}</Text>
                        </View>
                    )}
                </View>
                <View className="user-info">
                    <Text className="user-name">{user?.nickname || '未设置昵称'}</Text>
                    <Text className="user-email">{user?.email}</Text>
                    {user?.role === 'admin' && (
                        <View className="admin-badge">
                            <Text className="badge-text">管理员</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Menu List */}
            <View className="menu-section">
                <View className="menu-item" onClick={openEditModal}>
                    <Text className="menu-icon">✏️</Text>
                    <Text className="menu-text">编辑资料</Text>
                    <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={() => setShowFeedbackModal(true)}>
                    <Text className="menu-icon">💬</Text>
                    <Text className="menu-text">意见反馈</Text>
                    <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item">
                    <Text className="menu-icon">📖</Text>
                    <Text className="menu-text">使用帮助</Text>
                    <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item">
                    <Text className="menu-icon">ℹ️</Text>
                    <Text className="menu-text">关于我们</Text>
                    <Text className="menu-arrow">›</Text>
                </View>
            </View>

            {/* Version Info */}
            <View className="version-info">
                <Text className="version-text">版本 1.0.0</Text>
            </View>

            {/* Logout Button */}
            <View className="logout-section">
                <Button className="logout-btn" onClick={handleLogout}>
                    退出登录
                </Button>
            </View>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <View className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <View className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <Text className="modal-title">编辑资料</Text>

                        <View className="modal-form">
                            <View className="form-group">
                                <Text className="form-label">昵称</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入昵称"
                                    value={editNickname}
                                    onInput={(e) => setEditNickname(e.detail.value)}
                                />
                            </View>

                            <View className="form-group">
                                <Text className="form-label">手机号</Text>
                                <Input
                                    className="form-input"
                                    type="number"
                                    placeholder="请输入手机号"
                                    value={editPhone}
                                    onInput={(e) => setEditPhone(e.detail.value)}
                                />
                            </View>
                        </View>

                        <View className="modal-actions">
                            <Button className="modal-btn cancel" onClick={() => setShowEditModal(false)}>
                                取消
                            </Button>
                            <Button className="modal-btn confirm" onClick={handleSaveProfile}>
                                保存
                            </Button>
                        </View>
                    </View>
                </View>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <View className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <View className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <Text className="modal-title">意见反馈</Text>

                        <View className="modal-form">
                            <View className="form-group">
                                <Text className="form-label">标题</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入反馈标题"
                                    value={feedbackTitle}
                                    onInput={(e) => setFeedbackTitle(e.detail.value)}
                                />
                            </View>

                            <View className="form-group">
                                <Text className="form-label">内容</Text>
                                <Input
                                    className="form-input textarea"
                                    placeholder="请详细描述您的建议或问题"
                                    value={feedbackContent}
                                    onInput={(e) => setFeedbackContent(e.detail.value)}
                                />
                            </View>
                        </View>

                        <View className="modal-actions">
                            <Button className="modal-btn cancel" onClick={() => setShowFeedbackModal(false)}>
                                取消
                            </Button>
                            <Button className="modal-btn confirm" onClick={handleSubmitFeedback}>
                                提交
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
