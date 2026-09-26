import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  GitBranch,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ProtocolPageProps {
  flagshipStudy: any;
}

export const ProtocolPage: React.FC<ProtocolPageProps> = ({ flagshipStudy }) => {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [pList, dList] = await Promise.all([
        api.getProtocols(studyId),
        api.getDeviations(studyId)
      ]);
      setProtocols(pList);
      setDeviations(dList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const runAmendmentImpact = async () => {
    try {
      const res = await api.getAmendmentImpact(studyId, 'v1.0', 'v2.0');
      setImpactData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignoffDeviation = async (devId: string) => {
    try {
      await api.signoffDeviation(devId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. HEADER */}
      <div className="responsive-header-card" style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">SMART CLINICAL RULES</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Protocol Guardian Window Checks & Version Management
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Protocol Rules & Checkup Tolerances
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Translates protocol text into executable checks for checkup window dates (Day 28 ± 3 days) and mandatory blood tests.
          </p>
        </div>

        <button
          onClick={runAmendmentImpact}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <GitBranch size={16} />
          <span>Simulate Amendment (v1.0 → v2.0)</span>
        </button>
      </div>

      {/* 2. AMENDMENT SIMULATOR RESULT BOX */}
      {impactData && (
        <div className="card" style={{ background: '#f0fdfa', border: '1px solid #99f6e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} color="var(--ayush-teal)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', margin: 0 }}>
              Protocol Amendment Impact Analysis (v1.0 → v2.0)
            </h3>
          </div>

          <div className="responsive-kpi-grid" style={{ display: 'grid', marginBottom: '14px' }}>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Affected Patients</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{impactData.affected_participants_count} Cohort</div>
            </div>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Centers</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{impactData.affected_sites_count} Hospitals</div>
            </div>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visits Requiring New Test</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--warning-amber)' }}>{impactData.upcoming_visits_affected} Visits</div>
            </div>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Re-Consent Status</div>
              <span className="badge badge-rose" style={{ marginTop: '4px' }}>MANDATORY RE-CONSENT</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {impactData.summary_narrative}
          </p>
        </div>
      )}

      {/* 3. PROTOCOL DEVIATIONS REGISTER */}
      <div className="card table-responsive" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Protocol Exceptions & Deviations Register
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Occurs when a patient checkup happens outside the allowed visit window or a required lab measurement was omitted.
            </p>
          </div>
          <span className="badge badge-amber">{deviations.length} Logged</span>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Deviation Type</th>
              <th>Severity</th>
              <th>Description & Clinical Impact</th>
              <th>Date Flagged</th>
              <th>Status</th>
              <th>Doctor Sign-Off</th>
            </tr>
          </thead>
          <tbody>
            {deviations.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 700, color: 'var(--ayush-teal-dark)' }}>{d.deviation_type}</td>
                <td>
                  <span className={`badge ${d.severity === 'CRITICAL' || d.severity === 'MAJOR' ? 'badge-rose' : 'badge-amber'}`}>
                    {d.severity}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
                  {d.description}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{d.reported_date}</td>
                <td>
                  <span className={`badge ${d.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  {d.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleSignoffDeviation(d.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Doctor Sign-off
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>✓ Signed Off</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
