import React from 'react';
import { useHealthSystem, AppLanguage } from '../context/HealthSystemContext';
import { I18N_DICTIONARY } from '../services/i18n';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Zap,
  Bell,
  X,
  LogOut,
  Stethoscope,
  Building2,
  RotateCcw,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    login,
    logout,
    currentLanguage,
    setCurrentLanguage,
    notifications,
    setSelectedFacilityId,
    setActiveTab,
    resetToPitchBaseline,
  } = useHealthSystem();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showResetToast, setShowResetToast] = React.useState(false);
  const t = I18N_DICTIONARY[currentLanguage];

  const isPhcUser = currentUser?.role === 'FACILITY_USER';

  const handleQuickDemoJump = () => {
    setSelectedFacilityId('phc-042');
    setActiveTab('facility-detail');
  };

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${
      isPhcUser
        ? 'border-[#0e3d38] bg-[#041a18]/95'
        : 'border-slate-800 bg-slate-950/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & National Healthcare Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  MediSurge <span className="text-teal-400 font-mono text-sm px-1.5 py-0.5 bg-teal-950/80 border border-teal-800/60 rounded">AI</span>
                </span>
                <span className={`hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isPhcUser
                    ? 'text-teal-300 bg-teal-950/80 border-teal-700/50'
                    : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                }`}>
                  {isPhcUser ? (
                    <>
                      <Stethoscope className="w-3 h-3 text-teal-400" /> PHC Clinical Workstation
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3" /> NHM Resilient Supply Grid
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                {isPhcUser 
                  ? `${currentUser.facilityName || 'Primary Health Centre'} · ${currentUser.district || ''} District` 
                  : t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Hero Trigger */}
          {!isPhcUser && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={handleQuickDemoJump}
                className="flex items-center gap-1.5 px-2.5 py-1 text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 rounded transition font-medium"
                title="Jump directly to PHC-042 hero scenario (Gorakhpur ORS crisis)"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Inspect PHC-042 Crisis</span>
              </button>
            </div>
          )}

          {/* Right Controls: User Profile, Notifications, Language, Logout */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Live Ticker & Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-teal-400" />
                      <span>Live Health Grid Telemetry</span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border ${
                          n.type === 'ALERT'
                            ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                            : n.type === 'DISPATCH'
                            ? 'bg-teal-950/30 border-teal-800/50 text-teal-200'
                            : n.type === 'INCIDENT'
                            ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-[11px] tracking-wide">{n.title}</span>
                          <span className="text-[10px] opacity-70 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">{n.message}</p>
                        {!isPhcUser && n.facilityId && (
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedFacilityId(n.facilityId!);
                                setActiveTab('facility-detail');
                                setShowNotifications(false);
                              }}
                              className="text-[10px] underline text-teal-400 hover:text-teal-300"
                            >
                              Inspect Facility &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-slate-500 text-center py-4">No active alerts</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 text-xs ${
              isPhcUser ? 'bg-[#082824] border-[#104e46]' : 'bg-slate-900 border-slate-800'
            }`}>
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={currentLanguage}
                onChange={e => setCurrentLanguage(e.target.value as AppLanguage)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
                title="Select Language"
              >
                <option value="en" className="bg-slate-900 text-slate-200">English (EN)</option>
                <option value="hi" className="bg-slate-900 text-slate-200">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-slate-900 text-slate-200">मराठी (Marathi)</option>
                <option value="ta" className="bg-slate-900 text-slate-200">தமிழ் (Tamil)</option>
                <option value="te" className="bg-slate-900 text-slate-200">తెలుగు (Telugu)</option>
                <option value="bn" className="bg-slate-900 text-slate-200">বাংলা (Bengali)</option>
              </select>
            </div>

            {/* Authenticated User Badge */}
            <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1 text-xs ${
              isPhcUser ? 'bg-[#082a26] border-[#14564e]' : 'bg-slate-900 border-slate-800'
            }`}>
              {isPhcUser ? (
                <div className="flex items-center gap-1.5 text-teal-300">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="font-bold text-white block text-[11px]">
                      {currentUser?.facilityCode || currentUser?.username}
                    </span>
                    <span className="text-[10px] text-teal-300/90 font-mono">
                      PHC Medical Staff
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="font-bold text-white block text-[11px]">
                      {currentUser?.role === 'STATE_ADMIN'
                        ? `State DHS (${currentUser.state || 'State'})`
                        : currentUser?.role === 'DISTRICT_OFFICER'
                        ? `CMO (${currentUser.district || 'District'})`
                        : 'National Command'}
                    </span>
                    <span className="text-[10px] text-emerald-400/90 font-mono">
                      {currentUser?.role === 'STATE_ADMIN'
                        ? 'State Directorate'
                        : currentUser?.role === 'DISTRICT_OFFICER'
                        ? 'District Authority'
                        : 'All India MoHFW'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition ${
                isPhcUser
                  ? 'bg-[#082824] hover:bg-rose-950/60 border-[#104e46] hover:border-rose-700/60 text-teal-200 hover:text-rose-200'
                  : 'bg-slate-900 hover:bg-rose-950/50 border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-300'
              }`}
              title="Sign Out / Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

