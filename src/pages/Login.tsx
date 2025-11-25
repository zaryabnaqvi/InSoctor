import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import logoFull from '@/assets/logo-full.jpg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-60"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Glassmorphism Login Card */}
            <Card className="w-full max-w-md relative z-10 glass-card border-white/10 overflow-hidden animate-fade-in-scale">
                {/* Glow Effect on Top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

                <div className="p-8 space-y-8">
                    {/* Logo Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-block animate-float-in">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
                                <img
                                    src={logoFull}
                                    alt="InSOCtor Logo"
                                    className="h-16 w-auto object-contain relative z-10 hover-scale"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Sign in to access your security dashboard
                            </p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 
                                             focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 
                                             transition-all duration-300 rounded-xl hover:bg-white/10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                                    Password
                                </Label>
                                <button
                                    type="button"
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 
                                             focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 
                                             transition-all duration-300 rounded-xl hover:bg-white/10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-fade-in-scale">
                                <p className="text-red-400 text-sm text-center font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 
                                     text-white font-medium rounded-xl shadow-soft-lg hover:shadow-glow
                                     transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                          translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0f1e] px-4 text-slate-500">
                                    Secure Access
                                </span>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="text-center space-y-2 pt-4">
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Lock className="h-3 w-3" />
                            <span>Protected by InSOCtor Security System</span>
                        </p>
                    </div>
                </div>

                {/* Bottom Glow Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            </Card>
        </div>
    );
}
