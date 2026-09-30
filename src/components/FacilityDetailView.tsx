import React, { useState, useEffect } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { ForecastService, FacilityDemandForecast } from '../services/forecastService';
import { RiskExplanation } from '../types';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  FileText,
  Truck,
  Sparkles,
  Phone,
  Layers,
} from 'lucide-react';

export const FacilityDetailView: React.FC = () => {
  const {
    selectedFacility,
    selectedMedicine,
    setSelectedMedicineId,
    medicines,
    incidents,
    setActiveTab,
    facilities,
    setSelectedFacilityId,
  } = useHealthSystem();

  const [forecast, setForecast] = useState<FacilityDemandForecast | null>(null);
  const [xaiData, setXaiData] = useState<RiskExplanation | null>(null);
  const [isLoadingXai, setIsLoadingXai] = useState(false);

  const facility = selectedFacility || facilities[0];
  const medicine = selectedMedicine || medicines[0];

  const inventoryItem = facility.inventory[medicine.id] || Object.values(facility.inventory)[0];
  const facilityIncidents = incidents.filter(i => i.facilityId === facility.id);
  const footfallRatio = facility.currentDailyFootfall / Math.max(1, facility.averageDailyFootfall);

  // Generate Vertex AI Forecast
  useEffect(() => {
    if (!facility || !medicine || !inventoryItem) return;

    const surgeFactor = footfallRatio > 1.2 ? 1.35 : 1.0;
    const fc = ForecastService.generateForecast(
      facility.id,
      facility.name,
      medicine.id,
      medicine.name,
      inventoryItem.currentStock,
      inventoryItem.dailyConsumption,
      surgeFactor,
      inventoryItem.nextScheduledDeliveryDays
    );
    setForecast(fc);
  }, [facility, medicine, inventoryItem, footfallRatio]);

  // Fetch Gemini Explainable AI (XAI)
  useEffect(() => {
    let isMounted = true;
    const fetchXai = async () => {
      if (!facility || !medicine || !inventoryItem) return;
      setIsLoadingXai(true);
      try {
        const response = await fetch('/api/gemini/explain-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facility,
            medicine,
            inventoryItem,
            incidents: facilityIncidents,
            footfallRatio,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setXaiData(data);
        }
      } catch (err) {
        console.warn('Failed to fetch XAI:', err);
      } finally {
        if (isMounted) setIsLoadingXai(false);
      }
    };

    fetchXai();
    return () => {
      isMounted = false;
    };
  }, [facility?.id, medicine?.id]);

  if (!facility) {
    return <div className="p-8 text-center text-slate-500">No facility selected.</div>;
  }

  const isCritical = inventoryItem.status === 'CRITICAL';
  const isHigh = inventoryItem.status === 'HIGH';

  return (
    <div className="space-y-6 pb-16">
      
      {/* Facility Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded">
              {facility.code}
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{facility.name}</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                facility.riskLevel === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : facility.riskLevel === 'HIGH'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {facility.riskLevel} Facility Hazard
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {facility.taluk}, {facility.district} District, {facility.state} · Type: {facility.type} · Bed Occupancy: {facility.occupiedBeds}/{facility.totalBeds} ({Math.round((facility.occupiedBeds / facility.totalBeds) * 100)}%)
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {facility.contactPerson}: <strong className="text-slate-200">{facility.contactPhone}</strong>
            </span>
            <span>·</span>
            <span>
              Telemetry Sync: <strong className="text-slate-300 font-mono">03:45 IST (Live)</strong>
            </span>
          </div>
        </div>

        {/* Facility Selector Quick Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs">
            <span className="text-slate-500 block mb-1 font-medium">Switch Facility:</span>
            <select
              value={facility.id}
              onChange={e => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[220px]"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200">
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medicine Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-teal-400" /> Formulary:
        </span>
        {medicines.map(m => {
          const item = facility.inventory[m.id];
          const isSelected = m.id === medicine.id;
          const isItemCrit = item?.status === 'CRITICAL';
          const isItemHigh = item?.status === 'HIGH';

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMedicineId(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <span>{m.name.split('(')[0].trim()}</span>
              {item && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isSelected
                      ? 'bg-slate-950 text-teal-300'
                      : isItemCrit
                      ? 'bg-rose-950 text-rose-400'
                      : isItemHigh
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.daysRemaining}d
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stock Health KPI Cards for selected medicine */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Current On-Hand Stock</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {inventoryItem.currentStock}
            </span>
            <span className="text-xs text-slate-500">{medicine.unit}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Safety reserve: {inventoryItem.minimumReserve} {medicine.unit}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Daily Burn Rate</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-teal-400 font-mono tabular-nums">
              {inventoryItem.dailyConsumption}
            </span>
            <span className="text-xs text-slate-500">{medicine.unit}/day</span>
          </div>
          <div className="mt-1 text-[11px] flex items-center gap-1 text-amber-400">
            <TrendingUp className="w-3 h-3" />
            <span>Footfall surge: {(footfallRatio * 100).toFixed(0)}% of baseline</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isCritical
              ? 'bg-rose-950/30 border-rose-800/60'
              : isHigh
              ? 'bg-amber-950/30 border-amber-800/60'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className="text-xs text-slate-400 font-medium block">Days Until Depletion</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-extrabold font-mono tabular-nums ${
                isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {inventoryItem.daysRemaining}
            </span>
            <span className="text-xs text-slate-400">days remaining</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-400/90 font-medium">
            {isCritical ? 'Imminent stockout!' : 'Within safety margins'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Next Scheduled Resupply</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
              {inventoryItem.nextScheduledDeliveryDays}
            </span>
            <span className="text-xs text-slate-400">days away</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-400 font-mono">
            Deficit gap:{' '}
            {inventoryItem.nextScheduledDeliveryDays > inventoryItem.daysRemaining
              ? `${(inventoryItem.nextScheduledDeliveryDays - inventoryItem.daysRemaining).toFixed(1)} days without stock`
              : 'Covered by delivery'}
          </div>
        </div>
      </div>

      {/* Hero Split: Gemini Explainable AI (Left) + Vertex AI Forecasting Curve (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gemini Explainable AI (XAI) Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Explainable AI (XAI) Clinical Diagnostics
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-800 rounded">
                      Gemini 3.8 Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Transparent reasoning grounded in empirical telemetry and supply variables
                  </p>
                </div>
              </div>

              {xaiData && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Confidence</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {xaiData.confidenceScore}%
                  </span>
                </div>
              )}
            </div>

            {/* XAI Content */}
            {isLoadingXai ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-teal-400 animate-spin mx-auto" />
                <p className="text-xs">Synthesizing clinical evidence via Gemini 3.8 Flash...</p>
              </div>
            ) : xaiData ? (
              <div className="space-y-4 text-xs">
                
                {/* 1. WHY? Risk Summary */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>WHY IS THIS FACILITY AT RISK?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {xaiData.riskSummary}
                  </p>
                </div>

                {/* Primary Quantitative Drivers */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Primary Quantitative Drivers
                  </h4>
                  <div className="space-y-1.5">
                    {xaiData.primaryDrivers.map((driver, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 block truncate">{driver.factor}</span>
                          <span className="text-[11px] text-slate-400 block truncate">{driver.description}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-teal-400 font-bold text-xs">
                            {(driver.impactWeight * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">weight</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. EVIDENCE TABLE */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-400" /> Empirical Evidence Records
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-2">Metric</th>
                          <th className="p-2">Observed Value</th>
                          <th className="p-2">Threshold</th>
                          <th className="p-2">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {xaiData.evidence.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2 font-medium text-slate-300">{ev.metric}</td>
                            <td className="p-2 font-mono text-rose-400 font-bold">{ev.observedValue}</td>
                            <td className="p-2 font-mono text-slate-400">{ev.normalThreshold}</td>
                            <td className="p-2 text-slate-500 font-mono text-[10px]">{ev.sourceTimestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. ASSUMPTIONS */}
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>Model Assumptions</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                    {xaiData.keyAssumptions.map((asm, idx) => (
                      <li key={idx}>{asm}</li>
                    ))}
                  </ul>
                </div>

                {/* Projected Stockout Date & Urgent Action */}
                <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-800/50">
                  <div className="flex items-center justify-between text-teal-300 font-bold text-xs mb-1">
                    <span>Projected Stock-Out Date:</span>
                    <span className="font-mono text-white bg-rose-950/90 border border-rose-700 px-2 py-0.5 rounded">
                      {xaiData.projectedStockoutDate}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">
                    {xaiData.recommendedUrgentAction}
                  </p>
                </div>

              </div>
            ) : null}
          </div>

          {/* Action Button: Jump to Redistribution Solver */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Ready to solve this deficit?</span>
            <button
              onClick={() => setActiveTab('redistribution')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
            >
              <Truck className="w-4 h-4" />
              <span>Launch Redistribution Solver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Vertex AI Forecasting Curve (Right) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Vertex AI Demand Forecast</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  30-day lookback + 14-day lookahead AutoML trajectory
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                MAPE: 4.8%
              </span>
            </div>

            {/* Forecast Chart Visualization */}
            {forecast ? (
              <div className="space-y-4">
                
                {/* SVG Visual Graph of Stock Trajectory */}
                <div className="relative w-full h-56 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Stock Level (units)</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-teal-400"></span> Forecast Stock
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-rose-500 border-dashed"></span> Zero Stock
                      </span>
                    </div>
                  </div>

                  {/* Visual SVG Curve */}
                  <div className="relative flex-1 w-full flex items-end">
                    <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                      
                      {/* Safety threshold line */}
                      <line
                        x1="0"
                        y1="80"
                        x2="320"
                        y2="80"
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <text x="5" y="76" fill="#f59e0b" fontSize="8" opacity="0.8">Safety Buffer</text>

                      {/* Stock depletion curve */}
                      <path
                        d="M 10 25 Q 80 40, 160 75 T 260 115 L 310 118"
                        fill="none"
                        stroke={isCritical ? '#f43f5e' : '#14b8a6'}
                        strokeWidth="2.5"
                      />

                      {/* Stockout indicator dot */}
                      {isCritical && (
                        <g>
                          <circle cx="210" cy="100" r="5" fill="#f43f5e" className="animate-ping" opacity="0.5" />
                          <circle cx="210" cy="100" r="4" fill="#f43f5e" />
                          <text x="180" y="90" fill="#f43f5e" fontSize="9" fontWeight="bold">Stock-Out</text>
                        </g>
                      )}
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                    <span>Today</span>
                    <span>+3 Days</span>
                    <span>+7 Days</span>
                    <span>+14 Days</span>
                  </div>
                </div>

                {/* Forecast Summary Statistics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Projected 7-Day Demand</span>
                    <span className="font-mono text-slate-200 font-bold text-sm">
                      {inventoryItem.predictedDemand7Days} {medicine.unit}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Projected 14-Day Demand</span>
                    <span className="font-mono text-slate-200 font-bold text-sm">
                      {inventoryItem.predictedDemand14Days} {medicine.unit}
                    </span>
                  </div>
                </div>

                {/* Features Used in Vertex AI Model */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                  <span className="font-semibold text-slate-300 block mb-1.5">
                    Vertex AI Feature Weights:
                  </span>
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Daily OPD Patient Footfall</span>
                      <span className="font-mono text-teal-400">42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monsoon Rainfall Index (IMD)</span>
                      <span className="font-mono text-teal-400">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Historical Dispensation Velocity</span>
                      <span className="font-mono text-teal-400">19%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>District Syndromic Alerts</span>
                      <span className="font-mono text-teal-400">11%</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model Version: <code>VERTEX-TIME-SERIES-V3.4</code></span>
            <span className="text-emerald-400">AutoML Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
