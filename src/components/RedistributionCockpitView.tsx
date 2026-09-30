import React, { useState, useMemo } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import {
  RedistributionEngine,
  SolverConstraints,
  DEFAULT_CONSTRAINTS,
} from '../services/redistributionEngine';
import { RedistributionOption, RedistributionTransfer } from '../types';
import {
  Truck,
  Sliders,
  CheckCircle,
  AlertCircle,
  Clock,
  Navigation as NavIcon,
  ShieldCheck,
  Check,
  Building,
  ArrowRight,
  Sparkles,
  Layers,
  IndianRupee,
} from 'lucide-react';

export const RedistributionCockpitView: React.FC = () => {
  const {
    currentUser,
    facilities,
    medicines,
    warehouses,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedMedicineId,
    setSelectedMedicineId,
    canApproveTransfer,
    approveTransfer,
    escalateTransfer,
    transfers,
    updateTransferStatus,
    currentRole,
  } = useHealthSystem();

  const [constraints, setConstraints] = useState<SolverConstraints>(DEFAULT_CONSTRAINTS);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt-rapid-proximity');
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);
  const [escalatedId, setEscalatedId] = useState<string | null>(null);

  const destFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];
  const medicine = medicines.find(m => m.id === selectedMedicineId) || medicines[0];

  // Run Solver
  const solverOptions = useMemo(() => {
    if (!destFacility || !medicine) return [];
    return RedistributionEngine.solveForFacility(
      destFacility,
      medicine,
      facilities,
      warehouses,
      constraints
    );
  }, [destFacility, medicine, facilities, warehouses, constraints]);

  const activeOption = solverOptions.find(o => o.id === selectedOptionId) || solverOptions[0];

  const handleApprove = (option: RedistributionOption) => {
    let allOk = true;
    for (const t of option.transfers) {
      const ok = approveTransfer(t);
      if (!ok) allOk = false;
    }
    if (allOk) {
      setJustApprovedId(option.id);
      setTimeout(() => setJustApprovedId(null), 3000);
    }
  };

  const handleEscalate = (option: RedistributionOption) => {
    escalateTransfer(option.id, `Jurisdictional transfer required for ${option.title}`);
    setEscalatedId(option.id);
    setTimeout(() => setEscalatedId(null), 4000);
  };

  const inventoryItem = destFacility?.inventory[medicine?.id];
  const activeAuth = activeOption ? canApproveTransfer(activeOption) : { allowed: false };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Cockpit Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Truck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Automated Redistribution & Decision Cockpit
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic peer-to-peer resource optimization with strict buffer protection. Human administrator holds final authorization.
          </p>
        </div>

        {/* Target Deficit Selection */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs">
            <span className="text-slate-500 block mb-0.5 font-medium">Recipient Facility:</span>
            <select
              value={destFacility.id}
              onChange={e => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {facilities
                .filter(f => f.riskLevel === 'CRITICAL' || f.riskLevel === 'HIGH' || f.id === 'phc-042')
                .map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200">
                    {f.name} ({f.riskLevel})
                  </option>
                ))}
            </select>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs">
            <span className="text-slate-500 block mb-0.5 font-medium">Deficit Drug:</span>
            <select
              value={medicine.id}
              onChange={e => setSelectedMedicineId(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Status Banner */}
      {inventoryItem && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            <div>
              <span className="text-slate-400">Target Deficit: </span>
              <strong className="text-white">{destFacility.name}</strong> needs{' '}
              <strong className="text-teal-400">{medicine.name}</strong>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <span>Current Stock: <strong>{inventoryItem.currentStock} {medicine.unit}</strong></span>
            <span>·</span>
            <span>Burn Rate: <strong className="text-amber-400">{inventoryItem.dailyConsumption}/day</strong></span>
            <span>·</span>
            <span>Remaining: <strong className="text-rose-400">{inventoryItem.daysRemaining} days</strong></span>
          </div>
        </div>
      )}

      {/* Main Layout: Constraints Sidebar (Left) + Feasible Options (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Constraints Tuning Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Policy & Logistics Constraints</span>
            </h3>
            <button
              onClick={() => setConstraints(DEFAULT_CONSTRAINTS)}
              className="text-[10px] text-teal-400 hover:underline"
            >
              Reset Defaults
            </button>
          </div>

          {/* Slider 1: Max Distance */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Max Dispatch Distance</span>
              <span className="text-teal-400 font-mono font-bold">{constraints.maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={constraints.maxDistanceKm}
              onChange={e => setConstraints({ ...constraints, maxDistanceKm: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Limits transport radius to safeguard transit times.
            </span>
          </div>

          {/* Slider 2: Minimum Safety Buffer to Leave in Donor */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Donor Minimum Reserve Protection</span>
              <span className="text-teal-400 font-mono font-bold">{constraints.minimumReserveDays} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={constraints.minimumReserveDays}
              onChange={e => setConstraints({ ...constraints, minimumReserveDays: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Donor facilities will never be depleted below this threshold.
            </span>
          </div>

          {/* Slider 3: Budget Limit */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Logistics Budget Ceiling</span>
              <span className="text-teal-400 font-mono font-bold">₹{constraints.budgetLimitInr.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={constraints.budgetLimitInr}
              onChange={e => setConstraints({ ...constraints, budgetLimitInr: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Transport fuel + cold-chain escort budget.
            </span>
          </div>

          {/* Toggle: Inter-District Transfers */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-300 font-medium block">Allow Inter-District Sourcing</span>
              <span className="text-[10px] text-slate-500">Cross-district administrative pooling</span>
            </div>
            <input
              type="checkbox"
              checked={constraints.allowInterDistrict}
              onChange={e => setConstraints({ ...constraints, allowInterDistrict: e.target.checked })}
              className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Starvation Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Every mathematical redistribution candidate must verify that donor health centers retain ≥{constraints.minimumReserveDays} days of verified clinical stock.
            </p>
          </div>
        </div>

        {/* Options & Decision Cockpit */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Feasible Response Options ({solverOptions.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Select an option to review trade-offs & authorize
            </span>
          </div>

          {/* Option Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {solverOptions.map((opt, idx) => {
              const isSelected = (activeOption?.id === opt.id) || (idx === 0 && !activeOption);
              const optJurisdiction = opt.jurisdictionLevel || 'INTRA_DISTRICT';
              const jBadgeColor =
                optJurisdiction === 'INTRA_DISTRICT'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : optJurisdiction === 'INTER_DISTRICT'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30';
              const jBadgeLabel =
                optJurisdiction === 'INTRA_DISTRICT'
                  ? 'Tier 1: District CMO'
                  : optJurisdiction === 'INTER_DISTRICT'
                  ? 'Tier 2: State DHS'
                  : 'Tier 3: MoHFW National';

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-teal-300 border border-slate-800 font-bold">
                        {opt.title.split(':')[0]}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">
                        +{opt.resilienceScoreGain}% Resil
                      </span>
                    </div>

                    {/* Jurisdiction Tier Chip */}
                    <div className="mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${jBadgeColor}`}>
                        🏛️ {jBadgeLabel}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white leading-tight mb-1">
                      {opt.title.split(':')[1] || opt.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {opt.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Est. Cost:</span>
                      <span className="text-slate-200 font-bold">₹{opt.totalCostInr.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg Distance:</span>
                      <span className="text-slate-200 font-bold">{opt.averageDistanceKm} km</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {solverOptions.length === 0 && (
              <div className="col-span-3 p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                No feasible donor facilities found within current constraints ({constraints.maxDistanceKm}km, {constraints.minimumReserveDays} reserve days).
                Try expanding the maximum distance or reducing reserve buffer.
              </div>
            )}
          </div>

          {/* Active Option Deep Dive & Authorization Panel */}
          {activeOption && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">
                      {activeOption.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono border border-slate-800 text-teal-400 font-bold">
                      {activeOption.jurisdictionLevel === 'INTRA_DISTRICT'
                        ? 'TIER 1 (DISTRICT CMO JURISDICTION)'
                        : activeOption.jurisdictionLevel === 'INTER_DISTRICT'
                        ? 'TIER 2 (STATE DHS JURISDICTION)'
                        : 'TIER 3 (NATIONAL MoHFW JURISDICTION)'}
                    </span>
                  </div>
                  <p className="text-xs text-teal-400 mt-1">
                    Trade-off: {activeOption.tradeOffSummary}
                  </p>
                </div>

                {/* Conditional Authorization or Escalation Action Button */}
                <div className="shrink-0 flex items-center gap-2">
                  {activeAuth.allowed ? (
                    <button
                      onClick={() => handleApprove(activeOption)}
                      disabled={justApprovedId === activeOption.id}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition shadow-xl ${
                        justApprovedId === activeOption.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                      }`}
                    >
                      {justApprovedId === activeOption.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Consignment Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Authorize {activeOption.jurisdictionLevel === 'INTRA_DISTRICT' ? 'Intra-District' : 'State'} Consignment</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEscalate(activeOption)}
                      disabled={escalatedId === activeOption.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl transition shadow-amber-500/20"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{escalatedId === activeOption.id ? 'Forwarded to Higher Queue!' : 'Escalate to State DHS (1-Click)'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notice if user lacks authorization */}
              {!activeAuth.allowed && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-300">Jurisdictional Authority Note:</span>
                    <span>{activeAuth.reason} As District CMO, you can authorize Tier 1 local peer transfers directly, or use the Escalate button above to request State DHS clearance.</span>
                  </div>
                </div>
              )}

              {/* Transfer Manifest Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Reallocation Manifest ({activeOption.transfers.length} Consignments)
                </span>

                <div className="space-y-2">
                  {activeOption.transfers.map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.sourceFacilityName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                          <span className="font-bold text-white">{tx.destinationFacilityName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {tx.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
                        <div>
                          <span className="text-slate-500 block">Transfer Qty</span>
                          <span className="text-teal-300 font-bold text-xs">{tx.quantity} units</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Transit ETA</span>
                          <span className="text-slate-200 font-bold">{tx.transitHours} hrs ({tx.distanceKm} km)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Cost</span>
                          <span className="text-slate-200 font-bold">₹{tx.estimatedCostInr}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Coverage Gain</span>
                          <span className="text-emerald-400 font-bold">
                            {tx.destPreDaysRemaining}d &rarr; {tx.destPostDaysRemaining}d
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Active Transfers Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Network Consignments & Dispatches ({transfers.length})</span>
              </h4>
              <span className="text-[10px] text-slate-500">Live Logistics Pipeline</span>
            </div>

            <div className="space-y-2">
              {transfers.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-teal-400">{tx.id}</span>
                      <span className="font-bold text-slate-200">{tx.medicineName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                          tx.status === 'APPROVED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : tx.status === 'IN_TRANSIT'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      From {tx.sourceFacilityName} &rarr; {tx.destinationFacilityName} ({tx.quantity} units, {tx.distanceKm} km)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tx.status === 'APPROVED' && (
                      <button
                        onClick={() => updateTransferStatus(tx.id, 'IN_TRANSIT')}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium"
                      >
                        Mark In-Transit
                      </button>
                    )}
                    {tx.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => updateTransferStatus(tx.id, 'DELIVERED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                      >
                        Confirm Delivery at PHC
                      </button>
                    )}
                    {tx.status === 'DELIVERED' && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Stock Received
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
