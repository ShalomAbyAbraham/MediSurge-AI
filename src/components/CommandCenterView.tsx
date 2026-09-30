import React, { useState, useMemo } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { PHCFacility, RiskLevel } from '../types';
import { STATES_AND_DISTRICTS } from '../services/data/seedData';
import { I18N_DICTIONARY } from '../services/i18n';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  MapPin,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Hospital,
  Truck,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Entire India Sovereign Boundary Silhouette (Lat, Lng)
const INDIA_NATIONAL_OUTLINE: [number, number][] = [
  // 1. Northern Crown: Jammu & Kashmir / Ladakh
  [37.1, 74.8], [36.9, 75.5], [36.0, 76.8], [35.5, 77.8], [34.8, 78.9],
  [34.3, 79.3], [33.2, 79.1], [32.6, 78.7],
  // 2. Himachal / Uttarakhand / Nepal Border
  [31.8, 78.6], [31.0, 78.1], [30.4, 79.8], [30.2, 80.8], [28.9, 80.1],
  [28.4, 81.3], [27.7, 82.5], [27.3, 83.8], [26.9, 85.0], [26.6, 86.8],
  [26.7, 88.1], [27.2, 88.8],
  // 3. Sikkim & Northeast / Assam / Arunachal Pradesh
  [27.9, 88.6], [28.0, 89.9], [27.3, 91.8], [27.9, 92.5], [28.6, 94.2],
  [29.3, 95.2], [28.2, 96.7], [27.8, 97.4], [27.1, 96.5], [26.3, 95.1],
  // 4. Nagaland / Manipur / Mizoram / Tripura (East border with Myanmar & Bangladesh)
  [25.6, 94.8], [24.3, 94.0], [23.1, 93.3], [21.9, 92.8], [22.8, 92.2],
  [23.8, 91.3], [24.5, 92.1], [25.1, 92.3], [25.2, 91.0], [25.8, 89.9],
  // 5. West Bengal Coast / Sundarbans
  [24.5, 88.5], [22.8, 88.8], [21.7, 88.1],
  // 6. Odisha Coast (Bay of Bengal)
  [21.5, 87.3], [20.7, 86.9], [19.8, 85.8], [19.2, 84.9],
  // 7. Andhra Pradesh Coast
  [18.2, 84.0], [17.7, 83.3], [16.5, 82.2], [15.8, 80.8], [14.0, 80.1],
  // 8. Tamil Nadu Coast & Southern Tip (Kanyakumari)
  [13.1, 80.3], [11.9, 79.8], [10.8, 79.8], [9.3, 79.1], [9.1, 78.3],
  [8.1, 77.5], // Southernmost tip
  // 9. Kerala Coast (Arabian Sea)
  [8.4, 76.9], [9.3, 76.5], [9.9, 76.2], [10.8, 76.0], [11.3, 75.8],
  [12.1, 75.1], [12.8, 74.9],
  // 10. Karnataka & Goa & Maharashtra Coast
  [14.2, 74.4], [15.2, 73.9], [16.0, 73.5], [17.0, 73.3], [18.9, 72.8],
  [19.8, 72.8],
  // 11. Gujarat Coast & Rann of Kutch
  [20.5, 72.8], [21.0, 72.1], [20.7, 70.7], [21.7, 69.4], [22.3, 69.0],
  [22.8, 70.2], [23.1, 68.6], [23.8, 68.2], [24.5, 68.8], [24.7, 71.1],
  // 12. Rajasthan Western Border
  [25.8, 70.3], [27.0, 70.5], [28.0, 72.0], [29.2, 73.1],
  // 13. Punjab & Jammu West Border back to Kashmir
  [30.2, 74.0], [31.6, 74.6], [32.4, 74.9], [33.5, 74.3], [34.7, 74.1],
  [35.8, 74.4], [37.1, 74.8]
];

