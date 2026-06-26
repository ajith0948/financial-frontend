import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing'; 
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile'; 
import { ThemeProvider } from './context/ThemeProvider';

export default function App() {
    const hasToken = !!localStorage.getItem('token');

    return (
        <ThemeProvider defaultTheme="system" storageKey="theme">
            <BrowserRouter>
                <Routes>
                    {/* 🌟 The New Default Homepage */}
                    <Route path="/" element={<Landing />} />

                {/* Login Page (Only show if NOT logged in) */}
                <Route 
                    path="/login" 
                    element={hasToken ? <Navigate to="/dashboard" replace /> : <Auth />} 
                />
                
                {/* Protected Dashboard */}
                <Route 
                    path="/dashboard" 
                    element={hasToken ? <Dashboard /> : <Navigate to="/login" replace />} 
                />

                {/* Protected Profile */}
                <Route 
                    path="/profile" 
                    element={hasToken ? <Profile /> : <Navigate to="/login" replace />} 
                />
                
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
        </ThemeProvider>
    );
}