/**
 * Home Page - 家族列表页面
 */
import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useAuth } from '../../contexts/auth';
import { familiesApi } from '../../api';
import type { FamilyListItem } from '../../types/family';
import './index.scss';

export default function IndexPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [families, setFamilies] = useState<FamilyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilySubtitle, setNewFamilySubtitle] = useState('');

  // Load families
  const loadFamilies = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const data = await familiesApi.getAll();
      setFamilies(data || []);
    } catch (error: any) {
      console.error('Failed to load families:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useLoad(() => {
    console.log('Index page loaded');
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadFamilies();
    } else if (!authLoading) {
      // Not authenticated, redirect to login
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, [isAuthenticated, authLoading, loadFamilies]);

  // Pull down refresh
  usePullDownRefresh(async () => {
    await loadFamilies();
    Taro.stopPullDownRefresh();
  });

  // Navigate to family detail
  const handleFamilyClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/family/index?id=${id}` });
  };

  // Create new family
  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) {
      Taro.showToast({ title: '请输入家族名称', icon: 'none' });
      return;
    }

    try {
      await familiesApi.create({
        name: newFamilyName.trim(),
        subtitle: newFamilySubtitle.trim() || undefined,
        theme: 'classic',
      });
      Taro.showToast({ title: '创建成功', icon: 'success' });
      setShowCreateModal(false);
      setNewFamilyName('');
      setNewFamilySubtitle('');
      loadFamilies();
    } catch (error: any) {
      Taro.showToast({ title: error.message || '创建失败', icon: 'none' });
    }
  };

  // Delete family
  const handleDeleteFamily = async (family: FamilyListItem) => {
    const res = await Taro.showModal({
      title: '删除确认',
      content: `确定要删除「${family.name}」吗？此操作不可撤销。`,
      confirmText: '删除',
      confirmColor: '#f44336',
    });

    if (res.confirm) {
      try {
        await familiesApi.delete(family.id);
        Taro.showToast({ title: '删除成功', icon: 'success' });
        loadFamilies();
      } catch (error: any) {
        Taro.showToast({ title: error.message || '删除失败', icon: 'none' });
      }
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Show loading
  if (authLoading || (loading && families.length === 0)) {
    return (
      <View className="loading-container">
        <View className="loading-spinner" />
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="index-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-content">
          <Text className="header-title">我的家族</Text>
          <Text className="family-count">{families.length} 个家族</Text>
        </View>
        <Button className="add-btn" onClick={() => setShowCreateModal(true)}>
          <Text className="add-icon">+</Text>
        </Button>
      </View>

      {/* Family List */}
      <ScrollView className="family-list" scrollY enhanced showScrollbar={false}>
        {families.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📖</Text>
            <Text className="empty-title">还没有家族</Text>
            <Text className="empty-desc">点击右上角 + 创建您的第一个族谱</Text>
          </View>
        ) : (
          families.map((family) => (
            <View
              key={family.id}
              className="family-card"
              onClick={() => handleFamilyClick(family.id)}
              onLongPress={() => handleDeleteFamily(family)}
            >
              <View className="card-content">
                <View className="card-header">
                  <Text className="family-name">{family.name}</Text>
                  <View className={`theme-badge theme-${family.theme}`}>
                    <Text className="theme-text">{family.theme}</Text>
                  </View>
                </View>
                {family.subtitle && (
                  <Text className="family-subtitle">{family.subtitle}</Text>
                )}
                {family.hometown && (
                  <View className="family-info">
                    <Text className="info-icon">📍</Text>
                    <Text className="info-text">{family.hometown}</Text>
                  </View>
                )}
                <View className="card-footer">
                  <Text className="update-time">更新于 {formatDate(family.updatedAt)}</Text>
                  <Text className="arrow">›</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      {showCreateModal && (
        <View className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Text className="modal-title">创建新家族</Text>

            <View className="modal-form">
              <View className="form-group">
                <Text className="form-label">家族名称 *</Text>
                <Input
                  className="form-input"
                  placeholder="如：张氏家族"
                  value={newFamilyName}
                  onInput={(e) => setNewFamilyName(e.detail.value)}
                />
              </View>

              <View className="form-group">
                <Text className="form-label">副标题</Text>
                <Input
                  className="form-input"
                  placeholder="如：书香门第"
                  value={newFamilySubtitle}
                  onInput={(e) => setNewFamilySubtitle(e.detail.value)}
                />
              </View>
            </View>

            <View className="modal-actions">
              <Button className="modal-btn cancel" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button className="modal-btn confirm" onClick={handleCreateFamily}>
                创建
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
