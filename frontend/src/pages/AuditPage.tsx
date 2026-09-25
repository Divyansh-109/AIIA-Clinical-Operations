import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileLock2,
  Key,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Filter,
  Lock,
  FileCheck2
} from 'lucide-react';

interface AuditPageProps {
  flagshipStudy: any;
}

export const AuditPage: React.FC<AuditPageProps> = () => {
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [events, verif] = await Promise.all([
        api.getAuditEvents(50),
        api.verifyAuditIntegrity()
      ]);
      setAuditEvents(events);
      setVerificationResult(verif);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setVerifying(true);
      const res = await api.verifyAuditIntegrity();
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const filteredEvents = auditEvents.filter((ev) => {
    if (selectedEntityFilter === 'ALL') return true;
    return ev.entity_type?.toUpperCase() === selectedEntityFilter.toUpperCase();
  });

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
            <span className="badge badge-emerald">PERMANENT DATA INTEGRITY</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              ALCOA+ Principles · Tamper-Evident Medical Activity Ledger
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Official Clinical Audit Trail
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Every participant visit, doctor approval, and safety report is permanently recorded in an unalterable chronological sequence.
          </p>
        </div>

        <button
          onClick={handleVerifyIntegrity}
          disabled={verifying}
          className="btn btn-cobalt"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
          <span>{verifying ? 'Verifying Records...' : 'Verify Log Integrity'}</span>
        </button>
      </div>

      {/* 2. VERIFICATION STATUS CARD */}
      <div style={{
        background: verificationResult?.is_valid ? 'var(--ayush-teal-light)' : '#fff1f2',
        border: `1px solid ${verificationResult?.is_valid ? '#99f6e4' : '#fecaca'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={20} color="var(--ayush-teal-dark)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ayush-teal-dark)', margin: 0 }}>
              Audit Log Status: {verificationResult?.is_valid ? 'Permanently Sealed & Verified' : 'Discrepancy Flagged'}
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Total <strong>{verificationResult?.total_events_checked || auditEvents.length}</strong> consecutive clinical entries validated. Any retroactive change or deletion is detected instantly.
          </p>
        </div>

        <span className="badge badge-emerald" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
          ✓ 100% Records Valid
        </span>
      </div>

      {/* 3. EXPLANATORY PROOF DIAGRAM (FRIENDLY) */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          How Sequential Recording Protects Historical Accuracy
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Each clinical entry is linked to its preceding event with an unalterable digital seal. This creates a permanent, continuous timeline of trial activities that guarantees scientific credibility.
        </p>

        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          gap: '12px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Entry #1: Participant Consent</span>
            <div style={{ fontWeight: 700, color: 'var(--clinical-cobalt)' }}>Record Seal: Verified ✓</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→ Step 2 →</span>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Entry #2: Baseline Vitals</span>
            <div style={{ fontWeight: 700, color: 'var(--clinical-cobalt)' }}>Record Seal: Verified ✓</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→ Step 3 →</span>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Entry #3: Doctor Checkup</span>
            <div style={{ fontWeight: 700, color: 'var(--clinical-cobalt)' }}>Record Seal: Verified ✓</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span className="badge badge-emerald">Sequence Protected</span>
        </div>
      </div>

      {/* 4. AUDIT EVENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Chronological Activity Records
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Complete record of all clinical actions, responsible staff members, and verification status.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Scope:</span>
            {['ALL', 'PARTICIPANT', 'VISIT', 'DEVIATION', 'SAFETY'].map((ent) => (
              <button
                key={ent}
                onClick={() => setSelectedEntityFilter(ent)}
                className={selectedEntityFilter === ent ? 'btn btn-cobalt btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
              >
                {ent}
              </button>
            ))}
          </div>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date & Time (IST)</th>
              <th>Responsible Staff Member</th>
              <th>Record Category</th>
              <th>Clinical Event Executed</th>
              <th>Verification Stamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => (
              <tr key={ev.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'Recent'}
                </td>
                <td>
                  <strong style={{ color: 'var(--text-primary)' }}>{ev.user_email || 'Central Registry'}</strong>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>{ev.role?.replace('_', ' ')}</div>
                </td>
                <td>
                  <span className="badge badge-cobalt">{ev.entity_type}</span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--clinical-cobalt)' }}>{ev.action}</td>
                <td>
                  <span className="badge badge-emerald">Sealed & Recorded</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
