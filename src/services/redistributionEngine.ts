import { PHCFacility, Medicine, RedistributionOption, RedistributionTransfer, Warehouse } from '../types';

export interface SolverConstraints {
  maxDistanceKm: number;
  minimumReserveDays: number;
  budgetLimitInr: number;
  costPerKmInr: number;
  allowInterDistrict: boolean;
  priorityMedicineId?: string;
}

export const DEFAULT_CONSTRAINTS: SolverConstraints = {
  maxDistanceKm: 85,
  minimumReserveDays: 5,
  budgetLimitInr: 45000,
  costPerKmInr: 16,
  allowInterDistrict: true,
};

/**
 * Calculates geodesic distance between two coordinate pairs using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export class RedistributionEngine {
  /**
   * Generates candidate redistribution options for a critical facility and medicine
   */
  static solveForFacility(
    destFacility: PHCFacility,
    medicine: Medicine,
    allFacilities: PHCFacility[],
    warehouses: Warehouse[],
    constraints: SolverConstraints = DEFAULT_CONSTRAINTS
  ): RedistributionOption[] {
    const destItem = destFacility.inventory[medicine.id];
    if (!destItem) return [];

    const dailyDemand = destItem.dailyConsumption;
    // Calculate target resupply to reach a healthy 14-day stock cushion
    const targetDays = 14;
    const requiredUnits = Math.max(
      10,
      Math.round((targetDays - destItem.daysRemaining) * dailyDemand)
    );

    // 1. Scan candidate donor facilities
    interface CandidateDonor {
      facility: PHCFacility;
      distanceKm: number;
      availableSurplus: number;
      currentStock: number;
      safeStockPostTransfer: number;
      transitHours: number;
    }

    const candidateDonors: CandidateDonor[] = [];

    for (const f of allFacilities) {
      if (f.id === destFacility.id) continue;
      if (!constraints.allowInterDistrict && f.district !== destFacility.district) continue;
      // Must be in same state or adjacent
      if (f.state !== destFacility.state) continue;

      const item = f.inventory[medicine.id];
      if (!item) continue;

      const dist = calculateHaversineDistanceKm(
        destFacility.coordinates.lat,
        destFacility.coordinates.lng,
        f.coordinates.lat,
        f.coordinates.lng
      );

      if (dist > constraints.maxDistanceKm) continue;

      // Ensure donor maintains at least minimumReserveDays
      const donorSafetyReserve = item.dailyConsumption * constraints.minimumReserveDays;
      const surplus = Math.max(0, item.currentStock - donorSafetyReserve);

      if (surplus > 15) {
        // Average rural/district road speed in India: ~38 km/h
        const transitHours = Number((dist / 38).toFixed(1));
        candidateDonors.push({
          facility: f,
          distanceKm: dist,
          availableSurplus: surplus,
          currentStock: item.currentStock,
          safeStockPostTransfer: item.currentStock - surplus,
          transitHours,
        });
      }
    }

    // Sort by distance (proximity)
    const proximityDonors = [...candidateDonors].sort((a, b) => a.distanceKm - b.distanceKm);
    // Sort by surplus volume (large donors)
    const volumeDonors = [...candidateDonors].sort((a, b) => b.availableSurplus - a.availableSurplus);

    const options: RedistributionOption[] = [];

    // OPTION 1: Rapid Proximity Dispatch (nearest facilities, quick transit)
    if (proximityDonors.length > 0) {
      let accumulatedUnits = 0;
      let totalCost = 0;
      let sumDistance = 0;
      const transfers: Omit<RedistributionTransfer, 'id' | 'status' | 'createdTimestamp'>[] = [];

      for (const donor of proximityDonors) {
        if (accumulatedUnits >= requiredUnits) break;
        const take = Math.min(requiredUnits - accumulatedUnits, donor.availableSurplus);
        if (take <= 0) continue;

        const estCost = Math.round(donor.distanceKm * constraints.costPerKmInr + 350); // flat loading charge
        if (totalCost + estCost > constraints.budgetLimitInr) continue;

        accumulatedUnits += take;
        totalCost += estCost;
        sumDistance += donor.distanceKm;

        const postDays = Number(((destItem.currentStock + accumulatedUnits) / dailyDemand).toFixed(1));
        const donorPostStock = donor.currentStock - take;

        const isSameDistrict = donor.facility.district === destFacility.district;
        const isSameState = donor.facility.state === destFacility.state;
        const jLevel = isSameDistrict ? 'INTRA_DISTRICT' : isSameState ? 'INTER_DISTRICT' : 'INTER_STATE';
        const reqRole = isSameDistrict ? 'DISTRICT_OFFICER' : isSameState ? 'STATE_ADMIN' : 'NATIONAL_ADMIN';

        transfers.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          sourceFacilityId: donor.facility.id,
          sourceFacilityName: donor.facility.name,
          destinationFacilityId: destFacility.id,
          destinationFacilityName: destFacility.name,
          quantity: take,
          distanceKm: donor.distanceKm,
          transitHours: donor.transitHours,
          estimatedCostInr: estCost,
          sourcePreStock: donor.currentStock,
          sourcePostStock: donorPostStock,
          destPreDaysRemaining: destItem.daysRemaining,
          destPostDaysRemaining: postDays,
          priorityScore: 92,
          reason: `Fastest physical arrival (${donor.transitHours} hrs via SH route) while keeping donor at ${donor.facility.name} with ${constraints.minimumReserveDays}+ days safe reserve.`,
          jurisdictionLevel: jLevel,
          requiredRole: reqRole,
        });
      }

      if (transfers.length > 0) {
        const avgDist = Number((sumDistance / transfers.length).toFixed(1));
        const finalCoverageDays = transfers[transfers.length - 1].destPostDaysRemaining;
        const optionJurisdiction = transfers.some(t => t.jurisdictionLevel === 'INTER_STATE')
          ? 'INTER_STATE'
          : transfers.some(t => t.jurisdictionLevel === 'INTER_DISTRICT')
          ? 'INTER_DISTRICT'
          : 'INTRA_DISTRICT';
        const optionRole = optionJurisdiction === 'INTER_STATE'
          ? 'NATIONAL_ADMIN'
          : optionJurisdiction === 'INTER_DISTRICT'
          ? 'STATE_ADMIN'
          : 'DISTRICT_OFFICER';

        options.push({
          id: 'opt-rapid-proximity',
          title: 'Option A: Rapid Peer Proximity Dispatch (Fastest ETA)',
          description: `Draws stock from closest adjacent facilities (${transfers.map(t => t.sourceFacilityName).slice(0, 2).join(', ')}). Prioritizes emergency arrival time.`,
          jurisdictionLevel: optionJurisdiction,
          requiredRole: optionRole,
          transfers,
          totalCostInr: totalCost,
          averageDistanceKm: avgDist,
          facilitiesRescuedCount: 1,
          resilienceScoreGain: Math.min(45, Math.round((finalCoverageDays - destItem.daysRemaining) * 4)),
          tradeOffSummary: `Arrival in ~${transfers[0].transitHours} hrs. Consolidates smaller batches from ${transfers.length} neighboring centers.`,
        });
      }
    }

    // OPTION 2: Consolidated Regional Transfer (Single or few large donors)
    if (volumeDonors.length > 0) {
      let accumulatedUnits = 0;
      let totalCost = 0;
      let sumDistance = 0;
      const transfers: Omit<RedistributionTransfer, 'id' | 'status' | 'createdTimestamp'>[] = [];

      for (const donor of volumeDonors) {
        if (accumulatedUnits >= requiredUnits) break;
        // Take up to 70% of available surplus to leave high margin
        const take = Math.min(requiredUnits - accumulatedUnits, Math.round(donor.availableSurplus * 0.75));
        if (take <= 0) continue;

        const estCost = Math.round(donor.distanceKm * constraints.costPerKmInr + 500);
        if (totalCost + estCost > constraints.budgetLimitInr) continue;

        accumulatedUnits += take;
        totalCost += estCost;
        sumDistance += donor.distanceKm;

        const postDays = Number(((destItem.currentStock + accumulatedUnits) / dailyDemand).toFixed(1));
        const donorPostStock = donor.currentStock - take;

        const isSameDistrict = donor.facility.district === destFacility.district;
        const isSameState = donor.facility.state === destFacility.state;
        const jLevel = isSameDistrict ? 'INTRA_DISTRICT' : isSameState ? 'INTER_DISTRICT' : 'INTER_STATE';
        const reqRole = isSameDistrict ? 'DISTRICT_OFFICER' : isSameState ? 'STATE_ADMIN' : 'NATIONAL_ADMIN';

        transfers.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          sourceFacilityId: donor.facility.id,
          sourceFacilityName: donor.facility.name,
          destinationFacilityId: destFacility.id,
          destinationFacilityName: destFacility.name,
          quantity: take,
          distanceKm: donor.distanceKm,
          transitHours: donor.transitHours,
          estimatedCostInr: estCost,
          sourcePreStock: donor.currentStock,
          sourcePostStock: donorPostStock,
          destPreDaysRemaining: destItem.daysRemaining,
          destPostDaysRemaining: postDays,
          priorityScore: 86,
          reason: `High buffer capacity donor with deep inventory surplus (${donor.currentStock} units). Single shipment logistics.`,
          jurisdictionLevel: jLevel,
          requiredRole: reqRole,
        });
      }

      if (transfers.length > 0) {
        const avgDist = Number((sumDistance / transfers.length).toFixed(1));
        const finalCoverageDays = transfers[transfers.length - 1].destPostDaysRemaining;
        const optionJurisdiction = transfers.some(t => t.jurisdictionLevel === 'INTER_STATE')
          ? 'INTER_STATE'
          : transfers.some(t => t.jurisdictionLevel === 'INTER_DISTRICT')
          ? 'INTER_DISTRICT'
          : 'INTRA_DISTRICT';
        const optionRole = optionJurisdiction === 'INTER_STATE'
          ? 'NATIONAL_ADMIN'
          : optionJurisdiction === 'INTER_DISTRICT'
          ? 'STATE_ADMIN'
          : 'DISTRICT_OFFICER';

        options.push({
          id: 'opt-volume-balance',
          title: 'Option B: Bulk Consolidated Transfer (Lowest Operational Overhead)',
          description: `Draws from higher tier CHC/district centers with massive reserve cushions, reducing multi-trip transport complexity.`,
          jurisdictionLevel: optionJurisdiction,
          requiredRole: optionRole,
          transfers,
          totalCostInr: totalCost,
          averageDistanceKm: avgDist,
          facilitiesRescuedCount: 1,
          resilienceScoreGain: Math.min(48, Math.round((finalCoverageDays - destItem.daysRemaining) * 4.2)),
          tradeOffSummary: `Single supply run. Slightly longer transit (~${transfers[0].transitHours} hrs), but zero strain on rural PHC donors.`,
        });
      }
    }

    // OPTION 3: Warehouse Emergency Reallocation
    const stateWarehouse = warehouses.find(w => w.state === destFacility.state) || warehouses[0];
    if (stateWarehouse) {
      const whDist = calculateHaversineDistanceKm(
        destFacility.coordinates.lat,
        destFacility.coordinates.lng,
        stateWarehouse.coordinates.lat,
        stateWarehouse.coordinates.lng
      );
      const whCost = Math.round(whDist * constraints.costPerKmInr + 1200);
      const fullReplenish = requiredUnits;
      const postDays = Number(((destItem.currentStock + fullReplenish) / dailyDemand).toFixed(1));

      options.push({
        id: 'opt-warehouse-emergency',
        title: 'Option C: State Central Medical Depot Special Dispatch',
        description: `Direct emergency convoy dispatched from ${stateWarehouse.name}. Preserves all local PHC buffers.`,
        jurisdictionLevel: 'INTER_DISTRICT',
        requiredRole: 'STATE_ADMIN',
        transfers: [
          {
            medicineId: medicine.id,
            medicineName: medicine.name,
            sourceFacilityId: stateWarehouse.id,
            sourceFacilityName: stateWarehouse.name,
            destinationFacilityId: destFacility.id,
            destinationFacilityName: destFacility.name,
            quantity: fullReplenish,
            distanceKm: whDist,
            transitHours: Number((whDist / 42).toFixed(1)),
            estimatedCostInr: whCost,
            sourcePreStock: 25000,
            sourcePostStock: 25000 - fullReplenish,
            destPreDaysRemaining: destItem.daysRemaining,
            destPostDaysRemaining: postDays,
            priorityScore: 78,
            reason: `Central state contingency reserve deployment. Independent of district-level peer transfers.`,
            jurisdictionLevel: 'INTER_DISTRICT',
            requiredRole: 'STATE_ADMIN',
          },
        ],
        totalCostInr: whCost,
        averageDistanceKm: whDist,
        facilitiesRescuedCount: 1,
        resilienceScoreGain: 52,
        tradeOffSummary: `Highest absolute coverage gain (+${(postDays - destItem.daysRemaining).toFixed(1)} days), but takes ~${(whDist / 42).toFixed(1)} hrs highway transit.`,
      });
    }

    return options;
  }
}
