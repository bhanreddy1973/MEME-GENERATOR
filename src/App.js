import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Generate from '@/pages/Generate';
// Protected Route Component
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "dark", storageKey: "vite-ui-theme", children: _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-screen bg-gradient-to-b from-background to-background/95", children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/generate", element: _jsx(ProtectedRoute, { children: _jsx(Generate, {}) }) })] }), _jsx(Toaster, { position: "top-center" })] }) }) }) }));
}
export default App;
