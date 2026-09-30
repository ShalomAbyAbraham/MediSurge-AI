import React, { useState } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { Warehouse, PHCFacility } from '../types';
import {
  Network,
  Building,
  Hospital,
  AlertTriangle,
  ShieldCheck,
  Truck,
  ArrowDown,
  Layers,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const SupplyNetworkView: React.FC = () => {
  const { warehouses, facilities, setSelectedFacilityId, setActiveTab } = useHealthSystem();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0].id);
  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];

  // Facilities served by this warehouse
  const servedFacilities = facilities.filter(f => f.assignedWarehouseId === selectedWarehouse.id);

  // Network vulnerabilities calculation
  const networkVulnerabilities = [
    {
      title: 'Single-Point-of-Failure: Kashi Regional Drug Depot',
      severity: 'HIGH',
      description: 'Supplies 18 rural PHCs across Gorakhpur and Deoria. A road disruption along NH-27 cuts off direct resupply to 6 eastern taluks with no redundant feeder warehouse.',
      affectedFacilitiesCount: 18,
      recommendedMitigation: 'Establish a secondary buffer satellite depot at Khalilabad CHC.',
    },
    {
      title: 'Cold-Chain Redundancy Deficit: Wayanad District Warehouse',
      severity: 'CRITICAL',
      description: 'Hilly terrain and frequent monsoon mudslides create an average 7.5-hour emergency transit latency for refrigerated insulin & anti-rabies vaccines.',
      affectedFacilitiesCount: 14,
      recommendedMitigation: 'Equip Meppadi and Sultan Bathery PHCs with solar direct-drive backup refrigerators.',
    },
    {
      title: 'Long-Haul Feeder Lag: Cuttack Central Medical Warehouse',
      severity: 'MEDIUM',
      description: 'Transit distances to western tribal block PHCs exceed 120km, resulting in 4-day minimum dispatch turnaround.',
      affectedFacilitiesCount: 12,
      recommendedMitigation: 'Pre-position 30-day buffer stocks prior to monsoon onset.',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Network Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Network className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Healthcare Supply Network & Dependency Graph
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topological map of Central Depots &rarr; District Drug Warehouses &rarr; Primary Health Centres. Identifying single points of failure.
          </p>
        </div>

        {/* Warehouse Selector */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs">
          <span className="text-slate-500 block mb-0.5 font-medium">Select Supply Hub:</span>
          <select
            value={selectedWarehouse.id}
            onChange={e => setSelectedWarehouseId(e.target.value)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                {w.name} ({w.type.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Network Topology Graph: Depot -> Districts -> PHCs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Tiered Supply Tree: {selectedWarehouse.name}</span>
          </h2>
          <span className="text-xs text-teal-400 font-mono">
            {servedFacilities.length} PHCs Connected Downstream
          </span>
        </div>

        {/* Visual Multi-Tier Tree */}
        <div className="space-y-6">
          
          {/* Level 1: Central Depot */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/60 text-center max-w-md w-full shadow-lg shadow-cyan-950/30">
              <div className="inline-flex p-2 rounded-lg bg-cyan-500/20 text-cyan-300 mb-2">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">{selectedWarehouse.name}</h3>
              <p className="text-xs text-cyan-300/80">
                {selectedWarehouse.state} · Type: {selectedWarehouse.type}
              </p>
              <div className="mt-2 pt-2 border-t border-cyan-800/40 flex justify-center gap-4 text-[11px] font-mono text-slate-300">
                <span>Capacity: <strong>{selectedWarehouse.capacityTons || 350} Tons</strong></span>
                <span>·</span>
                <span>Cold Chain: <strong className="text-emerald-400">Active (2°-8°C)</strong></span>
              </div>
            </div>
          </div>

          {/* Branching Connecting Line */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-slate-700"></div>
            <ArrowDown className="w-4 h-4 text-slate-500 -mt-1" />
          </div>

          {/* Level 2: Downstream Facilities Network */}
          <div>
            <div className="text-center text-xs text-slate-400 font-semibold mb-3">
              PRIMARY HEALTH CENTRES & COMMUNITY HEALTH CENTRES SERVED
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {servedFacilities.map(f => {
                const isCritical = f.riskLevel === 'CRITICAL';
                const isHigh = f.riskLevel === 'HIGH';

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFacilityId(f.id);
                      setActiveTab('facility-detail');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                      isCritical
                        ? 'bg-rose-950/30 border-rose-600 shadow-md shadow-rose-950/20'
                        : isHigh
                        ? 'bg-amber-950/30 border-amber-600'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-white block truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {f.code} · {f.district}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                          isCritical
                            ? 'bg-rose-500 text-white'
                            : isHigh
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {f.riskLevel}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>OPD: {f.currentDailyFootfall}</span>
                      <span className="text-teal-400 hover:underline">View XAI &rarr;</span>
                    </div>
                  </div>
                );
              })}

              {servedFacilities.length === 0 && (
                <div className="col-span-4 p-6 text-center text-slate-500 text-xs">
                  No PHCs currently mapped to this warehouse in demo view.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Network Vulnerabilities & Single-Point-of-Failure Detector */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Network Vulnerability & Single-Point-of-Failure (SPOF) Assessment
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Automated Graph Topology Audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {networkVulnerabilities.map((vuln, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      vuln.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : vuln.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {vuln.severity} Risk
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {vuln.affectedFacilitiesCount} PHCs Exposed
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white mb-1.5">{vuln.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {vuln.description}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-teal-950/30 border border-teal-800/40 text-[10px] text-teal-300">
                <strong>Mitigation Directive:</strong> {vuln.recommendedMitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
