export type HealthRole = 'NATIONAL_ADMIN' | 'STATE_ADMIN' | 'DISTRICT_OFFICER' | 'FACILITY_USER';

export interface AuthenticatedUser {
  username: string;
  role: HealthRole;
  displayName: string;
  facilityId?: string; // Present when role === 'FACILITY_USER'
  facilityCode?: string;
  facilityName?: string;
  district?: string;
  state?: string;
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE';

export type MedicineCategory = 'ESSENTIAL_DRUG' | 'VACCINE' | 'IV_FLUID' | 'MATERNAL_HEALTH' | 'ANTIBIOTIC';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: string; // e.g. "Sachet", "Vial", "Tablet"
  unit: string; // e.g. "packets", "vials", "strips"
  criticalThresholdDays: number; // min days before alarming
  shelfLifeMonths: number;
  temperatureControlled: boolean;
  unitCostInr: number;
}

export interface InventoryItem {
  medicineId: string;
  currentStock: number;
  dailyConsumption: number;
  minimumReserve: number; // Safety buffer: must never be transferred away
  daysRemaining: number;
  predictedDemand7Days: number;
  predictedDemand14Days: number;
  nextScheduledDeliveryDays: number;
  status: RiskLevel;
  batchNumber: string;
  expiryDate: string;
}

export interface PHCFacility {
  id: string;
  name: string;
  code: string; // e.g. "PHC-MH-PUN-014"
  state: string;
  district: string;
  taluk: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'PHC' | 'CHC' | 'SUB_CENTRE';
  totalBeds: number;
  occupiedBeds: number;
  medicalOfficersCount: number;
  staffOnDuty: number;
  averageDailyFootfall: number;
  currentDailyFootfall: number;
  inventory: Record<string, InventoryItem>;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  lastSyncTimestamp: string;
  assignedWarehouseId: string;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: 'STATE_CENTRAL_DEPOT' | 'DISTRICT_DRUG_WAREHOUSE';
  state: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacityUtilization: number; // percentage
  capacityTons?: number;
  coldStorageCertified?: boolean;
  connectedPhcIds: string[];
  status: 'OPERATIONAL' | 'CONGESTED' | 'DISRUPTED';
  leadTimeDays: number;
}

export interface IncidentReport {
  id: string;
  facilityId: string;
  facilityName: string;
  district: string;
  state: string;
  timestamp: string;
  category: 'SHIPMENT_DELAY' | 'EQUIPMENT_FAILURE' | 'STAFF_SHORTAGE' | 'PATIENT_SURGE' | 'DISEASE_OUTBREAK' | 'FLOOD_WEATHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedMedicineIds: string[];
  reportedBy: string;
  status: 'OPEN' | 'INVESTIGATING' | 'DISPATCH_IN_TRANSIT' | 'RESOLVED';
  actionTaken?: string;
}

export interface RedistributionTransfer {
  id: string;
  medicineId: string;
  medicineName: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  quantity: number;
  distanceKm: number;
  transitHours: number;
  estimatedCostInr: number;
  sourcePreStock: number;
  sourcePostStock: number;
  destPreDaysRemaining: number;
  destPostDaysRemaining: number;
  status: 'PROPOSED' | 'APPROVED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdTimestamp: string;
  approvedBy?: string;
  priorityScore: number;
  reason: string;
  jurisdictionLevel?: 'INTRA_DISTRICT' | 'INTER_DISTRICT' | 'INTER_STATE';
  requiredRole?: HealthRole;
  escalatedTo?: HealthRole;
  escalatedReason?: string;
  escalatedTimestamp?: string;
}

export interface RedistributionOption {
  id: string;
  title: string;
  description: string;
  jurisdictionLevel?: 'INTRA_DISTRICT' | 'INTER_DISTRICT' | 'INTER_STATE';
  requiredRole?: HealthRole;
  transfers: Omit<RedistributionTransfer, 'id' | 'status' | 'createdTimestamp'>[];
  totalCostInr: number;
  averageDistanceKm: number;
  facilitiesRescuedCount: number;
  resilienceScoreGain: number;
  tradeOffSummary: string;
}

export interface RiskExplanation {
  facilityId: string;
  facilityName: string;
  medicineId: string;
  medicineName: string;
  riskSummary: string;
  primaryDrivers: {
    factor: string;
    description: string;
    impactWeight: number; // 0 - 1
  }[];
  evidence: {
    metric: string;
    observedValue: string;
    normalThreshold: string;
    sourceTimestamp: string;
  }[];
  keyAssumptions: string[];
  projectedStockoutDate: string;
  recommendedUrgentAction: string;
  confidenceScore: number;
}

export interface EmergencyScenario {
  id: string;
  name: string;
  category: 'DENGUE_OUTBREAK' | 'FLOOD_INUNDATION' | 'HEATWAVE_SURGE' | 'WAREHOUSE_FAILURE' | 'MALARIA_CLUSTER' | 'CUSTOM';
  description: string;
  targetState?: string;
  targetDistrict?: string;
  demandSurgePercent: Record<string, number>; // medicineId -> % increase
  supplyDelayDays: number;
  patientFootfallSurgePercent: number;
  budgetAllocatedInr: number;
}

export interface SimulationResult {
  scenarioName: string;
  preScenario: {
    criticalFacilitiesCount: number;
    highRiskFacilitiesCount: number;
    stableFacilitiesCount: number;
    averageDaysCoverage: number;
    potentialStockoutsCount: number;
  };
  postScenario: {
    criticalFacilitiesCount: number;
    highRiskFacilitiesCount: number;
    stableFacilitiesCount: number;
    averageDaysCoverage: number;
    potentialStockoutsCount: number;
  };
  affectedDistricts: {
    district: string;
    state: string;
    criticalPhcs: number;
    deficitMedicines: string[];
    riskJump: number;
  }[];
  criticalDeficits: {
    medicineName: string;
    totalShortfallUnits: number;
    phcsAffected: number;
  }[];
  recommendedInterventions: string[];
  estimatedMitigationCostInr: number;
}
