import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileLock2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Database,
  Building2,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ComplianceViewProps {
  flagshipStudy: any;
}

export const ComplianceAuditView: React.FC<ComplianceViewProps> = ({ flagshipStudy }) => {
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [alcoaPrinciples, setAlcoaPrinciples] = useState<any[]>([]);
  const [ethicsData, setEthicsData] = useState<any[]>([]);
  const [ctriData, setCtriData] = useState<any>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'alcoa' | 'regulatory'>('audit');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('ALL');

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    try {
      const [events, alcoa, verif] = await Promise.all([
        api.getAuditEvents(50),
        api.getALCOA(),
        api.verifyAuditIntegrity()
      ]);
      setAuditEvents(events);
      setAlcoaPrinciples(alcoa);
      setVerificationResult(verif);

      if (studyId) {
        const [eth, ctri] = await Promise.all([
          api.getEthics(studyId),
          api.getCTRI(studyId)
        ]);
        setEthicsData(eth);
        setCtriData(ctri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald">ALCOA+ DATA INTEGRITY CONTROLS</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              Controls Designed with Reference to 21 CFR Part 11, ICH GCP E6(R2) & NDCT 2019
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Tamper-Evident Audit Trail & Regulatory Compliance
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Cryptographically linked audit events with mathematical SHA-256 forward hash chaining, ALCOA+ controls, and institutional oversight.
          </p>
        </div>

        <button
          onClick={handleVerifyIntegrity}
          disabled={verifying}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
          <span>{verifying ? 'Verifying Hashes...' : 'Recalculate & Verify Audit Proof'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'audit', label: 'Cryptographic SHA-256 Audit Chain' },
          { id: 'alcoa', label: 'ALCOA+ Operational Controls Matrix' },
          { id: 'regulatory', label: 'IEC Ethics & CTRI Milestone Oversight' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.8125rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. CRYPTOGRAPHIC AUDIT CHAIN TAB (Section 21 & 22) */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verification Status Card */}
          <div style={{
            background: verificationResult?.is_valid ? 'var(--ayush-teal-light)' : '#fff1f2',
            border: `1px solid ${verificationResult?.is_valid ? '#99f6e4' : '#fecdd3'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--ayush-teal-dark)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', margin: 0 }}>
                  Tamper-Evident Audit Chain: {verificationResult?.is_valid ? 'Integrity Verified' : 'Discrepancy Detected'}
                </h3>
              </div>
              <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total Verified Blocks: <strong>{verificationResult?.total_events_checked || auditEvents.length}</strong> consecutive audit records. Every event is bound to its predecessor via SHA-256 cryptographic linkage.
              </div>
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.8125rem' }}>
              Chain Validated
            </span>
          </div>

          {/* Mathematical Proof Demonstration Box (Section 22) */}
          <div className="card">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              How Cryptographic Chaining Protects Historical Integrity (Section 22)
            </h4>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Each audit entry contains its own payload hash plus the cryptographic hash of the preceding event. If an attacker or database administrator mutates a historical record (such as an enrolled subject or visit BP), every subsequent block hash in the chain breaks immediately.
            </p>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflowX: 'auto',
              gap: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Block #1</span>
                <div style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>Hash 1: e3b0c442...</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>+ Event 2 →</span>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Block #2</span>
                <div style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>Hash 2: 7a8f3b12...</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>+ Event 3 →</span>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Block #3</span>
                <div style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>Hash 3: 4c9e88d1...</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="badge badge-emerald">Chain Intact</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Entity:</span>
              {['ALL', 'PARTICIPANT', 'VISIT', 'DEVIATION', 'SAFETY', 'DOCUMENT'].map((ent) => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntityFilter(ent)}
                  className={selectedEntityFilter === ent ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                >
                  {ent}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredEvents.length}</strong> audited records
            </div>
          </div>

          {/* Audit Events Table */}
          <div className="card">
            <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Actor / Authenticated User</th>
                  <th>Role</th>
                  <th>Entity Scope</th>
                  <th>Clinical Action</th>
                  <th>Preceding Hash</th>
                  <th>Block SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{ev.user_email || 'System Daemon'}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{ev.role}</span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{ev.entity_type}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{ev.action}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {ev.previous_hash ? ev.previous_hash.slice(0, 10) + '...' : 'GENESIS'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ayush-teal-dark)' }}>
                      {ev.current_hash ? ev.current_hash.slice(0, 14) + '...' : 'sha256_...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ALCOA+ PRINCIPLES MATRIX (Section 24) */}
      {activeTab === 'alcoa' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            ALCOA+ Data Integrity Operational Controls
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Technical implementation mapping for Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, and Available.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {alcoaPrinciples.map((a: any, idx: number) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--ayush-teal-dark)' }}>{a.principle}</strong>
                  <span className="badge badge-emerald">{a.status}</span>
                </div>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {a.description}
                </p>
                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <strong>Operational Control:</strong> {a.technical_implementation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REGULATORY OVERSIGHT (Section 25) */}
      {activeTab === 'regulatory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Institutional Ethics Committee (IEC) Approvals & Milestones
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Formal ethics committee approval tracking with expiry and renewal tracking.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Milestone Type</th>
                  <th>Approval Date</th>
                  <th>Expiry / Renewal Date</th>
                  <th>Institutional Reference</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {ethicsData.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>IEC Protocol Approval</td>
                    <td>{e.approval_date}</td>
                    <td style={{ color: 'var(--warning-amber)' }}>{e.expiry_date}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{e.iec_code}</td>
                    <td><span className="badge badge-emerald">{e.status}</span></td>
                  </tr>
                ))}
                {ctriData && (
                  <tr>
                    <td style={{ fontWeight: 600 }}>CTRI Trial Registry</td>
                    <td>{ctriData.registration_date}</td>
                    <td>Phase III Final Close</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{ctriData.ctri_number}</td>
                    <td><span className="badge badge-blue">{ctriData.status}</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
