import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
// Firebase configuration object
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// Initialize Firebase only if it hasn't been initialized
let app;
let auth;
let googleProvider;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    }
    catch (error) {
        console.error('Error initializing Firebase:', error);
        toast.error('Failed to initialize authentication service');
    }
}
else {
    app = getApps()[0]; // Use the already initialized app
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
}
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            toast.success(`Welcome ${result.user.displayName || 'back'}!`);
        }
        catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('Failed to sign in with Google');
            throw error;
        }
    };
    const loginWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Successfully signed in!');
        }
        catch (error) {
            console.error('Email sign-in error:', error);
            toast.error('Invalid email or password');
            throw error;
        }
    };
    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Successfully signed out');
        }
        catch (error) {
            console.error('Sign-out error:', error);
            toast.error('Failed to sign out');
            throw error;
        }
    };
    const value = {
        user,
        loading,
        signInWithGoogle,
        loginWithEmail,
        logout,
    };
    return (_jsx(AuthContext.Provider, { value: value, children: !loading && children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
