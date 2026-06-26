import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

type AuthView = 'login' | 'register' | 'otp' | 'forgot' | 'reset';

export default function Auth() {
    const navigate = useNavigate();
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const checkPasswordStrength = (pass: string) => {
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        return pass.length >= 8 && hasLetter && hasNumber;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (!checkPasswordStrength(password)) {
            setError('Password must be at least 8 characters long and contain both letters and numbers.');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/api/auth/register', { email, password });
            setMessage(response.data.message || 'OTP sent to your email!');
            setView('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const response = await api.post('/api/auth/verify-otp', { email, otp: otpCode });
            setMessage(response.data.message || 'Verified! You can now log in.');
            setOtpCode(''); setPassword('');
            setView('login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP.');
        } finally { setLoading(false); }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const response = await api.post('/api/auth/login', { email, password });

            // 1. Save the token
            localStorage.setItem('token', response.data.token);

            // 2. Hard redirect to dashboard
            window.location.href = '/dashboard';

        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials or unverified email.');
        } finally { setLoading(false); }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            setMessage(response.data.message);
            setView('reset');
        } catch (err: any) {
            setError('Failed to process request. Is the backend running?');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (!checkPasswordStrength(password)) {
            setError('New password must be at least 8 characters long and contain letters and numbers.');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/api/auth/reset-password', {
                email,
                resetCode: otpCode,
                newPassword: password
            });
            setMessage(response.data.message);
            setOtpCode(''); setPassword('');
            setView('login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid code or request.');
        } finally { setLoading(false); }
    };

    const switchView = (newView: AuthView) => {
        setView(newView);
        setError('');
        setMessage('');
        setShowPassword(false);
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await api.post('/api/auth/google', {
                    accessToken: tokenResponse.access_token,
                });

                localStorage.setItem('token', res.data.token);
                window.location.href = '/dashboard';
            } catch (error) {
                setError('Google login failed. Try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google login failed.'),
    });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">
                            {view === 'login' && 'Welcome Back'}
                            {view === 'register' && 'Create Account'}
                            {view === 'otp' && 'Check Your Email'}
                            {view === 'forgot' && 'Reset Password'}
                            {view === 'reset' && 'Create New Password'}
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            {view === 'login' && 'Enter your credentials to access your dashboard.'}
                            {view === 'register' && 'Start automating your financial analysis today.'}
                            {view === 'otp' && `We sent a 6-digit code to ${email}`}
                            {view === 'forgot' && 'Enter your email to receive a reset code.'}
                            {view === 'reset' && `Enter the 6-digit code sent to ${email}`}
                        </p>
                    </div>

                    {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start"><AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{error}</div>}
                    {message && <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100 flex items-start"><ShieldCheck className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{message}</div>}

                    {view === 'login' && (
                        <div className="space-y-5">
                            {/* THE NEW GOOGLE BUTTON */}
                            <button
                                type="button"
                                onClick={() => loginWithGoogle()}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
                                Continue with Google
                            </button>

                            <div className="flex items-center space-x-3 mt-4 mb-4">
                                <div className="flex-1 h-px bg-slate-200"></div>
                                <span className="text-slate-400 text-sm font-medium">OR</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="name@company.com" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-slate-700">Password</label>
                                        <button type="button" onClick={() => switchView('forgot')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 mt-4">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>}
                                </button>
                                <div className="text-center pt-2">
                                    <button type="button" onClick={() => switchView('register')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">Don't have an account? Sign up</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="name@company.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Must be 8+ characters with at least 1 number and 1 letter.</p>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 mt-4">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="ml-2 w-4 h-4" /></>}
                            </button>
                            <div className="text-center pt-2">
                                <button type="button" onClick={() => switchView('login')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">Already have an account? Sign in</button>
                            </div>
                        </form>
                    )}

                    {view === 'otp' && (
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none text-center tracking-[0.5em] font-bold text-lg" placeholder="000000" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 mt-4">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                            </button>
                            <div className="text-center pt-2">
                                <button type="button" onClick={() => switchView('register')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">Use a different email</button>
                            </div>
                        </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="name@company.com" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 mt-4">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Reset Code'}
                            </button>
                            <div className="text-center pt-2">
                                <button type="button" onClick={() => switchView('login')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">Back to Login</button>
                            </div>
                        </form>
                    )}

                    {view === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Reset Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none tracking-[0.25em] font-bold text-center" placeholder="000000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 mt-4">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password & Login'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}