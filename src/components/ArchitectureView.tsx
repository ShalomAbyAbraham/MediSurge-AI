import React, { useState } from 'react';
import { BIGQUERY_TABLE_SCHEMAS, SAMPLE_ANALYTICAL_SQL } from '../services/bigQuerySchema';
import {
  Database,
  Cloud,
  Cpu,
  ShieldCheck,
  Server,
  Layers,
  Code,
  Copy,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedTable, setSelectedTable] = useState(BIGQUERY_TABLE_SCHEMAS[4]); // inventory

  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const gcpComponents = [
    {
      name: 'Cloud Run',
      category: 'Compute & Microservices',
      description: 'Serverless container execution for SwasthyaFlow REST APIs and real-time optimization solver with automatic scale-to-zero.',
      badge: 'GCP Serverless',
    },
    {
      name: 'BigQuery',
      category: 'Healthcare Data Warehouse',
      description: 'Petabyte-scale analytical data warehouse storing partitioned PHC telemetry, footfall logs, drug inventory, and prediction histories.',
      badge: 'swasthyaflow_national_dw',
    },
    {
      name: 'Vertex AI Time-Series',
      category: 'Predictive Modeling',
      description: 'AutoML Demand Forecasting models trained on historical OPD attendance, meteorological monsoon cycles, and syndromic clusters.',
      badge: 'AutoML Forecasting',
    },
    {
      name: 'Gemini 3.8 Flash',
      category: 'Explainable AI & Reasoning',
      description: 'Synthesizes clinical telemetry, explains stock-out root causes with structured evidence tables, and powers the natural-language copilot.',
      badge: 'Multimodal Generative AI',
    },
    {
      name: 'Firebase Auth & Firestore',
      category: 'Identity & Cache',
      description: 'National Health Mission role-based access control (National Admin, State DHS, District CMO, PHC Doctor) and offline edge cache.',
      badge: 'ABHA Federated RBAC',
    },
    {
      name: 'Google Maps Platform',
      category: 'Geospatial Logistics',
      description: 'Distance Matrix API and Directions API for calculating inter-PHC transport travel times and cold-chain route feasibility.',
      badge: 'GIS Routing',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Blueprint Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Cloud className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Enterprise Google Cloud & BigQuery Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade reference implementation for India&apos;s National Health Mission (NHM) and Ayushman Bharat Digital Mission (ABDM).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
          <span>ABDM & DISHA Compliant</span>
        </div>
      </div>

      {/* GCP Service Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gcpComponents.map((comp, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-teal-400 border border-slate-800">
                  {comp.badge}
                </span>
                <span className="text-[10px] text-slate-500">{comp.category}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{comp.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{comp.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BigQuery Data Warehouse Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                BigQuery Healthcare Analytical Warehouse DDL
              </h2>
              <p className="text-[11px] text-slate-400">
                Dataset: <code>swasthyaflow_national_dw</code> · Partitioned by event date & clustered by state, district, facility
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCopySql(SAMPLE_ANALYTICAL_SQL)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 transition"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedSql ? 'Copied Query' : 'Copy Sample Query'}</span>
          </button>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {BIGQUERY_TABLE_SCHEMAS.map(tbl => (
            <button
              key={tbl.tableName}
              onClick={() => setSelectedTable(tbl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                selectedTable.tableName === tbl.tableName
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tbl.tableName}
            </button>
          ))}
        </div>

        {/* Selected Table DDL & Documentation */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white font-mono">
              Table: swasthyaflow_national_dw.{selectedTable.tableName}
            </span>
            <span className="text-slate-400 text-[11px]">{selectedTable.description}</span>
          </div>

          <pre className="text-xs font-mono text-teal-300/90 overflow-x-auto p-3 bg-slate-900/90 rounded-lg border border-slate-800 leading-relaxed">
            {selectedTable.ddl}
          </pre>
        </div>

        {/* Sample Analytical Query */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-teal-400" /> Sample Real-Time Vulnerability Analysis SQL
          </h3>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed">
            {SAMPLE_ANALYTICAL_SQL}
          </pre>
        </div>
      </div>

      {/* Security & Federated Governance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>DISHA & Data Privacy Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Zero personally identifiable patient information (PII) is transmitted across administrative layers. Telemetry is aggregated strictly at the facility-level (daily footfall, medicine consumption counts, bed utilization percentages) ensuring complete HIPAA and Indian Digital Health Privacy compliance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <Server className="w-4 h-4" />
            <span>Offline-First Resilience at Rural Edge</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            PHC field portals feature IndexedDB local queueing. If power or cellular data fails during monsoon floods, nurses and doctors continue logging medicine dispensations locally; transactions automatically reconcile to BigQuery upon connectivity restoration.
          </p>
        </div>
      </div>

    </div>
  );
};
