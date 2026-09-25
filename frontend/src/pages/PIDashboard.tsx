import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CalendarCheck,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface PIDashboardProps {
  flagshipStudy: any;
  currentRole: string;
}

export const PIDashboard: React.FC<PIDashboardProps> = ({ flagshipStudy }) => {
  const navigate = useNavigate();
  const [approvedItems, setApprovedItems] = useState<Record<string, boolean>>({});

  const handleApprove = (id: string) => {
    setApprovedItems(prev => ({ ...prev, [id]: true }));
  };

  const centerProgress = [
    { name: 'All India Institute of Ayurveda, New Delhi', code: 'Center 01', enrolled: 84, target: 100, pct: 84 },
    { name: 'Faculty of Ayurveda, BHU, Varanasi', code: 'Center 02', enrolled: 52, target: 70, pct: 74 },
    { name: 'ITRA Teaching Hospital, Jamnagar', code: 'Center 03', enrolled: 48, target: 60, pct: 80 },
    { name: 'National Institute of Ayurveda, Jaipur', code: 'Center 04', enrolled: 42, target: 50, pct: 84 },
    { name: 'Rishikul Govt Ayurvedic College, Haridwar', code: 'Center 05', enrolled: 34, target: 50, pct: 68 },
    { name: 'Govt. Ayurveda College Hospital, Thiruvananthapuram', code: 'Center 06', enrolled: 28, target: 50, pct: 56 },
    { name: 'Govt. Ayurvedic Medical College, Bengaluru', code: 'Center 07', enrolled: 20, target: 60, pct: 33 },
    { name: 'Podar Ayurvedic Medical Hospital, Mumbai', code: 'Center 08', enrolled: 12, target: 60, pct: 20 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. WELCOME BANNER (MINIMAL & ATTRACTIVE) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--clinical-cobalt-light)',
            color: 'var(--clinical-cobalt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Prof. (Dr.) Tanuja Manoj Nesari
              </h1>
              <span className="badge badge-emerald">Principal Investigator</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', margin: 0 }}>
              National Clinical Trial Lead · All India Institute of Ayurveda Apex Center
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/app/study')}
            className="btn btn-secondary btn-sm"
          >
            <span>View Protocol v2.0</span>
          </button>
          <button
            onClick={() => navigate('/app/patients')}
            className="btn btn-cobalt btn-sm"
          >
            <span>Patient Registry</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. FOUR KEY EXECUTIVE METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Patient Cohort
            </span>
            <Users size={18} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            320 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 500</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            64.0% National Enrollment Target
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hospital Centers
            </span>
            <Building2 size={18} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            8 Active
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All centers screening & enrolling
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Protocol Compliance
            </span>
            <ShieldCheck size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            98.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            Within Day 28 ± 3 visit window
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending PI Sign-Offs
            </span>
            <AlertTriangle size={18} color="var(--safety-amber)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--safety-amber)', marginBottom: '4px' }}>
            {2 - Object.keys(approvedItems).length} Items
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Protocol deviation & eligibility reviews
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN OPERATIONAL SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Left Column: Hospital Recruitment Leaderboard */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recruitment Progress by Hospital Center
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Real-time patient enrollment across all 8 apex Ayurvedic medical institutions
              </p>
            </div>
            <button onClick={() => navigate('/app/sites')} className="btn btn-secondary btn-sm">
              <span>Center Details</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {centerProgress.map((c, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({c.code})</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--ayush-teal-dark)' }}>
                    {c.enrolled} / {c.target} ({c.pct}%)
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${c.pct}%`,
                      height: '100%',
                      background: c.pct > 75 ? 'var(--ayush-teal)' : c.pct > 50 ? 'var(--clinical-blue)' : 'var(--safety-amber)',
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pending PI Sign-Offs Queue */}
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Investigator Approval Queue
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Clinical exceptions and protocol adjustments requiring your formal medical sign-off
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Approval Item 1 */}
            <div style={{
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              background: approvedItems['dev-1'] ? 'var(--ayush-emerald-light)' : '#ffffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-amber">Visit Window Exception</span>
                <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Patient AIIA-01-019</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px' }}>
                Day 28 protocol checkup performed on Day 32 (+4 days tolerance) due to documented travel delay. No safety risk observed.
              </p>
              {approvedItems['dev-1'] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ayush-emerald)', fontWeight: 600, fontSize: '0.78125rem' }}>
                  <CheckCircle2 size={14} />
                  <span>Approved by Lead PI</span>
                </div>
              ) : (
                <button
                  onClick={() => handleApprove('dev-1')}
                  className="btn btn-cobalt btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  <FileCheck2 size={13} />
                  <span>Approve & Authorize Exception</span>
                </button>
              )}
            </div>

            {/* Approval Item 2 */}
            <div style={{
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              background: approvedItems['elig-1'] ? 'var(--ayush-emerald-light)' : '#ffffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-blue">Baseline Eligibility Clearance</span>
                <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Patient AIIA-01-042</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px' }}>
                Rotterdam diagnostic criteria confirmed on pelvic ultrasound. Fasting insulin 16.4 μIU/mL. Ready for formulation dispensation.
              </p>
              {approvedItems['elig-1'] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ayush-emerald)', fontWeight: 600, fontSize: '0.78125rem' }}>
                  <CheckCircle2 size={14} />
                  <span>Cleared for Dispensation</span>
                </div>
              ) : (
                <button
                  onClick={() => handleApprove('elig-1')}
                  className="btn btn-cobalt btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  <CheckCircle2 size={13} />
                  <span>Sign Off Baseline Clearance</span>
                </button>
              )}
            </div>
          </div>

          {/* Clinical Insights Strip */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginTop: '16px'
          }}>
            <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Study Milestone Summary
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Trial Phase III interim report scheduled at 250 completed Day-28 milestones (currently at 194).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
