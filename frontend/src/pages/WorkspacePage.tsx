import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ShieldCheck,
  FileCheck2,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface WorkspacePageProps {
  currentRole: string;
  currentUser: any;
  flagshipStudy: any;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  currentRole,
  currentUser,
  flagshipStudy
}) => {
  const navigate = useNavigate();
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const cc = await api.getStudyControlCenter(studyId);
      setControlCenter(cc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const handleResolveAction = async (item: any) => {
    try {
      if (item.category === 'DEVIATION' && item.target_id) {
        await api.signoffDeviation(item.target_id);
        setActionFeedback(`Protocol deviation signed off by ${currentRole}. Study metrics refreshed.`);
        await loadData();
      } else if (item.category === 'DATA_QUALITY' && item.target_id) {
        await api.resolveQuery(item.target_id, 'RESOLVED', `Verified against OPD charts by ${currentRole}`);
        setActionFeedback(`Data discrepancy query resolved and sealed into audit trail.`);
        await loadData();
      } else if (item.category === 'SAFETY') {
        navigate('/app/safety');
      } else {
        navigate('/app/study');
      }
    } catch (err: any) {
      console.error('Error resolving action:', err);
    }
  };

  const roleDisplayNames: Record<string, { title: string; subtitle: string; badge: string }> = {
    PI: {
      title: 'Principal Investigator Workspace',
      subtitle: 'Complete clinical trial oversight, deviation approvals & patient safety across all 8 centers.',
      badge: 'Lead Investigator'
    },
    PHARMACOVIGILANCE: {
      title: 'Safety & Pharmacovigilance Desk',
      subtitle: 'Adverse reaction surveillance, medical causality reviews & 24h statutory reporting clocks.',
      badge: 'Safety Officer'
    },
    STUDY_COORDINATOR: {
      title: 'Clinical Study Coordinator Desk',
      subtitle: 'Patient registration, scheduled checkup visits, vitals entry & query responses.',
      badge: 'Study Coordinator'
    },
    MONITOR: {
      title: 'CRA Clinical Monitoring Desk',
      subtitle: 'Hospital source data verification, statistical vitals audits & query tracking.',
      badge: 'CRA Auditor'
    },
    ADMIN: {
      title: 'Central Clinical Operations Workspace',
      subtitle: 'Institutional trial portfolio metrics, multi-center health & compliance tracking.',
      badge: 'Institutional Admin'
    }
  };

  const currentRoleInfo = roleDisplayNames[currentRole] || roleDisplayNames.ADMIN;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. WELCOME HEADER (CLEAN & SPACIOUS) */}
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
            <span className="badge badge-emerald">{currentRoleInfo.badge}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Active Study: <strong>{flagshipStudy?.study_code || 'AIIA-PCOS-001'}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Welcome back, {currentUser?.full_name || 'Dr. Tanuja Nesari'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '720px' }}>
            {currentRoleInfo.subtitle}
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div style={{
          background: 'var(--ayush-teal-light)',
          border: '1px solid #99f6e4',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--ayush-teal-dark)',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--ayush-teal)" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ayush-teal-dark)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. THREE HIGHLIGHT CARDS (HIGH READABILITY, NO CLUTTER) */}
      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>PATIENT RECRUITMENT</span>
            <Users size={20} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            320 <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 500 Target</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ayush-teal-dark)', marginTop: '6px', fontWeight: 600 }}>
            64.0% Recruited across 8 Ayush Hospitals
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>SAFETY SURVEILLANCE</span>
            <AlertOctagon size={20} color="var(--danger-rose)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-rose)' }}>
            1 Active Clock
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--danger-rose)', marginTop: '6px', fontWeight: 600 }}>
            18.5h remaining to submit CDSCO 24-hour notice
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--clinical-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>QUALITY & CHECKS</span>
            <ShieldCheck size={20} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            91.2% Compliance
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--clinical-blue-dark)', marginTop: '6px', fontWeight: 600 }}>
            Protocol Guardian validating visit windows in real time
          </div>
        </div>
      </div>

      {/* 3. PRIORITIZED ACTION ITEMS (CLEAR & ACTIONABLE) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              What Needs Your Attention Today
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Prioritized exceptions requiring medical review or coordinator verification.
            </p>
          </div>

          <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            {(controlCenter?.action_items || []).length} Pending Items
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(controlCenter?.action_items || []).map((item: any) => {
            const isCritical = item.priority === 'CRITICAL';
            const isHigh = item.priority === 'HIGH';

            return (
              <div
                key={item.id}
                style={{
                  background: isCritical ? '#fff1f2' : isHigh ? '#fffbeb' : '#ffffff',
                  border: '1px solid',
                  borderColor: isCritical ? '#fecaca' : isHigh ? '#fde68a' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isCritical ? '#fecdd3' : isHigh ? '#fef3c7' : '#e0f2fe',
                    color: isCritical ? '#b91c1c' : isHigh ? '#b45309' : '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.category === 'SAFETY' && <AlertOctagon size={18} />}
                    {item.category === 'DEVIATION' && <AlertTriangle size={18} />}
                    {item.category === 'DATA_QUALITY' && <FileCheck2 size={18} />}
                    {item.category === 'COMPLIANCE' && <ShieldCheck size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span className={`badge ${isCritical ? 'badge-rose' : isHigh ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '0.6875rem' }}>
                        {item.priority}
                      </span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {item.description}
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      System Consequence: {item.consequence || 'Requires review before study closeout.'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleResolveAction(item)}
                  className={`btn ${isCritical ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <span>{item.action_label || 'Take Action'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TIMELINE */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Clock size={18} color="var(--ayush-teal)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Live Study Activity Trail
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(controlCenter?.activity_timeline || []).slice(0, 5).map((ev: any, idx: number) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                paddingBottom: '12px',
                borderBottom: idx < 4 ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--ayush-teal)',
                marginTop: '6px',
                flexShrink: 0
              }}></div>

              <div style={{ flex: 1, fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{ev.event_name}</strong>
                  <span>{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Recent'}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {ev.summary}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Triggered by: {ev.actor} · Entity: {ev.entity_type} {ev.entity_id ? `(#${ev.entity_id.slice(0, 6)})` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
