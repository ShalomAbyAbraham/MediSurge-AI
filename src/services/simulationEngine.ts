import { PHCFacility, Medicine, EmergencyScenario, SimulationResult } from '../types';

export const PRESET_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'scen-dengue',
    name: 'Monsoon Dengue & Vector-Borne Outbreak',
    category: 'DENGUE_OUTBREAK',
    description: 'Post-monsoon water stagnation triggers rapid mosquito breeding. Platelet and fever symptomatic patients surge by 140%. Paracetamol, IV Saline, and ORS face catastrophic demand spikes.',
    demandSurgePercent: {
      'med-pcm': 160,
      'med-saline': 140,
      'med-ors': 120,
      'med-amox': 40,
    },
    supplyDelayDays: 3,
    patientFootfallSurgePercent: 120,
    budgetAllocatedInr: 250000,
  },
  {
    id: 'scen-flood',
    name: 'Western Ghats & Wayanad Landslide Surge & Road Severance',
    category: 'FLOOD_INUNDATION',
    description: 'Torrential monsoon downpours trigger debris flow along Western Ghats arterial highways. Supply convoys delayed by 6-9 days. Contaminated surface wells trigger acute diarrheal and leptospirosis surge.',
    targetState: 'Kerala',
    targetDistrict: 'Wayanad',
    demandSurgePercent: {
      'med-ors': 220,
      'med-saline': 180,
      'med-amox': 90,
      'med-arv': 80,
    },
    supplyDelayDays: 7,
    patientFootfallSurgePercent: 150,
    budgetAllocatedInr: 400000,
  },
  {
    id: 'scen-heatwave',
    name: 'Northern Plains Severe Heatwave Warning (Loo Winds)',
    category: 'HEATWAVE_SURGE',
    description: 'Peak summer ambient temperatures exceed 46°C across Uttar Pradesh & Maharashtra. Heat exhaustion, dehydration, and elderly footfall increase dramatically.',
    demandSurgePercent: {
      'med-ors': 250,
      'med-saline': 190,
      'med-ins': 60,
    },
    supplyDelayDays: 2,
    patientFootfallSurgePercent: 90,
    budgetAllocatedInr: 180000,
  },
  {
    id: 'scen-warehouse',
    name: 'State Central Medical Depot Fire & Grid Failure',
    category: 'WAREHOUSE_FAILURE',
    description: 'Catastrophic cold-chain power interruption and warehouse structural disruption completely freezes outgoing shipments for 12 days across the region.',
    targetState: 'Maharashtra',
    demandSurgePercent: {
      'med-ins': 30,
      'med-arv': 30,
      'med-oxy': 40,
    },
    supplyDelayDays: 12,
    patientFootfallSurgePercent: 20,
    budgetAllocatedInr: 650000,
  },
];

