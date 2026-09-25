import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SitesPageProps {
  flagshipStudy: any;
}

export const SitesPage: React.FC<SitesPageProps> = ({ flagshipStudy }) => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  useEffect(() => {
    if (!studyId) return;
    api.getSites(studyId).then(setSites).catch(console.error).finally(() => setLoading(false));
  }, [studyId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. HEADER */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-emerald">MULTI-CENTRIC NETWORK</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              8 Certified Teaching & Research Hospitals Across India
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Clinical Trial Centers & Hospital Network
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Live enrollment velocity, site investigator assignments, and operational status across all participating Ayush facilities.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Enrolled</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ayush-teal-dark)' }}>
            320 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 500 Target</span>
          </div>
        </div>
      </div>

      {/* 2. SITES GRID (UNCLUTTERED & VISUAL) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {sites.map((s) => {
          let scenarioText = 'Operational Benchmark';
          let badgeClass = 'badge-emerald';

          if (s.site_code === 'S03') {
            scenarioText = 'Data Integrity Check: Identical BP Clustering';
            badgeClass = 'badge-amber';
          } else if (s.site_code === 'S04') {
            scenarioText = 'Query Backlog: 2 Open Queries';
            badgeClass = 'badge-amber';
          } else if (s.site_code === 'S05') {
            scenarioText = 'Protocol Compliance: 4 Visit Window Deviations';
            badgeClass = 'badge-rose';
          } else if (s.site_code === 'S06') {
            scenarioText = 'Safety Reporting Lag: Unusually Low AE Rate';
            badgeClass = 'badge-amber';
          } else if (s.site_code === 'S07') {
            scenarioText = 'Recruitment Shortfall: 28/60 vs Target';
            badgeClass = 'badge-rose';
          } else if (s.site_code === 'S08') {
            scenarioText = 'Active SAE Surveillance: 24h Clock Monitoring';
            badgeClass = 'badge-rose';
          }

          const pct = Math.min(100, Math.round((s.actual_enrollment / (s.target_enrollment || 1)) * 100));

          return (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-blue">{s.site_code}</span>
                  <span className="badge badge-emerald">{s.status}</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {s.site_name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <MapPin size={14} color="var(--ayush-teal)" />
                  <span>{s.location}</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Site Principal Investigator: <strong>{s.pi_name || 'Designated Lead Doctor'}</strong>
                </div>
              </div>

              <div>
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recruitment Progress:</span>
                    <strong>{s.actual_enrollment} / {s.target_enrollment} ({pct}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: s.site_code === 'S07' ? 'var(--danger-rose)' : 'var(--ayush-teal)'
                    }}></div>
                  </div>
                </div>

                <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                  {scenarioText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
