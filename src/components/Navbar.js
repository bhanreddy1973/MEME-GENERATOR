import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    return (_jsx("nav", { className: "border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: _jsxs("div", { className: "container flex h-16 items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-2 group", children: [_jsx(Sparkles, { className: "h-6 w-6 text-primary transition-transform group-hover:rotate-12" }), _jsx("span", { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-600", children: "MemeGenius" })] }), _jsx("div", { className: "hidden md:flex md:items-center md:space-x-4", children: user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/generate", children: _jsx(Button, { variant: "ghost", children: "Create Meme" }) }), _jsxs(Button, { variant: "ghost", onClick: handleLogout, children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Sign Out"] })] })) : (_jsx(Link, { to: "/login", children: _jsx(Button, { children: "Sign In" }) })) }), _jsx("div", { className: "md:hidden", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Menu, { className: "h-5 w-5" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: user ? (_jsxs(_Fragment, { children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { to: "/generate", children: "Create Meme" }) }), _jsx(DropdownMenuItem, { onClick: handleLogout, children: "Sign Out" })] })) : (_jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { to: "/login", children: "Sign In" }) })) })] }) })] }) }));
}
