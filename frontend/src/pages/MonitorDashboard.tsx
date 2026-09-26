import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Search,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface MonitorDashboardProps {
  flagshipStudy: any;
  currentRole: string;
}

export const MonitorDashboard: React.FC<MonitorDashboardProps> = () => {
  const navigate = useNavigate();

  const [resolvedQueries, setResolvedQueries] = useState<Record<string, boolean>>({});

  const handleResolveQuery = (id: string) => {
    setResolvedQueries(prev => ({ ...prev, [id]: true }));
  };

  const openQueries = [
    {
      id: 'QRY-104',
      patientId: 'AIIA-01-008',
      center: 'Delhi Center 01',
      field: 'Systolic Blood Pressure',
      flag: 'Entered as 180 mmHg (Nurse paper source note records 120 mmHg)',
      type: 'Data Discrepancy',
      severity: 'Moderate'
    },
    {
      id: 'QRY-105',
      patientId: 'AIIA-02-014',
      center: 'Varanasi Center 02',
      field: 'Fasting Insulin Lab Sheet',
      flag: 'Case report indicates test performed on 2026-09-18 but PDF attachment is missing',
      type: 'Missing Source Document',
      severity: 'Minor'
    }
  ];

  const siteAuditStatus = [
    { site: 'All India Institute of Ayurveda, New Delhi', sdv: '94%', lastAudit: '2026-09-20', status: 'Audit Passed' },
    { site: 'Faculty of Ayurveda, BHU, Varanasi', sdv: '86%', lastAudit: '2026-09-14', status: 'Queries Pending' },
    { site: 'ITRA Teaching Hospital, Jamnagar', sdv: '90%', lastAudit: '2026-09-10', status: 'Audit Passed' },
    { site: 'National Institute of Ayurveda, Jaipur', sdv: '88%', lastAudit: '2026-09-04', status: 'Audit Passed' },
    { site: 'Rishikul Govt Ayurvedic College, Haridwar', sdv: '82%', lastAudit: '2026-08-28', status: 'Routine Review' },
    { site: 'Govt. Ayurveda College Hospital, Thiruvananthapuram', sdv: '80%', lastAudit: '2026-08-20', status: 'Routine Review' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. TOP GREETING & AUDIT STATUS */}
      <div className="responsive-header-card" style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--safety-amber-light)',
            color: 'var(--safety-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                CRA Quality & Source Verification Desk
              </h1>
              <span className="badge badge-amber">Clinical Monitor</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', margin: 0 }}>
              Independent Monitoring · Source Data Verification (SDV) & Good Clinical Practice Audit
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/app/quality')} className="btn btn-secondary btn-sm">
            <span>Query Management</span>
          </button>
          <button onClick={() => navigate('/app/audit')} className="btn btn-cobalt btn-sm">
            <span>Audit Trail Log</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. FOUR KEY QUALITY METRICS */}
      <div className="responsive-kpi-grid" style={{ display: 'grid' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Source Data Verified (SDV)
            </span>
            <FileCheck2 size={18} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            88.1%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            282 / 320 records verified
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Open Clinical Queries
            </span>
            <MessageSquare size={18} color="var(--safety-amber)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--safety-amber)', marginBottom: '4px' }}>
            {2 - Object.keys(resolvedQueries).length} Pending
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hospital site responses awaited
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hospital Sites Inspected
            </span>
            <Building2 size={18} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--clinical-blue)', marginBottom: '4px' }}>
            6 of 8 Sites
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Bengaluru & Mumbai pending
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Data Anomaly Score
            </span>
            <ShieldCheck size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ayush-emerald)', marginBottom: '4px' }}>
            0.4% Low
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            Zero evidence of digit fraud
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN SPLIT */}
      <div className="dashboard-split-grid" style={{ display: 'grid' }}>
        {/* Left Column: Open Queries Queue */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Clinical Data Queries
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Discrepancies identified between hospital clinic source notes and digital entry
              </p>
            </div>
            <span className="badge badge-amber">Action Required</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {openQueries.map((q) => {
              const isResolved = resolvedQueries[q.id];
              return (
                <div
                  key={q.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    background: isResolved ? 'var(--ayush-emerald-light)' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{q.id}</strong>
                      <span className="badge badge-neutral">{q.type}</span>
                      <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{q.center}</span>
                    </div>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{q.patientId}</span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <strong>{q.field}:</strong> {q.flag}
                  </div>

                  {isResolved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ayush-emerald)', fontWeight: 600, fontSize: '0.78125rem' }}>
                      <CheckCircle2 size={15} />
                      <span>Verified Against Paper Source & Resolved</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleResolveQuery(q.id)}
                        className="btn btn-cobalt btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Verify & Resolve Discrepancy</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Site Audit Verification Table */}
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Hospital Verification Status
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Source Data Verification rate across centers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {siteAuditStatus.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-primary)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {s.site}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Last Monitor Audit: {s.lastAudit}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ayush-teal-dark)' }}>
                    {s.sdv}
                  </div>
                  <span className={`badge ${s.status === 'Audit Passed' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
