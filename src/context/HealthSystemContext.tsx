import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  PHCFacility,
  Medicine,
  Warehouse,
  IncidentReport,
  RedistributionTransfer,
  RedistributionOption,
  HealthRole,
  EmergencyScenario,
  SimulationResult,
  AuthenticatedUser,
} from '../types';
import {
  ESSENTIAL_MEDICINES,
  SEED_WAREHOUSES,
  generateSeedFacilities,
  SEED_INCIDENT_REPORTS,
} from '../services/data/seedData';
import { SimulationEngine, PRESET_SCENARIOS } from '../services/simulationEngine';

export type AppLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

export interface SystemNotification {
  id: string;
  type: 'ALERT' | 'DISPATCH' | 'INCIDENT' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  facilityId?: string;
}

interface HealthSystemContextType {
  currentUser: AuthenticatedUser | null;
  login: (username: string, password: string, portalMode?: 'PHC' | 'ADMIN') => { success: boolean; error?: string };
  logout: () => void;
  facilities: PHCFacility[];
  medicines: Medicine[];
  warehouses: Warehouse[];
  incidents: IncidentReport[];
  transfers: RedistributionTransfer[];
  currentRole: HealthRole;
  setCurrentRole: (role: HealthRole) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedFacilityId: string;
  setSelectedFacilityId: (id: string) => void;
  selectedMedicineId: string;
  setSelectedMedicineId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentLanguage: AppLanguage;
  setCurrentLanguage: (lang: AppLanguage) => void;
  notifications: SystemNotification[];
  dismissNotification: (id: string) => void;
  
  // Dynamic mutations (The Closed Loop)
  updateFacilityStock: (facilityId: string, medicineId: string, delta: number, type: 'DISPENSED' | 'RECEIVED') => void;
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'timestamp' | 'status'>) => void;
  canApproveTransfer: (transfer: Partial<RedistributionTransfer> | RedistributionOption) => { allowed: boolean; reason?: string };
  approveTransfer: (transfer: Omit<RedistributionTransfer, 'id' | 'status' | 'createdTimestamp'>) => boolean;
  escalateTransfer: (transferOrOptionId: string, reason?: string) => void;
  updateTransferStatus: (transferId: string, status: 'IN_TRANSIT' | 'DELIVERED') => void;
  requestEmergencyResupply: (facilityId: string, medicineId: string, quantity: number, notes: string) => void;
  resetToPitchBaseline: () => void;
  
  // Simulation
  activeScenario: EmergencyScenario | null;
  simulationResult: SimulationResult | null;
  triggerSimulation: (scenario: EmergencyScenario) => void;
  clearSimulation: () => void;
  
  // Helpers
  selectedFacility: PHCFacility | undefined;
  selectedMedicine: Medicine | undefined;
  stats: {
    totalFacilities: number;
    criticalCount: number;
    highRiskCount: number;
    stableCount: number;
    totalStockoutsProjected7Days: number;
    activeIncidentsCount: number;
    activeTransfersCount: number;
  };
}

const HealthSystemContext = createContext<HealthSystemContextType | undefined>(undefined);

