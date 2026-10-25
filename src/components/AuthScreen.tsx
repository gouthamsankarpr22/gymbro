'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  RotateCcw,
  Zap,
  Bell
} from 'lucide-react';
import { UserProfile } from '@/types';
import { SEED_USERS } from '@/lib/seed-data';
import { triggerHaptic } from '@/lib/mobile-utils';
import { triggerPRConfetti } from '@/lib/utils';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  allUsers: UserProfile[];
  onLogin: (identifier: string, password: string) => { success: boolean; user?: UserProfile; error?: string };
  onRegister: (data: { full_name: string; email: string; phone: string; age: number; password: string }) => { success: boolean; user?: UserProfile; error?: string };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  allUsers,
  onLogin,
  onRegister,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>(21);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // OTP Verification Step State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [showSmsToast, setShowSmsToast] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleAutoFillOtp = () => {
    triggerHaptic('success');
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      setOtpError(null);
      setShowSmsToast(false);
    }
  };

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, resendCountdown]);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter your email/phone and password');
      return;
    }

    const result = onLogin(loginIdentifier, loginPassword);
    if (result.success && result.user) {
      triggerHaptic('success');
      onLoginSuccess(result.user);
    } else {
      triggerHaptic('error');
      setLoginError(result.error || 'Login failed. Please check credentials.');
    }
  };

  // Step 1: Initiate Sign Up and Generate OTP
  const handleInitiateSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setSignupError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setSignupError('Please enter a valid email address');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      setSignupError('Please enter a valid phone number (at least 7 digits)');
      return;
    }
    if (!age || Number(age) < 13) {
      setSignupError('Age must be at least 13');
      return;
    }
    if (!password || password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpStep(true);
    setResendCountdown(45);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setShowSmsToast(true);
    triggerHaptic('medium');

    // Auto focus first OTP input
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Only keep last typed digit
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto advance to next box
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setResendCountdown(45);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setShowSmsToast(true);
    triggerHaptic('light');
  };

  // Step 3: Verify OTP and Register Account
  const handleVerifyOtpAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      triggerHaptic('error');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the code sent above.');
      triggerHaptic('error');
      return;
    }

    // Complete Registration
    const result = onRegister({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: Number(age),
      password,
    });

    if (result.success && result.user) {
      triggerHaptic('success');
      triggerPRConfetti();
      onLoginSuccess(result.user);
    } else {
      setOtpError(result.error || 'Failed to create account.');
      triggerHaptic('error');
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (user: UserProfile) => {
    triggerHaptic('light');
    const result = onLogin(user.email || user.username, 'gymbro123');
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-white flex flex-col justify-center items-center px-3 sm:px-4 pt-[max(env(safe-area-inset-top,0px),1.5rem)] pb-[max(env(safe-area-inset-bottom,0px),2rem)] relative selection:bg-emerald-500 selection:text-zinc-950 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Simulated Mobile Carrier SMS / Email Push Toast Notification */}
      {showSmsToast && isOtpStep && (
        <div 
          onClick={handleAutoFillOtp}
          className="fixed top-4 inset-x-3 max-w-sm mx-auto z-50 p-3.5 rounded-2xl bg-zinc-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-3 cursor-pointer animate-slide-down ring-2 ring-emerald-500/30"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-emerald-400">GymBro Security • SMS</span>
              <span className="text-[10px] text-zinc-500">Just now</span>
            </div>
            <p className="text-xs text-white font-medium truncate">
              Your verification code is <span className="font-mono font-black text-emerald-300">{generatedOtp}</span>
            </p>
            <span className="text-[10px] font-extrabold text-emerald-400 underline">⚡ Tap here to 1-Tap Auto-Fill</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-500 shadow-xl shadow-emerald-500/25 mb-1">
            <Dumbbell className="w-8 h-8 text-zinc-950 stroke-[2.75]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            GymBro <span className="text-emerald-400">Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
            Stay connected with your gym friends across distances. Daily workouts, PRs, and Guild Wars.
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        {!isOtpStep && (
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <button
              onClick={() => {
                triggerHaptic('light');
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                authMode === 'login'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In (Existing User)
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setAuthMode('signup');
                setSignupError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                authMode === 'signup'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              New Lifter (Sign Up)
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && !isOtpStep && (
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5 animate-fade-in">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-base font-black text-white">Welcome Back, Bro</h2>
              <p className="text-xs text-zinc-400">Log in with your email, phone, or username</p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email, Phone, or Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. alex@gymbro.app or +1 555-0101"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <span className="text-[10px] text-zinc-500">Default: gymbro123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
              >
                Log In to GymBro
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-2.5 text-center">
                Or 1-Tap Quick Demo Login As
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {allUsers.slice(0, 5).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickDemoLogin(u)}
                    title={`Log in as ${u.full_name}`}
                    className="flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.avatar_url}
                      alt={u.full_name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover ring-1 ring-zinc-700 group-hover:ring-emerald-400 transition"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 group-hover:text-white mt-1 truncate max-w-[46px]">
                      {u.full_name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIGN UP FORM (STEP 1: MINIMAL DETAILS) */}
        {authMode === 'signup' && !isOtpStep && (
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-fade-in">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-base font-black text-white">Join the GymBro Brotherhood</h2>
              <p className="text-xs text-zinc-400">Minimal details needed. Verified securely by OTP.</p>
            </div>

            {signupError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signupError}</span>
              </div>
            )}

            <form onSubmit={handleInitiateSignup} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rohit@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="13"
                    max="120"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 21"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Setup Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Setup Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer mt-2"
              >
                Send Verification OTP
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        )}

        {/* SIGN UP STEP 2: OTP VERIFICATION */}
        {isOtpStep && (
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-slide-up">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-black text-white">Verify Phone & Email</h2>
              <p className="text-xs text-zinc-400">
                A 6-digit OTP code has been dispatched to:
              </p>
              <div className="text-xs font-bold text-emerald-400 bg-zinc-950 py-1.5 px-3 rounded-xl border border-zinc-800 inline-block max-w-full truncate">
                📱 {phone} & ✉️ {email}
              </div>
            </div>

            {/* 1-Tap Auto Fill Hero Button */}
            <button
              type="button"
              onClick={handleAutoFillOtp}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-emerald-400 font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>⚡ Tap to Auto-Fill Code ({generatedOtp})</span>
            </button>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndCreate} className="space-y-4">
              {/* 6 Digit Input Boxes (Mobile Responsive width) */}
              <div className="flex justify-between gap-1.5 sm:gap-2 max-w-full">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 sm:w-12 h-12 sm:h-14 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-lg sm:text-xl font-black text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                ))}
              </div>

              {/* Resend & Back buttons */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="hover:text-white underline text-xs"
                >
                  Edit details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0}
                  className="font-bold text-emerald-400 disabled:opacity-40 disabled:hover:text-emerald-400 hover:underline flex items-center gap-1 text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 hover:opacity-95 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
              >
                Verify & Create GymBro Account
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