export class SimulationEngine {
  static runSimulation(
    facilities: PHCFacility[],
    medicines: Medicine[],
    scenario: EmergencyScenario
  ): SimulationResult {
    // 1. Calculate Pre-Scenario Baseline
    let preCritical = 0;
    let preHigh = 0;
    let preStable = 0;
    let preStockouts = 0;
    let preTotalCoverageDays = 0;
    let preItemCount = 0;

    for (const f of facilities) {
      if (f.riskLevel === 'CRITICAL') preCritical++;
      else if (f.riskLevel === 'HIGH') preHigh++;
      else preStable++;

      for (const item of Object.values(f.inventory)) {
        preTotalCoverageDays += item.daysRemaining;
        preItemCount++;
        if (item.daysRemaining < 3) preStockouts++;
      }
    }

    const preAvgCoverage = Number((preTotalCoverageDays / Math.max(1, preItemCount)).toFixed(1));

    // 2. Compute Post-Scenario Impact
    let postCritical = 0;
    let postHigh = 0;
    let postStable = 0;
    let postStockouts = 0;
    let postTotalCoverageDays = 0;
    let postItemCount = 0;

    const districtImpactMap: Record<string, { state: string; criticalPhcs: number; deficits: Set<string>; preCrit: number }> = {};
    const medicineDeficitMap: Record<string, { totalUnits: number; affectedPhcs: number; name: string }> = {};

    // Initialize medicine deficit trackers
    for (const m of medicines) {
      medicineDeficitMap[m.id] = { totalUnits: 0, affectedPhcs: 0, name: m.name };
    }

    for (const f of facilities) {
      // Check if scenario targets specific state or applies nationally
      const isTargeted = !scenario.targetState || scenario.targetState === f.state;
      const effectiveDemandMultiplier = isTargeted
        ? 1 + (scenario.patientFootfallSurgePercent / 100) * 0.5
        : 1.0;
      const effectiveDelay = isTargeted ? scenario.supplyDelayDays : 0;

      let facilityMaxRisk: any = 'STABLE';
      const districtKey = f.district;
      if (!districtImpactMap[districtKey]) {
        districtImpactMap[districtKey] = {
          state: f.state,
          criticalPhcs: 0,
          deficits: new Set<string>(),
          preCrit: f.riskLevel === 'CRITICAL' ? 1 : 0,
        };
      } else if (f.riskLevel === 'CRITICAL') {
        districtImpactMap[districtKey].preCrit++;
      }

      for (const med of medicines) {
        const item = f.inventory[med.id];
        if (!item) continue;

        const surgePercent = isTargeted ? (scenario.demandSurgePercent[med.id] || 0) : 0;
        const medicineMultiplier = 1 + (surgePercent / 100);
        const combinedBurnRate = item.dailyConsumption * effectiveDemandMultiplier * medicineMultiplier;

        // Post simulated days remaining
        const simulatedDaysRemaining = Number((item.currentStock / Math.max(1, combinedBurnRate)).toFixed(1));
        const nextDeliverySimulated = item.nextScheduledDeliveryDays + effectiveDelay;

        postTotalCoverageDays += simulatedDaysRemaining;
        postItemCount++;

        if (simulatedDaysRemaining < 3.0 || simulatedDaysRemaining < nextDeliverySimulated * 0.6) {
          postStockouts++;
          const shortfall = Math.max(0, Math.round((nextDeliverySimulated - simulatedDaysRemaining) * combinedBurnRate));
          medicineDeficitMap[med.id].totalUnits += shortfall;
          medicineDeficitMap[med.id].affectedPhcs++;
          districtImpactMap[districtKey].deficits.add(med.name);

          if (simulatedDaysRemaining < 3.0) {
            facilityMaxRisk = 'CRITICAL';
          } else if (facilityMaxRisk !== 'CRITICAL') {
            facilityMaxRisk = 'HIGH';
          }
        } else if (simulatedDaysRemaining < med.criticalThresholdDays) {
          if (facilityMaxRisk === 'STABLE') facilityMaxRisk = 'HIGH';
        }
      }

      if (facilityMaxRisk === 'CRITICAL') {
        postCritical++;
        districtImpactMap[districtKey].criticalPhcs++;
      } else if (facilityMaxRisk === 'HIGH') {
        postHigh++;
      } else {
        postStable++;
      }
    }

    const postAvgCoverage = Number((postTotalCoverageDays / Math.max(1, postItemCount)).toFixed(1));

    // Format affected districts
    const affectedDistricts = Object.entries(districtImpactMap)
      .map(([district, data]) => ({
        district,
        state: data.state,
        criticalPhcs: data.criticalPhcs,
        deficitMedicines: Array.from(data.deficits),
        riskJump: data.criticalPhcs - data.preCrit,
      }))
      .filter(d => d.criticalPhcs > 0)
      .sort((a, b) => b.criticalPhcs - a.criticalPhcs);

    // Format top deficits
    const criticalDeficits = Object.values(medicineDeficitMap)
      .filter(d => d.totalUnits > 0)
      .map(d => ({
        medicineName: d.name,
        totalShortfallUnits: d.totalUnits,
        phcsAffected: d.affectedPhcs,
      }))
      .sort((a, b) => b.totalShortfallUnits - a.totalShortfallUnits);

    // Dynamic strategic recommendations
    const recommendedInterventions: string[] = [
      `Authorize emergency cross-district stock pooling from unaffected tertiary CHCs within a 90km radius.`,
      `Release ${scenario.budgetAllocatedInr ? `₹${(scenario.budgetAllocatedInr / 100000).toFixed(2)} Lakhs` : 'reserve funds'} from National Health Mission State Contingency Corpus for express supply van hires.`,
      `Trigger priority manufacturer dispatch alerts for high-shortfall items (${criticalDeficits.slice(0, 2).map(d => d.medicineName).join(', ')}).`,
      `Institute daily digital telemetry check-ins at 08:00 IST for ${postCritical} projected critical facilities.`,
    ];

    const estimatedMitigationCostInr = Math.round(
      criticalDeficits.reduce((sum, d) => sum + d.totalShortfallUnits * 14, 0) + (affectedDistricts.length * 12500)
    );

    return {
      scenarioName: scenario.name,
      preScenario: {
        criticalFacilitiesCount: preCritical,
        highRiskFacilitiesCount: preHigh,
        stableFacilitiesCount: preStable,
        averageDaysCoverage: preAvgCoverage,
        potentialStockoutsCount: preStockouts,
      },
      postScenario: {
        criticalFacilitiesCount: postCritical,
        highRiskFacilitiesCount: postHigh,
        stableFacilitiesCount: postStable,
        averageDaysCoverage: postAvgCoverage,
        potentialStockoutsCount: postStockouts,
      },
      affectedDistricts,
      criticalDeficits,
      recommendedInterventions,
      estimatedMitigationCostInr,
    };
  }
}
