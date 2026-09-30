import React from 'react';
import { HealthSystemProvider, useHealthSystem } from './context/HealthSystemContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { UnifiedLoginView } from './components/UnifiedLoginView';
import { CommandCenterView } from './components/CommandCenterView';
import { FacilityPortalView } from './components/FacilityPortalView';
import { FacilityDetailView } from './components/FacilityDetailView';
import { SupplyNetworkView } from './components/SupplyNetworkView';
import { RedistributionCockpitView } from './components/RedistributionCockpitView';
import { EmergencySimulatorView } from './components/EmergencySimulatorView';
import { AskSwasthyaFlowView } from './components/AskSwasthyaFlowView';
import { ArchitectureView } from './components/ArchitectureView';
import { HeartPulse } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, activeTab } = useHealthSystem();

  const isPhc = currentUser?.role === 'FACILITY_USER';

  return (
    <>
      {!currentUser ? (
        <UnifiedLoginView />
      ) : (
        <div
          className={`min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 transition-colors duration-300 ${
            isPhc
              ? 'bg-gradient-to-b from-[#051c1a] via-[#041615] to-[#020e0d] text-emerald-50'
              : 'bg-slate-950 text-slate-100'
          }`}
        >
          <Header />
          <Navigation />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {isPhc ? (
              <FacilityPortalView />
            ) : (
              <>
                {activeTab === 'command-center' && <CommandCenterView />}
                {activeTab === 'facility-detail' && <FacilityDetailView />}
                {activeTab === 'supply-network' && <SupplyNetworkView />}
                {activeTab === 'redistribution' && <RedistributionCockpitView />}
                {activeTab === 'simulator' && <EmergencySimulatorView />}
                {activeTab === 'ask-ai' && <AskSwasthyaFlowView />}
                {activeTab === 'architecture' && <ArchitectureView />}
              </>
            )}
          </main>

          <footer
            className={`border-t py-5 mt-auto transition-colors duration-300 ${
              isPhc
                ? 'border-[#0e3d38] bg-[#031312]'
                : 'border-slate-800/80 bg-slate-950'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-400" />
                <span className={`font-semibold ${isPhc ? 'text-teal-300' : 'text-slate-400'}`}>
                  MediSurge {isPhc ? 'Clinical Field Workstation' : 'AI Command Center'}
                </span>
                <span>—</span>
                <span>Track 3: Smart Health & Supply Chain Resilience</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span>Google &quot;Build with AI: Code for Communities&quot;</span>
                <span>·</span>
                <span>Vertex AI · Gemini 3.8 Flash · BigQuery · Cloud Run</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <HealthSystemProvider>
      <AppContent />
    </HealthSystemProvider>
  );
}
