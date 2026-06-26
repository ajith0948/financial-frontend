import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Key, Mail, Save, Trash2, ShieldCheck, AlertCircle, Loader2, Activity, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

export default function Profile() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const { isDark, setTheme } = useTheme();
    const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark');

    const fetchProfile = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await api.get('/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmail(response.data.email);
            setHasApiKey(response.data.hasApiKey);
        } catch (err: any) {
            console.error('Failed to fetch profile', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            setError(err.response?.data?.error || 'Failed to load profile data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, []);

    const handleSaveKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKeyInput.trim()) return;

        setSaving(true);
        setError('');
        setMessage('');
        const token = localStorage.getItem('token');

        try {
            const response = await api.post('/api/users/profile/apikey', 
                { apiKey: apiKeyInput }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(response.data.message);
            setHasApiKey(response.data.hasApiKey);
            setApiKeyInput('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save API Key.');
        } finally {
            setSaving(false);
        }
    };

    const handleClearKey = async () => {
        if (!window.confirm('Are you sure you want to clear your custom API Key? The application will fall back to the system default key.')) {
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');
        const token = localStorage.getItem('token');

        try {
            const response = await api.post('/api/users/profile/apikey', 
                { apiKey: '' }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(response.data.message);
            setHasApiKey(response.data.hasApiKey);
            setApiKeyInput('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to clear API Key.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-200">
            {/* 🌟 NAVBAR */}
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <Activity className="text-blue-600 w-6 h-6" />
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Financial Engine</span>
                </div>
                <div className="flex items-center space-x-6">
                    <button onClick={toggleDarkMode} className="text-slate-500 hover:text-blue-600 transition-colors">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-2 transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto p-8 pt-16">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white relative">
                        <h2 className="text-3xl font-black tracking-tight">Your Profile</h2>
                        <p className="text-blue-100 mt-2">Manage your account preferences and custom API credentials.</p>
                    </div>

                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-slate-500 font-medium animate-pulse">Loading account configuration...</p>
                        </div>
                    ) : (
                        <div className="p-8 space-y-8">
                            {/* Feedback Alerts */}
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-start">
                                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {message && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium border border-green-100 flex items-start">
                                    <ShieldCheck className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                                    <span>{message}</span>
                                </div>
                            )}

                            {/* User details */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Account Info</h3>
                                <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl text-blue-600 dark:text-blue-300">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">{email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* BYOK Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Google Gemini API Key (BYOK)</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    FinEngine runs on Google Gemini AI. To enable unlimited free statement parsing, you can save your own Gemini API Key. If no custom key is added, the app automatically falls back to our system key.
                                </p>

                                {/* Key Status Badge */}
                                <div className="flex items-center space-x-3 pt-2">
                                    <span className="text-sm font-bold text-slate-700">API Key Status:</span>
                                    {hasApiKey ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ● Custom Key Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            ● Using System Default Key
                                        </span>
                                    )}
                                </div>

                                {/* Form / Input */}
                                <form onSubmit={handleSaveKey} className="space-y-4 pt-2">
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            required
                                            value={apiKeyInput}
                                            onChange={(e) => setApiKeyInput(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono"
                                            placeholder="Paste your Gemini API Key here (AIzaSy...)"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                        <button
                                            type="submit"
                                            disabled={saving || !apiKeyInput.trim()}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/15"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> <span>Save Custom Key</span></>}
                                        </button>

                                        {hasApiKey && (
                                            <button
                                                type="button"
                                                onClick={handleClearKey}
                                                disabled={saving}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                <span>Clear Key</span>
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
