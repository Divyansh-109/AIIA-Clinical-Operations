import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Plus,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileCheck2
} from 'lucide-react';

interface CoordinatorDashboardProps {
  flagshipStudy: any;
  currentRole: string;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = () => {
  const navigate = useNavigate();

  // State for quick vitals entry modal
  const [activeModalPatient, setActiveModalPatient] = useState<any | null>(null);
  const [systolic, setSystolic] = useState('118');
  const [diastolic, setDiastolic] = useState('78');
  const [pulse, setPulse] = useState('72');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const todayAppointments = [
    {
      id: 'AIIA-01-008',
      name: 'Sunita Sharma',
      visitType: 'Day 28 Milestone',
      scheduledTime: '10:30 AM',
      status: 'In Waiting Room',
      complianceNotes: 'Bottles returned: 56/60 doses taken (93.3%)',
      badge: 'badge-amber'
    },
    {
      id: 'AIIA-01-012',
      name: 'Pooja Verma',
      visitType: 'Day 14 Follow-up',
      scheduledTime: '11:45 AM',
      status: 'Confirmed Scheduled',
      complianceNotes: 'Routine checkup & vital signs review',
      badge: 'badge-blue'
    },
    {
      id: 'AIIA-01-015',
      name: 'Ananya Roy',
      visitType: 'Baseline Screening (Day 0)',
      scheduledTime: '02:00 PM',
      status: 'Confirmed Scheduled',
      complianceNotes: 'eConsent signed · Baseline blood draw scheduled',
      badge: 'badge-emerald'
    }
  ];

  const windowAlerts = [
    {
      patientId: 'AIIA-01-019',
      targetVisit: 'Day 28 Follow-up',
      targetDate: '2026-09-28',
      windowRange: '2026-09-25 to 2026-10-01 (±3 days)',
      daysRemaining: '3 days remaining',
      status: 'Call Placed'
    },
    {
      patientId: 'AIIA-01-022',
      targetVisit: 'Day 14 Checkup',
      targetDate: '2026-09-29',
      windowRange: '2026-09-26 to 2026-10-02 (±3 days)',
      daysRemaining: '4 days remaining',
      status: 'Reminder SMS Sent'
    }
  ];

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(`Vitals recorded successfully for ${activeModalPatient?.id}!`);
    setTimeout(() => {
      setSavedSuccess(null);
      setActiveModalPatient(null);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. TOP GREETING & QUICK ACTION BAR */}
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
            background: 'var(--clinical-cobalt-light)',
            color: 'var(--clinical-cobalt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Site Study Coordinator Desk
              </h1>
              <span className="badge badge-cobalt">Delhi Apex Center</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', margin: 0 }}>
              Hospital OPD Clinic · Managing Participant Visits & Daily Vitals
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/app/patients')}
            className="btn btn-cobalt btn-sm"
          >
            <Plus size={14} />
            <span>Enroll New Participant</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR KEY COORDINATOR METRIC CARDS */}
      <div className="responsive-kpi-grid" style={{ display: 'grid' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Today's OPD Appointments
            </span>
            <CalendarCheck size={18} color="var(--clinical-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            3 Patients
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--clinical-blue)', fontWeight: 600 }}>
            1 currently in clinic waiting area
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Center Patient Cohort
            </span>
            <Users size={18} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            84 Enrolled
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>
            84% of Center 01 Target (100)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Window Guardian
            </span>
            <Clock size={18} color="var(--safety-amber)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--safety-amber)', marginBottom: '4px' }}>
            2 Upcoming
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Visits due within 72 hours
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              eConsent Status
            </span>
            <CheckCircle2 size={18} color="var(--ayush-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ayush-emerald)', marginBottom: '4px' }}>
            100% Signed
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All electronic consents archived
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN OPERATIONAL SPLIT */}
      <div className="dashboard-split-grid" style={{ display: 'grid' }}>
        {/* Left Column: Today's Appointments Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Today's Hospital Appointments
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Scheduled participant checkups, drug counts, and routine health assessments
              </p>
            </div>
            <span className="badge badge-emerald">Opd Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {todayAppointments.map((appt, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{appt.id}</strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>· {appt.name}</span>
                    <span className={`badge ${appt.badge}`}>{appt.visitType}</span>
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                    Scheduled Time: <strong style={{ color: 'var(--text-primary)' }}>{appt.scheduledTime}</strong> · {appt.complianceNotes}
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalPatient(appt)}
                  className="btn btn-cobalt btn-sm"
                  style={{ gap: '6px' }}
                >
                  <HeartPulse size={14} />
                  <span>Record Vitals</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Protocol Window Tracker */}
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Visit Window Guardian
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Active ±3 day tolerance windows to avoid protocol deviations
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {windowAlerts.map((w, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{w.patientId}</strong>
                  <span className="badge badge-amber">{w.daysRemaining}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {w.targetVisit} due on {w.targetDate}
                </div>
                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                  Window Range: {w.windowRange}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/app/protocol')}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '16px' }}
          >
            <span>Open Window Calculator</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* QUICK VITALS RECORDING MODAL */}
      {activeModalPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Record OPD Vitals
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Patient: <strong style={{ color: 'var(--ayush-teal-dark)' }}>{activeModalPatient.id} ({activeModalPatient.name})</strong> · {activeModalPatient.visitType}
            </p>

            {savedSuccess ? (
              <div style={{
                padding: '16px',
                background: 'var(--ayush-emerald-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--ayush-emerald)',
                textAlign: 'center',
                fontWeight: 700
              }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                <div>{savedSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleSaveVitals}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="input-text"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="input-text"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Pulse Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setActiveModalPatient(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cobalt">
                    Save Vitals to Case Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
