import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Clock,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Send,
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';

interface SafetyDashboardProps {
  flagshipStudy: any;
  currentRole: string;
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = () => {
  const navigate = useNavigate();

  // Simulated 24-hour statutory countdown clock (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });
  const [reportDispatched, setReportDispatched] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adverseEvents = [
    {
      id: 'AE-001',
      patientId: 'AIIA-01-024',
      site: 'Delhi Apex Center',
      symptom: 'Acute Gastroenteritis (Brief Hospitalization)',
      severity: 'SERIOUS',
      onset: '2026-09-24',
      causality: 'Unlikely Related (Viral Foodborne Etiology)',
      status: '24h Clock Active'
    },
    {
      id: 'AE-002',
      patientId: 'AIIA-01-008',
      site: 'Delhi Apex Center',
      symptom: 'Transient Mild Nausea after morning Kwatha dose',
      severity: 'MILD',
      onset: '2026-09-21',
      causality: 'Possible (Astringent Kashaya taste)',
      status: 'Resolved (Advised post-meal)'
    },
    {
      id: 'AE-003',
      patientId: 'AIIA-02-015',
      site: 'Varanasi BHU Center',
      symptom: 'Mild Localized Skin Itchiness',
      severity: 'MILD',
      onset: '2026-09-18',
      causality: 'Unlikely (Seasonal dermatitis)',
      status: 'Resolved with Aloe vera gel'
    },
    {
      id: 'AE-004',
      patientId: 'AIIA-03-011',
      site: 'Jamnagar ITRA Center',
      symptom: 'Mild Abdominal Bloating',
      severity: 'MILD',
      onset: '2026-09-15',
      causality: 'Unlikely',
      status: 'Self-limiting'
    }
  ];

  const filteredAEs = adverseEvents.filter(ae => {
    if (filterSeverity === 'ALL') return true;
    return ae.severity === filterSeverity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. TOP 24-HOUR STATUTORY COUNTDOWN CLOCK BANNER */}
      <div className="safety-countdown-banner" style={{
        background: reportDispatched ? 'var(--ayush-emerald-light)' : '#fff1f2',
        border: `1px solid ${reportDispatched ? '#a7f3d0' : '#fecdd3'}`,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: reportDispatched ? 'var(--ayush-emerald)' : 'var(--danger-rose)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {reportDispatched ? <CheckCircle2 size={28} /> : <Clock size={28} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className={`badge ${reportDispatched ? 'badge-emerald' : 'badge-rose'}`}>
                {reportDispatched ? 'CDSCO NOTIFICATION DISPATCHED' : 'ACTIVE 24-HOUR STATUTORY SAFETY CLOCK'}
              </span>
              <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                CDSCO GCP Rule 12(3) Compliance
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
              {reportDispatched
                ? 'Official 24h Notification Confirmed & Archived'
                : 'Urgent Initial Safety Report: Patient AIIA-01-024 (Hospitalization)'}
            </h2>

            <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', margin: 0 }}>
              {reportDispatched
                ? 'Receipt ID: CDSCO-SAE-2026-0925-AIIA · Forwarded to Ethics Committee & Lead PI'
                : 'Initial reporting required within 24 hours of notification to the Licensing Authority & Ethics Committee.'}
            </p>
          </div>
        </div>

        {/* Countdown Timer Display & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {!reportDispatched ? (
            <>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.71875rem', fontWeight: 700, color: 'var(--danger-rose)', textTransform: 'uppercase' }}>
                  Statutory Time Remaining
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger-rose)', fontFamily: 'var(--font-mono)' }}>
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>

              <button
                onClick={() => setReportDispatched(true)}
                className="btn btn-primary"
                style={{
                  background: 'var(--danger-rose)',
                  borderColor: 'var(--danger-rose)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                <Send size={15} />
                <span>Dispatch CDSCO Form 44 Notification</span>
              </button>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ayush-emerald)',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Compliant & Logged (05h 18m before deadline)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. FOUR KEY SAFETY VIGILANCE METRICS */}
      <div className="responsive-kpi-grid" style={{ display: 'grid' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Adverse Events Logged
            </span>
            <AlertOctagon size={18} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            4 Events
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-teal)', fontWeight: 600 }}>
            3 Mild (75%) · 1 Serious (25%)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Causality Assessment
            </span>
            <HeartPulse size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ayush-emerald)', marginBottom: '4px' }}>
            0 Drug-Related SAEs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            Zero toxic organ events
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Statutory 24h Clocks
            </span>
            <Clock size={18} color={reportDispatched ? 'var(--ayush-emerald)' : 'var(--danger-rose)'} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: reportDispatched ? 'var(--ayush-emerald)' : 'var(--danger-rose)', marginBottom: '4px' }}>
            {reportDispatched ? '0 Pending' : '1 Active'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% On-time compliance
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Medical Safety Board
            </span>
            <CheckCircle2 size={18} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--clinical-blue)', marginBottom: '4px' }}>
            DSMB Cleared
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Quarterly safety audit passed
          </div>
        </div>
      </div>

      {/* 3. ADVERSE EVENTS REGISTRY & CAUSALITY TABLE */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Patient Safety & Adverse Event Reports
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Comprehensive log of all reported side effects, severity classification, and WHO-UMC causality evaluation
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`btn btn-sm ${filterSeverity === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Events ({adverseEvents.length})
            </button>
            <button
              onClick={() => setFilterSeverity('SERIOUS')}
              className={`btn btn-sm ${filterSeverity === 'SERIOUS' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Serious (1)
            </button>
            <button
              onClick={() => setFilterSeverity('MILD')}
              className={`btn btn-sm ${filterSeverity === 'MILD' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Mild / Moderate (3)
            </button>
          </div>
        </div>

        {/* Clean Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Patient ID</th>
                <th>Hospital Center</th>
                <th>Reported Symptom</th>
                <th>Severity</th>
                <th>Ayush Causality (WHO-UMC)</th>
                <th>Resolution Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAEs.map((ae) => (
                <tr key={ae.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ae.id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{ae.patientId}</span>
                  </td>
                  <td>{ae.site}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ae.symptom}</td>
                  <td>
                    <span className={`badge ${ae.severity === 'SERIOUS' ? 'badge-rose' : 'badge-neutral'}`}>
                      {ae.severity}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {ae.causality}
                  </td>
                  <td>
                    <span className="badge badge-emerald">{ae.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
            Pharmacovigilance Program of India (PvPI) & National Pharmacovigilance Centre for Ayush (NPCA) integrated.
          </span>
          <button onClick={() => navigate('/app/safety')} className="btn btn-secondary btn-sm">
            <span>View Full Safety Regulatory Filings</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
