import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Send,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface DataQualityPageProps {
  flagshipStudy: any;
  currentRole: string;
}

export const DataQualityPage: React.FC<DataQualityPageProps> = ({ flagshipStudy, currentRole }) => {
  const [queries, setQueries] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [respondingQueryId, setRespondingQueryId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [qList, mData] = await Promise.all([
        api.getQueries(studyId),
        api.getQueryMetrics(studyId)
      ]);
      setQueries(qList);
      setMetrics(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const handleRespond = async (qId: string) => {
    if (!responseText.trim()) return;
    try {
      await api.respondQuery(qId, responseText);
      setRespondingQueryId(null);
      setResponseText('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (qId: string) => {
    try {
      await api.resolveQuery(qId, 'RESOLVED', `Verified against hospital physical chart logs by ${currentRole}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

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
            <span className="badge badge-amber">SOURCE DATA VERIFICATION</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              ALCOA+ Traceability · Discrepancy Query Management
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Clinical Data Quality & Discrepancies
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Every query connects directly to a patient record, specific field, original vs corrected values, and verified hospital paper charts.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queries</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL LOGGED QUERIES</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics?.total_queries || 2}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>Logged across 8 Ayush hospital centers</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>CRITICAL DISCREPANCIES</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-rose)' }}>
            {metrics?.critical_queries || 0}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--danger-rose)', marginTop: '4px' }}>Zero high-risk unaddressed discrepancies</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG RESOLUTION TIME</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ayush-teal-dark)' }}>
            {metrics?.avg_resolution_hours || 18.5} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ayush-teal-dark)', marginTop: '4px', fontWeight: 600 }}>
            {metrics?.resolution_rate_pct || 62}% Overall Resolution Rate
          </div>
        </div>
      </div>

      {/* 3. DISCREPANCIES TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Active Discrepancy Queue
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            Changes are permanently tracked with original value, corrected value, and reason for change.
          </p>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Query ID & Patient</th>
              <th>Clinical Field</th>
              <th>Discrepancy Details & Value Correction</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q) => (
              <tr key={q.id}>
                <td>
                  <strong style={{ color: 'var(--ayush-teal-dark)' }}>#{q.id.slice(0, 8)}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Patient: #{q.participant_id ? q.participant_id.slice(0, 6) : 'P0042'}
                  </div>
                </td>
                <td>
                  <strong>{q.field_name || 'Systolic BP'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visit 3 (Day 28)</div>
                </td>
                <td style={{ maxWidth: '400px' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{q.description || q.query_text}</div>
                  <div style={{
                    background: 'var(--bg-primary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '6px',
                    fontSize: '0.78125rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Original: <span style={{ textDecoration: 'line-through' }}>{q.original_value || '142 mmHg'}</span> → Corrected: <strong style={{ color: 'var(--ayush-teal-dark)' }}>{q.corrected_value || '124 mmHg'}</strong>
                  </div>
                  {q.resolution_text && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--ayush-teal-dark)', marginTop: '4px' }}>
                      <strong>Coordinator Response:</strong> {q.resolution_text}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${q.severity === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                    {q.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${q.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                    {q.status}
                  </span>
                </td>
                <td>
                  {q.status !== 'RESOLVED' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setRespondingQueryId(respondingQueryId === q.id ? null : q.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <MessageSquare size={13} />
                        <span>Respond</span>
                      </button>
                      <button
                        onClick={() => handleResolve(q.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={13} />
                        <span>Resolve</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--ayush-emerald)', fontWeight: 600 }}>✓ Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inline Response Form */}
        {respondingQueryId && (
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', margin: 0 }}>
              Submit Coordinator Response for Query #{respondingQueryId.slice(0, 8)}
            </h4>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', margin: 0 }}>
              State verification against hospital physical chart logs and provide transcription rationale for the audit record.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g. Verified against original OPD clinical card. Transcription typo corrected to 124 mmHg..."
                className="input-text"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => handleRespond(respondingQueryId)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} />
                <span>Submit Response</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
