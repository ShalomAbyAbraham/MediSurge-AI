import { Medicine, PHCFacility, Warehouse, IncidentReport } from '../../types';

export const ESSENTIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-ors',
    name: 'Oral Rehydration Salts (ORS)',
    genericName: 'Oral Rehydration Salts IP (WHO Formula)',
    category: 'ESSENTIAL_DRUG',
    dosageForm: 'Sachet (20.5g)',
    unit: 'sachets',
    criticalThresholdDays: 5,
    shelfLifeMonths: 24,
    temperatureControlled: false,
    unitCostInr: 6.5,
  },
  {
    id: 'med-pcm',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol IP',
    category: 'ESSENTIAL_DRUG',
    dosageForm: 'Tablet',
    unit: 'strips (10 tabs)',
    criticalThresholdDays: 7,
    shelfLifeMonths: 36,
    temperatureControlled: false,
    unitCostInr: 12.0,
  },
  {
    id: 'med-amox',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate IP',
    category: 'ANTIBIOTIC',
    dosageForm: 'Capsule',
    unit: 'strips (10 caps)',
    criticalThresholdDays: 6,
    shelfLifeMonths: 24,
    temperatureControlled: false,
    unitCostInr: 45.0,
  },
  {
    id: 'med-ins',
    name: 'Regular Human Insulin 40IU',
    genericName: 'Recombinant Human Insulin 40 IU/ml',
    category: 'ESSENTIAL_DRUG',
    dosageForm: 'Vial (10ml)',
    unit: 'vials',
    criticalThresholdDays: 10,
    shelfLifeMonths: 18,
    temperatureControlled: true,
    unitCostInr: 140.0,
  },
  {
    id: 'med-arv',
    name: 'Anti-Rabies Vaccine (ARV)',
    genericName: 'Purified Chick Embryo Cell Rabies Vaccine',
    category: 'VACCINE',
    dosageForm: 'Vial + Diluent',
    unit: 'doses',
    criticalThresholdDays: 8,
    shelfLifeMonths: 24,
    temperatureControlled: true,
    unitCostInr: 320.0,
  },
  {
    id: 'med-saline',
    name: 'Normal Saline 0.9% IV 500ml',
    genericName: 'Sodium Chloride 0.9% w/v IV Infusion',
    category: 'IV_FLUID',
    dosageForm: 'Bottle (500ml)',
    unit: 'bottles',
    criticalThresholdDays: 5,
    shelfLifeMonths: 36,
    temperatureControlled: false,
    unitCostInr: 35.0,
  },
  {
    id: 'med-artem',
    name: 'Artemether + Lumefantrine',
    genericName: 'Artemether 20mg + Lumefantrine 120mg (ACT)',
    category: 'ESSENTIAL_DRUG',
    dosageForm: 'Tablet',
    unit: 'blister packs',
    criticalThresholdDays: 7,
    shelfLifeMonths: 24,
    temperatureControlled: false,
    unitCostInr: 68.0,
  },
  {
    id: 'med-met',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride Prolonged Release IP',
    category: 'ESSENTIAL_DRUG',
    dosageForm: 'Tablet',
    unit: 'strips (10 tabs)',
    criticalThresholdDays: 7,
    shelfLifeMonths: 36,
    temperatureControlled: false,
    unitCostInr: 18.0,
  },
  {
    id: 'med-ifa',
    name: 'Iron & Folic Acid (IFA Large)',
    genericName: 'Dried Ferrous Sulphate 100mg + Folic Acid 0.5mg',
    category: 'MATERNAL_HEALTH',
    dosageForm: 'Coated Tablet',
    unit: 'bottles (100 tabs)',
    criticalThresholdDays: 12,
    shelfLifeMonths: 36,
    temperatureControlled: false,
    unitCostInr: 28.0,
  },
  {
    id: 'med-oxy',
    name: 'Oxytocin Injection 10 IU/ml',
    genericName: 'Oxytocin IP Synthetic',
    category: 'MATERNAL_HEALTH',
    dosageForm: 'Ampoule (1ml)',
    unit: 'ampoules',
    criticalThresholdDays: 6,
    shelfLifeMonths: 24,
    temperatureControlled: true,
    unitCostInr: 22.0,
  },
];

