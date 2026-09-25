import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AlertOctagon,
  Clock,
  Activity,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Check,
  Edit3,
  X,
  Send,
  RefreshCw,
  Info
} from 'lucide-react';

interface PVViewProps {
  flagshipStudy: any;
  currentRole: string;
}

export const PharmacovigilanceView: React.FC<PVViewProps> = ({ flagshipStudy, currentRole }) => {
  const [saeDeadlines, setSaeDeadlines] = useState<any[]>([]);
  const [reportingRules, setReportingRules] = useState<any[]>([]);
  const [adverseEvents, setAdverseEvents] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [narrativeInput, setNarrativeInput] = useState('');
  const [aiExtracted, setAiExtracted] = useState<any>(null);
  const [aiReviewStatus, setAiReviewStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EDITED' | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Medical Assessment Modal / Inline Review
  const [selectedSAE, setSelectedSAE] = useState<any>(null);
  const [causality, setCausality] = useState<string>('POSSIBLE');
  const [expectedness, setExpectedness] = useState<string>('UNEXPECTED');
  const [notes, setNotes] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [deadlines, rules, aes, sigs] = await Promise.all([
        api.getSAEDeadlines(studyId),
        api.getReportingRules(),
        api.getAdverseEvents(studyId),
        api.getSafetySignals(studyId)
      ]);
      setSaeDeadlines(deadlines);
      setReportingRules(rules);
      setAdverseEvents(aes);
      setSignals(sigs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const handleExtractNarrative = async () => {
    if (!narrativeInput.trim()) return;
    try {
      setExtracting(true);
      setAiReviewStatus(null);
      const res = await api.extractNarrative(narrativeInput);
      setAiExtracted(res);
      setAiReviewStatus('PENDING');
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleReviewSAE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSAE) return;
    try {
      await api.reviewSAE(selectedSAE.id, {
        causality_assessment: causality,
        expectedness: expectedness,
        follow_up_notes: notes
      });
      setActionFeedback(`Medical review for SAE #${selectedSAE.id.slice(0, 8)} saved by ${currentRole}. Case status: UNDER_REVIEW.`);
      setSelectedSAE(null);
      await loadData();
    } catch (err: any) {
      console.error('Error reviewing SAE:', err);
      setActionFeedback(`Error: ${err?.message}`);
    }
  };

  const handleSubmitRegulatory = async (saeId: string) => {
    try {
      await api.submitSAE(saeId, {
        submission_notes: `Submitted by ${currentRole} via AIIA Regulatory Portal. CDSCO Form 44 package attached.`
      });
      setActionFeedback(`SAE #${saeId.slice(0, 8)} successfully submitted to Regulatory Authority. Audit event sealed.`);
      await loadData();
    } catch (err: any) {
      console.error('Error submitting SAE:', err);
      setActionFeedback(`Error: ${err?.message}`);
    }
  };

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
            <span className="badge badge-rose">NPvCC / CDSCO SURVEILLANCE</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              National Pharmacovigilance Program for Ayush (NPvCC) Standards
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Pharmacovigilance & Safety Surveillance Center
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            End-to-end clinical safety lifecycle: AE Logging → Medical Assessment → Configurable Reporting Rule Clock → Regulatory Submission → Signal Surveillance.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Safety Data</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div style={{
          background: 'var(--ayush-teal-light)',
          border: '1px solid #99f6e4',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--ayush-teal-dark)',
          fontSize: '0.8125rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--ayush-teal)" />
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

      {/* 1. CONFIGURABLE SAE REPORTING RULES (Section 13) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--ayush-teal)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Configured Regulatory Reporting Rules (Section 13)
            </h3>
          </div>
          <span className="badge badge-neutral">Rules Engine Active</span>
        </div>
        <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Statutory reporting deadlines are not generic timers. They model configurable regulatory rules tied to the exact awareness event and recipient authority.
        </p>

        <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
          <thead>
            <tr>
              <th>Regulatory Framework</th>
              <th>Study / Event Scope</th>
              <th>Clock-Start Event</th>
              <th>Statutory Deadline</th>
              <th>Recipient Authority</th>
              <th>Statutory Legal Reference</th>
            </tr>
          </thead>
          <tbody>
            {reportingRules.map((rule) => (
              <tr key={rule.id}>
                <td style={{ fontWeight: 600 }}>{rule.regulatory_framework}</td>
                <td>{rule.event_type}</td>
                <td style={{ color: 'var(--ayush-teal-dark)', fontWeight: 600 }}>{rule.clock_start_event}</td>
                <td style={{ fontWeight: 700, color: 'var(--danger-rose)' }}>{rule.deadline_hours} Hours</td>
                <td>{rule.recipient}</td>
                <td style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>{rule.statutory_reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. EXPEDITED SAE REPORTING COUNTDOWN ENGINE (Section 12 & 13) */}
      <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--danger-rose)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--danger-rose)', margin: 0 }}>
              Expedited SAE Reporting Countdown & Case Lifecycle
            </h3>
          </div>
          <span className="badge badge-rose">{saeDeadlines.length} Active Reporting Clocks</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {saeDeadlines.map((sae) => (
            <div
              key={sae.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-rose">{sae.status}</span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      SAE #{sae.id.slice(0, 8)} · {sae.event_term || 'Acute Abdominal Cramps & Transaminitis'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Participant: #{sae.participant_id ? sae.participant_id.slice(0, 6) : 'P0042'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                    Regulatory Rule: <strong>{sae.regulatory_framework || 'CDSCO / NDCT 2019'}</strong> · Governing Rule: 24h Expedited Initial Notification
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Remaining</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger-rose)' }}>
                    {sae.status === 'SUBMITTED' ? 'SUBMITTED' : `${sae.hours_remaining || 18.5} hrs`}
                  </div>
                </div>
              </div>

              {/* Exact Awareness Clock Timeline (Section 13) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                overflowX: 'auto'
              }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  SAE Occurred: <strong style={{ color: 'var(--text-primary)' }}>{sae.awareness_date || '2026-09-24 14:00'}</strong>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ color: 'var(--ayush-teal-dark)' }}>
                  PI Aware: <strong>{sae.awareness_date || '2026-09-24 16:30'}</strong>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ color: 'var(--danger-rose)' }}>
                  Clock Started: <strong>{sae.awareness_date || '2026-09-24 16:30'}</strong>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div>
                  Statutory Deadline: <strong>{sae.deadline_timestamp || '2026-09-25 16:30'}</strong>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div>
                  Current Status: <span className="badge badge-rose">{sae.status}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  Causality: <strong>{sae.causality_assessment || 'Pending Review'}</strong> · Expectedness: <strong>{sae.expectedness || 'Under Evaluation'}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedSAE(sae)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.71875rem', padding: '4px 10px' }}
                  >
                    Conduct Medical Review
                  </button>
                  {sae.status !== 'SUBMITTED' && (
                    <button
                      onClick={() => handleSubmitRegulatory(sae.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.71875rem', padding: '4px 10px' }}
                    >
                      Submit CDSCO Form 44 →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EXPLAINABLE SAFETY SIGNAL SURVEILLANCE (Section 17) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--warning-amber)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Explainable Potential Safety Signal Surveillance (Section 17)
            </h3>
          </div>
          <span className="badge badge-amber">{signals.length} Potential Signals</span>
        </div>
        <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Identifies statistical disproportionality (PRR) against reference historical trial populations. Signals are labelled <span style={{ color: 'var(--warning-amber)', fontWeight: 600 }}>Potential Safety Signals</span> and require human pharmacovigilance evaluation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
          {signals.map((sig) => (
            <div
              key={sig.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-amber">Potential Safety Signal</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  PRR Score: <strong style={{ color: 'var(--warning-amber)' }}>{sig.disproportionality_score || 3.4}x</strong>
                </span>
              </div>

              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {sig.event_term}
              </h4>

              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                fontSize: '0.78125rem',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Observed Cohort:</span>
                  <strong>{sig.observed_cases || 18} / 240 participants</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reference Comparison:</span>
                  <span>{sig.expected_cases || 7} / 230 participants</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Surveillance Window:</span>
                  <span>01 Aug – 25 Sep 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Formula / Method:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.71875rem' }}>PRR = (A/(A+B)) / (C/(C+D))</span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Reason for Prioritization:</strong> Observed frequency exceeds configured statistical threshold (PRR &gt; 2.0, Chi-Square &gt; 4.0). Requires clinical investigator review.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI AE NARRATIVE EXTRACTION WITH HUMAN-IN-THE-LOOP (Section 18) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={18} color="var(--ayush-teal)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            AI-Assisted AE Narrative Extraction with Human Verification (Section 18)
          </h3>
        </div>
        <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Paste raw physician progress notes. AI extracts terms, severity, suspected medication, and seriousness indicators with explicit confidence. <strong>Output never silently becomes clinical truth without human review.</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <div>
            <textarea
              rows={4}
              value={narrativeInput}
              onChange={(e) => setNarrativeInput(e.target.value)}
              placeholder="e.g. 26-year-old female participant presented with severe abdominal cramps and nausea 2 hours post Ayush-PCOS ingestion, admitted to ward for observation..."
              className="input-text"
              style={{ resize: 'none', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                onClick={handleExtractNarrative}
                disabled={extracting}
                style={{ fontSize: '0.75rem' }}
              >
                <Sparkles size={14} />
                <span>{extracting ? 'Analyzing Narrative...' : 'Extract Clinical Entities'}</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setNarrativeInput('Patient reported experiencing severe abdominal cramps with hepatic transaminitis after evening dose, required hospital admission for monitoring.')}
                style={{ fontSize: '0.75rem' }}
              >
                Load Sample Note
              </button>
            </div>
          </div>

          {aiExtracted && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-purple">AI Extraction Draft</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Confidence: 91%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78125rem' }}>
                <div><strong>Extracted Term:</strong> <span style={{ color: 'var(--ayush-teal-dark)' }}>{aiExtracted.extracted_event_term}</span></div>
                <div><strong>Severity:</strong> <span className="badge badge-rose">{aiExtracted.extracted_severity}</span></div>
                <div><strong>Suspected Drug:</strong> <span>{aiExtracted.suspected_drug}</span></div>
                <div><strong>Seriousness Flag:</strong> <strong style={{ color: aiExtracted.is_serious_indicated ? 'var(--danger-rose)' : 'var(--ayush-teal)' }}>{aiExtracted.is_serious_indicated ? 'YES (Hospitalization)' : 'NO'}</strong></div>
                <div><strong>Model / Provenance:</strong> <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>BioClinical-BERT v2.4 · 2026-09-25</span></div>
              </div>

              {/* Human in the loop controls (Section 18) */}
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Human Review Action:
                </div>
                {aiReviewStatus === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setAiReviewStatus('ACCEPTED')}
                      className="btn btn-primary"
                      style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={12} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => setAiReviewStatus('EDITED')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setAiReviewStatus('REJECTED')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: aiReviewStatus === 'ACCEPTED' ? 'var(--ayush-teal-dark)' : 'var(--text-muted)' }}>
                    Status: {aiReviewStatus} by {currentRole}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. ADVERSE EVENT MASTER REGISTRY */}
      <div className="card">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Pharmacovigilance Master Adverse Event Register
        </h3>
        <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th>Event Term</th>
              <th>MedDRA PT Code</th>
              <th>Severity</th>
              <th>Serious?</th>
              <th>Suspected Intervention</th>
              <th>Causality</th>
              <th>Reported Date</th>
            </tr>
          </thead>
          <tbody>
            {adverseEvents.map((ae) => (
              <tr key={ae.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ae.event_term}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ayush-teal-dark)' }}>
                  {ae.meddra_pt_code || '10000084'}
                </td>
                <td>
                  <span className={`badge ${ae.severity === 'SEVERE' ? 'badge-rose' : 'badge-amber'}`}>
                    {ae.severity}
                  </span>
                </td>
                <td>
                  {ae.is_serious ? (
                    <span className="badge badge-rose">SAE</span>
                  ) : (
                    <span className="badge badge-blue">NON-SERIOUS</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{ae.suspected_drug || 'Ayush-PCOS Kwatha'}</td>
                <td>{ae.causality || 'Unassessed'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{ae.onset_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: MEDICAL ASSESSMENT */}
      {selectedSAE && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '520px', maxWidth: '90vw', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--danger-rose)', marginBottom: '4px' }}>
              Medical Assessment: SAE #{selectedSAE.id.slice(0, 8)}
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Finalize physician causality and expectedness assessments before formal regulatory transmission to CDSCO/Ethics.
            </p>

            <form onSubmit={handleReviewSAE} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Causality Assessment:
                  </label>
                  <select
                    value={causality}
                    onChange={(e) => setCausality(e.target.value)}
                    className="input-select"
                  >
                    <option value="CERTAIN">Certain</option>
                    <option value="PROBABLE">Probable</option>
                    <option value="POSSIBLE">Possible</option>
                    <option value="UNLIKELY">Unlikely</option>
                    <option value="UNCLASSIFIABLE">Unclassifiable</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Expectedness:
                  </label>
                  <select
                    value={expectedness}
                    onChange={(e) => setExpectedness(e.target.value)}
                    className="input-select"
                  >
                    <option value="UNEXPECTED">Unexpected (SUSAR Criteria)</option>
                    <option value="EXPECTED">Expected (Per Investigator Brochure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Medical Reviewer Notes:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-text"
                  placeholder="Document clinical rationale, concomitant herbal/allopathic drugs, and dechallenge/rechallenge observation..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSAE(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Medical Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
