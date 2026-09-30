/**
 * BigQuery Healthcare Analytical Warehouse Schemas & DDL
 * 
 * Production GCP Architecture:
 * - Dataset: `swasthyaflow_national_dw`
 * - Partitioning: TIMESTAMP / DATE partitions for real-time telemetry
 * - Clustering: `state_id`, `district_id`, `facility_id`
 */

export const BIGQUERY_TABLE_SCHEMAS = [
  {
    tableName: 'states',
    description: 'Master directory of Indian States and Union Territories with health administration codes',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.states\` (
  state_id STRING OPTIONS(description="ISO 3166-2:IN subcode"),
  state_name STRING,
  region STRING,
  nodal_officer_name STRING,
  emergency_helpline STRING,
  active_phcs_count INT64,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
) CLUSTER BY state_id;`,
  },
  {
    tableName: 'districts',
    description: 'District health administration zones with geographical centroids and drug warehouse IDs',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.districts\` (
  district_id STRING,
  state_id STRING,
  district_name STRING,
  latitude FLOAT64,
  longitude FLOAT64,
  chief_medical_officer STRING,
  assigned_warehouse_id STRING
) CLUSTER BY state_id, district_id;`,
  },
  {
    tableName: 'facilities',
    description: 'Primary Health Centres (PHC), Community Health Centres (CHC), and Sub-Centres',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.facilities\` (
  facility_id STRING,
  facility_code STRING,
  name STRING,
  facility_type STRING, -- 'PHC' | 'CHC' | 'SUB_CENTRE'
  state STRING,
  district STRING,
  taluk STRING,
  latitude FLOAT64,
  longitude FLOAT64,
  total_beds INT64,
  occupied_beds INT64,
  medical_officers_count INT64,
  staff_on_duty INT64,
  average_daily_footfall INT64,
  assigned_warehouse_id STRING,
  last_sync_timestamp TIMESTAMP
) PARTITION BY DATE(last_sync_timestamp) CLUSTER BY state, district, facility_id;`,
  },
  {
    tableName: 'medicines',
    description: 'National Essential Drugs List (EDL) / National Health Mission drug formulary',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.medicines\` (
  medicine_id STRING,
  brand_name STRING,
  generic_name STRING,
  category STRING, -- 'ESSENTIAL_DRUG' | 'VACCINE' | 'IV_FLUID' | 'MATERNAL_HEALTH' | 'ANTIBIOTIC'
  dosage_form STRING,
  unit STRING,
  critical_threshold_days INT64,
  shelf_life_months INT64,
  temperature_controlled BOOL,
  unit_cost_inr FLOAT64
) CLUSTER BY category, medicine_id;`,
  },
  {
    tableName: 'inventory',
    description: 'Current real-time stock balances, batch numbers, and days of coverage per PHC',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.inventory\` (
  facility_id STRING,
  medicine_id STRING,
  current_stock INT64,
  daily_consumption FLOAT64,
  minimum_reserve INT64,
  days_remaining FLOAT64,
  batch_number STRING,
  expiry_date DATE,
  risk_level STRING,
  snapshot_timestamp TIMESTAMP
) PARTITION BY DATE(snapshot_timestamp) CLUSTER BY facility_id, medicine_id;`,
  },
  {
    tableName: 'patient_demand',
    description: 'Time-series patient attendance and medicine dispensation velocity',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.patient_demand\` (
  event_id STRING,
  facility_id STRING,
  event_date DATE,
  patient_footfall INT64,
  inpatient_admissions INT64,
  outpatient_consultations INT64,
  medicine_id STRING,
  units_dispensed INT64
) PARTITION BY event_date CLUSTER BY facility_id, medicine_id;`,
  },
  {
    tableName: 'shipments',
    description: 'Supply chain transit shipments between central depots, district drug warehouses, and PHCs',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.shipments\` (
  shipment_id STRING,
  origin_warehouse_id STRING,
  destination_facility_id STRING,
  medicine_id STRING,
  quantity_dispatched INT64,
  dispatched_at TIMESTAMP,
  estimated_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  transit_status STRING, -- 'SCHEDULED' | 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED'
  carrier_details STRING
) PARTITION BY DATE(dispatched_at) CLUSTER BY destination_facility_id;`,
  },
  {
    tableName: 'predictions',
    description: 'Vertex AI 14-day forward demand projections and stockout hazard dates',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.predictions\` (
  prediction_id STRING,
  facility_id STRING,
  medicine_id STRING,
  forecast_date DATE,
  predicted_daily_demand FLOAT64,
  p10_lower_bound FLOAT64,
  p90_upper_bound FLOAT64,
  projected_stockout_date DATE,
  model_version STRING,
  generated_at TIMESTAMP
) PARTITION BY forecast_date CLUSTER BY facility_id, medicine_id;`,
  },
  {
    tableName: 'risk_events',
    description: 'Telemetry alerts, flood notices, disease clusters, and cold-chain incidents',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.risk_events\` (
  event_id STRING,
  facility_id STRING,
  event_type STRING, -- 'PATIENT_SURGE' | 'SHIPMENT_DELAY' | 'COLD_CHAIN_FAIL'
  severity STRING,
  title STRING,
  description STRING,
  reported_at TIMESTAMP,
  resolved_at TIMESTAMP,
  status STRING
) PARTITION BY DATE(reported_at) CLUSTER BY facility_id;`,
  },
  {
    tableName: 'recommendations',
    description: 'Automated cross-district redistribution plans and human approval logs',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.recommendations\` (
  transfer_id STRING,
  source_facility_id STRING,
  destination_facility_id STRING,
  medicine_id STRING,
  transfer_quantity INT64,
  distance_km FLOAT64,
  estimated_transit_hours FLOAT64,
  estimated_cost_inr FLOAT64,
  status STRING, -- 'PROPOSED' | 'APPROVED' | 'IN_TRANSIT' | 'DELIVERED'
  approved_by STRING,
  approved_at TIMESTAMP
) PARTITION BY DATE(approved_at) CLUSTER BY destination_facility_id;`,
  },
  {
    tableName: 'simulation_runs',
    description: 'Records of "What If?" emergency scenario runs and policy stress-tests',
    ddl: `CREATE TABLE IF NOT EXISTS \`swasthyaflow_national_dw.simulation_runs\` (
  simulation_id STRING,
  scenario_name STRING,
  scenario_category STRING,
  target_state STRING,
  pre_critical_facilities INT64,
  post_critical_facilities INT64,
  estimated_mitigation_cost_inr FLOAT64,
  simulated_at TIMESTAMP,
  simulated_by_role STRING
) PARTITION BY DATE(simulated_at);`,
  },
];

export const SAMPLE_ANALYTICAL_SQL = `-- Query 1: Top 10 High-Velocity Stockout Risks across All States
SELECT 
  f.state,
  f.district,
  f.name AS facility_name,
  m.brand_name AS medicine_name,
  inv.current_stock,
  inv.daily_consumption,
  ROUND(inv.days_remaining, 1) AS days_remaining,
  pred.projected_stockout_date,
  pred.p90_upper_bound AS surge_demand
FROM \`swasthyaflow_national_dw.inventory\` inv
JOIN \`swasthyaflow_national_dw.facilities\` f ON inv.facility_id = f.facility_id
JOIN \`swasthyaflow_national_dw.medicines\` m ON inv.medicine_id = m.medicine_id
LEFT JOIN \`swasthyaflow_national_dw.predictions\` pred 
  ON inv.facility_id = pred.facility_id 
  AND inv.medicine_id = pred.medicine_id
WHERE inv.days_remaining < 5.0
ORDER BY inv.days_remaining ASC
LIMIT 10;`;
