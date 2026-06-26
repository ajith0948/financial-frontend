import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { 
    LogOut, FileText, Activity, UploadCloud, Loader2, IndianRupee, 
    TrendingDown, Trash2, RefreshCw, ShoppingCart, Truck, Landmark, 
    Moon, Sun, Plus, FolderOpen, FolderArchive, User, Download, Target, Edit2, X 
} from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

export default function Dashboard() {
    const navigate = useNavigate();
    const [statements, setStatements] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 📂 Folders & Filtering State
    const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
    const [showCreate, setShowCreate] = useState(false);
    const [scannerFolderId, setScannerFolderId] = useState('');

    const { theme, setTheme, isDark } = useTheme();
    const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark');

    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const [monthlyBudget, setMonthlyBudget] = useState(Number(localStorage.getItem('monthlyBudget')) || 50000);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [viewingStatement, setViewingStatement] = useState<any>(null);

    const fetchStatements = async () => {
        setRefreshing(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:3000/api/statements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatements(response.data);
        } catch (error: any) {
            console.error('Failed to fetch statements', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchFolders = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:3000/api/folders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFolders(response.data);
        } catch (error: any) {
            console.error('Failed to fetch folders', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchStatements();
        fetchFolders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:3000/api/folders', 
                { name: newFolderName, color: newFolderColor },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewFolderName('');
            setNewFolderColor('#3b82f6');
            setShowCreate(false);
            fetchFolders();
        } catch (error) {
            console.error('Failed to create folder', error);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this folder? Statement documents inside it will not be deleted; they will just become unorganized.')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/api/folders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (selectedFolderId === id) {
                setSelectedFolderId('all');
            }
            fetchFolders();
            fetchStatements();
        } catch (error) {
            console.error('Failed to delete folder', error);
        }
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/api/statements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatements(prev => prev.filter(doc => doc._id !== id));
        } catch (error) {
            console.error('Failed to delete file', error);
            alert('Failed to delete file.');
        }
    };

    const exportToCSV = () => {
        if (!filteredStatements.length) return;
        
        // Define CSV headers
        const headers = ['File Name', 'Category', 'Total Amount', 'Folder', 'Processed At'];
        
        // Map data to rows
        const rows = filteredStatements.map(doc => {
            const folderName = doc.folderId ? folders.find(f => f._id === doc.folderId)?.name || 'Unknown' : 'Unorganized';
            return [
                `"${doc.originalFileName}"`,
                `"${doc.category || 'Other'}"`,
                doc.totalAmount || 0,
                `"${folderName}"`,
                `"${new Date(doc.processedAt).toLocaleString()}"`
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'financial_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        setUploadMessage('');
        const token = localStorage.getItem('token');

        try {
            const uploadPromises = Array.from(selectedFiles).map(file => {
                const formData = new FormData();
                formData.append('statement', file);
                if (scannerFolderId) {
                    formData.append('folderId', scannerFolderId);
                }
                
                return axios.post('http://localhost:3000/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            });

            await Promise.all(uploadPromises);

            setUploadMessage(`Successfully analyzed ${selectedFiles.length} document(s)!`);
            setSelectedFiles(null);
            
            fetchStatements();

            setTimeout(() => setUploadMessage(''), 4000);

        } catch (error) {
            setUploadMessage('Upload failed. Check the backend logs.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // ⚡ INSTANT FOLDER FILTER
    const filteredStatements = statements.filter(doc => {
        if (selectedFolderId === 'all') return true;
        if (selectedFolderId === 'unorganized') return !doc.folderId;
        return doc.folderId === selectedFolderId;
    });

    // 🧠 UNIVERSAL AI CALCULATIONS (Based on active folder selection)
    const totalTradingLeakage = filteredStatements
        .filter(doc => doc.category === 'Trading')
        .reduce((sum, doc) => sum + (doc.extractedData?.brokerage || 0) + (doc.extractedData?.sttCharges || 0) + (doc.extractedData?.stampDuty || 0), 0);

    const totalVehicleCosts = filteredStatements
        .filter(doc => doc.category === 'Vehicle')
        .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

    const totalRetailCosts = filteredStatements
        .filter(doc => doc.category === 'Retail')
        .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

    const totalBankBalance = filteredStatements
        .filter(doc => doc.category === 'Bank Statement')
        .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

    const totalOthers = filteredStatements
        .filter(doc => doc.category === 'Others' || doc.category === 'Other')
        .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

    const expenseChartData = [
        { name: 'Trading Leakage', value: totalTradingLeakage, color: '#3b82f6' }, 
        { name: 'Vehicle', value: totalVehicleCosts, color: '#f59e0b' }, 
        { name: 'Retail', value: totalRetailCosts, color: '#a855f7' }, 
        { name: 'Bank Balance', value: totalBankBalance, color: '#10b981' },
        { name: 'Others', value: totalOthers, color: '#64748b' }
    ].filter(item => item.value > 0);

    const timeSeriesData = filteredStatements
        .sort((a, b) => new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime())
        .reduce((acc: any[], doc) => {
            const dateStr = new Date(doc.processedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const existing = acc.find(item => item.date === dateStr);
            if (existing) {
                existing.amount += (doc.totalAmount || 0);
            } else {
                acc.push({ date: dateStr, amount: (doc.totalAmount || 0) });
            }
            return acc;
        }, []);

    const monthlySpendData = filteredStatements.reduce((acc: any[], doc) => {
        if (doc.category === 'Bank Statement') return acc; // Exclude balance from spend
        const monthStr = new Date(doc.processedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === monthStr);
        if (existing) {
            existing.spend += (doc.totalAmount || 0);
        } else {
            acc.push({ month: monthStr, spend: (doc.totalAmount || 0) });
        }
        return acc;
    }, []);

    const currentMonthSpend = monthlySpendData.length > 0 ? monthlySpendData[monthlySpendData.length - 1].spend : 0;
    const budgetPercentage = Math.min((currentMonthSpend / monthlyBudget) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-white dark:bg-slate-900 dark:border-slate-800 border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center space-x-2">
                    <Activity className="text-blue-600 w-6 h-6" />
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Financial Engine</h1>
                </div>
                <div className="flex items-center space-x-6">
                    {/* 👤 Profile Link */}
                    <button 
                        onClick={() => navigate('/profile')}
                        className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1.5 transition-colors text-sm font-semibold"
                    >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                    </button>

                    {/* 🌙 Dark Mode Toggle */}
                    <button onClick={toggleDarkMode} className="text-slate-500 hover:text-blue-600 transition-colors">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center space-x-2 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 flex-col md:flex-row">
                
                {/* 📁 SLEEK FOLDER SIDEBAR */}
                <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-6 z-10">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Directories</h3>
                            <button 
                                onClick={() => setShowCreate(!showCreate)}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                title="Create New Folder"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Inline folder creation form */}
                        {showCreate && (
                            <form onSubmit={handleCreateFolder} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                                <input 
                                    type="text" 
                                    placeholder="Folder Name (e.g. Taxes)"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-1 focus:ring-blue-600 text-slate-700 dark:text-slate-200"
                                    required
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-1">
                                        {['#3b82f6', '#f59e0b', '#a855f7', '#10b981', '#ef4444'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewFolderColor(color)}
                                                className={`w-3.5 h-3.5 rounded-full border ${newFolderColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button type="submit" className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="flex flex-col space-y-1">
                        <button 
                            onClick={() => setSelectedFolderId('all')}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${selectedFolderId === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <span className="flex items-center space-x-2">
                                <FolderOpen className="w-4 h-4" />
                                <span>All Files</span>
                            </span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{statements.length}</span>
                        </button>

                        <button 
                            onClick={() => setSelectedFolderId('unorganized')}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${selectedFolderId === 'unorganized' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <span className="flex items-center space-x-2">
                                <FolderArchive className="w-4 h-4" />
                                <span>Unorganized</span>
                            </span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                                {statements.filter(doc => !doc.folderId).length}
                            </span>
                        </button>

                        {folders.map(folder => {
                            const count = statements.filter(doc => doc.folderId === folder._id).length;
                            return (
                                <div 
                                    key={folder._id} 
                                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${selectedFolderId === folder._id ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <button 
                                        onClick={() => setSelectedFolderId(folder._id)}
                                        className="flex-1 text-left flex items-center space-x-2.5 truncate"
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color || '#3b82f6' }} />
                                        <span className="truncate">{folder.name}</span>
                                    </button>
                                    <div className="flex items-center space-x-1.5 ml-2">
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 group-hover:hidden px-2 py-0.5 rounded-full text-slate-500">{count}</span>
                                        <button 
                                            onClick={() => handleDeleteFolder(folder._id)}
                                            className="hidden group-hover:block text-slate-400 hover:text-red-500 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* 📊 MAIN CONTENT */}
                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    {/* --- TOP 4 CARDS --- */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Expense Overview {selectedFolderId !== 'all' && ` - ${selectedFolderId === 'unorganized' ? 'Unorganized' : folders.find(f => f._id === selectedFolderId)?.name}`}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            
                            {/* Trading Box */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Trading Leakage</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {totalTradingLeakage.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <TrendingDown className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Box */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Vehicle & Maintenance</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {totalVehicleCosts.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <Truck className="w-6 h-6 text-amber-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Retail Box */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Retail & Shopping</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {totalRetailCosts.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <ShoppingCart className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Balance Box */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Liquid Bank Balance</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {totalBankBalance.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <Landmark className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Others Box */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Other Expenses</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {totalOthers.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <FileText className="w-6 h-6 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Budget Tracker */}
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 col-span-1 md:col-span-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Monthly Budget Goal</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isEditingBudget ? (
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    type="number" 
                                                    value={monthlyBudget} 
                                                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                                                    className="w-24 px-2 py-1 text-sm border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={() => {
                                                        localStorage.setItem('monthlyBudget', String(monthlyBudget));
                                                        setIsEditingBudget(false);
                                                    }}
                                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                                >Save</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{monthlyBudget.toLocaleString()}</span>
                                                <button onClick={() => setIsEditingBudget(true)} className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${budgetPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 font-medium">
                                    <span>₹{currentMonthSpend.toFixed(2)} Spent</span>
                                    <span>{budgetPercentage.toFixed(1)}%</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- MIDDLE SECTION: CHARTS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {expenseChartData.length > 0 && (
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Expense Distribution</h2>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expenseChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={110}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {expenseChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => `₹${Number(value).toFixed(2)}`} 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }}
                                                itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {timeSeriesData.length > 0 && (
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Processing Activity Trends</h2>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip 
                                                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }}
                                                itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {monthlySpendData.length > 0 && (
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Monthly Spend Analysis</h2>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlySpendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip 
                                                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Spend']}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }}
                                                itemStyle={{ color: '#a855f7', fontWeight: 600 }}
                                                cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
                                            />
                                            <Bar dataKey="spend" fill="#a855f7" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- BOTTOM SECTION: SCANNER & TABLE --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Box */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 space-y-4">
                                <div className="mb-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Document Scanner</h2>
                                    <p className="text-slate-500 text-sm mt-1">Upload ANY receipt or statement. Gemini AI will sort it.</p>
                                </div>

                                {/* 📂 Destination Folder dropdown */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Upload Destination</label>
                                    <select
                                        value={scannerFolderId}
                                        onChange={(e) => setScannerFolderId(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all"
                                    >
                                        <option value="">📂 Unorganized / No Folder</option>
                                        {folders.map(f => (
                                            <option key={f._id} value={f._id}>📁 {f.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <form onSubmit={handleUpload} className="space-y-4">
                                    <label className="flex flex-col items-center justify-center w-full h-40 transition bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-300 dark:border-slate-750 border-dashed rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-medium text-slate-500 text-center px-4">
                                            {selectedFiles && selectedFiles.length > 0
                                                ? <span className="text-blue-600 font-bold">{selectedFiles.length} file(s) ready</span>
                                                : 'Drop PDFs here'}
                                        </span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            multiple 
                                            accept=".pdf" 
                                            onChange={(e) => setSelectedFiles(e.target.files)} 
                                            onClick={(e) => (e.target as any).value = null}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!selectedFiles || uploading}
                                        className="w-full bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 hover:bg-black text-white font-semibold py-3 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Scan with Gemini'}
                                    </button>
                                </form>
                                {uploadMessage && (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-xl flex items-center">
                                        <Activity className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">{uploadMessage}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table Ledger */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Universal Processing Ledger</h2>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={exportToCSV} 
                                            disabled={loading || filteredStatements.length === 0} 
                                            title="Export to CSV"
                                            className="text-slate-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={fetchStatements} 
                                            disabled={refreshing} 
                                            title="Refresh Ledger"
                                            className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Connecting to Redis Cache...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-xs tracking-wider">
                                                <tr>
                                                    <th className="p-4">File Name</th>
                                                    <th className="p-4">Category</th>
                                                    <th className="p-4">Extracted Details</th>
                                                    <th className="p-4 text-right">Total Amount</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {Array.isArray(filteredStatements) && filteredStatements.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-16 text-center">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                                                                    <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Statements Found</h3>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                                                    Upload your first financial statement above to let Gemini AI extract and categorize your data automatically.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredStatements.map((doc, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setViewingStatement(doc)}>
                                                            <td className="p-4 flex items-center space-x-3">
                                                                <FileText className="w-4 h-4 text-slate-400" />
                                                                <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[150px]" title={doc.originalFileName}>
                                                                    {doc.originalFileName}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                                    ${doc.category === 'Trading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' : 
                                                                      doc.category === 'Vehicle' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 
                                                                      doc.category === 'Retail' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' : 
                                                                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                                    {doc.category || 'Other'}
                                                                </span>
                                                                {doc.folderId && folders.find(f => f._id === doc.folderId) && (
                                                                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                                                                        📁 {folders.find(f => f._id === doc.folderId)?.name}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                                                                {doc.category === 'Trading' && `Brokerage: ₹${doc.extractedData?.brokerage || 0}`}
                                                                {doc.category === 'Vehicle' && `Labor: ₹${doc.extractedData?.laborCost || 0}`}
                                                                {doc.category === 'Retail' && `Store: ${doc.extractedData?.storeName || 'N/A'}`}
                                                            </td>
                                                            <td className="p-4 text-right font-bold text-slate-900 dark:text-slate-100">
                                                                ₹{doc.totalAmount?.toFixed(2) || '0.00'}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }} className="text-slate-450 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100">
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
        </div>
        
        {/* Receipt View Modal */}
        {viewingStatement && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setViewingStatement(null)}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-500" />
                            Receipt Details
                        </h3>
                        <button onClick={() => setViewingStatement(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">File Name</p>
                            <p className="text-slate-900 dark:text-slate-100 font-medium">{viewingStatement.originalFileName}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Category & Amount</p>
                            <p className="text-slate-900 dark:text-slate-100 font-medium">{viewingStatement.category || 'Other'} - <span className="font-bold text-blue-600 dark:text-blue-400">₹{viewingStatement.totalAmount?.toFixed(2) || '0.00'}</span></p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">AI Extraction Breakdown</p>
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                                <pre className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                    {JSON.stringify(viewingStatement.extractedData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}