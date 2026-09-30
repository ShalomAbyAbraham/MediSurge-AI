import React, { useState } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import {
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  Send,
  Truck,
  CheckCircle2,
  Clock,
  Building,
  Users,
  BedDouble,
  FileWarning,
  Sparkles,
  ClipboardList,
  Package,
  Layers,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  Activity,
  History,
} from 'lucide-react';

interface DispensationRecord {
  id: string;
  timestamp: string;
  opdTicket: string;
  patientAge: number;
  gender: 'M' | 'F' | 'Other';
  condition: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  dispensedBy: string;
}

export const FacilityPortalView: React.FC = () => {
  const {
    currentUser,
    facilities,
    selectedFacilityId,
    medicines,
    updateFacilityStock,
    reportIncident,
    requestEmergencyResupply,
    transfers,
    updateTransferStatus,
    incidents,
  } = useHealthSystem();

  // Strictly bind to the authenticated facility for PHC user
  const activeFacId = (currentUser?.role === 'FACILITY_USER' && currentUser.facilityId)
    ? currentUser.facilityId
    : selectedFacilityId;

  const facility = facilities.find(f => f.id === activeFacId) || facilities[0];

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'dispense' | 'incoming' | 'resupply' | 'incidents'>('inventory');

  // Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showResupplyModal, setShowResupplyModal] = useState(false);

  // Quick Dispense Register form state
  const [opdTicket, setOpdTicket] = useState(`OPD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Other'>('F');
  const [clinicalCondition, setClinicalCondition] = useState('Acute Waterborne Gastroenteritis');
  const [dispenseMedId, setDispenseMedId] = useState(medicines[0]?.id || 'med-ors');
  const [dispenseQty, setDispenseQty] = useState<number>(10);
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState<string | null>(null);

  // Local log of dispensations
  const [dispensationLogs, setDispensationLogs] = useState<DispensationRecord[]>([
    {
      id: 'disp-101',
      timestamp: 'Today, 09:15 AM',
      opdTicket: 'OPD-2026-7731',
      patientAge: 28,
      gender: 'F',
      condition: 'Acute Diarrhea / Dehydration',
      medicineId: 'med-ors',
      medicineName: 'Oral Rehydration Salts (ORS)',
      quantity: 15,
      dispensedBy: facility.contactPerson,
    },
    {
      id: 'disp-102',
      timestamp: 'Today, 09:40 AM',
      opdTicket: 'OPD-2026-7732',
      patientAge: 45,
      gender: 'M',
      condition: 'High Febrile Episode',
      medicineId: 'med-pcm',
      medicineName: 'Paracetamol 500mg',
      quantity: 10,
      dispensedBy: facility.contactPerson,
    },
    {
      id: 'disp-103',
      timestamp: 'Today, 10:10 AM',
      opdTicket: 'OPD-2026-7733',
      patientAge: 8,
      gender: 'M',
      condition: 'Severe Pediatric Dehydration',
      medicineId: 'med-ors',
      medicineName: 'Oral Rehydration Salts (ORS)',
      quantity: 20,
      dispensedBy: facility.contactPerson,
    },
  ]);

  // Incident Form state
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentCategory, setIncidentCategory] = useState<any>('PATIENT_SURGE');
  const [incidentSeverity, setIncidentSeverity] = useState<any>('CRITICAL');
  const [selectedMedForIncident, setSelectedMedForIncident] = useState(medicines[0]?.id || 'med-ors');

  // Resupply Form state
  const [resupplyMed, setResupplyMed] = useState(medicines[0]?.id || 'med-ors');
  const [resupplyQty, setResupplyQty] = useState(350);
  const [resupplyNotes, setResupplyNotes] = useState('Stock depleted below safety buffer due to acute diarrhea patient surge');

  const incomingTransfers = transfers.filter(
    t => t.destinationFacilityId === facility.id && (t.status === 'APPROVED' || t.status === 'IN_TRANSIT')
  );

  const facilityIncidents = incidents.filter(i => i.facilityId === facility.id);

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispenseQty <= 0) return;

    const med = medicines.find(m => m.id === dispenseMedId);
    const medName = med ? med.name : 'Medicine';

    // 1. Update facility inventory in central state (closed loop)
    updateFacilityStock(facility.id, dispenseMedId, dispenseQty, 'DISPENSED');

    // 2. Add to local dispensation log
    const newLog: DispensationRecord = {
      id: `disp-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      opdTicket,
      patientAge,
      gender: patientGender,
      condition: clinicalCondition,
      medicineId: dispenseMedId,
      medicineName: medName,
      quantity: dispenseQty,
      dispensedBy: facility.contactPerson,
    };

    setDispensationLogs(prev => [newLog, ...prev]);

    // 3. Reset form with next ticket number
    setOpdTicket(`OPD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setDispenseSuccessMsg(`Successfully dispensed ${dispenseQty} units of ${medName} for ticket ${opdTicket}. Central telemetry updated.`);
    setTimeout(() => setDispenseSuccessMsg(null), 4000);
  };

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) return;

    reportIncident({
      facilityId: facility.id,
      facilityName: facility.name,
      district: facility.district,
      state: facility.state,
      category: incidentCategory,
      severity: incidentSeverity,
      title: incidentTitle,
      description: incidentDesc,
      affectedMedicineIds: [selectedMedForIncident],
      reportedBy: facility.contactPerson,
    });

    setShowIncidentModal(false);
    setIncidentTitle('');
    setIncidentDesc('');
    setActiveSubTab('incidents');
  };

  const handleResupplyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestEmergencyResupply(facility.id, resupplyMed, resupplyQty, resupplyNotes);
    setShowResupplyModal(false);
    setActiveSubTab('resupply');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Field Officer Banner with Strict Security Badge */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a3530] via-[#072723] to-[#051c19] border border-[#145d55] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-teal-950/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-teal-500 text-slate-950 font-bold font-mono text-xs shadow-sm">
              {facility.code}
            </span>
            <h1 className="text-xl font-extrabold text-white">{facility.name}</h1>
          </div>
          <p className="text-xs text-teal-200/80 mt-1">
            {facility.district} District, {facility.state} · Medical Officer: <strong className="text-white">{facility.contactPerson}</strong>
          </p>
          <div className="mt-2.5 flex items-center gap-4 text-xs text-teal-300/80">
            <span className="flex items-center gap-1.5 text-teal-300 font-medium">
              <Users className="w-3.5 h-3.5" /> OPD Footfall: <strong>{facility.currentDailyFootfall}</strong> /day
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <BedDouble className="w-3.5 h-3.5" /> Inpatient Beds: <strong>{facility.occupiedBeds}/{facility.totalBeds}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Stethoscope className="w-3.5 h-3.5" /> Doctors: <strong>{facility.medicalOfficersCount}</strong>
            </span>
          </div>
        </div>

        {/* Security & Access Isolation Badge */}
        <div className="flex items-center gap-2.5 shrink-0 bg-[#031514] border border-[#104e46] px-3.5 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-[#082a26] border border-[#12534a] flex items-center justify-center text-teal-400 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="text-left text-xs leading-tight">
            <div className="font-semibold text-teal-300">Scoped PHC Workspace</div>
            <div className="text-[10px] text-teal-400/70 font-mono">Restricted to {facility.code}</div>
          </div>
        </div>
      </div>

      {/* Target Crisis Callout for PHC-042 or high-risk facilities */}
      {facility.riskLevel === 'CRITICAL' && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-600/70 shadow-xl shadow-rose-950/30">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                  ACTIVE CRITICAL STOCKOUT ALERT
                </span>
                <span className="text-xs text-rose-300 font-semibold">
                  Imminent Depletion Threshold Reached
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/50">
                  <span className="text-slate-400 text-[10px] block">Critical Drug</span>
                  <strong className="text-white text-sm">Oral Rehydration Salts</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/50">
                  <span className="text-slate-400 text-[10px] block">On-Hand Stock</span>
                  <strong className="text-white text-sm">{facility.inventory['med-ors']?.currentStock || 420} units</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/50">
                  <span className="text-slate-400 text-[10px] block">Stock Depletion ETA</span>
                  <strong className="text-rose-400 text-sm font-bold">{facility.inventory['med-ors']?.daysRemaining || 2.5} days</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/50">
                  <span className="text-slate-400 text-[10px] block">Warehouse Delivery</span>
                  <strong className="text-cyan-400 text-sm">In {facility.inventory['med-ors']?.nextScheduledDeliveryDays || 9} days</strong>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0 self-center">
              <button
                onClick={() => {
                  setResupplyMed('med-ors');
                  setResupplyQty(500);
                  setShowResupplyModal(true);
                }}
                className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
              >
                [REQUEST EMERGENCY RESUPPLY]
              </button>
              <button
                onClick={() => {
                  setIncidentTitle('Acute ORS shortage & patient surge');
                  setShowIncidentModal(true);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/20"
              >
                [REPORT OUTBREAK INCIDENT]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Consignment Status Banner */}
      {incomingTransfers.length > 0 && (
        <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 animate-bounce" />
              <span>Incoming Emergency Consignments Dispatched to This PHC:</span>
            </span>
            <span>{incomingTransfers.length} Active Shipments</span>
          </div>

          <div className="space-y-2">
            {incomingTransfers.map(tx => (
              <div
                key={tx.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{tx.quantity} units of {tx.medicineName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Dispatched from {tx.sourceFacilityName} · Distance: {tx.distanceKm} km · ETA: ~{tx.transitHours} hrs
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTransferStatus(tx.id, 'DELIVERED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Receipt & Restock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation for PHC Staff */}
      <div className="border-b border-[#0f443f] flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'inventory'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold shadow-teal-500/20'
              : 'text-teal-200/80 hover:text-white hover:bg-[#09312c] bg-[#06201d]/60 border border-[#0f443f]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Medicine Inventory</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dispense')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'dispense'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold shadow-teal-500/20'
              : 'text-teal-200/80 hover:text-white hover:bg-[#09312c] bg-[#06201d]/60 border border-[#0f443f]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Daily Dispensation Register</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#031514] text-teal-300 rounded-full font-mono">
            {dispensationLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('incoming')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'incoming'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold shadow-teal-500/20'
              : 'text-teal-200/80 hover:text-white hover:bg-[#09312c] bg-[#06201d]/60 border border-[#0f443f]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Incoming Consignments</span>
          {incomingTransfers.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-rose-500 text-white rounded-full font-mono font-bold">
              {incomingTransfers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('resupply')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'resupply'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold shadow-teal-500/20'
              : 'text-teal-200/80 hover:text-white hover:bg-[#09312c] bg-[#06201d]/60 border border-[#0f443f]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Emergency Requisitions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'incidents'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold shadow-teal-500/20'
              : 'text-teal-200/80 hover:text-white hover:bg-[#09312c] bg-[#06201d]/60 border border-[#0f443f]'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>Incident & Outbreak Logs</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#031514] text-teal-300 rounded-full font-mono">
            {facilityIncidents.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: MEDICINE INVENTORY CARDS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Essential Drug Formulary & Live Days Remaining
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResupplyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Requisition Emergency Stock</span>
              </button>
              <button
                onClick={() => setShowIncidentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl transition"
              >
                <FileWarning className="w-3.5 h-3.5" />
                <span>Report Local Outbreak</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map(med => {
              const item = facility.inventory[med.id];
              if (!item) return null;

              const isCrit = item.status === 'CRITICAL';
              const isHigh = item.status === 'HIGH';

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-800/70 shadow-md'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-800/70'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{med.name}</span>
                          {med.temperatureControlled && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                              2°-8°C Cold Chain
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-400">{med.genericName} · {med.dosageForm}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {item.daysRemaining} days remaining
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block">On-Hand Stock</span>
                        <span className="font-bold text-white text-sm">{item.currentStock} {med.unit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Daily Burn</span>
                        <span className="font-bold text-slate-300">{item.dailyConsumption} /day</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Next Delivery</span>
                        <span className="font-bold text-cyan-400">{item.nextScheduledDeliveryDays}d away</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Batch: {item.batchNumber}</span>
                      <span>Exp: {item.expiryDate}</span>
                    </div>
                  </div>

                  {/* Stock Quick Adjustment Buttons */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Quick Log:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateFacilityStock(facility.id, med.id, 25, 'DISPENSED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] transition"
                        title="Dispense 25 units to patients"
                      >
                        <MinusCircle className="w-3 h-3 text-rose-400" />
                        <span>Dispense -25</span>
                      </button>
                      <button
                        onClick={() => updateFacilityStock(facility.id, med.id, 100, 'RECEIVED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] transition"
                        title="Receive local delivery batch +100"
                      >
                        <PlusCircle className="w-3 h-3 text-emerald-400" />
                        <span>Restock +100</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: DAILY DISPENSATION REGISTER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'dispense' && (
        <div className="space-y-6">
          {dispenseSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dispenseSuccessMsg}</span>
            </div>
          )}

          {/* Form */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-teal-400" />
                  <span>Log Patient OPD Dispensation</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Record prescriptions dispensed during outpatient consultations. Decrements local stock and recalculates national stockout risk in real time.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                DISHA Compliant (No PII)
              </span>
            </div>

            <form onSubmit={handleDispenseSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">OPD Registration Ticket</label>
                <input
                  type="text"
                  required
                  value={opdTicket}
                  onChange={e => setOpdTicket(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Patient Age & Gender</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="105"
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                  <select
                    value={patientGender}
                    onChange={e => setPatientGender(e.target.value as any)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Clinical Indication / Diagnosis</label>
                <select
                  value={clinicalCondition}
                  onChange={e => setClinicalCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Acute Waterborne Gastroenteritis">Acute Gastroenteritis / Diarrhea</option>
                  <option value="Febrile Episode / High Fever">Febrile Episode / High Fever</option>
                  <option value="Bacterial Upper Respiratory Infection">Upper Respiratory Infection</option>
                  <option value="Type 2 Diabetes Maintenance">Type 2 Diabetes Maintenance</option>
                  <option value="Maternal Antenatal / Postnatal Care">Maternal / Postnatal Care</option>
                  <option value="Animal Bite / Post-exposure Prophylaxis">Animal Bite / Exposure</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medicine to Dispense</label>
                <select
                  value={dispenseMedId}
                  onChange={e => setDispenseMedId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {medicines.map(m => {
                    const stock = facility.inventory[m.id]?.currentStock || 0;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} (Stock: {stock} {m.unit})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantity Dispensed</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={dispenseQty}
                  onChange={e => setDispenseQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Log Dispensation & Sync</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Historical Log Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Shift Dispensation Log ({facility.name})</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">OPD Ticket</th>
                    <th className="py-2.5 px-3">Patient Profile</th>
                    <th className="py-2.5 px-3">Clinical Diagnosis</th>
                    <th className="py-2.5 px-3">Medicine Dispensed</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {dispensationLogs.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{item.timestamp}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{item.opdTicket}</td>
                      <td className="py-2.5 px-3">{item.patientAge}y / {item.gender}</td>
                      <td className="py-2.5 px-3">{item.condition}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{item.medicineName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">-{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: INCOMING CONSIGNMENTS & TRUCKS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'incoming' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>Consignments Dispatched to This Facility</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Active transfers routed from regional depots or peer CHC surplus stocks. Click &quot;Confirm Receipt&quot; once goods arrive physically.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-800">
              {incomingTransfers.length} Active Shipments
            </span>
          </div>

          {incomingTransfers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No incoming consignments currently in transit to {facility.name}.</p>
              <p className="text-[11px] text-slate-600">
                If your stock is low, use the &quot;Emergency Requisitions&quot; tab to request stock from district reserves.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingTransfers.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{tx.quantity} units of {tx.medicineName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Origin: <strong className="text-slate-200">{tx.sourceFacilityName}</strong> · Highway Route: {tx.distanceKm} km
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      Estimated Transit: ~{tx.transitHours} hours · Approved by: {tx.approvedBy || 'District Command'}
                    </p>
                  </div>

                  <button
                    onClick={() => updateTransferStatus(tx.id, 'DELIVERED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Receipt & Update Inventory</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: EMERGENCY REQUISITION CENTER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'resupply' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-400" />
                <span>Emergency Drug Requisitions (SOS)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Submit prioritized supply requests directly to the District Chief Medical Officer and National Redistribution Solver.
              </p>
            </div>
            <button
              onClick={() => setShowResupplyModal(true)}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              + Create New Requisition
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider block">
                Requisition Protocol & Rules
              </span>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>Requisitions bypass standard monthly cycles for urgent patient safety.</li>
                <li>The AI redistribution solver immediately calculates nearest donor facilities with verified surplus.</li>
                <li>Cold-chain medicines (Insulin, ARV) will be assigned certified cold-box vehicles.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                Designated District Supply Depot
              </span>
              <div className="text-xs font-bold text-white">Gorakhpur District Drug Warehouse</div>
              <p className="text-[11px] text-slate-400">
                Lead-time to {facility.name}: <strong className="text-cyan-400">~1.2 hours</strong> (31.4 km)
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Depot Capacity: 84% operational</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 5: INCIDENT & OUTBREAK LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'incidents' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-rose-400" />
                <span>Field Incidents & Outbreak Reports</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Live health events recorded at this facility broadcasted to the National Command Center.
              </p>
            </div>
            <button
              onClick={() => setShowIncidentModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              + Report New Incident
            </button>
          </div>

          {facilityIncidents.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No active incidents logged for {facility.name}. Facility operational status is normal.
            </p>
          ) : (
            <div className="space-y-3">
              {facilityIncidents.map(inc => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-slate-950 border border-rose-900/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{inc.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {inc.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{inc.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Category: {inc.category}</span>
                    <span>Reported by: {inc.reportedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-rose-400" />
              <span>Report Health Facility Incident</span>
            </h3>

            <form onSubmit={handleSubmitIncident} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Incident Category</label>
                <select
                  value={incidentCategory}
                  onChange={e => setIncidentCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="PATIENT_SURGE">Patient Surge / Outbreak</option>
                  <option value="SHIPMENT_DELAY">Shipment Delay / Non-arrival</option>
                  <option value="EQUIPMENT_FAILURE">Cold Chain / Refrigerator Failure</option>
                  <option value="STAFF_SHORTAGE">Medical Staff Shortage</option>
                  <option value="FLOOD_WEATHER">Flood / Road Obstruction</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Severity Level</label>
                <select
                  value={incidentSeverity}
                  onChange={e => setIncidentSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="CRITICAL">Critical (Immediate stockout threat)</option>
                  <option value="HIGH">High (Within 48 hours)</option>
                  <option value="MEDIUM">Medium (Within 5 days)</option>
                  <option value="LOW">Low (Informational)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Affected Drug</label>
                <select
                  value={selectedMedForIncident}
                  onChange={e => setSelectedMedForIncident(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Brief Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diarrhea cluster in Ward 4, ORS running out"
                  value={incidentTitle}
                  onChange={e => setIncidentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder:text-slate-500 placeholder:font-['Outfit'] placeholder:tracking-wide focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Details & Field Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide clinical observations, estimated patient volume, road conditions..."
                  value={incidentDesc}
                  onChange={e => setIncidentDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder:text-slate-500 placeholder:font-['Outfit'] placeholder:tracking-wide focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Broadcast to Command Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resupply Request Modal */}
      {showResupplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <span>Request Emergency Resupply</span>
            </h3>

            <form onSubmit={handleResupplyRequest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Medicine Required</label>
                <select
                  value={resupplyMed}
                  onChange={e => setResupplyMed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.dosageForm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantity Requested</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  required
                  value={resupplyQty}
                  onChange={e => setResupplyQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Urgency Justification</label>
                <textarea
                  rows={3}
                  value={resupplyNotes}
                  onChange={e => setResupplyNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResupplyModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl"
                >
                  Submit Resupply Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
