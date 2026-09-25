import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Network,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Activity,
  Search,
  AlertTriangle,
  FileText,
  Eye,
  ArrowRight
} from 'lucide-react';

interface TrustViewProps {
  flagshipStudy: any;
}

export const TrialTrustView: React.FC<TrustViewProps> = ({ flagshipStudy }) => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [evidenceGraph, setEvidenceGraph] = useState<any>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  useEffect(() => {
    if (!studyId) return;
    const fetchTrust = async () => {
      try {
        setLoading(true);
        const [anomList, graph] = await Promise.all([
          api.getTrialTrust(studyId),
          api.getEvidenceGraph(studyId)
        ]);
        setAnomalies(anomList);
        setEvidenceGraph(graph);
        if (anomList.length > 0) {
          setSelectedAnomaly(anomList[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrust();
  }, [studyId]);

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
            <span className="badge badge-amber">DATA INTEGRITY SURVEILLANCE</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              Statistical Distribution Tests & Evidence Graph (Section 15 & 16)
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Trial Data Integrity & Statistical Evidence Graph
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Identifies potential statistical anomalies (such as digit clustering, identical vitals, or temporal clustering) for objective human clinical verification.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Potential Integrity Concerns
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
            {anomalies.length} Flagged Indicators
          </div>
        </div>
      </div>

      {/* Explanatory Ethical Framing Notice (Section 15) */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        fontSize: '0.8125rem',
        color: '#92400e',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AlertTriangle size={18} color="var(--warning-amber)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Ethical AI Principles & Objective Phrasing (Section 15):</strong> Anomaly detectors flag statistical distribution deviations. Findings are classified as <strong>Potential Data Integrity Concerns requiring human clinical verification</strong>, never automated accusations of fraud or misconduct.
        </div>
      </div>

      {/* Main Layout: Anomaly Directory & Deep Evidence Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
        {/* Left: Anomaly Concerns List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Flagged Data Integrity Indicators ({anomalies.length})
          </h3>

          {anomalies.map((a, idx) => {
            const isSelected = selectedAnomaly?.title === a.title;
            return (
              <div
                key={idx}
                onClick={() => setSelectedAnomaly(a)}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid var(--ayush-teal)' : '4px solid var(--warning-amber)',
                  background: isSelected ? 'var(--ayush-teal-light)' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-rose">{a.site_code}</span>
                  <span className="badge badge-amber">{a.confidence} Confidence</span>
                </div>

                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {a.title}
                </h4>

                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {a.evidence_narrative.slice(0, 110)}...
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Deep Evidence Graph Inspector (Section 16) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="var(--ayush-teal)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Statistical Evidence Hierarchy Graph (Section 16)
            </h3>
          </div>

          {selectedAnomaly ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px'
              }}>
                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Indicator</div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{selectedAnomaly.title}</strong>
                <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Site: <strong>{selectedAnomaly.site_code}</strong> · Detection Rule: Statistical Variance & Digit Distribution
                </div>
              </div>

              {/* Hierarchy Tree (Section 16) */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.78125rem',
                fontFamily: 'var(--font-mono)',
                background: '#ffffff'
              }}>
                <div style={{ color: 'var(--ayush-teal-dark)', fontWeight: 600 }}>Study: AIIA-PCOS-001</div>
                <div style={{ paddingLeft: '14px', color: 'var(--text-primary)' }}>
                  └── Site: {selectedAnomaly.site_code} (IPGTRA Jamnagar)
                </div>
                <div style={{ paddingLeft: '28px', color: 'var(--text-secondary)' }}>
                  └── Participants: 12 Enrolled Subjects (P0018 - P0030)
                </div>
                <div style={{ paddingLeft: '42px', color: 'var(--text-secondary)' }}>
                  └── Visit 2 Attendance Records (2026-09-12)
                </div>
                <div style={{ paddingLeft: '56px', color: 'var(--warning-amber)' }}>
                  └── Vital Measurement: Systolic BP = 120 mmHg, Diastolic BP = 80 mmHg
                </div>
                <div style={{ paddingLeft: '70px', color: 'var(--danger-rose)' }}>
                  └── Statistical Anomaly: Variance σ² = 0.00 (p &lt; 0.001 vs Cohort σ² = 64.2)
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Evidence Summary:</strong> {selectedAnomaly.evidence_narrative}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                marginTop: '4px'
              }}>
                <button
                  onClick={() => alert(`Opening source case report forms for Site ${selectedAnomaly.site_code}...`)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Eye size={13} />
                  <span>Inspect Source eCRFs</span>
                </button>
                <button
                  onClick={() => alert(`Clinical Query generated for CRA monitor verification at Site ${selectedAnomaly.site_code}.`)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FileText size={13} />
                  <span>Initiate On-Site Verification Query</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Select an indicator from the left to view evidence hierarchy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