// Authentic geographic boundary polygons for the 5 states (Lat, Lng)
const STATE_POLYGONS: Record<string, [number, number][]> = {
  'Uttar Pradesh': [
    [27.9, 77.4], [28.8, 78.1], [29.6, 77.6], [30.1, 77.9], [29.2, 79.2],
    [28.8, 80.1], [28.3, 81.3], [27.7, 82.3], [27.3, 83.7], [26.8, 84.4],
    [25.8, 84.7], [25.0, 83.3], [24.4, 83.1], [24.2, 82.8], [25.1, 81.7],
    [25.2, 80.3], [25.0, 79.4], [25.7, 78.5], [26.7, 78.7], [27.4, 77.6],
  ],
  Maharashtra: [
    [19.8, 72.8], [20.5, 72.9], [21.3, 73.8], [21.5, 75.2], [21.4, 77.0],
    [21.6, 78.9], [21.3, 80.1], [20.0, 80.5], [19.2, 79.8], [18.7, 79.2],
    [18.0, 77.4], [17.4, 76.0], [16.0, 74.4], [15.8, 73.8], [16.8, 73.3],
    [18.2, 72.9], [19.1, 72.8],
  ],
  Kerala: [
    [12.75, 74.9], [12.15, 75.25], [11.65, 75.6], [11.2, 75.8], [10.8, 75.95],
    [10.2, 76.15], [9.6, 76.35], [9.0, 76.55], [8.4, 76.9], [8.3, 77.1],
    [8.65, 77.25], [9.25, 77.15], [9.8, 77.2], [10.2, 77.1], [10.8, 76.75],
    [11.35, 76.5], [11.85, 76.15], [12.2, 75.75], [12.65, 75.2],
  ],
  Karnataka: [
    [15.2, 74.1], [15.8, 74.5], [16.8, 75.2], [17.5, 76.8], [17.4, 77.5],
    [16.2, 77.3], [15.1, 76.8], [14.0, 77.4], [13.2, 77.8], [12.7, 78.2],
    [12.0, 77.0], [11.8, 76.0], [12.2, 75.5], [12.8, 74.9], [13.5, 74.6],
    [14.3, 74.3],
  ],
  Odisha: [
    [22.4, 85.8], [22.2, 86.8], [21.6, 87.4], [20.8, 86.9], [19.9, 86.2],
    [19.3, 85.0], [18.2, 84.0], [18.8, 82.6], [19.7, 82.5], [20.6, 82.8],
    [21.8, 83.8], [22.3, 84.8],
  ],
};

