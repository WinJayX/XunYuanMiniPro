/**
 * Family Detail Page - 族谱详情页
 * Features: Couple grouping, sorted members, canvas connection lines
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image, Input, Canvas } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { familiesApi } from '../../api';
import { API_BASE_URL } from '../../api/request';
import type { FamilyData, Generation, Member } from '../../types/family';
import './index.scss';

// Get spouse IDs (compatible with old single spouse data)
function getSpouseIds(member: Member): (number | string)[] {
    if (member.spouseIds && Array.isArray(member.spouseIds)) {
        return member.spouseIds;
    }
    if ((member as any).spouseId) {
        return [(member as any).spouseId];
    }
    return [];
}

// Sort members by hierarchy and couple grouping
function sortMembersByCouple(members: Member[], parentGenMembers?: Member[]): Member[] {
    // Build parent order mapping
    const parentOrderMap = new Map<number | string, number>();
    if (parentGenMembers) {
        const sortedParents = [...parentGenMembers].sort((a, b) => {
            const orderDiff = (a.birthOrder || 999) - (b.birthOrder || 999);
            if (orderDiff !== 0) return orderDiff;
            const yearA = a.birthYear || 9999;
            const yearB = b.birthYear || 9999;
            return yearA - yearB;
        });
        sortedParents.forEach((parent, index) => {
            parentOrderMap.set(parent.id, index);
            if (parent.apiId) parentOrderMap.set(parent.apiId, index);
        });
    }

    // Sort by parent order, birthOrder, birthYear
    const sortedByOrder = [...members].sort((a, b) => {
        const parentOrderA = a.parentId ? (parentOrderMap.get(a.parentId) ?? 999) : 999;
        const parentOrderB = b.parentId ? (parentOrderMap.get(b.parentId) ?? 999) : 999;
        if (parentOrderA !== parentOrderB) return parentOrderA - parentOrderB;

        const orderA = a.birthOrder || 999;
        const orderB = b.birthOrder || 999;
        if (orderA !== orderB) return orderA - orderB;

        const yearA = a.birthYear || 9999;
        const yearB = b.birthYear || 9999;
        return yearA - yearB;
    });

    // Group couples together
    const sorted: Member[] = [];
    const added = new Set<number | string>();

    sortedByOrder.forEach(member => {
        const memberId = member.apiId || member.id;
        if (added.has(memberId)) return;

        sorted.push(member);
        added.add(memberId);

        // Add spouses right after main member
        const spouseIds = getSpouseIds(member);
        spouseIds.forEach(spouseId => {
            const spouse = members.find(m => (m.apiId || m.id) === spouseId || m.id === spouseId);
            const sId = spouse ? (spouse.apiId || spouse.id) : null;
            if (spouse && sId && !added.has(sId)) {
                sorted.push(spouse);
                added.add(sId);
            }
        });
    });

    return sorted;
}

// Get zodiac emoji
function getZodiacEmoji(year?: number | null): string {
    if (!year) return '';
    const zodiacEmojis = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐴', '🐑', '🐵', '🐔', '🐕', '🐷'];
    const index = (year - 4) % 12;
    return zodiacEmojis[index >= 0 ? index : index + 12];
}

export default function FamilyPage() {
    const router = useRouter();
    const familyId = router.params.id;

    const [familyData, setFamilyData] = useState<FamilyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Member>>({});
    const [uploading, setUploading] = useState(false);

    // Load family data
    const loadFamily = useCallback(async () => {
        if (!familyId) return;

        setLoading(true);
        try {
            const data = await familiesApi.getOne(familyId);
            setFamilyData(data);
            Taro.setNavigationBarTitle({ title: data.settings?.familyName || '族谱详情' });
        } catch (error: any) {
            console.error('Failed to load family:', error);
            Taro.showToast({ title: '加载失败', icon: 'none' });
        } finally {
            setLoading(false);
        }
    }, [familyId]);

    useEffect(() => {
        loadFamily();
    }, [loadFamily]);

    // Close member detail
    const closeMemberDetail = () => {
        setSelectedMember(null);
        setIsEditing(false);
        setEditForm({});
    };

    // Open member for editing
    const openEditMode = () => {
        if (selectedMember) {
            setEditForm({
                name: selectedMember.name,
                birthYear: selectedMember.birthYear,
                deathYear: selectedMember.deathYear,
                hometown: selectedMember.hometown,
                bio: selectedMember.bio,
                photo: selectedMember.photo,
            });
            setIsEditing(true);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async () => {
        try {
            const chooseRes = await Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
            });

            if (chooseRes.tempFilePaths.length === 0) return;

            setUploading(true);
            const tempPath = chooseRes.tempFilePaths[0];
            const token = Taro.getStorageSync('token');

            const uploadRes = await Taro.uploadFile({
                url: `${API_BASE_URL}/upload/image?folder=avatars`,
                filePath: tempPath,
                name: 'file',
                header: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });

            if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
                const data = JSON.parse(uploadRes.data);
                setEditForm({ ...editForm, photo: data.url });
                Taro.showToast({ title: '上传成功', icon: 'success' });
            } else {
                throw new Error('Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Taro.showToast({ title: '上传失败', icon: 'none' });
        } finally {
            setUploading(false);
        }
    };

    // Save member changes
    const handleSaveMember = async () => {
        const memberId = selectedMember?.apiId || String(selectedMember?.id);

        if (!memberId || memberId === 'undefined') {
            Taro.showToast({ title: '无法保存：成员ID无效', icon: 'none' });
            return;
        }

        try {
            await familiesApi.updateMember(memberId, editForm);
            Taro.showToast({ title: '保存成功', icon: 'success' });
            setIsEditing(false);
            loadFamily();
            closeMemberDetail();
        } catch (error: any) {
            Taro.showToast({ title: error.message || '保存失败', icon: 'none' });
        }
    };

    // Build processed generations with sorted and grouped members
    const processedGenerations = useMemo(() => {
        if (!familyData) return [];

        return familyData.generations.map((gen, genIndex) => {
            const parentGenMembers = genIndex > 0
                ? familyData.generations[genIndex - 1].members
                : undefined;
            const sortedMembers = sortMembersByCouple(gen.members, parentGenMembers);

            // Group into couples and singles
            const groups: { type: 'couple' | 'single'; main: Member; spouses: Member[] }[] = [];
            const processed = new Set<string>();

            sortedMembers.forEach(member => {
                const mId = String(member.apiId || member.id);
                if (processed.has(mId)) return;

                const spouseIds = getSpouseIds(member);
                const spouses = spouseIds
                    .map(sid => sortedMembers.find(m =>
                        (m.apiId || m.id) === sid || m.id === sid
                    ))
                    .filter((s): s is Member => {
                        if (!s) return false;
                        const sId = String(s.apiId || s.id);
                        return !processed.has(sId);
                    });

                processed.add(mId);
                spouses.forEach(s => processed.add(String(s.apiId || s.id)));

                groups.push({
                    type: spouses.length > 0 ? 'couple' : 'single',
                    main: member,
                    spouses,
                });
            });

            return { ...gen, groups };
        });
    }, [familyData]);

    // Render couple connector line
    const renderCoupleConnector = (index: number, total: number) => {
        const label = total > 1
            ? (index === 0 ? '元配' : (index === 1 ? '继室' : '侧室'))
            : '';
        return (
            <View className="couple-connector">
                <View className="connector-line" />
                {label && <Text className="connector-label">{label}</Text>}
            </View>
        );
    };

    // Render member card
    const renderMemberCard = (member: Member, isInCouple: boolean = false) => (
        <View
            key={member.id}
            className={`member-card gender-${member.gender} ${isInCouple ? 'in-couple' : ''}`}
            data-member-id={member.apiId || member.id}
            onClick={() => setSelectedMember(member)}
        >
            <View className="member-avatar">
                {member.photo ? (
                    <Image className="avatar-image" src={member.photo} mode="aspectFill" />
                ) : (
                    <Text className="avatar-placeholder">
                        {member.gender === 'male' ? '👨' : '👩'}
                    </Text>
                )}
            </View>
            <View className="member-info">
                <Text className="member-name">{member.name}</Text>
                {member.birthYear && (
                    <Text className="member-year">
                        {member.birthYear} {getZodiacEmoji(member.birthYear)}
                    </Text>
                )}
            </View>
            {/* Connection point indicator */}
            <View className="connection-point top" />
            <View className="connection-point bottom" />
        </View>
    );

    // Render generation with couples grouped
    const renderGeneration = (generation: typeof processedGenerations[0], genIndex: number) => {
        const hasParentConnections = genIndex > 0;

        return (
            <View key={generation.id} className="generation-section">
                {/* Vertical connector from previous generation */}
                {hasParentConnections && (
                    <View className="generation-connector">
                        <View className="main-vertical-line" />
                    </View>
                )}

                {/* Generation header */}
                <View className="generation-header">
                    <View className="generation-line" />
                    <Text className="generation-name">{generation.name}</Text>
                    <View className="generation-line" />
                </View>

                {/* Members container - centered */}
                <View className="members-wrapper">
                    <ScrollView
                        className="members-scroll"
                        scrollX
                        enhanced
                        showScrollbar={false}
                    >
                        <View className="members-container">
                            {generation.groups.map((group, groupIdx) => {
                                if (group.type === 'couple') {
                                    return (
                                        <View
                                            key={`couple-${group.main.id}`}
                                            className="couple-container"
                                            data-couple-id={group.main.apiId || group.main.id}
                                        >
                                            {renderMemberCard(group.main, true)}
                                            {group.spouses.map((spouse, spouseIdx) => (
                                                <View key={spouse.id} className="spouse-group">
                                                    {renderCoupleConnector(spouseIdx, group.spouses.length)}
                                                    {renderMemberCard(spouse, true)}
                                                </View>
                                            ))}
                                            {/* Couple bottom connection point */}
                                            <View className="couple-connection-point" />
                                        </View>
                                    );
                                }
                                return renderMemberCard(group.main, false);
                            })}

                            {generation.groups.length === 0 && (
                                <View className="empty-members">
                                    <Text className="empty-text">暂无成员</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>

                {/* Connection lines between this and next generation */}
                {genIndex < (familyData?.generations.length || 0) - 1 && (
                    <View className="inter-generation-lines">
                        {generation.groups.map(group => {
                            // Find children in next generation
                            const nextGen = familyData?.generations[genIndex + 1];
                            const mainId = group.main.apiId || group.main.id;
                            const hasChildren = nextGen?.members.some(m =>
                                m.parentId === mainId || String(m.parentId) === String(mainId)
                            );

                            if (hasChildren) {
                                return (
                                    <View
                                        key={`line-${mainId}`}
                                        className="parent-child-line"
                                    />
                                );
                            }
                            return null;
                        })}
                    </View>
                )}
            </View>
        );
    };

    // Loading state
    if (loading) {
        return (
            <View className="loading-container">
                <View className="loading-spinner" />
                <Text className="loading-text">加载中...</Text>
            </View>
        );
    }

    if (!familyData) {
        return (
            <View className="error-container">
                <Text className="error-icon">😕</Text>
                <Text className="error-text">未找到家族数据</Text>
            </View>
        );
    }

    return (
        <View className="family-page">
            {/* Header Banner */}
            <View className="family-header">
                <Text className="family-title">{familyData.settings.familyName}</Text>
                {familyData.settings.subtitle && (
                    <Text className="family-subtitle">{familyData.settings.subtitle}</Text>
                )}
                {familyData.settings.hometown && (
                    <View className="hometown-info">
                        <Text className="hometown-icon">📍</Text>
                        <Text className="hometown-text">{familyData.settings.hometown}</Text>
                    </View>
                )}
            </View>

            {/* Generations */}
            <ScrollView className="generations-list" scrollY enhanced showScrollbar={false}>
                {processedGenerations.map((gen, idx) => renderGeneration(gen, idx))}

                {processedGenerations.length === 0 && (
                    <View className="empty-state">
                        <Text className="empty-icon">📋</Text>
                        <Text className="empty-title">还没有世代信息</Text>
                        <Text className="empty-desc">请在网页版添加世代和成员</Text>
                    </View>
                )}
            </ScrollView>

            {/* Member Detail Modal */}
            {selectedMember && (
                <View className="member-modal-overlay" onClick={closeMemberDetail}>
                    <View className="member-modal" onClick={(e) => e.stopPropagation()}>
                        <View className="modal-header">
                            <View
                                className={`modal-avatar ${isEditing ? 'editable' : ''}`}
                                onClick={() => {
                                    if (isEditing) handleAvatarUpload();
                                }}
                            >
                                {(isEditing ? editForm.photo : selectedMember.photo) ? (
                                    <Image
                                        className="avatar-image"
                                        src={isEditing ? editForm.photo! : selectedMember.photo!}
                                        mode="aspectFill"
                                    />
                                ) : (
                                    <Text className="avatar-placeholder">
                                        {selectedMember.gender === 'male' ? '👨' : '👩'}
                                    </Text>
                                )}
                                {isEditing && (
                                    <View className="upload-overlay">
                                        <Text className="upload-icon">{uploading ? '⏳' : '📷'}</Text>
                                    </View>
                                )}
                            </View>

                            {isEditing ? (
                                <Input
                                    className="edit-name-input"
                                    value={editForm.name || ''}
                                    onInput={(e) => setEditForm({ ...editForm, name: e.detail.value })}
                                    placeholder="输入姓名"
                                />
                            ) : (
                                <Text className="modal-name">{selectedMember.name}</Text>
                            )}
                            <Text className={`modal-gender gender-${selectedMember.gender}`}>
                                {selectedMember.gender === 'male' ? '男' : '女'}
                            </Text>
                        </View>

                        <View className="modal-content">
                            <View className="info-row">
                                <Text className="info-label">出生年份</Text>
                                {isEditing ? (
                                    <Input
                                        className="edit-input"
                                        type="number"
                                        value={String(editForm.birthYear || '')}
                                        onInput={(e) => setEditForm({ ...editForm, birthYear: Number(e.detail.value) || null })}
                                        placeholder="输入年份"
                                    />
                                ) : (
                                    <Text className="info-value">
                                        {selectedMember.birthYear ? `${selectedMember.birthYear}年 ${getZodiacEmoji(selectedMember.birthYear)}` : '-'}
                                    </Text>
                                )}
                            </View>

                            <View className="info-row">
                                <Text className="info-label">逝世年份</Text>
                                {isEditing ? (
                                    <Input
                                        className="edit-input"
                                        type="number"
                                        value={String(editForm.deathYear || '')}
                                        onInput={(e) => setEditForm({ ...editForm, deathYear: Number(e.detail.value) || null })}
                                        placeholder="输入年份"
                                    />
                                ) : (
                                    <Text className="info-value">
                                        {selectedMember.deathYear ? `${selectedMember.deathYear}年` : '-'}
                                    </Text>
                                )}
                            </View>

                            <View className="info-row">
                                <Text className="info-label">籍贯</Text>
                                {isEditing ? (
                                    <Input
                                        className="edit-input"
                                        value={editForm.hometown || ''}
                                        onInput={(e) => setEditForm({ ...editForm, hometown: e.detail.value })}
                                        placeholder="输入籍贯"
                                    />
                                ) : (
                                    <Text className="info-value">{selectedMember.hometown || '-'}</Text>
                                )}
                            </View>

                            <View className="bio-section">
                                <Text className="bio-label">简介</Text>
                                {isEditing ? (
                                    <Input
                                        className="edit-input bio-input"
                                        value={editForm.bio || ''}
                                        onInput={(e) => setEditForm({ ...editForm, bio: e.detail.value })}
                                        placeholder="输入简介"
                                    />
                                ) : (
                                    <Text className="bio-content">{selectedMember.bio || '暂无简介'}</Text>
                                )}
                            </View>
                        </View>

                        <View className="modal-actions">
                            {isEditing ? (
                                <>
                                    <View className="action-btn cancel-btn" onClick={() => setIsEditing(false)}>
                                        <Text>取消</Text>
                                    </View>
                                    <View className="action-btn save-btn" onClick={handleSaveMember}>
                                        <Text>保存</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View className="action-btn close-btn" onClick={closeMemberDetail}>
                                        <Text>关闭</Text>
                                    </View>
                                    <View className="action-btn edit-btn" onClick={openEditMode}>
                                        <Text>编辑</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