export const STATES_AND_DISTRICTS: Record<string, { name: string; center: { lat: number; lng: number }; districts: string[] }> = {
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    center: { lat: 26.8467, lng: 80.9462 },
    districts: ['Gorakhpur', 'Lucknow', 'Varanasi', 'Prayagraj'],
  },
  Maharashtra: {
    name: 'Maharashtra',
    center: { lat: 19.7515, lng: 75.7139 },
    districts: ['Pune', 'Satara', 'Nashik', 'Kolhapur'],
  },
  Kerala: {
    name: 'Kerala',
    center: { lat: 10.8505, lng: 76.2711 },
    districts: ['Ernakulam', 'Wayanad', 'Thiruvananthapuram', 'Kozhikode'],
  },
  Karnataka: {
    name: 'Karnataka',
    center: { lat: 14.5204, lng: 75.7224 },
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dakshina Kannada'],
  },
  Odisha: {
    name: 'Odisha',
    center: { lat: 20.9517, lng: 85.0985 },
    districts: ['Khordha', 'Cuttack', 'Puri', 'Mayurbhanj'],
  },
};

export const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-up-gkp',
    name: 'Gorakhpur Regional Drug Warehouse (UPMSCL)',
    code: 'UPMSCL-GKP-01',
    type: 'DISTRICT_DRUG_WAREHOUSE',
    state: 'Uttar Pradesh',
    district: 'Gorakhpur',
    coordinates: { lat: 26.7606, lng: 83.3732 },
    capacityUtilization: 82,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 1,
  },
  {
    id: 'wh-up-central',
    name: 'UPMSCL State Central Depot Lucknow',
    code: 'UPMSCL-LKO-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    coordinates: { lat: 26.8467, lng: 80.9462 },
    capacityUtilization: 91,
    connectedPhcIds: [],
    status: 'CONGESTED',
    leadTimeDays: 3,
  },
  {
    id: 'wh-mh-central',
    name: 'Maharashtra State Central Medical Depot Pune',
    code: 'MSMS-PUN-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Maharashtra',
    district: 'Pune',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    capacityUtilization: 78,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 2,
  },
  {
    id: 'wh-kl-central',
    name: 'KMSCL Central Drug Warehouse Kochi (Ernakulam)',
    code: 'KMSCL-EKM-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Kerala',
    district: 'Ernakulam',
    coordinates: { lat: 9.9816, lng: 76.2999 },
    capacityUtilization: 84,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 2,
  },
  {
    id: 'wh-kl-tvm',
    name: 'KMSCL State Apex Warehouse Thiruvananthapuram',
    code: 'KMSCL-TVM-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    coordinates: { lat: 8.5241, lng: 76.9366 },
    capacityUtilization: 76,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 2,
  },
  {
    id: 'wh-ka-central',
    name: 'KSMSCL Apex Central Warehouse Bengaluru',
    code: 'KSMSCL-BLR-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    capacityUtilization: 79,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 2,
  },
  {
    id: 'wh-ka-mys',
    name: 'KSMSCL Regional Drug Depot Mysuru',
    code: 'KSMSCL-MYS-01',
    type: 'DISTRICT_DRUG_WAREHOUSE',
    state: 'Karnataka',
    district: 'Mysuru',
    coordinates: { lat: 12.2958, lng: 76.6394 },
    capacityUtilization: 72,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 1,
  },
  {
    id: 'wh-or-central',
    name: 'OSMCL Central Warehouse Bhubaneswar',
    code: 'OSMCL-BBI-01',
    type: 'STATE_CENTRAL_DEPOT',
    state: 'Odisha',
    district: 'Khordha',
    coordinates: { lat: 20.2961, lng: 85.8245 },
    capacityUtilization: 74,
    connectedPhcIds: [],
    status: 'OPERATIONAL',
    leadTimeDays: 2,
  },
];

