import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();
            navigate('/generate');
            toast.success('Successfully signed in!');
        }
        catch (error) {
            toast.error('Failed to sign in with Google');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await loginWithEmail(email, password);
            navigate('/generate');
            toast.success('Successfully signed in!');
        }
        catch (error) {
            toast.error('Invalid email or password');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "container flex items-center justify-center min-h-[calc(100vh-4rem)]", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md", children: _jsxs(Card, { className: "backdrop-blur-sm bg-card/95", children: [_jsx(CardHeader, { className: "space-y-1", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.2 }, children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-center", children: "Welcome to MemeGenius" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Sign in to start creating amazing memes" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 }, children: _jsxs(Button, { variant: "outline", className: "w-full relative overflow-hidden group", onClick: handleGoogleSignIn, disabled: isLoading, children: [_jsx("div", { className: "absolute inset-0 w-3 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600 transition-all duration-[250ms] ease-out group-hover:w-full" }), _jsxs("span", { className: "relative flex items-center justify-center", children: [_jsx("svg", { className: "mr-2 h-4 w-4", "aria-hidden": "true", focusable: "false", "data-prefix": "fab", "data-icon": "google", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 488 512", children: _jsx("path", { fill: "currentColor", d: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" }) }), "Continue with Google"] })] }) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with email" }) })] }), _jsxs("form", { onSubmit: handleEmailSignIn, className: "space-y-4", children: [_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.4 }, children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "genius@memegenius.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }) }), _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.5 }, children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, children: _jsx(Button, { type: "submit", className: "w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600 hover:opacity-90", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' }) })] })] })] }) }) }));
}
