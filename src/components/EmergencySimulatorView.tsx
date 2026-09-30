import React, { useState, useEffect } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { PRESET_SCENARIOS, SimulationEngine } from '../services/simulationEngine';
import { EmergencyScenario, SimulationResult } from '../types';
import {
  Sparkles,
  Play,
  RotateCcw,
  AlertTriangle,
  Flame,
  CloudRain,
  Activity,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Building,
  FileText,
  Sliders,
  DollarSign,
  Layers,
} from 'lucide-react';

export const EmergencySimulatorView: React.FC = () => {
  const { facilities, medicines } = useHealthSystem();

  const [selectedScenario, setSelectedScenario] = useState<EmergencyScenario>(PRESET_SCENARIOS[0]);
  const [customFootfall, setCustomFootfall] = useState(selectedScenario.patientFootfallSurgePercent);
  const [customDelay, setCustomDelay] = useState(selectedScenario.supplyDelayDays);
  const [customBudget, setCustomBudget] = useState(selectedScenario.budgetAllocatedInr);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [executiveBrief, setExecutiveBrief] = useState<string | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);

  // Run simulation on mount or parameter changes
  const runSim = (scenarioToRun: EmergencyScenario) => {
    const res = SimulationEngine.runSimulation(facilities, medicines, scenarioToRun);
    setSimulationResult(res);

    // Call server route for Gemini Executive Brief
    setIsLoadingBrief(true);
    fetch('/api/gemini/scenario-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioName: scenarioToRun.name,
        simulationResult: res,
      }),
    })
      .then(r => r.json())
      .then(data => {
        setExecutiveBrief(data.brief);
      })
      .catch(err => console.warn('Brief error:', err))
      .finally(() => setIsLoadingBrief(false));
  };

  useEffect(() => {
    runSim(selectedScenario);
  }, [selectedScenario.id]);

  const handleSelectPreset = (scen: EmergencyScenario) => {
    setSelectedScenario(scen);
    setCustomFootfall(scen.patientFootfallSurgePercent);
    setCustomDelay(scen.supplyDelayDays);
    setCustomBudget(scen.budgetAllocatedInr);
  };

  const handleCustomParamChange = () => {
    const updated: EmergencyScenario = {
      ...selectedScenario,
      patientFootfallSurgePercent: customFootfall,
      supplyDelayDays: customDelay,
      budgetAllocatedInr: customBudget,
    };
    runSim(updated);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DENGUE_OUTBREAK':
        return Activity;
      case 'FLOOD_INUNDATION':
        return CloudRain;
      case 'HEATWAVE_SURGE':
        return Flame;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Simulator Hero Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              &quot;What If?&quot; Health System Digital Twin Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate epidemics, climate shocks, logistics blockades, and warehouse disruptions before they hit ground zero.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectPreset(PRESET_SCENARIOS[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Scenarios</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCENARIOS.map(scen => {
          const Icon = getCategoryIcon(scen.category);
          const isSelected = selectedScenario.id === scen.id;

          return (
            <button
              key={scen.id}
              onClick={() => handleSelectPreset(scen)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {scen.targetState && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                      {scen.targetState}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-white leading-tight mb-1">{scen.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{scen.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Surge: +{scen.patientFootfallSurgePercent}%</span>
                <span>Delay: +{scen.supplyDelayDays}d</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Knobs Panel */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Scenario Knobs: {selectedScenario.name}</span>
          </h3>
          <button
            onClick={handleCustomParamChange}
            className="flex items-center gap-1.5 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Apply Stress Knobs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-medium">Patient Footfall Surge</span>
              <span className="text-teal-400 font-mono font-bold">+{customFootfall}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={customFootfall}
              onChange={e => setCustomFootfall(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Increases OPD patient load and drug burn velocity.</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-medium">Supply Chain Transit Delay</span>
              <span className="text-teal-400 font-mono font-bold">+{customDelay} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={customDelay}
              onChange={e => setCustomDelay(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Simulates road washouts or warehouse quarantine lag.</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-medium">Contingency Mitigation Budget</span>
              <span className="text-teal-400 font-mono font-bold">₹{(customBudget / 100000).toFixed(2)} Lakhs</span>
            </div>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="50000"
              value={customBudget}
              onChange={e => setCustomBudget(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Allocated state NHM emergency transport fund.</span>
          </div>
        </div>
      </div>

      {/* BEFORE vs AFTER Dynamic Comparison Matrix */}
      {simulationResult && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Network Impact: BEFORE vs. AFTER Simulation</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Metric 1: Critical Facilities */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Critical Facilities (&lt;3D)</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-lg text-slate-400">{simulationResult.preScenario.criticalFacilitiesCount}</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="text-2xl font-extrabold text-rose-400">
                    {simulationResult.postScenario.criticalFacilitiesCount}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-rose-400 font-bold">
                  +{simulationResult.postScenario.criticalFacilitiesCount - simulationResult.preScenario.criticalFacilitiesCount} Facilities at risk
                </div>
              </div>

              {/* Metric 2: High Attention Facilities */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">High Attention (3-6D)</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-lg text-slate-400">{simulationResult.preScenario.highRiskFacilitiesCount}</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="text-2xl font-extrabold text-amber-400">
                    {simulationResult.postScenario.highRiskFacilitiesCount}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-amber-400 font-medium">
                  Pre-emptive buffer breach
                </div>
              </div>

              {/* Metric 3: Stable Facilities */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Resilient / Stable</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-lg text-slate-400">{simulationResult.preScenario.stableFacilitiesCount}</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {simulationResult.postScenario.stableFacilitiesCount}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Remaining safety nodes
                </div>
              </div>

              {/* Metric 4: Average Days Coverage */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Avg Days Inventory</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-lg text-slate-400">{simulationResult.preScenario.averageDaysCoverage}d</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="text-2xl font-extrabold text-teal-300">
                    {simulationResult.postScenario.averageDaysCoverage}d
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-rose-400 font-medium">
                  -{(simulationResult.preScenario.averageDaysCoverage - simulationResult.postScenario.averageDaysCoverage).toFixed(1)}d network depletion
                </div>
              </div>

              {/* Metric 5: Est Mitigation Cost */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Mitigation Cost</span>
                <div className="mt-1 text-2xl font-extrabold text-white font-mono">
                  ₹{(simulationResult.estimatedMitigationCostInr / 100000).toFixed(2)}L
                </div>
                <div className="mt-1 text-[10px] text-teal-400 font-medium">
                  {simulationResult.estimatedMitigationCostInr <= customBudget ? 'Within Budget' : 'Budget Overrun Alert'}
                </div>
              </div>

            </div>
          </div>

          {/* Granular Breakdown: Affected Districts + Top Medicine Deficits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Affected Districts */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-rose-400" />
                <span>Hardest-Hit Districts ({simulationResult.affectedDistricts.length})</span>
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {simulationResult.affectedDistricts.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {d.district}, {d.state}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Deficits: <span className="text-rose-300">{d.deficitMedicines.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-rose-400 font-bold font-mono text-sm block">
                        {d.criticalPhcs} PHCs
                      </span>
                      <span className="text-[10px] text-slate-500">at critical risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Medicine Deficits */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Projected Critical Drug Deficits</span>
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {simulationResult.criticalDeficits.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{def.medicineName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Affects {def.phcsAffected} Primary Health Centres
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-amber-400 font-bold font-mono text-sm block">
                        -{def.totalShortfallUnits.toLocaleString('en-IN')} units
                      </span>
                      <span className="text-[10px] text-slate-500">projected shortfall</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Gemini Executive Strategic Brief */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-sm text-white">
                  Gemini 3.8 Flash Strategic Memorandum for Health Administration
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Decision-Support Intelligence</span>
            </div>

            {isLoadingBrief ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Generating executive policy directives via Gemini 3.8 Flash...
              </div>
            ) : executiveBrief ? (
              <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                {executiveBrief}
              </div>
            ) : null}
          </div>

        </div>
      )}

    </div>
  );
};
