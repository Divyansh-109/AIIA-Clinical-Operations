import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Users,
  ShieldCheck,
  FolderGit2,
  Activity,
  ArrowRight,
  Building2,
  HeartPulse,
  CalendarCheck,
  Award,
  FileCheck2
} from 'lucide-react';

interface AdminDashboardProps {
  flagshipStudy: any;
  currentRole: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const navigate = useNavigate();

  const portfolioStudies = [
    {
      code: 'AIIA-PCOS-001',
      title: 'Clinical Evaluation of Ayush-PCOS Herbal Formulation vs Standard Care',
      phase: 'Phase III',
      sites: 8,
      enrolled: '320 / 500',
      status: 'Active Enrolling',
      badge: 'badge-emerald'
    },
    {
      code: 'AIIA-DM2-002',
      title: 'Integrative Glycemic Control with Nisha-Amalaki in Pre-Diabetic Adults',
      phase: 'Phase IIb',
      sites: 5,
      enrolled: '240 / 240',
      status: 'Follow-up Phase',
      badge: 'badge-blue'
    },
    {
      code: 'AIIA-RA-003',
      title: 'Classical Panchakarma & Guggulu in Rheumatoid Arthritis (Amavata)',
      phase: 'Phase III',
      sites: 6,
      enrolled: '200 / 400',
      status: 'Active Enrolling',
      badge: 'badge-emerald'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. TOP GREETING & INSTITUTIONAL ADMIN HEADER */}
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
            background: 'var(--purple-light)',
            color: 'var(--purple-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Settings size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Directorate of Research Administration Desk
              </h1>
              <span className="badge badge-purple">Institutional Admin</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', margin: 0 }}>
              National Platform Operations · Portfolio Oversight, Hospital Network Governance & Ethics Adherence
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/app/audit')} className="btn btn-secondary btn-sm">
            <span>Audit Trail Ledger</span>
          </button>
          <button onClick={() => navigate('/app/export')} className="btn btn-cobalt btn-sm">
            <span>Official Regulatory Reports</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. FOUR KEY ADMIN METRICS */}
      <div className="responsive-kpi-grid" style={{ display: 'grid' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Research Portfolio
            </span>
            <FolderGit2 size={18} color="var(--purple-accent)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            3 Active Trials
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--purple-accent)', fontWeight: 600 }}>
            760 Participants Across India
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Official Clinical Log
            </span>
            <FileCheck2 size={18} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            4,892 Records
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            100% Sealed & Verified
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Platform Operations
            </span>
            <Activity size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ayush-emerald)', marginBottom: '4px' }}>
            Fully Operational
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            All Clinical Desks Online
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Authorized Personnel
            </span>
            <Users size={18} color="var(--clinical-cobalt)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--clinical-cobalt)', marginBottom: '4px' }}>
            38 Staff
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            8 Clinical sites connected
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN SPLIT: PORTFOLIO & CLINICAL GOVERNANCE */}
      <div className="dashboard-split-grid" style={{ display: 'grid' }}>
        {/* Left Column: Multi-Study Institutional Portfolio */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                National Clinical Trial Portfolio
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                All India Institute of Ayurveda active research studies and multisite trials
              </p>
            </div>
            <span className="badge badge-emerald">Ministry of Ayush</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {portfolioStudies.map((study) => (
              <div
                key={study.code}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{study.code}</strong>
                    <span className="badge badge-neutral">{study.phase}</span>
                  </div>
                  <span className={`badge ${study.badge}`}>{study.status}</span>
                </div>

                <div style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {study.title}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                  <span>Participating Hospital Sites: <strong style={{ color: 'var(--text-primary)' }}>{study.sites} Centers</strong></span>
                  <span>National Recruitment: <strong style={{ color: 'var(--clinical-cobalt)' }}>{study.enrolled}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hospital Network & Clinical Governance Status */}
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Hospital Network & Clinical Governance
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Multi-center institutional health operations & record protection
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color="var(--clinical-cobalt)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hospital Multisite Network</span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>8 Centers Connected</span>
            </div>

            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarCheck size={16} color="var(--ayush-teal)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Patient Records Registry</span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>Active & Synchronized</span>
            </div>

            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HeartPulse size={16} color="var(--danger-rose)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Safety Surveillance System</span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>24/7 Monitoring Active</span>
            </div>

            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} color="var(--purple-accent)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tamper-Proof Audit Seal</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>100% Integrity Confirmed</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            System conforms to National Good Clinical Practice (GCP) guidelines and Institutional Ethics Committee governance.
          </div>
        </div>
      </div>
    </div>
  );
};
