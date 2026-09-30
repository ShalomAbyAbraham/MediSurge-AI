import React from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { I18N_DICTIONARY } from '../services/i18n';
import {
  Compass,
  Building2,
  AlertOctagon,
  Network,
  Truck,
  Sparkles,
  MessageSquareQuote,
  Database,
  Stethoscope,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentLanguage,
    stats,
    currentUser,
    selectedFacilityId,
    facilities,
    transfers,
  } = useHealthSystem();
  const t = I18N_DICTIONARY[currentLanguage];

  const isPhc = currentUser?.role === 'FACILITY_USER';
  const myFacility = facilities.find(f => f.id === selectedFacilityId);
  const myIncomingTransfers = transfers.filter(
    tx => tx.destinationFacilityId === selectedFacilityId && (tx.status === 'APPROVED' || tx.status === 'IN_TRANSIT')
  );

  if (isPhc) {
    return (
      <nav className="border-b border-[#0f443f] bg-[#05211e]/95 overflow-x-auto scrollbar-none transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>PHC Portal: {currentUser?.facilityCode || myFacility?.code || 'PHC'}</span>
              </span>
              <span className="text-slate-300 font-semibold hidden md:inline">
                {myFacility?.name || 'Primary Health Centre'}
              </span>
              <span className="text-slate-500 hidden lg:inline">
                ({myFacility?.district} District, {myFacility?.state})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {myIncomingTransfers.length > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-700/60 text-teal-300 font-mono text-[11px] animate-pulse">
                  <Truck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{myIncomingTransfers.length} Incoming Consignment</span>
                </span>
              )}
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold ${
                  myFacility?.riskLevel === 'CRITICAL'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                    : myFacility?.riskLevel === 'HIGH'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                }`}
              >
                Risk: {myFacility?.riskLevel || 'STABLE'}
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navItems = [
    {
      id: 'command-center',
      label: t.nationalCommandCenter,
      icon: Compass,
      badge: stats.criticalCount > 0 ? `${stats.criticalCount} Critical` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'facility-detail',
      label: t.facilityDetail,
      icon: AlertOctagon,
    },
    {
      id: 'supply-network',
      label: t.supplyNetwork,
      icon: Network,
    },
    {
      id: 'redistribution',
      label: t.redistribution,
      icon: Truck,
      badge: stats.activeTransfersCount > 0 ? `${stats.activeTransfersCount} Active` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    },
    {
      id: 'simulator',
      label: t.emergencySimulator,
      icon: Sparkles,
    },
    {
      id: 'ask-ai',
      label: t.askAi,
      icon: MessageSquareQuote,
    },
    {
      id: 'architecture',
      label: t.architecture,
      icon: Database,
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-900 text-teal-300' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

