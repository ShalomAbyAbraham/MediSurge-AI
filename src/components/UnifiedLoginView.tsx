import React, { useState } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info,
} from 'lucide-react';

export const UnifiedLoginView: React.FC = () => {
  const { login, resetToPitchBaseline } = useHealthSystem();

  // Mode: PHC Facility Staff vs National/State/District Command
  const [authPortal, setAuthPortal] = useState<'PHC' | 'ADMIN'>('PHC');

  // Input states (clean empty inputs without pre-filled hints)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handlePortalSwitch = (portal: 'PHC' | 'ADMIN') => {
    setAuthPortal(portal);
    setErrorMessage(null);
    setUsername('');
    setPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both User ID and Password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Pass the current portal mode to strictly isolate PHC vs Admin
      const res = login(username, password, authPortal);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-[#152232] text-slate-100 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Lighter Luminous Ambient Glows across the slate-petrol background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-gradient-to-b from-teal-400/20 via-emerald-400/12 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header - Compact Government Seal & Brand (Lighter Slate-Petrol Bar) */}
      <header className="relative z-10 w-full pt-3.5 pb-2.5 px-6 sm:px-10 flex items-center justify-between border-b border-slate-700/70 bg-[#192739]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 via-emerald-400 to-cyan-300 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <div className="w-full h-full bg-[#121d2b] rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                MediSurge <span className="text-teal-300 font-mono text-xs px-1.5 py-0.5 bg-teal-950/80 border border-teal-700/60 rounded font-semibold">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-200 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Predictive Emergency Supply System
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Ministry of Health & Family Welfare · Autonomous Supply Chain Mesh
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="font-medium text-slate-200">Grid Status: Online</span>
        </div>
      </header>

      {/* Main Single-Viewport Login Center - Clean Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-gradient-to-b from-[#f9fdfa] via-white to-[#f0f9f4] border border-emerald-100 rounded-2xl shadow-2xl shadow-slate-950/50 p-7 sm:p-8 backdrop-blur-xl">
          
          {/* Segmented Role Toggle */}
          <div className="grid grid-cols-2 p-1.5 bg-[#0a131f] border border-slate-800 rounded-xl mb-5 text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => handlePortalSwitch('PHC')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                authPortal === 'PHC'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>PHC Facility Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                authPortal === 'ADMIN'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-md shadow-cyan-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Command Portal</span>
            </button>
          </div>

          {/* Form Context Header */}
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              {authPortal === 'PHC' ? (
                <>
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Primary Health Centre Access</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span>Administrative Command Access</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authPortal === 'PHC'
                ? 'Sign in with your local facility identifier to manage dispensations, stock levels, and emergency resupply.'
                : 'Sign in with administrative credentials to access national analytics, predictive solver, and multi-district logistics.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-shake shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5 text-xs flex items-center justify-between">
                <span>{authPortal === 'PHC' ? 'Facility Identifier / PHC Code' : 'Administrative User ID'}</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {authPortal === 'PHC' ? 'PHC Portal' : 'Admin Portal'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={authPortal === 'PHC' ? 'Enter PHC Identifier or Facility Code' : 'Enter Administrative User ID'}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-['Outfit'] placeholder:tracking-wide font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 text-xs">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter Password"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-['Outfit'] placeholder:tracking-wide font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  authPortal === 'PHC'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-teal-500/25'
                }`}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure Environment Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 End-to-End Encrypted Session</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 font-semibold">GovCloud Secured</span>
          </div>

        </div>
      </main>

      {/* Compact Single-Viewport Footer (Lighter Slate-Petrol Bar) */}
      <footer className="relative z-10 w-full py-2.5 px-6 border-t border-slate-700/70 bg-[#192739]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MediSurge</span>
            <span>·</span>
            <span>Predictive Emergency Supply System</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">National Health Mission (NHM) Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>DISHA Compliant · Zero-Trust Architecture</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                resetToPitchBaseline();
                setResetSuccess(true);
                setTimeout(() => setResetSuccess(false), 2000);
              }}
              className="text-slate-400 hover:text-slate-200 transition cursor-pointer underline underline-offset-2"
              title="Reset demo state"
            >
              {resetSuccess ? 'Reset Done' : 'Reset State'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
