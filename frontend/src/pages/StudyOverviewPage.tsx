import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  FolderGit2,
  Users,
  ShieldCheck,
  AlertOctagon,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface StudyOverviewPageProps {
  flagshipStudy: any;
  currentRole: string;
}

export const StudyOverviewPage: React.FC<StudyOverviewPageProps> = ({ flagshipStudy, currentRole }) => {
  const navigate = useNavigate();
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [cc, sList, pList] = await Promise.all([
        api.getStudyControlCenter(studyId),
        api.getSites(studyId),
        api.getProtocols(studyId)
      ]);
      setControlCenter(cc);
      setSites(sList);
      setProtocols(pList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const lifecyclePhases = [
    'DRAFT', 'PROTOCOL_FINALIZED', 'ETHICS_PENDING', 'ETHICS_APPROVED',
    'CTRI_REGISTERED', 'SITE_ACTIVATION', 'RECRUITING', 'ACTIVE',
    'FOLLOW_UP', 'CLOSE_OUT', 'COMPLETED'
  ];
  const currentStatus = flagshipStudy?.status || 'RECRUITING';
  const currentIdx = lifecyclePhases.indexOf(currentStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. STUDY MASTER HEADER */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">{flagshipStudy?.study_code || 'AIIA-PCOS-001'}</span>
              <span className="badge badge-blue">PHASE III MULTI-CENTRIC</span>
              <span className="badge badge-purple">Ayurvedic Endocrinology</span>
              <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                CTRI/2026/08/042109 · IEC/AIIA/2026/04
              </span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '920px', lineHeight: 1.3 }}>
              {flagshipStudy?.title || 'Clinical Evaluation of Ayush-PCOS Formulation in Women of Reproductive Age with Polycystic Ovary Syndrome'}
            </h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Lead Principal Investigator: <strong>Prof. (Dr.) Tanuja Manoj Nesari</strong> · 8 Certified Ayush Research Hospitals · 500 Target Cohort
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Lifecycle Status
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.875rem', marginTop: '4px', padding: '4px 12px' }}>
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Ayurvedic Formulation Profile */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          fontSize: '0.8125rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Classical Formulation</span>
            <strong style={{ color: 'var(--ayush-teal-dark)', fontSize: '0.875rem' }}>
              Ayush-PCOS Kwatha & Vati
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Standard Dosage & Route</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              500mg BID with lukewarm water
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Classical Reference</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              Sahasrayogam (Kwatha Prakarana)
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Standard Morbidity Code</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              Artava-Kshaya (NAMASTE AYU-GYN-042)
            </strong>
          </div>
        </div>

        {/* Visual Lifecycle Progression */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
            Study Lifecycle Progression
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {lifecyclePhases.map((phase, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <React.Fragment key={phase}>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    background: isCurrent ? 'var(--ayush-teal)' : isPast ? '#e0f2fe' : 'var(--bg-primary)',
                    color: isCurrent ? '#ffffff' : isPast ? '#0369a1' : 'var(--text-muted)',
                    border: isCurrent ? '1px solid var(--ayush-teal-dark)' : '1px solid var(--border-subtle)'
                  }}>
                    {phase}
                  </div>
                  {idx < lifecyclePhases.length - 1 && (
                    <span style={{ color: isPast ? '#0369a1' : 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. FOUR HEALTH DIMENSIONS (EXPLAINABLE, UNCLUTTERED) */}
      <div className="grid-4">
        <div
          onClick={() => navigate('/app/patients')}
          className="card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--ayush-teal)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT RECRUITMENT</span>
            <span className="badge badge-emerald">64% Target</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            320 / 500
          </div>
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active across 8 certified Ayush hospitals.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-teal)', marginTop: '8px', fontWeight: 600 }}>
            View Patients List →
          </div>
        </div>

        <div
          onClick={() => navigate('/app/safety')}
          className="card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--danger-rose)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SAFETY SURVEILLANCE</span>
            <span className="badge badge-rose">1 Active Clock</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger-rose)' }}>
            18.5h Left
          </div>
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Fast-track 24h notification for CDSCO Form 44.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--danger-rose)', marginTop: '8px', fontWeight: 600 }}>
            Open Safety Desk →
          </div>
        </div>

        <div
          onClick={() => navigate('/app/protocol')}
          className="card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--clinical-blue)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PROTOCOL GUARDIAN</span>
            <span className="badge badge-blue">Day 28 ± 3d</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            91.2%
          </div>
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automated checkup window compliance rate.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--clinical-blue)', marginTop: '8px', fontWeight: 600 }}>
            Check Protocol Rules →
          </div>
        </div>

        <div
          onClick={() => navigate('/app/quality')}
          className="card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--safety-amber)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATA QUALITY</span>
            <span className="badge badge-amber">2 Queries</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            18.5 hrs
          </div>
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Average discrepancy resolution turnaround.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--safety-amber)', marginTop: '8px', fontWeight: 600 }}>
            Inspect Queries →
          </div>
        </div>
      </div>

      {/* 3. HOSPITAL NETWORK OVERVIEW PREVIEW */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Hospital Recruitment Performance (8 Ayush Clinical Centers)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Live patient enrollment metrics across certified teaching hospitals.
            </p>
          </div>

          <button
            onClick={() => navigate('/app/sites')}
            className="btn btn-secondary btn-sm"
          >
            <span>View All Hospital Details</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {sites.slice(0, 4).map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="badge badge-blue">{s.site_code}</span>
                <span className="badge badge-emerald">{s.status}</span>
              </div>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>
                {s.site_name}
              </strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {s.location}
              </div>

              <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recruitment:</span>
                <strong>{s.actual_enrollment} / {s.target_enrollment}</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (s.actual_enrollment / (s.target_enrollment || 1)) * 100)}%`,
                  height: '100%',
                  background: 'var(--ayush-teal)'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
