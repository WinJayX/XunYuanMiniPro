/**
 * Login Page - 登录/注册页面
 */
import { useState, useCallback } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/auth';
import { authApi } from '../../api';
import './index.scss';

type Mode = 'login' | 'register';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Send verification code
    const handleSendCode = useCallback(async () => {
        if (!email) {
            Taro.showToast({ title: '请输入邮箱', icon: 'none' });
            return;
        }
        if (countdown > 0) return;

        try {
            await authApi.sendCode({ email, type: 'register' });
            Taro.showToast({ title: '验证码已发送', icon: 'success' });

            // Start countdown
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            Taro.showToast({ title: error.message || '发送失败', icon: 'none' });
        }
    }, [email, countdown]);

    // Submit form
    const handleSubmit = useCallback(async () => {
        if (loading) return;

        // Validation
        if (mode === 'login') {
            if (!email || !password) {
                Taro.showToast({ title: '请填写邮箱和密码', icon: 'none' });
                return;
            }
        } else {
            if (!email || !password || !nickname || !phone || !verificationCode) {
                Taro.showToast({ title: '请填写所有必填项', icon: 'none' });
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
                Taro.showToast({ title: '登录成功', icon: 'success' });
            } else {
                await register(email, password, nickname, phone, verificationCode);
                Taro.showToast({ title: '注册成功', icon: 'success' });
            }
            // Navigate to home after success
            setTimeout(() => {
                Taro.switchTab({ url: '/pages/index/index' });
            }, 1000);
        } catch (error: any) {
            Taro.showToast({ title: error.message || '操作失败', icon: 'none' });
        } finally {
            setLoading(false);
        }
    }, [mode, email, password, nickname, phone, verificationCode, loading, login, register]);

    // Toggle mode
    const toggleMode = useCallback(() => {
        setMode(mode === 'login' ? 'register' : 'login');
        // Reset form
        setPassword('');
        setNickname('');
        setPhone('');
        setVerificationCode('');
    }, [mode]);

    return (
        <View className="login-page">
            {/* Logo */}
            <View className="login-header">
                <Text className="logo-text">寻源家谱</Text>
                <Text className="logo-subtitle">传承家族记忆，延续血脉亲情</Text>
            </View>

            {/* Form */}
            <View className="login-form">
                <View className="form-group">
                    <Text className="form-label">邮箱</Text>
                    <Input
                        className="form-input"
                        type="text"
                        placeholder="请输入邮箱"
                        value={email}
                        onInput={(e) => setEmail(e.detail.value)}
                    />
                </View>

                <View className="form-group">
                    <Text className="form-label">密码</Text>
                    <Input
                        className="form-input"
                        type="text"
                        password
                        placeholder="请输入密码"
                        value={password}
                        onInput={(e) => setPassword(e.detail.value)}
                    />
                </View>

                {mode === 'register' && (
                    <>
                        <View className="form-group">
                            <Text className="form-label">昵称</Text>
                            <Input
                                className="form-input"
                                type="text"
                                placeholder="请输入昵称"
                                value={nickname}
                                onInput={(e) => setNickname(e.detail.value)}
                            />
                        </View>

                        <View className="form-group">
                            <Text className="form-label">手机号</Text>
                            <Input
                                className="form-input"
                                type="number"
                                placeholder="请输入手机号"
                                value={phone}
                                onInput={(e) => setPhone(e.detail.value)}
                            />
                        </View>

                        <View className="form-group">
                            <Text className="form-label">验证码</Text>
                            <View className="code-input-row">
                                <Input
                                    className="form-input code-input"
                                    type="number"
                                    placeholder="请输入验证码"
                                    value={verificationCode}
                                    onInput={(e) => setVerificationCode(e.detail.value)}
                                />
                                <Button
                                    className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
                                    onClick={handleSendCode}
                                    disabled={countdown > 0}
                                >
                                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                </Button>
                            </View>
                        </View>
                    </>
                )}

                {/* Submit Button */}
                <Button
                    className="submit-btn"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading}
                >
                    {mode === 'login' ? '登 录' : '注 册'}
                </Button>

                {/* Toggle Mode */}
                <View className="mode-toggle" onClick={toggleMode}>
                    <Text className="toggle-text">
                        {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View className="login-footer">
                <Text className="footer-text">登录即表示同意</Text>
                <Text className="footer-link">《用户协议》</Text>
                <Text className="footer-text">和</Text>
                <Text className="footer-link">《隐私政策》</Text>
            </View>
        </View>
    );
}
