import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Zap, Shield, BarChart3, ChevronRight, Activity } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
            {/* 🌟 PREMIUM GLASS NAVBAR */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            Fin<span className="text-blue-600">Engine</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">How it Works</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => navigate('/login')}
                            className="hidden md:block text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 transition-colors"
                        >
                            Log In
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-semibold flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <span>Sign Up Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* 🚀 HERO SECTION WITH ANIMATED GRADIENT */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-8 pt-12">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4 animate-bounce">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                        </span>
                        <span>Gemini 2.5 AI Powered Engine</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
                        Stop losing money to <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse">
                            hidden capital leakage.
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Upload your messy broker statements, vehicle receipts, and invoices. Our AI instantly extracts the hidden fees, taxes, and costs so you can take back control of your wealth.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-blue-600/20 transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Start Analyzing Now
                        </button>
                        <button 
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-lg font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-300"
                        >
                            <span>See How it Works</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ✨ FEATURE CARDS WITH HOVER EFFECTS */}
                <div id="features" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Universal Uploads</h3>
                        <p className="text-slate-500 leading-relaxed">Drop in any PDF. Whether it's a messy Zerodha ledger or a local bike booking receipt, the engine reads it seamlessly.</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                        <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">AI Powered Extraction</h3>
                        <p className="text-slate-500 leading-relaxed">No fragile Regex code. We utilize Google's Gemini 2.5 Flash to intelligently parse human-readable documents into strict JSON.</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                        <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <BarChart3 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Analytics</h3>
                        <p className="text-slate-500 leading-relaxed">Watch your capital leakage update in real-time. Track STT, stamp duty, and vehicle taxes all in one centralized dashboard.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}