export const CommandCenterView: React.FC = () => {
  const {
    currentUser,
    facilities,
    medicines,
    stats,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    setSelectedFacilityId,
    setActiveTab,
    currentLanguage,
    warehouses,
    transfers,
  } = useHealthSystem();

  const t = I18N_DICTIONARY[currentLanguage];

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [hoveredFacility, setHoveredFacility] = useState<PHCFacility | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Filter facilities based on State, District, Risk, Search
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (selectedState !== 'All' && f.state !== selectedState) return false;
      if (selectedDistrict !== 'All' && f.district !== selectedDistrict) return false;
      if (riskFilter !== 'ALL' && f.riskLevel !== riskFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchCode = f.code.toLowerCase().includes(q);
        const matchDistrict = f.district.toLowerCase().includes(q);
        const matchState = f.state.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDistrict && !matchState) return false;
      }
      return true;
    });
  }, [facilities, selectedState, selectedDistrict, riskFilter, searchQuery]);

  const availableDistricts = useMemo(() => {
    if (selectedState === 'All') return [];
    return STATES_AND_DISTRICTS[selectedState]?.districts || [];
  }, [selectedState]);

  const handleFacilityClick = (fac: PHCFacility) => {
    setSelectedFacilityId(fac.id);
    setActiveTab('facility-detail');
  };

  // Adaptive Geospatial Bounds & Zoom for Calibrated Mapping
  const mapBounds = useMemo(() => {
    // 1. District Zoom (When a specific district is active)
    if (selectedDistrict !== 'All') {
      const districtFacs = facilities.filter(f => f.district === selectedDistrict);
      if (districtFacs.length > 0) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        districtFacs.forEach(f => {
          if (f.coordinates.lat < minLat) minLat = f.coordinates.lat;
          if (f.coordinates.lat > maxLat) maxLat = f.coordinates.lat;
          if (f.coordinates.lng < minLng) minLng = f.coordinates.lng;
          if (f.coordinates.lng > maxLng) maxLng = f.coordinates.lng;
        });
        // Include warehouse in that district if present
        warehouses.filter(w => w.district === selectedDistrict).forEach(w => {
          if (w.coordinates.lat < minLat) minLat = w.coordinates.lat;
          if (w.coordinates.lat > maxLat) maxLat = w.coordinates.lat;
          if (w.coordinates.lng < minLng) minLng = w.coordinates.lng;
          if (w.coordinates.lng > maxLng) maxLng = w.coordinates.lng;
        });
        const padLat = Math.max(0.12, (maxLat - minLat) * 0.35);
        const padLng = Math.max(0.15, (maxLng - minLng) * 0.35);
        return {
          minLat: minLat - padLat,
          maxLat: maxLat + padLat,
          minLng: minLng - padLng,
          maxLng: maxLng + padLng,
          mode: 'DISTRICT' as const,
        };
      }
    }

    // 2. State Zoom (When a specific state is active)
    if (selectedState !== 'All') {
      const stateBounds: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
        'Uttar Pradesh': { minLat: 23.8, maxLat: 28.5, minLng: 79.0, maxLng: 85.0 },
        Maharashtra: { minLat: 15.6, maxLat: 21.6, minLng: 72.6, maxLng: 77.6 },
        Kerala: { minLat: 8.25, maxLat: 11.95, minLng: 75.35, maxLng: 77.15 },
        Karnataka: { minLat: 11.5, maxLat: 15.0, minLng: 74.0, maxLng: 78.4 },
        Odisha: { minLat: 18.8, maxLat: 22.6, minLng: 83.8, maxLng: 87.8 },
      };
      if (stateBounds[selectedState]) {
        return { ...stateBounds[selectedState], mode: 'STATE' as const };
      }
    }

    // 3. National Panoramic View (Full India bounds)
    return {
      minLat: 7.2,
      maxLat: 37.5,
      minLng: 67.5,
      maxLng: 97.8,
      mode: 'NATIONAL' as const,
    };
  }, [selectedState, selectedDistrict, facilities, warehouses]);

  // Convert Lat/Lng to SVG Map Coordinates with isometric aspect ratio preservation
  const mapCoordinates = (lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng, mode } = mapBounds;
    const midLat = (minLat + maxLat) / 2;
    const cosLat = Math.cos((midLat * Math.PI) / 180);

    const geoWidth = Math.max(0.05, (maxLng - minLng) * cosLat);
    const geoHeight = Math.max(0.05, maxLat - minLat);

    const canvasW = 760;
    const canvasH = 560;

    const padX = mode === 'DISTRICT' ? 35 : mode === 'STATE' ? 25 : 20;
    const padY = mode === 'DISTRICT' ? 30 : mode === 'STATE' ? 20 : 20;
    const availW = canvasW - padX * 2;
    const availH = canvasH - padY * 2;

    const scale = Math.min(availW / geoWidth, availH / geoHeight);
    const actualW = geoWidth * scale;
    const actualH = geoHeight * scale;

    const offsetX = padX + (availW - actualW) / 2;
    const offsetY = padY + (availH - actualH) / 2;

    const x = offsetX + (lng - minLng) * cosLat * scale;
    const y = offsetY + (maxLat - lat) * scale;

    return {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
    };
  };

  const getPolygonPath = (coords: [number, number][]) => {
    return (
      coords
        .map((pt, i) => {
          const p = mapCoordinates(pt[0], pt[1]);
          return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
        })
        .join(' ') + ' Z'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: National Status Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.totalFacilities}</span>
            <Hospital className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {stats.totalFacilities}
            </span>
            <span className="text-xs text-slate-500">Across 5 States</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% active telemetry links</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
          <div className="flex items-center justify-between text-rose-300 text-xs font-medium">
            <span>{t.criticalRisk}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono tabular-nums">
              {stats.criticalCount}
            </span>
            <span className="text-xs text-rose-300/80">&lt; 3 days coverage</span>
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">Requires urgent redistribution</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>{t.highRisk}</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
              {stats.highRiskCount}
            </span>
            <span className="text-xs text-amber-300/80">3 - 6 days coverage</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">Pre-emptive replenishment queue</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.inTransitTransfers}</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">
              {stats.activeTransfersCount}
            </span>
            <span className="text-xs text-slate-500">Autonomous Reallocation</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero stock-out zero loss goal</p>
        </div>
      </div>

      {/* Drill-Down Hierarchy Bar: INDIA -> STATE -> DISTRICT -> PHC */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" /> Administrative Drill-Down:
          </span>

          {/* State Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">State:</span>
            <select
              value={selectedState}
              onChange={e => {
                setSelectedState(e.target.value);
                setSelectedDistrict('All');
              }}
              disabled={currentUser?.role === 'STATE_ADMIN' || currentUser?.role === 'DISTRICT_OFFICER'}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs disabled:opacity-80"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All States (National View)</option>
              {Object.keys(STATES_AND_DISTRICTS).map(s => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">
                  {s} {currentUser?.role === 'STATE_ADMIN' && currentUser.state === s ? '(Your State Jurisdiction)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">District:</span>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'All' || currentUser?.role === 'DISTRICT_OFFICER'}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs disabled:opacity-80"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Districts</option>
              {availableDistricts.map(d => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d} {currentUser?.role === 'DISTRICT_OFFICER' && currentUser.district === d ? '(Your District Jurisdiction)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Jurisdiction Scope Badge if restricted */}
          {currentUser?.role === 'DISTRICT_OFFICER' && (
            <span className="px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/40 text-[11px] font-mono text-teal-300">
              CMO Scoped: {currentUser.district}
            </span>
          )}
          {currentUser?.role === 'STATE_ADMIN' && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              State DHS Scoped: {currentUser.state}
            </span>
          )}

          {/* Risk Level Segmented Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                riskFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({filteredFacilities.length})
            </button>
            <button
              onClick={() => setRiskFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                riskFilter === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800/50' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Critical ({filteredFacilities.filter(f => f.riskLevel === 'CRITICAL').length})
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                riskFilter === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              High ({filteredFacilities.filter(f => f.riskLevel === 'HIGH').length})
            </button>
            <button
              onClick={() => setRiskFilter('STABLE')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                riskFilter === 'STABLE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Stable ({filteredFacilities.filter(f => f.riskLevel === 'STABLE').length})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search PHC code, name, district..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 placeholder:font-['Outfit'] placeholder:tracking-wide focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Places / Facility Risk Prioritization (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Map Section */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden h-[660px]">
          {/* Header with Title, Mode & Controls */}
          <div className="flex flex-col gap-2 pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <MapPin className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">Geospatial Health Network Grid</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {mapBounds.mode === 'DISTRICT'
                    ? `DISTRICT: ${selectedDistrict.toUpperCase()}`
                    : mapBounds.mode === 'STATE'
                    ? `STATE: ${selectedState.toUpperCase()}`
                    : 'PAN-INDIA FEDERATED GRID'}
                </span>
                {currentUser?.role === 'NATIONAL_ADMIN' && selectedState !== 'All' && (
                  <button
                    onClick={() => {
                      setSelectedState('All');
                      setSelectedDistrict('All');
                    }}
                    className="text-[10px] text-teal-400 hover:text-teal-300 underline cursor-pointer ml-1 font-semibold"
                  >
                    &larr; Back to National View
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Critical
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Attention
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stable
                </span>
              </div>
            </div>

            {/* Quick District Navigation Chips when a State is selected */}
            {selectedState !== 'All' && availableDistricts.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">District:</span>
                <button
                  onClick={() => setSelectedDistrict('All')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    selectedDistrict === 'All'
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  All {selectedState} ({facilities.filter(f => f.state === selectedState).length})
                </button>
                {availableDistricts.map(d => {
                  const count = facilities.filter(f => f.district === d).length;
                  const hasCrit = facilities.some(f => f.district === d && f.riskLevel === 'CRITICAL');
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDistrict(d)}
                      disabled={currentUser?.role === 'DISTRICT_OFFICER' && currentUser.district !== d}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                        selectedDistrict === d
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{d}</span>
                      <span className="text-[9px] opacity-80">({count})</span>
                      {hasCrit && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SVG Map Canvas: Enlarged graphic layout filling the section */}
          <div className="relative w-full flex-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <svg
              viewBox="0 0 760 560"
              className="w-full h-full object-contain pointer-events-auto"
            >
              {/* Entire India Sovereign Boundary Silhouette (National View Only) */}
              {mapBounds.mode === 'NATIONAL' && (
                <g className="pointer-events-none">
                  <path
                    d={getPolygonPath(INDIA_NATIONAL_OUTLINE)}
                    fill="#081420"
                    stroke="#1e3248"
                    strokeWidth="1.5"
                    className="drop-shadow-2xl"
                  />
                </g>
              )}

              {/* 5 Operating State Clusters Highlighted Inside India (National View Only) */}
              {mapBounds.mode === 'NATIONAL' && (
                <g>
                  {Object.entries(STATE_POLYGONS).map(([stName, coords]) => {
                    const center = STATES_AND_DISTRICTS[stName]?.center;
                    const pCenter = center ? mapCoordinates(center.lat, center.lng) : null;
                    const stFacCount = facilities.filter(f => f.state === stName).length;
                    const stCriticalCount = facilities.filter(f => f.state === stName && f.riskLevel === 'CRITICAL').length;
                    const stWhCount = warehouses.filter(w => w.state === stName).length;

                    return (
                      <g
                        key={stName}
                        className="cursor-pointer group"
                        onClick={() => {
                          setSelectedState(stName);
                          setSelectedDistrict('All');
                        }}
                      >
                        <path
                          d={getPolygonPath(coords)}
                          fill="#0e283d"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          className="transition-all duration-300 hover:fill-[#153e5e] hover:stroke-teal-300 filter drop-shadow-md"
                        />
                        <title>{`Operational State: ${stName} (${stFacCount} Centers · ${stWhCount} Warehouses) - Click to drill down`}</title>

                        {/* Centroid State Label & Operational Metrics Badge */}
                        {pCenter && (
                          <g className="pointer-events-none select-none">
                            <rect
                              x={pCenter.x - 50}
                              y={pCenter.y - 18}
                              width="100"
                              height="36"
                              rx="6"
                              fill="#030c17ee"
                              stroke={stCriticalCount > 0 ? '#f43f5e99' : '#14b8a699'}
                              strokeWidth="1.2"
                              className="backdrop-blur-sm"
                            />
                            <text
                              x={pCenter.x}
                              y={pCenter.y - 4}
                              textAnchor="middle"
                              fill="#5eead4"
                              fontSize="10"
                              fontWeight="800"
                              letterSpacing="0.05em"
                              className="uppercase font-mono"
                            >
                              {stName}
                            </text>
                            <text
                              x={pCenter.x}
                              y={pCenter.y + 11}
                              textAnchor="middle"
                              fill={stCriticalCount > 0 ? '#fca5a5' : '#94a3b8'}
                              fontSize="8"
                              fontWeight="600"
                              className="font-mono"
                            >
                              {stFacCount} PHCs · {stWhCount} Hubs {stCriticalCount > 0 ? `· ⚠️ ${stCriticalCount} Crit` : '· Active'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* State Territory Boundary Outline (State or District View) */}
              {mapBounds.mode !== 'NATIONAL' && STATE_POLYGONS[selectedState] && (
                <g>
                  <path
                    d={getPolygonPath(STATE_POLYGONS[selectedState])}
                    fill="#081e30"
                    stroke="#14b8a6"
                    strokeWidth={mapBounds.mode === 'DISTRICT' ? "1.8" : "2.5"}
                    strokeDasharray={mapBounds.mode === 'DISTRICT' ? "6 3" : undefined}
                    className="drop-shadow-2xl"
                  />
                </g>
              )}

              {/* Dynamic Active Transfer Vectors (Dispatched Corridors) */}
              {transfers
                .filter(t => t.status === 'APPROVED' || t.status === 'IN_TRANSIT')
                .map(tx => {
                  const src = facilities.find(f => f.id === tx.sourceFacilityId);
                  const dst = facilities.find(f => f.id === tx.destinationFacilityId);
                  if (!src || !dst) return null;
                  if (mapBounds.mode !== 'NATIONAL' && src.state !== selectedState && dst.state !== selectedState) return null;

                  const pSrc = mapCoordinates(src.coordinates.lat, src.coordinates.lng);
                  const pDst = mapCoordinates(dst.coordinates.lat, dst.coordinates.lng);
                  return (
                    <g key={tx.id} className="pointer-events-none">
                      <line
                        x1={pSrc.x}
                        y1={pSrc.y}
                        x2={pDst.x}
                        y2={pDst.y}
                        stroke="#14b8a6"
                        strokeWidth="2.5"
                        strokeDasharray="6 3"
                        className="animate-pulse"
                      />
                      <circle cx={pSrc.x} cy={pSrc.y} r="4" fill="#14b8a6" />
                      <circle cx={pDst.x} cy={pDst.y} r="4" fill="#06b6d4" />
                      {mapBounds.mode !== 'NATIONAL' && (
                        <text
                          x={(pSrc.x + pDst.x) / 2}
                          y={(pSrc.y + pDst.y) / 2 - 8}
                          textAnchor="middle"
                          fill="#2dd4bf"
                          fontSize="9.5"
                          fontWeight="700"
                          className="font-mono bg-slate-950 px-1"
                        >
                          ⚡ Active ({tx.quantity} units · {tx.transitHours}h)
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* Central Drug Warehouses (Rendered in State / District View Only) */}
              {mapBounds.mode !== 'NATIONAL' && warehouses
                .filter(wh => wh.state === selectedState && (selectedDistrict === 'All' || wh.district === selectedDistrict))
                .map(wh => {
                  const { x, y } = mapCoordinates(wh.coordinates.lat, wh.coordinates.lng);
                  return (
                    <g key={wh.id} className="cursor-pointer group">
                      <rect
                        x={x - 8}
                        y={y - 8}
                        width="16"
                        height="16"
                        transform={`rotate(45, ${x}, ${y})`}
                        fill="#06b6d4"
                        stroke="#083344"
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-125"
                      />
                      <circle cx={x} cy={y} r="2.5" fill="#ffffff" />
                      <title>{`${wh.name} (${wh.type})`}</title>
                      <g className="pointer-events-none select-none">
                        <rect
                          x={x - 44}
                          y={y + 12}
                          width="88"
                          height="14"
                          rx="3"
                          fill="#031526ee"
                          stroke="#06b6d4"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={y + 22}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="8.5"
                          fontWeight="800"
                          className="font-mono"
                        >
                          DEPOT: {wh.code}
                        </text>
                      </g>
                    </g>
                  );
                })}

              {/* PHC Facilities with Non-Crowding Clean Pins (Rendered in State / District View Only) */}
              {mapBounds.mode !== 'NATIONAL' && filteredFacilities.map((f, idx) => {
                const { x, y } = mapCoordinates(f.coordinates.lat, f.coordinates.lng);
                const isCritical = f.riskLevel === 'CRITICAL';
                const isHigh = f.riskLevel === 'HIGH';
                const isHero = f.id === 'phc-042';

                const color = isCritical ? '#f43f5e' : isHigh ? '#f59e0b' : '#10b981';
                const isTop = idx % 2 === 0;

                return (
                  <g
                    key={f.id}
                    onClick={() => handleFacilityClick(f)}
                    onMouseEnter={() => setHoveredFacility(f)}
                    onMouseLeave={() => setHoveredFacility(null)}
                    className="cursor-pointer transition-transform hover:scale-125 group"
                  >
                    {/* Critical Pulsing Ring */}
                    {isCritical && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="#f43f5e"
                        opacity="0.35"
                        className="animate-ping"
                      />
                    )}
                    {isHigh && (
                      <circle
                        cx={x}
                        cy={y}
                        r="11"
                        fill="#f59e0b"
                        opacity="0.25"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHero ? 7.5 : isCritical ? 6.5 : 5}
                      fill={color}
                      stroke={isHero ? '#ffffff' : '#0a1626'}
                      strokeWidth={isHero ? 2.5 : 1.5}
                    />

                    {/* In District Mode or For Critical Centers: Display Clean Non-Colliding Labels */}
                    {(mapBounds.mode === 'DISTRICT' || isCritical || isHero) && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={x - 42}
                          y={isTop ? y - 22 : y + 9}
                          width="84"
                          height="15"
                          rx="3"
                          fill="#030d1ae6"
                          stroke={isHero ? '#14b8a6' : isCritical ? '#f43f5e' : '#334155'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={isTop ? y - 11 : y + 20}
                          textAnchor="middle"
                          fill={isCritical ? '#fca5a5' : '#e2e8f0'}
                          fontSize="8.5"
                          fontWeight={isCritical || isHero ? '800' : '600'}
                          className="font-sans"
                        >
                          {f.name.replace(' PHC', '').replace(' CHC', '').replace(' Model', '')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredFacility && (
              <div
                className="absolute bottom-4 left-4 max-w-xs bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none z-30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white truncate">{hoveredFacility.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      hoveredFacility.riskLevel === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300'
                        : hoveredFacility.riskLevel === 'HIGH'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {hoveredFacility.riskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {hoveredFacility.district}, {hoveredFacility.state} · Code: {hoveredFacility.code}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Footfall</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {hoveredFacility.currentDailyFootfall} / day
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bed Occupancy</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {hoveredFacility.occupiedBeds}/{hoveredFacility.totalBeds} beds
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 text-[10px] text-teal-400 font-medium">
                  Click node to inspect clinical XAI & redistribution &rarr;
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute top-3 right-3 bg-slate-950/85 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 space-y-1 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45"></span> Depot
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 rounded-full bg-rose-500"></span> Critical (&lt; 3d)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 rounded-full bg-amber-500"></span> High (3 - 6d)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 rounded-full bg-emerald-500"></span> Stable (&gt; 6d)
              </div>
            </div>

            {/* National Mode Helper */}
            {mapBounds.mode === 'NATIONAL' && (
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Select <strong>Kerala</strong>, <strong>UP</strong>, or any state to inspect centers</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>
              {mapBounds.mode === 'NATIONAL'
                ? '5 Active Operating States · 100% Telemetry Links'
                : `Showing ${filteredFacilities.length} centers in ${selectedState} ${selectedDistrict !== 'All' ? `(${selectedDistrict})` : ''}`}
            </span>
            {selectedState === 'All' ? (
              <button
                onClick={() => {
                  setSelectedState('Kerala');
                  setSelectedDistrict('All');
                }}
                className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
              >
                Inspect Kerala State &rarr;
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedFacilityId('phc-042');
                  setActiveTab('facility-detail');
                }}
                className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Examine PHC-042 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Places / Facility Risk Prioritization */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[660px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Facility Risk Prioritization</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Sorted by imminent stock depletion hazards
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{filteredFacilities.length} centers</span>
          </div>

          {/* List of Facilities ("Places") */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredFacilities.map(fac => {
              const isHeroCrisis = fac.id === 'phc-042';
              const minDays = Math.min(...Object.values(fac.inventory).map(i => i.daysRemaining));

              return (
                <div
                  key={fac.id}
                  onClick={() => handleFacilityClick(fac)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isHeroCrisis
                      ? 'bg-rose-950/30 border-rose-700 hover:bg-rose-950/50 shadow-lg shadow-rose-950/40'
                      : fac.riskLevel === 'CRITICAL'
                      ? 'bg-slate-950 border-rose-900/60 hover:border-rose-700'
                      : fac.riskLevel === 'HIGH'
                      ? 'bg-slate-950 border-amber-900/60 hover:border-amber-700'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{fac.name}</span>
                        {isHeroCrisis && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-extrabold rounded uppercase tracking-wider animate-pulse">
                            Hero Target
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {fac.district}, {fac.state} · <span className="font-mono text-slate-500">{fac.code}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${
                          fac.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : fac.riskLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {fac.riskLevel}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Min: <span className="text-rose-400 font-bold">{minDays}d</span> left
                      </div>
                    </div>
                  </div>

                  {/* Targeted Callout for PHC-042 or Criticals */}
                  {isHeroCrisis && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-900/30 border border-rose-800/60 text-[11px] text-rose-200">
                      <div className="flex items-center justify-between font-semibold">
                        <span>ORS Stock: 420 sachets</span>
                        <span className="text-rose-300 font-mono">Burn: 165/day (Spike)</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-rose-300/80">
                        <span>Depletion in 2.5 days</span>
                        <span className="text-amber-300">Next delivery: 9 days</span>
                      </div>
                    </div>
                  )}

                  {/* Footfall & Beds Bar */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-500" />
                      Footfall: <strong className="text-slate-300 font-mono">{fac.currentDailyFootfall}</strong>/day
                    </span>
                    <span className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1">
                      Diagnose Risk &rarr;
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredFacilities.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No facilities match the selected filters.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
