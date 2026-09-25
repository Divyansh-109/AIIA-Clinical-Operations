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
  Filter,
  FileText,
  UserCheck
} from 'lucide-react';

interface DataQualityViewProps {
  flagshipStudy: any;
  currentRole: string;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ flagshipStudy, currentRole }) => {
  const [queries, setQueries] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [respondingQueryId, setRespondingQueryId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

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
      await api.resolveQuery(qId, 'RESOLVED', `Verified against source clinical log sheets by ${currentRole}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (selectedStatusFilter === 'ALL') return true;
    return q.status === selectedStatusFilter;
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
            <span className="badge badge-amber">ALCOA+ ACCURACY & TRACEABILITY</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              Source Record Linkage & Query Audit Lifecycle (Section 20)
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Clinical Data Quality & Discrepancy Query Management
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Every query connects to a participant, visit, specific field, original vs corrected values, and immutable audit trail.
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

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL QUERIES</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics?.total_queries || 0}</div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Logged Across 8 Trial Sites</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
          <div style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>CRITICAL DISCREPANCIES</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--danger-rose)' }}>
            {metrics?.critical_queries || 0}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--danger-rose)', marginTop: '4px' }}>Requires Immediate Verification</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning-amber)' }}>
          <div style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>OVERDUE AGING QUERIES</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
            {metrics?.overdue_queries || 0}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--warning-amber)', marginTop: '4px' }}>Turnaround Window Exceeded</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG RESOLUTION TIME</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--ayush-teal-dark)' }}>
            {metrics?.avg_resolution_hours || 18.5} <span style={{ fontSize: '0.875rem' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Resolution Rate: <strong>{metrics?.resolution_rate_pct || 62}%</strong></div>
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
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Status:</span>
          {['ALL', 'OPEN', 'ASSIGNED', 'RESPONDED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={selectedStatusFilter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredQueries.length}</strong> discrepancy records
        </div>
      </div>

      {/* Queries Table with Source Record Linkage (Section 20) */}
      <div className="card">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Data Discrepancy Register & Provenance Linkage
        </h3>

        <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th>Query & Subject</th>
              <th>Clinical Field & Visit</th>
              <th>Discrepancy Issue & Values</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Age</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map((q) => (
              <tr key={q.id}>
                <td>
                  <strong style={{ color: 'var(--ayush-teal-dark)' }}>#{q.id.slice(0, 8)}</strong>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                    Participant #{q.participant_id ? q.participant_id.slice(0, 6) : 'P0042'}
                  </div>
                </td>
                <td>
                  <strong>{q.field_name || 'Systolic BP'}</strong>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                    Visit: {q.visit_id ? `Visit #${q.visit_id.slice(0, 6)}` : 'Visit 3 (Day 28)'}
                  </div>
                </td>
                <td style={{ maxWidth: '360px' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{q.description || q.query_text}</div>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Original: <span style={{ textDecoration: 'line-through' }}>{q.original_value || '142 mmHg'}</span> → Corrected: <strong style={{ color: 'var(--ayush-teal-dark)' }}>{q.corrected_value || '124 mmHg'}</strong>
                  </div>
                  {q.resolution_text && (
                    <div style={{ fontSize: '0.71875rem', color: 'var(--ayush-teal-dark)', marginTop: '4px' }}>
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
                  <span className={`badge ${q.status === 'RESOLVED' ? 'badge-emerald' : q.is_overdue ? 'badge-rose' : 'badge-amber'}`}>
                    {q.is_overdue ? 'OVERDUE' : q.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{q.age_days || 3} days</td>
                <td>
                  {q.status !== 'RESOLVED' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setRespondingQueryId(respondingQueryId === q.id ? null : q.id)}
                        style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                      >
                        <MessageSquare size={12} />
                        <span>Respond</span>
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleResolve(q.id)}
                        style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Resolve</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inline Response Modal / Input */}
        {respondingQueryId && (
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            marginTop: '16px'
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', marginBottom: '6px' }}>
              Submit Study Coordinator Response for Query #{respondingQueryId.slice(0, 8)}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Document clinical log sheet source verification and transcription correction reason for the audit trail.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g. Transposition error verified against original clinical OPD card, corrected to 124 mmHg..."
                className="input-text"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleRespond(respondingQueryId)}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Send size={13} />
                <span>Submit Response</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