// Generate 100 realistic PHCs spread across the 5 states and 20 districts
export function generateSeedFacilities(): PHCFacility[] {
  const facilities: PHCFacility[] = [];

  const districtProfiles: Record<string, { state: string; lat: number; lng: number; count: number; prefix: string }> = {
    // Maharashtra (22 PHCs)
    Pune: { state: 'Maharashtra', lat: 18.5204, lng: 73.8567, count: 6, prefix: 'MH-PUN' },
    Satara: { state: 'Maharashtra', lat: 17.6805, lng: 73.9997, count: 5, prefix: 'MH-SAT' },
    Nashik: { state: 'Maharashtra', lat: 19.9975, lng: 73.7898, count: 6, prefix: 'MH-NAS' },
    Kolhapur: { state: 'Maharashtra', lat: 16.7050, lng: 74.2433, count: 5, prefix: 'MH-KOL' },

    // Kerala (18 PHCs)
    Ernakulam: { state: 'Kerala', lat: 9.9816, lng: 76.2999, count: 5, prefix: 'KL-EKM' },
    Wayanad: { state: 'Kerala', lat: 11.6854, lng: 76.1320, count: 5, prefix: 'KL-WAY' },
    Thiruvananthapuram: { state: 'Kerala', lat: 8.5241, lng: 76.9366, count: 4, prefix: 'KL-TVM' },
    Kozhikode: { state: 'Kerala', lat: 11.2588, lng: 75.7804, count: 4, prefix: 'KL-KZD' },

    // Uttar Pradesh (25 PHCs) - Positioned so Gorakhpur facilities land on phc-041 to phc-046!
    Gorakhpur: { state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, count: 6, prefix: 'UP-GKP' },
    Lucknow: { state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, count: 7, prefix: 'UP-LKO' },
    Varanasi: { state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, count: 6, prefix: 'UP-VNS' },
    Prayagraj: { state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, count: 6, prefix: 'UP-PRY' },

    // Karnataka (18 PHCs)
    'Bengaluru Urban': { state: 'Karnataka', lat: 12.9716, lng: 77.5946, count: 5, prefix: 'KA-BLR' },
    'Bengaluru Rural': { state: 'Karnataka', lat: 13.2847, lng: 77.5583, count: 4, prefix: 'KA-BRU' },
    Mysuru: { state: 'Karnataka', lat: 12.2958, lng: 76.6394, count: 5, prefix: 'KA-MYS' },
    'Dakshina Kannada': { state: 'Karnataka', lat: 12.8703, lng: 74.8806, count: 4, prefix: 'KA-DKN' },

    // Odisha (17 PHCs)
    Khordha: { state: 'Odisha', lat: 20.1914, lng: 85.6200, count: 5, prefix: 'OR-KHD' },
    Cuttack: { state: 'Odisha', lat: 20.4625, lng: 85.8828, count: 4, prefix: 'OR-CTC' },
    Puri: { state: 'Odisha', lat: 19.8135, lng: 85.8312, count: 4, prefix: 'OR-PRI' },
    Mayurbhanj: { state: 'Odisha', lat: 21.9287, lng: 86.7416, count: 4, prefix: 'OR-MYB' },
  };

  const phcNamesByDistrict: Record<string, string[]> = {
    Pune: ['Khed PHC', 'Shirwal CHC', 'Bhor PHC', 'Baramati Taluk PHC', 'Junnar Rural PHC', 'Saswad Urban PHC'],
    Satara: ['Wai PHC', 'Karad North CHC', 'Patan Tribal PHC', 'Khandala PHC', 'Mahabaleshwar PHC'],
    Nashik: ['Dindori PHC', 'Igatpuri Hill PHC', 'Niphad Agro PHC', 'Trimbak PHC', 'Sinnar CHC', 'Yeola Rural PHC'],
    Kolhapur: ['Panhala PHC', 'Radhanagari PHC', 'Shirol Agro PHC', 'Kagal CHC', 'Gadhinglaj PHC'],

    Ernakulam: ['Aluva Model FHC', 'Angamaly CHC', 'Kothamangalam PHC', 'Paravur Coast PHC', 'Muvattupuzha CHC'],
    Wayanad: ['Meppadi Tea Estate PHC', 'Mananthavady CHC', 'Sulthan Bathery PHC', 'Vythiri Hill PHC', 'Kalpetta Model PHC'],
    Thiruvananthapuram: ['Nedumangad CHC', 'Neyyattinkara PHC', 'Varkala Coastal PHC', 'Kattakada Model PHC'],
    Kozhikode: ['Koyilandy CHC', 'Vatakara Coastal PHC', 'Thamarassery Ghats PHC', 'Feroke Industrial PHC'],

    Gorakhpur: ['Sahjanwa Industrial PHC', 'Pipraich Sugarbelt PHC', 'Bansgaon CHC', 'Campierganj Terai PHC', 'Chauri Chaura PHC', 'Khajni PHC'],
    Lucknow: ['Malihabad Mango Belt PHC', 'Bakshi Ka Talab CHC', 'Mohanlalganj PHC', 'Gosainganj PHC', 'Sarojini Nagar CHC', 'Kakori PHC', 'Chinhat Rural PHC'],
    Varanasi: ['Sarnath Cultural PHC', 'Pindra Rural CHC', 'Arajiline PHC', 'Kashi Ganga Coast PHC', 'Sewapuri PHC', 'Cholapur CHC'],
    Prayagraj: ['Phulpur Fertilizer PHC', 'Koraon Tribal CHC', 'Karchhana Riverine PHC', 'Shankargarh Stone PHC', 'Soraon PHC', 'Jasra CHC'],

    'Bengaluru Urban': ['Anekal Taluk PHC', 'Kengeri Model PHC', 'Yelahanka Urban PHC', 'Mahadevapura PHC', 'Bommanahalli Model PHC'],
    'Bengaluru Rural': ['Nelamangala CHC', 'Hoskote Agro PHC', 'Devanahalli Airport PHC', 'Doddaballapura CHC'],
    Mysuru: ['Nanjangud Rural PHC', 'T. Narasipura CHC', 'Hunsur Tribal PHC', 'Heggadadevankote Forest PHC', 'Periyapatna Model PHC'],
    'Dakshina Kannada': ['Bantwal Coastal CHC', 'Puttur Hill PHC', 'Belthangady Western Ghats PHC', 'Sullia Rubber Belt PHC'],

    Khordha: ['Jatni Railway PHC', 'Balianta Rural PHC', 'Banapur Coastal PHC', 'Begunia CHC', 'Khordha Town Model PHC'],
    Cuttack: ['Choudwar Industrial PHC', 'Banki Riverine CHC', 'Salepur Agro PHC', 'Athagarh Forest PHC'],
    Puri: ['Brahmagiri Chilika PHC', 'Konark Coastal CHC', 'Nimapara Agro PHC', 'Pipili Applique PHC'],
    Mayurbhanj: ['Baripada Tribal CHC', 'Rairangpur Forest PHC', 'Karanjia Plateau PHC', 'Udala Hill PHC'],
  };

  const specificCoordinates: Record<string, { lat: number; lng: number }> = {
    // Gorakhpur (UP)
    'Sahjanwa Industrial PHC': { lat: 26.7720, lng: 83.2180 },
    'Pipraich Sugarbelt PHC': { lat: 26.8310, lng: 83.5410 }, // PHC-042
    'Bansgaon CHC': { lat: 26.5620, lng: 83.3580 }, // PHC-043
    'Campierganj Terai PHC': { lat: 27.0210, lng: 83.3510 },
    'Chauri Chaura PHC': { lat: 26.6430, lng: 83.6120 },
    'Khajni PHC': { lat: 26.6210, lng: 83.1890 },

    // Ernakulam (Kerala) - spaced north to south and coast to hills
    'Aluva Model FHC': { lat: 10.1080, lng: 76.3570 },
    'Angamaly CHC': { lat: 10.1960, lng: 76.3860 },
    'Kothamangalam PHC': { lat: 10.0620, lng: 76.6250 },
    'Paravur Coast PHC': { lat: 10.1450, lng: 76.2280 },
    'Muvattupuzha CHC': { lat: 9.9890, lng: 76.5780 },

    // Wayanad (Kerala) - spread across hills
    'Meppadi Tea Estate PHC': { lat: 11.5540, lng: 76.1280 },
    'Mananthavady CHC': { lat: 11.8020, lng: 76.0040 },
    'Sulthan Bathery PHC': { lat: 11.6620, lng: 76.2570 },
    'Vythiri Hill PHC': { lat: 11.5510, lng: 76.0390 },
    'Kalpetta Model PHC': { lat: 11.6100, lng: 76.0830 },

    // Thiruvananthapuram (Kerala)
    'Nedumangad CHC': { lat: 8.6010, lng: 76.9990 },
    'Neyyattinkara PHC': { lat: 8.4010, lng: 77.0850 },
    'Varkala Coastal PHC': { lat: 8.7380, lng: 76.7160 },
    'Kattakada Model PHC': { lat: 8.5100, lng: 77.0800 },

    // Kozhikode (Kerala)
    'Koyilandy CHC': { lat: 11.4390, lng: 75.6960 },
    'Vatakara Coastal PHC': { lat: 11.6090, lng: 75.5920 },
    'Thamarassery Ghats PHC': { lat: 11.4180, lng: 75.9340 },
    'Feroke Industrial PHC': { lat: 11.1840, lng: 75.8360 },

    // Bengaluru Urban (Karnataka)
    'Anekal Taluk PHC': { lat: 12.7110, lng: 77.6960 },
    'Kengeri Model PHC': { lat: 12.9180, lng: 77.4830 },
    'Yelahanka Urban PHC': { lat: 13.1010, lng: 77.5960 },
    'Mahadevapura PHC': { lat: 12.9920, lng: 77.6930 },
    'Bommanahalli Model PHC': { lat: 12.9030, lng: 77.6250 },

    // Bengaluru Rural (Karnataka)
    'Nelamangala CHC': { lat: 13.0980, lng: 77.3890 },
    'Hoskote Agro PHC': { lat: 13.0710, lng: 77.7980 },
    'Devanahalli Airport PHC': { lat: 13.2480, lng: 77.7120 },
    'Doddaballapura CHC': { lat: 13.2930, lng: 77.5380 },

    // Mysuru (Karnataka)
    'Nanjangud Rural PHC': { lat: 12.1190, lng: 76.6820 },
    'T. Narasipura CHC': { lat: 12.2130, lng: 76.9060 },
    'Hunsur Tribal PHC': { lat: 12.3080, lng: 76.2910 },
    'Heggadadevankote Forest PHC': { lat: 11.9210, lng: 76.3290 },
    'Periyapatna Model PHC': { lat: 12.3410, lng: 76.0960 },
  };

  let globalIdCounter = 1;

  for (const [district, profile] of Object.entries(districtProfiles)) {
    const names = phcNamesByDistrict[district] || [];
    for (let i = 0; i < profile.count; i++) {
      const phcCodeNumber = String(globalIdCounter).padStart(3, '0');
      const facilityId = `phc-${phcCodeNumber}`;
      const name = names[i] || `${district} Sector ${i + 1} PHC`;
      
      // Use specific realistic town coordinates if defined, or wide district offset
      const coord = specificCoordinates[name] || {
        lat: profile.lat + (Math.sin(globalIdCounter * 3.7) * 0.16),
        lng: profile.lng + (Math.cos(globalIdCounter * 2.3) * 0.16),
      };

      // Seed realistic footfall & bed count
      const isChc = name.includes('CHC');
      const totalBeds = isChc ? 30 : 6;
      const avgFootfall = isChc ? 180 + (globalIdCounter % 40) : 65 + (globalIdCounter % 35);
      
      // Targeted Crisis PHCs:
      // PHC-042 (Pipraich Sugarbelt PHC, Gorakhpur) -> Acute ORS crisis!
      // PHC-043 (Bansgaon CHC, Gorakhpur) -> Surplus donor ready for peer transfer!
      // PHC-028 (Meppadi Tea Estate PHC, Wayanad) -> Landslide supply cutoff!
      // PHC-002 (Shirwal CHC, Pune) -> Pyrexia fever surge!
      const isTargetCrisisPHC = globalIdCounter === 42;
      const isDonorBansgaon = globalIdCounter === 43;
      const isHighRiskPHC = !isTargetCrisisPHC && !isDonorBansgaon && (globalIdCounter === 28 || globalIdCounter === 66 || (globalIdCounter % 9 === 0));
      const isModerateRiskPHC = !isTargetCrisisPHC && !isHighRiskPHC && !isDonorBansgaon && (globalIdCounter % 5 === 0);

      const footfallSurgeMultiplier = isTargetCrisisPHC ? 1.85 : isHighRiskPHC ? 1.35 : 1.0;
      const currentFootfall = Math.round(avgFootfall * footfallSurgeMultiplier);
      const occupiedBeds = Math.min(totalBeds, Math.round(totalBeds * (isTargetCrisisPHC ? 0.95 : isHighRiskPHC ? 0.75 : 0.45)));

      // Build inventory for 10 medicines
      const inventory: Record<string, any> = {};
      let maxMedicineRisk: any = 'STABLE';
      let compositeRiskScore = isTargetCrisisPHC ? 89 : isHighRiskPHC ? 68 : isModerateRiskPHC ? 42 : 16;

      for (const med of ESSENTIAL_MEDICINES) {
        let dailyRate = Math.round(avgFootfall * (med.id === 'med-ors' ? 0.45 : med.id === 'med-pcm' ? 0.6 : med.id === 'med-saline' ? 0.25 : 0.15));
        if (dailyRate < 4) dailyRate = 4;

        let daysRemaining: number;
        let nextDeliveryDays = 4 + (globalIdCounter % 7);

        // Targeted stress tests:
        if (isTargetCrisisPHC && med.id === 'med-ors') {
          // Hero pitch scenario:
          // ORS stock: 412, daily demand: 165 (acute outbreak), days remaining: 2.5, next delivery: 9 days!
          dailyRate = 165;
          daysRemaining = 2.5;
          nextDeliveryDays = 9;
        } else if (isDonorBansgaon && med.id === 'med-ors') {
          // Donor facility with plenty of ORS surplus:
          dailyRate = 30;
          daysRemaining = 28.3; // 850 sachets
        } else if (globalIdCounter === 28 && (med.id === 'med-arv' || med.id === 'med-saline')) {
          dailyRate = 18;
          daysRemaining = 1.9;
          nextDeliveryDays = 8;
        } else if (isHighRiskPHC && (med.id === 'med-pcm' || med.id === 'med-amox')) {
          daysRemaining = 3.2;
        } else if (isModerateRiskPHC && med.id === 'med-ins') {
          daysRemaining = 7.0;
        } else {
          // Stable PHCs have 14 - 35 days of stock
          daysRemaining = 14 + ((globalIdCounter * 3 + med.id.length * 5) % 24);
        }

        const currentStock = Math.round(dailyRate * daysRemaining);
        const minimumReserve = Math.round(dailyRate * 5); // 5 days safety reserve buffer

        let status: any = 'STABLE';
        if (daysRemaining < med.criticalThresholdDays) {
          status = daysRemaining < 3.0 ? 'CRITICAL' : 'HIGH';
          if (status === 'CRITICAL') maxMedicineRisk = 'CRITICAL';
          else if (maxMedicineRisk !== 'CRITICAL') maxMedicineRisk = 'HIGH';
        } else if (daysRemaining < med.criticalThresholdDays * 1.5) {
          status = 'MODERATE';
          if (maxMedicineRisk === 'STABLE') maxMedicineRisk = 'MODERATE';
        }

        inventory[med.id] = {
          medicineId: med.id,
          currentStock,
          dailyConsumption: dailyRate,
          minimumReserve,
          daysRemaining: Number(daysRemaining.toFixed(1)),
          predictedDemand7Days: Math.round(dailyRate * 7 * (isTargetCrisisPHC ? 1.3 : 1.05)),
          predictedDemand14Days: Math.round(dailyRate * 14 * (isTargetCrisisPHC ? 1.4 : 1.08)),
          nextScheduledDeliveryDays: nextDeliveryDays,
          status,
          batchNumber: `BAT-${med.id.slice(4).toUpperCase()}-${2026}${globalIdCounter}`,
          expiryDate: '2027-08-30',
        };
      }

      const assignedWarehouse = SEED_WAREHOUSES.find(w => w.state === profile.state) || SEED_WAREHOUSES[0];

      facilities.push({
        id: facilityId,
        name,
        code: `PHC-${profile.prefix}-${phcCodeNumber}`,
        state: profile.state,
        district,
        taluk: `${district} Rural`,
        coordinates: {
          lat: Number(coord.lat.toFixed(4)),
          lng: Number(coord.lng.toFixed(4)),
        },
        type: isChc ? 'CHC' : 'PHC',
        totalBeds,
        occupiedBeds,
        medicalOfficersCount: isChc ? 4 : 2,
        staffOnDuty: isChc ? 11 : 4,
        averageDailyFootfall: avgFootfall,
        currentDailyFootfall: currentFootfall,
        inventory,
        riskLevel: maxMedicineRisk,
        riskScore: compositeRiskScore,
        lastSyncTimestamp: '2026-09-28T03:45:00Z',
        assignedWarehouseId: assignedWarehouse.id,
        contactPerson: `Dr. ${['Kulkarni', 'Nair', 'Sharma', 'Patnaik', 'Gowda', 'Menon', 'Verma', 'Hegde'][globalIdCounter % 8]} (Medical Officer In-Charge)`,
        contactPhone: `+91 98${(76543210 + globalIdCounter).toString().slice(0, 8)}`,
        notes: globalIdCounter === 42 ? 'Surge in acute gastroenteritis cases following local water contamination' : undefined,
      });

      globalIdCounter++;
    }
  }

  return facilities;
}