export const HealthSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilities, setFacilities] = useState<PHCFacility[]>(() => generateSeedFacilities());
  const [medicines] = useState<Medicine[]>(ESSENTIAL_MEDICINES);
  const [warehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [incidents, setIncidents] = useState<IncidentReport[]>(SEED_INCIDENT_REPORTS);
  const [transfers, setTransfers] = useState<RedistributionTransfer[]>([
    {
      id: 'tx-init-001',
      medicineId: 'med-ors',
      medicineName: 'Oral Rehydration Salts (ORS)',
      sourceFacilityId: 'phc-043',
      sourceFacilityName: 'Bansgaon CHC',
      destinationFacilityId: 'phc-042',
      destinationFacilityName: 'Pipraich Sugarbelt PHC',
      quantity: 350,
      distanceKm: 31.4,
      transitHours: 1.2,
      estimatedCostInr: 950,
      sourcePreStock: 850,
      sourcePostStock: 500,
      destPreDaysRemaining: 2.5,
      destPostDaysRemaining: 4.8,
      status: 'IN_TRANSIT',
      createdTimestamp: '2026-09-24T03:00:00Z',
      approvedBy: 'District Collector (Gorakhpur)',
      priorityScore: 94,
      reason: 'Urgent diarrheal outbreak mitigation dispatch',
    },
  ]);

  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const saved = localStorage.getItem('medisurge_auth_user') || localStorage.getItem('swasthyaflow_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved auth user', e);
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<HealthRole>(() => currentUser?.role || 'NATIONAL_ADMIN');
  const [selectedStateRaw, setSelectedStateRaw] = useState<string>(() => currentUser?.state || 'All');
  const [selectedDistrictRaw, setSelectedDistrictRaw] = useState<string>(() => currentUser?.district || 'All');

  const selectedState = currentUser?.role === 'STATE_ADMIN' && currentUser.state
    ? currentUser.state
    : currentUser?.role === 'DISTRICT_OFFICER' && currentUser.state
    ? currentUser.state
    : selectedStateRaw;

  const selectedDistrict = currentUser?.role === 'DISTRICT_OFFICER' && currentUser.district
    ? currentUser.district
    : selectedDistrictRaw;

  const setSelectedState = useCallback((state: string) => {
    if (currentUser?.role === 'STATE_ADMIN' || currentUser?.role === 'DISTRICT_OFFICER') {
      return; // Locked to user's assigned jurisdiction
    }
    setSelectedStateRaw(state);
    if (state === 'All') {
      setSelectedDistrictRaw('All');
    }
  }, [currentUser]);

  const setSelectedDistrict = useCallback((district: string) => {
    if (currentUser?.role === 'DISTRICT_OFFICER') {
      return; // Locked to user's assigned district
    }
    setSelectedDistrictRaw(district);
  }, [currentUser]);

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => currentUser?.facilityId || 'phc-042');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('med-ors');
  const [activeTab, setActiveTab] = useState<string>(() => currentUser?.role === 'FACILITY_USER' ? 'phc-portal' : 'command-center');
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('en');

  const login = (
    usernameInput: string,
    passwordInput: string,
    portalMode?: 'PHC' | 'ADMIN'
  ): { success: boolean; error?: string } => {
    const userTrim = usernameInput.trim();
    const passTrim = passwordInput.trim();

    if (!userTrim || !passTrim) {
      return {
        success: false,
        error: 'Please enter both User ID and Password.',
      };
    }

    // Authentication Rule: Password must match User ID internally
    if (userTrim.toLowerCase() !== passTrim.toLowerCase()) {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your User ID and Password.',
      };
    }

    const lower = userTrim.toLowerCase();
    
    // Administrative user directory
    const adminAccounts: Record<string, { role: HealthRole; displayName: string; state?: string; district?: string }> = {
      // National
      admin: { role: 'NATIONAL_ADMIN', displayName: 'National Health Mission Command Officer (MoHFW)', state: 'All', district: 'All' },
      national_admin: { role: 'NATIONAL_ADMIN', displayName: 'National Health Mission Command Officer (MoHFW)', state: 'All', district: 'All' },
      mohfw: { role: 'NATIONAL_ADMIN', displayName: 'Ministry of Health & Family Welfare Command', state: 'All', district: 'All' },

      // 5 State Directorates (Full State Names & Admin Aliases)
      kerala_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Kerala)', state: 'Kerala', district: 'All' },
      kerala: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Kerala)', state: 'Kerala', district: 'All' },
      kl_dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Kerala)', state: 'Kerala', district: 'All' },
      
      uttar_pradesh_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Uttar Pradesh)', state: 'Uttar Pradesh', district: 'All' },
      uttar_pradesh: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Uttar Pradesh)', state: 'Uttar Pradesh', district: 'All' },
      up_dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Uttar Pradesh)', state: 'Uttar Pradesh', district: 'All' },
      state_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Uttar Pradesh)', state: 'Uttar Pradesh', district: 'All' },
      dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Uttar Pradesh)', state: 'Uttar Pradesh', district: 'All' },

      maharashtra_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Maharashtra)', state: 'Maharashtra', district: 'All' },
      maharashtra: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Maharashtra)', state: 'Maharashtra', district: 'All' },
      mh_dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Health Services (Maharashtra)', state: 'Maharashtra', district: 'All' },

      karnataka_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Health & Family Welfare (Karnataka)', state: 'Karnataka', district: 'All' },
      karnataka: { role: 'STATE_ADMIN', displayName: 'Directorate of Health & Family Welfare (Karnataka)', state: 'Karnataka', district: 'All' },
      ka_dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Health & Family Welfare (Karnataka)', state: 'Karnataka', district: 'All' },

      odisha_admin: { role: 'STATE_ADMIN', displayName: 'Directorate of Public Health (Odisha)', state: 'Odisha', district: 'All' },
      odisha: { role: 'STATE_ADMIN', displayName: 'Directorate of Public Health (Odisha)', state: 'Odisha', district: 'All' },
      or_dhs: { role: 'STATE_ADMIN', displayName: 'Directorate of Public Health (Odisha)', state: 'Odisha', district: 'All' },

      // District CMOs
      cmo_gorakhpur: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Gorakhpur District, UP)', state: 'Uttar Pradesh', district: 'Gorakhpur' },
      cmo: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Gorakhpur District, UP)', state: 'Uttar Pradesh', district: 'Gorakhpur' },
      district_officer: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Gorakhpur District, UP)', state: 'Uttar Pradesh', district: 'Gorakhpur' },
      cmo_ernakulam: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Ernakulam District, Kerala)', state: 'Kerala', district: 'Ernakulam' },
      cmo_wayanad: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Wayanad District, Kerala)', state: 'Kerala', district: 'Wayanad' },
      cmo_bengaluru: { role: 'DISTRICT_OFFICER', displayName: 'District Health Officer (Bengaluru Urban, Karnataka)', state: 'Karnataka', district: 'Bengaluru Urban' },
      cmo_mysuru: { role: 'DISTRICT_OFFICER', displayName: 'Chief Medical Officer (Mysuru District, Karnataka)', state: 'Karnataka', district: 'Mysuru' },
      cmo_pune: { role: 'DISTRICT_OFFICER', displayName: 'Civil Surgeon & CMO (Pune District, Maharashtra)', state: 'Maharashtra', district: 'Pune' },
      cmo_khordha: { role: 'DISTRICT_OFFICER', displayName: 'Chief District Medical Officer (Khordha, Odisha)', state: 'Odisha', district: 'Khordha' },
    };

    const isAdminId = Boolean(adminAccounts[lower]);

    // Strict Portal Segregation
    if (portalMode === 'PHC' && isAdminId) {
      return {
        success: false,
        error: 'Administrative accounts cannot log in through the PHC Facility portal. Please switch to the "Admin Command" toggle.',
      };
    }

    if (portalMode === 'ADMIN' && !isAdminId) {
      return {
        success: false,
        error: 'PHC Facility credentials cannot log in through the Admin Command portal. Please switch to the "PHC Facility" toggle.',
      };
    }

    // Process Administrative Login
    if (adminAccounts[lower]) {
      const config = adminAccounts[lower];
      const user: AuthenticatedUser = {
        username: userTrim,
        role: config.role,
        displayName: config.displayName,
        state: config.state,
        district: config.district,
      };
      setCurrentUser(user);
      setCurrentRole(config.role);
      setSelectedState(config.state || 'All');
      setSelectedDistrict(config.district || 'All');
      setActiveTab('command-center');
      localStorage.setItem('medisurge_auth_user', JSON.stringify(user));
      return { success: true };
    }

    // If strictly in ADMIN portal and didn't match admin credentials above
    if (portalMode === 'ADMIN') {
      return {
        success: false,
        error: 'Administrative account identifier not recognized. Please use an admin credential or switch to "PHC Facility".',
      };
    }

    // Facility aliases mapping for instant demo login
    const facilityAliases: Record<string, string> = {
      'phc-042': 'phc-042',
      'phc-42': 'phc-042',
      '042': 'phc-042',
      '42': 'phc-042',
      'pipraich': 'phc-042',
      'phc-pipraich': 'phc-042',
      'bansgaon': 'phc-043',
      'phc-043': 'phc-043',
      'phc-43': 'phc-043',
      // Kerala
      'phc-kl-001': 'phc-023',
      'phc-aluva': 'phc-023',
      'aluva': 'phc-023',
      'phc-kl-005': 'phc-028',
      'phc-meppadi': 'phc-028',
      'meppadi': 'phc-028',
      'phc-kalpetta': 'phc-032',
      'kalpetta': 'phc-032',
      // Karnataka
      'phc-ka-001': 'phc-066',
      'phc-anekal': 'phc-066',
      'anekal': 'phc-066',
      'phc-ka-005': 'phc-075',
      'phc-nanjangud': 'phc-075',
      'nanjangud': 'phc-075',
      // Maharashtra
      'phc-002': 'phc-002',
      'phc-shirwal': 'phc-002',
      'shirwal': 'phc-002',
    };

    const targetLookupId = facilityAliases[lower] || lower;

    // PHC Facility lookup
    let matched = facilities.find(f => 
      f.id.toLowerCase() === targetLookupId ||
      f.code.toLowerCase() === targetLookupId ||
      f.code.toLowerCase().includes(targetLookupId) ||
      (targetLookupId.startsWith('phc-') && f.id.toLowerCase() === targetLookupId) ||
      f.id.replace('phc-', '').replace(/^0+/, '') === targetLookupId.replace('phc-', '').replace(/^0+/, '')
    );

    // If user enters a custom PHC like phc-150 or PHC-150 that isn't in seed
    if (!matched && (lower.startsWith('phc') || /^\d+$/.test(lower))) {
      const numPart = lower.replace(/[^0-9]/g, '') || '150';
      const padded = numPart.padStart(3, '0');
      const newFacilityId = `phc-${padded}`;

      matched = facilities.find(f => f.id === newFacilityId);
      if (!matched) {
        const sampleWarehouse = warehouses[0] || SEED_WAREHOUSES[0];
        const newInventory: Record<string, any> = {};
        medicines.forEach((m, idx) => {
          const dailyRate = Math.max(5, 18 + ((parseInt(numPart, 10) * (idx + 3)) % 40));
          const daysRemaining = 14 + ((parseInt(numPart, 10) + idx * 5) % 16);
          const currentStock = Math.round(dailyRate * daysRemaining);
          newInventory[m.id] = {
            medicineId: m.id,
            currentStock,
            dailyConsumption: dailyRate,
            minimumReserve: Math.round(dailyRate * 5),
            daysRemaining: Number(daysRemaining.toFixed(1)),
            predictedDemand7Days: Math.round(dailyRate * 7 * 1.05),
            predictedDemand14Days: Math.round(dailyRate * 14 * 1.08),
            nextScheduledDeliveryDays: 5,
            status: daysRemaining < 5 ? 'CRITICAL' : daysRemaining < 8 ? 'HIGH' : 'STABLE',
            batchNumber: `BAT-${m.id.slice(4).toUpperCase()}-2026${padded}`,
            expiryDate: '2027-12-31',
          };
        });

        matched = {
          id: newFacilityId,
          name: `Kaptanganj Sector ${numPart} PHC`,
          code: `PHC-UP-GKP-${padded}`,
          state: 'Uttar Pradesh',
          district: 'Gorakhpur',
          taluk: 'Gorakhpur Rural',
          coordinates: { lat: 26.7606 + 0.04, lng: 83.3732 + 0.04 },
          type: 'PHC',
          totalBeds: 12,
          occupiedBeds: 7,
          medicalOfficersCount: 2,
          staffOnDuty: 5,
          averageDailyFootfall: 92,
          currentDailyFootfall: 95,
          inventory: newInventory,
          riskLevel: 'STABLE',
          riskScore: 22,
          lastSyncTimestamp: new Date().toISOString(),
          assignedWarehouseId: sampleWarehouse.id,
          contactPerson: 'Dr. Amit Verma (Medical Officer)',
          contactPhone: '+91 94500 12345',
        };

        setFacilities(prev => [matched!, ...prev]);
      }
    }

    if (matched) {
      const user: AuthenticatedUser = {
        username: userTrim,
        role: 'FACILITY_USER',
        displayName: matched.contactPerson,
        facilityId: matched.id,
        facilityCode: matched.code,
        facilityName: matched.name,
        district: matched.district,
        state: matched.state,
      };
      setCurrentUser(user);
      setCurrentRole('FACILITY_USER');
      setSelectedFacilityId(matched.id);
      setSelectedState(matched.state);
      setSelectedDistrict(matched.district);
      setActiveTab('phc-portal');
      localStorage.setItem('medisurge_auth_user', JSON.stringify(user));
      return { success: true };
    }

    return {
      success: false,
      error: `PHC facility identifier "${userTrim}" was not found. Please verify your facility credentials.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('medisurge_auth_user');
    localStorage.removeItem('swasthyaflow_auth_user');
    setCurrentRole('NATIONAL_ADMIN');
    setActiveTab('command-center');
  };

  const [activeScenario, setActiveScenario] = useState<EmergencyScenario | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      type: 'ALERT',
      title: 'CRITICAL STOCK ALERT: PHC-042',
      message: 'Pipraich Sugarbelt PHC faces imminent ORS depletion in 2.5 days. Urgent redistribution recommended.',
      timestamp: '10 mins ago',
      facilityId: 'phc-042',
    },
    {
      id: 'notif-2',
      type: 'DISPATCH',
      title: 'TRANSFER IN TRANSIT',
      message: '350 ORS units dispatched from Bansgaon CHC to Pipraich PHC. ETA: 45 minutes.',
      timestamp: '30 mins ago',
      facilityId: 'phc-042',
    },
  ]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Facility stock mutation
  const updateFacilityStock = (
    facilityId: string,
    medicineId: string,
    delta: number,
    type: 'DISPENSED' | 'RECEIVED'
  ) => {
    setFacilities(prev =>
      prev.map(f => {
        if (f.id !== facilityId) return f;

        const currentItem = f.inventory[medicineId];
        if (!currentItem) return f;

        const newStock = type === 'DISPENSED'
          ? Math.max(0, currentItem.currentStock - delta)
          : currentItem.currentStock + delta;

        const newDaysRemaining = Number((newStock / Math.max(1, currentItem.dailyConsumption)).toFixed(1));

        let status = currentItem.status;
        if (newDaysRemaining < 3) status = 'CRITICAL';
        else if (newDaysRemaining < 6) status = 'HIGH';
        else if (newDaysRemaining < 10) status = 'MODERATE';
        else status = 'STABLE';

        const updatedInventory = {
          ...f.inventory,
          [medicineId]: {
            ...currentItem,
            currentStock: newStock,
            daysRemaining: newDaysRemaining,
            status,
          },
        };

        // Recalculate facility overall risk
        let facilityRisk: any = 'STABLE';
        for (const item of Object.values(updatedInventory)) {
          if (item.status === 'CRITICAL') {
            facilityRisk = 'CRITICAL';
            break;
          }
          if (item.status === 'HIGH') facilityRisk = 'HIGH';
          else if (item.status === 'MODERATE' && facilityRisk === 'STABLE') facilityRisk = 'MODERATE';
        }

        return {
          ...f,
          inventory: updatedInventory,
          riskLevel: facilityRisk,
          lastSyncTimestamp: new Date().toISOString(),
        };
      })
    );

    const medName = medicines.find(m => m.id === medicineId)?.name || 'Medicine';
    setNotifications(prev => [
      {
        id: `stock-${Date.now()}`,
        type: 'INFO',
        title: `STOCK UPDATED: ${facilityId.toUpperCase()}`,
        message: `${type === 'DISPENSED' ? 'Dispensed' : 'Received'} ${delta} units of ${medName}. System telemetry updated.`,
        timestamp: 'Just now',
        facilityId,
      },
      ...prev,
    ]);
  };

  // Incident reporting
  const reportIncident = (incidentData: Omit<IncidentReport, 'id' | 'timestamp' | 'status'>) => {
    const newIncident: IncidentReport = {
      ...incidentData,
      id: `inc-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      status: 'OPEN',
    };

    setIncidents(prev => [newIncident, ...prev]);

    // Update facility risk if high or critical
    if (newIncident.severity === 'CRITICAL' || newIncident.severity === 'HIGH') {
      setFacilities(prev =>
        prev.map(f => {
          if (f.id === newIncident.facilityId) {
            return {
              ...f,
              riskLevel: newIncident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
              riskScore: Math.min(99, f.riskScore + 25),
              notes: newIncident.description,
            };
          }
          return f;
        })
      );
    }

    setNotifications(prev => [
      {
        id: `inc-notif-${Date.now()}`,
        type: 'INCIDENT',
        title: `NEW INCIDENT: ${newIncident.facilityName}`,
        message: `${newIncident.title} (${newIncident.severity} severity). Telemetry recalculating.`,
        timestamp: 'Just now',
        facilityId: newIncident.facilityId,
      },
      ...prev,
    ]);
  };

  // Jurisdictional Authority Checker
  const canApproveTransfer = (
    transfer: Partial<RedistributionTransfer> | RedistributionOption
  ): { allowed: boolean; reason?: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'You must be logged in to authorize transfers.' };
    }
    if (currentUser.role === 'FACILITY_USER') {
      return {
        allowed: false,
        reason: 'Facility Medical Officers cannot authorize inter-facility transfers. Sovereign authority rests with District CMO, State DHS, or National Command.',
      };
    }

    const jurisdiction = 'jurisdictionLevel' in transfer && transfer.jurisdictionLevel
      ? transfer.jurisdictionLevel
      : 'transfers' in transfer && transfer.transfers?.[0]?.jurisdictionLevel
      ? transfer.transfers[0].jurisdictionLevel
      : 'INTRA_DISTRICT';

    if (currentUser.role === 'NATIONAL_ADMIN') {
      return { allowed: true };
    }

    if (currentUser.role === 'STATE_ADMIN') {
      if (jurisdiction === 'INTER_STATE') {
        return {
          allowed: false,
          reason: 'Inter-state transfers require MoHFW National Command authorization.',
        };
      }
      return { allowed: true };
    }

    if (currentUser.role === 'DISTRICT_OFFICER') {
      if (jurisdiction === 'INTER_STATE') {
        return {
          allowed: false,
          reason: 'Inter-state transfers exceed district jurisdiction. Requires MoHFW National Command authorization.',
        };
      }
      if (jurisdiction === 'INTER_DISTRICT') {
        return {
          allowed: false,
          reason: 'Inter-district transfers & State Central Warehouse dispatches require State DHS authorization. Use the Escalate button.',
        };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'Unauthorized role.' };
  };

  // Transfer approval with strict jurisdiction enforcement
  const approveTransfer = (
    transferData: Omit<RedistributionTransfer, 'id' | 'status' | 'createdTimestamp'>
  ): boolean => {
    const check = canApproveTransfer(transferData);
    if (!check.allowed) {
      setNotifications(prev => [
        {
          id: `auth-err-${Date.now()}`,
          type: 'INCIDENT',
          title: 'AUTHORIZATION BLOCKED: JURISDICTION RESTRICTION',
          message: check.reason || 'Insufficient administrative jurisdiction.',
          timestamp: 'Just now',
        },
        ...prev,
      ]);
      return false;
    }

    const approverTitle =
      currentUser?.role === 'NATIONAL_ADMIN'
        ? 'National Health Mission Command Officer'
        : currentUser?.role === 'STATE_ADMIN'
        ? `${currentUser.state || 'State'} Directorate of Health Services`
        : currentUser?.role === 'DISTRICT_OFFICER'
        ? `Chief Medical Officer (${currentUser.district || 'District'})`
        : 'Health Administration';

    const newTx: RedistributionTransfer = {
      ...transferData,
      id: `tx-${Date.now().toString().slice(-5)}`,
      status: 'APPROVED',
      createdTimestamp: new Date().toISOString(),
      approvedBy: approverTitle,
    };

    setTransfers(prev => [newTx, ...prev]);

    // Proactively update stocks to reflect pipeline dispatch
    setFacilities(prev =>
      prev.map(f => {
        if (f.id === newTx.sourceFacilityId) {
          const item = f.inventory[newTx.medicineId];
          if (item) {
            const nextStock = Math.max(0, item.currentStock - newTx.quantity);
            return {
              ...f,
              inventory: {
                ...f.inventory,
                [newTx.medicineId]: {
                  ...item,
                  currentStock: nextStock,
                  daysRemaining: Number((nextStock / item.dailyConsumption).toFixed(1)),
                },
              },
            };
          }
        }
        return f;
      })
    );

    setNotifications(prev => [
      {
        id: `tx-approved-${Date.now()}`,
        type: 'DISPATCH',
        title: 'TRANSFER CONSIGNMENT AUTHORIZED',
        message: `Approved ${newTx.quantity} units of ${newTx.medicineName} from ${newTx.sourceFacilityName} to ${newTx.destinationFacilityName} by ${approverTitle}. Logistics order generated.`,
        timestamp: 'Just now',
        facilityId: newTx.destinationFacilityId,
      },
      ...prev,
    ]);

    return true;
  };

  const escalateTransfer = (transferOrOptionId: string, reason?: string) => {
    const targetRole = currentUser?.role === 'DISTRICT_OFFICER' ? 'STATE_ADMIN' : 'NATIONAL_ADMIN';
    const targetName = targetRole === 'STATE_ADMIN' ? 'State Directorate of Health Services' : 'National Command (MoHFW)';
    
    setNotifications(prev => [
      {
        id: `esc-${Date.now()}`,
        type: 'INFO',
        title: `TRANSFER ESCALATED TO ${targetName.toUpperCase()}`,
        message: `Consignment authorization request forwarded to ${targetName}. Reason: ${reason || 'Exceeds district jurisdiction authority'}.`,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const resetToPitchBaseline = () => {
    const freshFacilities = generateSeedFacilities();
    const freshIncidents = SEED_INCIDENT_REPORTS;
    const baselineTransfers: RedistributionTransfer[] = [
      {
        id: 'tx-init-001',
        medicineId: 'med-ors',
        medicineName: 'Oral Rehydration Salts (ORS)',
        sourceFacilityId: 'phc-043',
        sourceFacilityName: 'Bansgaon CHC',
        destinationFacilityId: 'phc-042',
        destinationFacilityName: 'Pipraich Sugarbelt PHC',
        quantity: 350,
        distanceKm: 24.5,
        transitHours: 1.1,
        estimatedCostInr: 850,
        sourcePreStock: 850,
        sourcePostStock: 500,
        destPreDaysRemaining: 2.5,
        destPostDaysRemaining: 4.8,
        status: 'IN_TRANSIT',
        createdTimestamp: new Date().toISOString(),
        approvedBy: 'Chief Medical Officer (Gorakhpur)',
        priorityScore: 94,
        reason: 'Urgent diarrheal outbreak mitigation dispatch',
        jurisdictionLevel: 'INTRA_DISTRICT',
        requiredRole: 'DISTRICT_OFFICER',
      },
    ];

    setFacilities(freshFacilities);
    setIncidents(freshIncidents);
    setTransfers(baselineTransfers);
    setActiveScenario(null);
    setSimulationResult(null);

    localStorage.setItem('medisurge_facilities', JSON.stringify(freshFacilities));
    localStorage.setItem('medisurge_transfers', JSON.stringify(baselineTransfers));
    localStorage.setItem('medisurge_incidents', JSON.stringify(freshIncidents));

    setNotifications(prev => [
      {
        id: `reset-${Date.now()}`,
        type: 'INFO',
        title: 'PITCH DEMO BASELINE RESTORED',
        message: 'All 100 facilities, inventory buffers, and active incident alerts reset to default demonstration state. Ready for live scenario presentation.',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const updateTransferStatus = (transferId: string, status: 'IN_TRANSIT' | 'DELIVERED') => {
    setTransfers(prev =>
      prev.map(t => {
        if (t.id === transferId) {
          if (status === 'DELIVERED') {
            // Credit the stock to destination facility
            updateFacilityStock(t.destinationFacilityId, t.medicineId, t.quantity, 'RECEIVED');
          }
          return { ...t, status };
        }
        return t;
      })
    );
  };

  const requestEmergencyResupply = (
    facilityId: string,
    medicineId: string,
    quantity: number,
    notes: string
  ) => {
    const fac = facilities.find(f => f.id === facilityId);
    const med = medicines.find(m => m.id === medicineId);
    if (!fac || !med) return;

    reportIncident({
      facilityId,
      facilityName: fac.name,
      district: fac.district,
      state: fac.state,
      category: 'PATIENT_SURGE',
      severity: 'CRITICAL',
      title: `Emergency Resupply Requested: ${med.name}`,
      description: `Immediate request for ${quantity} ${med.unit}. Reason: ${notes}`,
      affectedMedicineIds: [medicineId],
      reportedBy: fac.contactPerson,
    });
  };

  // Run Simulation
  const triggerSimulation = (scenario: EmergencyScenario) => {
    setActiveScenario(scenario);
    const result = SimulationEngine.runSimulation(facilities, medicines, scenario);
    setSimulationResult(result);
  };

  const clearSimulation = () => {
    setActiveScenario(null);
    setSimulationResult(null);
  };

  const selectedFacility = useMemo(() => facilities.find(f => f.id === selectedFacilityId), [facilities, selectedFacilityId]);
  const selectedMedicine = useMemo(() => medicines.find(m => m.id === selectedMedicineId), [medicines, selectedMedicineId]);

  const stats = useMemo(() => {
    let critical = 0;
    let high = 0;
    let stable = 0;
    let stockouts = 0;

    const scopedFacilities = facilities.filter(f => {
      if (selectedState !== 'All' && f.state !== selectedState) return false;
      if (selectedDistrict !== 'All' && f.district !== selectedDistrict) return false;
      return true;
    });

    for (const f of scopedFacilities) {
      if (f.riskLevel === 'CRITICAL') critical++;
      else if (f.riskLevel === 'HIGH') high++;
      else stable++;

      for (const item of Object.values(f.inventory)) {
        if (item.daysRemaining < 5) stockouts++;
      }
    }

    const scopedIncidents = incidents.filter(i => {
      if (selectedState !== 'All' && i.state !== selectedState) return false;
      if (selectedDistrict !== 'All' && i.district !== selectedDistrict) return false;
      return i.status === 'OPEN' || i.status === 'INVESTIGATING';
    });

    const scopedFacilityIds = new Set(scopedFacilities.map(f => f.id));
    const scopedTransfers = transfers.filter(t => {
      if (selectedState === 'All' && selectedDistrict === 'All') {
        return t.status === 'APPROVED' || t.status === 'IN_TRANSIT';
      }
      return (
        (scopedFacilityIds.has(t.sourceFacilityId) || scopedFacilityIds.has(t.destinationFacilityId)) &&
        (t.status === 'APPROVED' || t.status === 'IN_TRANSIT')
      );
    });

    return {
      totalFacilities: scopedFacilities.length,
      criticalCount: critical,
      highRiskCount: high,
      stableCount: stable,
      totalStockoutsProjected7Days: stockouts,
      activeIncidentsCount: scopedIncidents.length,
      activeTransfersCount: scopedTransfers.length,
    };
  }, [facilities, incidents, transfers, selectedState, selectedDistrict]);

  return (
    <HealthSystemContext.Provider
      value={{
        currentUser,
        login,
        logout,
        facilities,
        medicines,
        warehouses,
        incidents,
        transfers,
        currentRole,
        setCurrentRole,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        selectedFacilityId,
        setSelectedFacilityId,
        selectedMedicineId,
        setSelectedMedicineId,
        activeTab,
        setActiveTab,
        currentLanguage,
        setCurrentLanguage,
        notifications,
        dismissNotification,
        updateFacilityStock,
        reportIncident,
        canApproveTransfer,
        approveTransfer,
        escalateTransfer,
        updateTransferStatus,
        requestEmergencyResupply,
        resetToPitchBaseline,
        activeScenario,
        simulationResult,
        triggerSimulation,
        clearSimulation,
        selectedFacility,
        selectedMedicine,
        stats,
      }}
    >
      {children}
    </HealthSystemContext.Provider>
  );
};

export const useHealthSystem = () => {
  const context = useContext(HealthSystemContext);
  if (!context) {
    throw new Error('useHealthSystem must be used within a HealthSystemProvider');
  }
  return context;
};
