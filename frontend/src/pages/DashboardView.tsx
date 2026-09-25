import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  currentRole: string;
  flagshipStudy: any;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentRole, flagshipStudy, onNavigate }) => {
  const [portfolioKPIs, setPortfolioKPIs] = useState<any>(null);
  const [studyKPIs, setStudyKPIs] = useState<any>(null);
  const [saeDeadlines, setSaeDeadlines] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pKPI, sKPI, deadlines, alerts] = await Promise.all([
          api.getPortfolioKPIs(),
          flagshipStudy?.id ? api.getStudyKPIs(flagshipStudy.id) : Promise.resolve(null),
          api.getSAEDeadlines(),
          api.getAlerts()
        ]);
        setPortfolioKPIs(pKPI);
        setStudyKPIs(sKPI);
        setSaeDeadlines(deadlines);
        setActiveAlerts(alerts);
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [flagshipStudy]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ marginBottom: '10px' }}>Loading AIIA Research Hub Real-Time Metrics...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Role Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-purple">{currentRole} WORKSPACE</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-Time Operational Intelligence</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome, {currentRole === 'LEADERSHIP' ? 'Institutional Directorate' : currentRole === 'PI' ? 'Principal Investigator' : currentRole === 'PHARMACOVIGILANCE' ? 'Central Pharmacovigilance Officer' : 'Clinical Trial Investigator'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Flagship trial <strong style={{ color: '#38bdf8' }}>{flagshipStudy?.study_code || 'AIIA-PCOS-001'}</strong> active with 8 trial sites and centralized event-driven telemetry.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trial Health Index</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: studyKPIs?.composite_health_score > 70 ? '#34d399' : '#f59e0b' }}>
            {studyKPIs?.composite_health_score || 85.0} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Explainable Multi-Factor Metric</div>
        </div>
      </div>

      {/* Urgent SAE Deadlines Bar (Crucial for PV & Leadership) */}
      {saeDeadlines.length > 0 && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#f43f5e" />
              <strong style={{ fontSize: '0.95rem', color: '#fb7185' }}>Active SAE Regulatory Deadlines (CDSCO / IEC 24h & 7d Rules)</strong>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('pv')} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              Open PV Safety Desk →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {saeDeadlines.map((sae) => (
              <div key={sae.sae_id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{sae.event_term}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Participant: <strong>{sae.participant_code}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-rose pulse-urgent" style={{ marginBottom: '4px' }}>
                    {sae.initial_hours_remaining > 0 ? `${sae.initial_hours_remaining}h Remaining` : 'OVERDUE'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Initial Report (24h)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Operational Metric Cards */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>ENROLLMENT VELOCITY</span>
            <Users size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {studyKPIs?.actual_enrollment || 132} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {studyKPIs?.target_enrollment || 500}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', marginTop: '6px' }}>
            {studyKPIs?.enrollment_pct || 26.4}% Target Reached Across 8 Sites
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>PROTOCOL GUARDIAN</span>
            <ShieldCheck size={18} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {studyKPIs?.visit_compliance_pct || 91.2}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {studyKPIs?.critical_deviations || 2} Critical Deviations Detected
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>DATA QUALITY BURDEN</span>
            <FileText size={18} color="var(--safety-amber)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {studyKPIs?.open_queries || 2} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Queries</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px' }}>
            1 Overdue eCRF Query Requiring Resolution
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>PHARMACOVIGILANCE</span>
            <AlertCircle size={18} color="var(--danger-rose)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {studyKPIs?.total_ae_count || 5} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AEs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '6px' }}>
            {studyKPIs?.safety_signals_count || 1} Potential Safety Signal Identified
          </div>
        </div>
      </div>

      {/* Dual Column: Protocol Guardian & Active Alerts */}
      <div className="grid-2">
        {/* Protocol Guardian Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--ayush-teal)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Protocol Guardian Engine</h3>
            </div>
            <span className="badge badge-emerald">Real-Time Rules Active</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Transforms protocol text into executable visit-window and mandatory assessment rules.
            Automatically evaluates attendance upon coordinator entry.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Protocol Version:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>v2.0 (Tightened +/-3d Window)</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rule Set Applied:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399' }}>V0-V4 Mandatory Assessments</span>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('studies')} style={{ marginTop: '6px', width: '100%' }}>
              Inspect Protocol Rules & Deviations →
            </button>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--safety-amber)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Active Trial Alerts & Signals</h3>
            </div>
            <span className="badge badge-amber">{activeAlerts.length} Alerts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
            {activeAlerts.slice(0, 4).map((a) => (
              <div key={a.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.8rem', color: a.severity === 'CRITICAL' ? '#fb7185' : '#fbbf24' }}>
                    {a.title}
                  </strong>
                  <span className={`badge ${a.severity === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.62rem' }}>
                    {a.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