export const SEED_INCIDENT_REPORTS: IncidentReport[] = [
  {
    id: 'inc-001',
    facilityId: 'phc-042',
    facilityName: 'Pipraich Sugarbelt PHC',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    timestamp: '2026-09-28T02:15:00Z',
    category: 'PATIENT_SURGE',
    severity: 'CRITICAL',
    title: 'Acute Waterborne Diarrhea Cluster in Ward 4',
    description: 'Footfall surged by 160% in past 48 hours following pipeline breach. ORS consumption spiked from 45 sachets/day to 165 sachets/day. Current inventory 412 sachets will deplete in under 2.5 days. Next central shipment delayed by 9 days due to regional depot backlog.',
    affectedMedicineIds: ['med-ors', 'med-saline', 'med-amox'],
    reportedBy: 'Dr. Sharma (MOIC)',
    status: 'OPEN',
  },
  {
    id: 'inc-002',
    facilityId: 'phc-028',
    facilityName: 'Meppadi Tea Estate PHC',
    district: 'Wayanad',
    state: 'Kerala',
    timestamp: '2026-09-27T19:40:00Z',
    category: 'FLOOD_WEATHER',
    severity: 'HIGH',
    title: 'Ghat Road Debris Blocking District Supply Van',
    description: 'Monsoon debris on NH-766 has isolated Meppadi sub-divisional stores. Cold-chain backup generator running on reserve diesel. ARV and Snake Antivenom critical.',
    affectedMedicineIds: ['med-arv', 'med-saline'],
    reportedBy: 'Dr. Nair (MOIC)',
    status: 'OPEN',
  },
  {
    id: 'inc-003',
    facilityId: 'phc-002',
    facilityName: 'Shirwal CHC',
    district: 'Pune',
    state: 'Maharashtra',
    timestamp: '2026-09-27T14:10:00Z',
    category: 'DISEASE_OUTBREAK',
    severity: 'MEDIUM',
    title: 'Seasonal Viral Pyrexia Influx',
    description: 'Pediatric viral fever cluster reported from 3 adjacent villages. Paracetamol 500mg and Pediatric suspension running low.',
    affectedMedicineIds: ['med-pcm'],
    reportedBy: 'Dr. Kulkarni (MOIC)',
    status: 'INVESTIGATING',
  },
  {
    id: 'inc-004',
    facilityId: 'phc-066',
    facilityName: 'Anekal Taluk PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    timestamp: '2026-09-26T16:20:00Z',
    category: 'PATIENT_SURGE',
    severity: 'HIGH',
    title: 'Industrial Corridor Viral Outbreak & Respiratory Surge',
    description: 'Inflow of factory workers with acute bronchitis and asthma symptoms. Salbutamol inhalers and Amoxicillin reaching minimum safety buffer.',
    affectedMedicineIds: ['med-amox', 'med-saline'],
    reportedBy: 'Dr. Gowda (MOIC)',
    status: 'OPEN',
  },
  {
    id: 'inc-005',
    facilityId: 'phc-097',
    facilityName: 'Baripada Tribal CHC',
    district: 'Mayurbhanj',
    state: 'Odisha',
    timestamp: '2026-09-26T10:30:00Z',
    category: 'SHIPMENT_DELAY',
    severity: 'MEDIUM',
    title: 'Scheduled Fortnightly Consignment Missed',
    description: 'OSMCL truck broke down near Keonjhar border. Metformin and IFA buffer stock sufficient for 6 days.',
    affectedMedicineIds: ['med-met', 'med-ifa'],
    reportedBy: 'Dr. Patnaik (MOIC)',
    status: 'DISPATCH_IN_TRANSIT',
    actionTaken: 'Secondary route dispatched from Cuttack sub-warehouse.',
  },
];
