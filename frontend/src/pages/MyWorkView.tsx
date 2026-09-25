import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Users,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileText,
  Activity,
  ArrowRight,
  AlertOctagon
} from 'lucide-react';

interface MyWorkViewProps {
  currentRole: string;
  flagshipStudy: any;
  onNavigate: (tab: string, subTab?: string) => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({ currentRole, flagshipStudy, onNavigate }) => {
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  useEffect(() => {
    if (!studyId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getStudyControlCenter(studyId);
        setControlCenter(data);
      } catch (err) {
        console.error('Error loading control center in MyWork:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studyId]);

  if (loading) {
    return (
      <div className="empty-state">
        <div>Loading personalized clinical workspace for {currentRole}...</div>
      </div>
    );
  }

  // Generate role-specific customized work queues
  const renderRoleWorkspace = () => {
    switch (currentRole) {
      case 'PI':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <CheckSquare size={18} color="var(--ayush-teal)" />
                  <span>Principal Investigator Clinical Oversight Queue</span>
                </h3>
                <div className="panel-subtitle">
                  Immediate investigator reviews, safety sign-offs, and protocol deviation dispositions
                </div>
              </div>
              <span className="badge badge-purple">PI Role Scope</span>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  SAE Medical Assessments Pending
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.safety?.sae_count || 1}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginBottom: '10px' }}>
                  Active 24h statutory reporting clock running
                </div>
                <button
                  className="btn btn-danger"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'safety')}
                >
                  Conduct Medical Review →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--safety-amber)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Protocol Deviations Pending Sign-off
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.open_deviations || 2}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '10px' }}>
                  Out-of-window visits and missing mandatory assessments
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'deviations')}
                >
                  Review & Sign-Off Deviations →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--clinical-blue)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Protocol v2.0 Amendment Approvals
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  1 Pending
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Cohort re-consent and visit schedule impact analysis
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'protocol')}
                >
                  Inspect Amendment Impact →
                </button>
              </div>
            </div>
          </div>
        );

      case 'STUDY_COORDINATOR':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <Calendar size={18} color="var(--ayush-teal)" />
                  <span>Clinical Study Coordinator Daily Schedule & eCRF Tasks</span>
                </h3>
                <div className="panel-subtitle">
                  Participant visit appointments, vital collection, and discrepancy resolution
                </div>
              </div>
              <span className="badge badge-emerald">Coordinator Scope</span>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Visits Due This Week
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  8 Visits
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ayush-teal-dark)', marginBottom: '10px' }}>
                  Follow-up visits V2 & V3 scheduled
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'participants')}
                >
                  Open Visit Completion Console →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--safety-amber)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Data Discrepancy Queries
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.open_queries || 2} Open
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '10px' }}>
                  1 Overdue query requiring source verification
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'queries')}
                >
                  Respond to Discrepancies →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--purple-accent)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Screening & Informed Consent
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.actual_enrollment || 132} / {controlCenter?.operational_health?.target_enrollment || 500}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Digital Aadhaar/OTP verified ICF v2.0
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'participants')}
                >
                  Screen & Enroll Participant →
                </button>
              </div>
            </div>
          </div>
        );

      case 'PHARMACOVIGILANCE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <AlertOctagon size={18} color="var(--danger-rose)" />
                  <span>Central Pharmacovigilance & Safety Surveillance Desk</span>
                </h3>
                <div className="panel-subtitle">
                  Expedited regulatory reporting (24h/7d), causality assessment, and safety signal evaluations
                </div>
              </div>
              <span className="badge badge-rose">PV Safety Scope</span>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Urgent SAE Reporting Clocks
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626', margin: '4px 0' }}>
                  {controlCenter?.safety?.active_sae_deadlines || 1} Active
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginBottom: '10px' }}>
                  Severe Abdominal Cramps (Awareness 18h ago)
                </div>
                <button
                  className="btn btn-danger"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('pv')}
                >
                  Open PV Case Timeline & Submit →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--safety-amber)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Potential Safety Signals
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.safety?.safety_signals_count || 1}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '10px' }}>
                  PRR Disproportionality &gt; 2.0x reference baseline
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('pv')}
                >
                  Review Disproportionality Evidence →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  AI Narrative Medical Entity Extraction
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  Human-in-the-Loop
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Extract MedDRA terms with Accept/Edit/Reject workflow
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('pv')}
                >
                  Open AI Narrative Assistant →
                </button>
              </div>
            </div>
          </div>
        );

      case 'MONITOR':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <ShieldCheck size={18} color="var(--clinical-blue)" />
                  <span>Clinical Research Associate (CRA) Monitoring Queue</span>
                </h3>
                <div className="panel-subtitle">
                  Site surveillance, Source Data Verification (SDV), and discrepancy aging
                </div>
              </div>
              <span className="badge badge-blue">CRA Monitor Scope</span>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderLeft: '4px solid var(--clinical-blue)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Active Sites Monitored
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.active_sites_count || 8} Sites
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Site S04 flagged with identical vitals pattern
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'sites')}
                >
                  Inspect Site Performance Matrix →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--safety-amber)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Discrepancy Queries for CRA Close-Out
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.open_queries || 2}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '10px' }}>
                  Verify against clinic paper source logs
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'queries')}
                >
                  Verify & Close Queries →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--purple-accent)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Statistical Data Integrity Indicators
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  3 Sites Flagged
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Targeted SDV recommended for S03 & S04
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'intelligence')}
                >
                  View Integrity Evidence Graph →
                </button>
              </div>
            </div>
          </div>
        );

      case 'ETHICS_COMMITTEE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <ShieldCheck size={18} color="var(--ayush-teal)" />
                  <span>Institutional Ethics Committee (IEC) Oversight Panel</span>
                </h3>
                <div className="panel-subtitle">
                  Ethics clearances, annual renewals, protocol amendment reviews, and SAE notifications
                </div>
              </div>
              <span className="badge badge-emerald">Ethics Scope</span>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  IEC Approval Status
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857', margin: '4px 0' }}>
                  {controlCenter?.compliance?.iec_status || 'APPROVED'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Ref: {controlCenter?.compliance?.iec_reference} | Expires: {controlCenter?.compliance?.iec_expiry_date}
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('compliance')}
                >
                  View IEC Dossier & Certificates →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Expedited SAE Notifications to IEC
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', margin: '4px 0' }}>
                  1 Report Received
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginBottom: '10px' }}>
                  Subject hospitalization in Ayush-PCOS trial
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'safety')}
                >
                  Review Ethics SAE Report →
                </button>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--clinical-blue)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Informed Consent Revisions
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  ICF Version 2.0
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Re-consent compliance tracking active
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  onClick={() => onNavigate('studies', 'documents')}
                >
                  Inspect Approved Consent Forms →
                </button>
              </div>
            </div>
          </div>
        );

      case 'LEADERSHIP':
      case 'ADMIN':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  <Activity size={18} color="var(--ayush-teal)" />
                  <span>Institutional Leadership Trial Portfolio Governance</span>
                </h3>
                <div className="panel-subtitle">
                  High-level study portfolio trajectory, critical safety deadlines, and regulatory milestones
                </div>
              </div>
              <span className="badge badge-purple">{currentRole} Overview</span>
            </div>

            <div className="grid-4">
              <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Recruitment Trajectory
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.actual_enrollment || 132} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 500</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ayush-teal-dark)' }}>
                  {controlCenter?.operational_health?.enrollment_pct || 26.4}% across 8 AYUSH institutions
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Safety Workload
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc2626', margin: '4px 0' }}>
                  {controlCenter?.safety?.sae_count || 1} SAE <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {controlCenter?.safety?.total_ae_count || 5} AEs</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                  1 Active 24h statutory reporting clock
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--clinical-blue)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Protocol Compliance
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {controlCenter?.operational_health?.visit_compliance_pct || 91.2}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {controlCenter?.operational_health?.total_deviations || 2} deviations identified
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--safety-amber)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Data Integrity Scrutiny
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  3 Sites Flagged
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309' }}>
                  Anomalies awaiting CRA verification
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald">Active Clinical Workstation</span>
              <span className="badge badge-neutral">Role: {currentRole}</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              My Clinical Work & Tasks
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Connected operational dashboard tailored to your active role responsibilities for trial{' '}
              <strong style={{ color: 'var(--ayush-teal-dark)' }}>{controlCenter?.study_code || 'AIIA-PCOS-001'}</strong>.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Multi-Dimensional Trial Health
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ayush-teal)' }}>
              {controlCenter?.composite_health_score || 85.0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Explainable Operational Metric</div>
          </div>
        </div>
      </div>

      {/* Role-Specific Work Desk */}
      {renderRoleWorkspace()}

      {/* Cross-Cutting Urgent Actions Requiring Immediate Attention */}
      <div className="card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <AlertTriangle size={18} color="var(--safety-amber)" />
              <span>Prioritized Actions Requiring Human Disposition ({controlCenter?.action_center?.items?.length || 0})</span>
            </h3>
            <div className="panel-subtitle">
              Every action item triggers real-time state propagation and generates cryptographically linked audit entries
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem' }}
            onClick={() => onNavigate('action_center')}
          >
            Open Complete Action Center →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {controlCenter?.action_center?.items?.slice(0, 4).map((act: any) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: act.severity === 'CRITICAL' ? '#fef2f2' : '#f8fafc',
                border: act.severity === 'CRITICAL' ? '1px solid #fecaca' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${act.severity === 'CRITICAL' ? 'badge-rose' : act.severity === 'HIGH' ? 'badge-amber' : 'badge-blue'}`}>
                  {act.severity}
                </span>
                <div>
                  <div style={{ fontSize: '0.84375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {act.description}
                  </div>
                </div>
              </div>

              <button
                className={act.severity === 'CRITICAL' ? 'btn btn-danger' : 'btn btn-secondary'}
                style={{ fontSize: '0.75rem', padding: '5px 12px', flexShrink: 0 }}
                onClick={() => onNavigate('studies', act.target_module)}
              >
                <span>{act.action_label}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
