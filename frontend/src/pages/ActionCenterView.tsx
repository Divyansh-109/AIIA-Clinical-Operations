import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AlertOctagon,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Filter,
  RefreshCw,
  ExternalLink,
  Info,
  Building2
} from 'lucide-react';

interface ActionCenterViewProps {
  flagshipStudy: any;
  currentRole: string;
  onNavigate: (tab: string, subTab?: string) => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  flagshipStudy,
  currentRole,
  onNavigate
}) => {
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionFeedback, setResolutionFeedback] = useState<string | null>(null);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const res = await api.getStudyControlCenter(studyId);
      setControlCenter(res);
    } catch (err) {
      console.error('Error loading action center items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const allItems = controlCenter?.action_items || [];

  const filteredItems = allItems.filter((item: any) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesPriority =
      selectedPriority === 'ALL' ||
      item.priority.toUpperCase() === selectedPriority.toUpperCase();
    return matchesCategory && matchesPriority;
  });

  const priorityCounts = {
    CRITICAL: allItems.filter((i: any) => i.priority === 'CRITICAL').length,
    HIGH: allItems.filter((i: any) => i.priority === 'HIGH').length,
    MEDIUM: allItems.filter((i: any) => i.priority === 'MEDIUM').length,
    INFO: allItems.filter((i: any) => i.priority === 'INFO').length
  };

  const handleExecuteAction = async (item: any) => {
    setResolvingId(item.id);
    setResolutionFeedback(null);
    try {
      if (item.category === 'DEVIATION' && item.target_id) {
        // Direct execution of deviation signoff
        await api.signoffDeviation(item.target_id);
        setResolutionFeedback(`Deviation ${item.target_id.slice(0, 8)} signed off by ${currentRole}. Re-evaluating study KPIs.`);
        await loadData();
      } else if (item.category === 'DATA_QUALITY' && item.target_id) {
        // Direct resolution of query
        await api.resolveQuery(item.target_id, 'RESOLVED', `Resolved via Action Center by ${currentRole}`);
        setResolutionFeedback(`Data Query ${item.target_id.slice(0, 8)} resolved and audit record created.`);
        await loadData();
      } else {
        // Navigate directly to the corresponding module and submodule
        onNavigate(item.target_tab, item.target_subtab);
      }
    } catch (err: any) {
      console.error('Failed to execute action:', err);
      setResolutionFeedback(`Error executing action: ${err?.message || 'Check permissions'}`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
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
            <span className="badge badge-emerald">AIIA CENTRAL TRIAGE</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              Operational Exceptions & Decision Queue
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Unified Action Center
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Prioritized clinical, safety, protocol guardian, and data quality triggers requiring authenticated human review for <strong>{flagshipStudy?.study_code || 'AIIA-PCOS-001'}</strong>.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Actions</span>
        </button>
      </div>

      {/* Resolution Feedback Alert */}
      {resolutionFeedback && (
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
            <span>{resolutionFeedback}</span>
          </div>
          <button
            onClick={() => setResolutionFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'var(--ayush-teal-dark)', cursor: 'pointer', fontSize: '0.8125rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Priority Summary Cards */}
      <div className="grid-4">
        <div
          onClick={() => setSelectedPriority(selectedPriority === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className="card"
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid var(--danger-rose)',
            background: selectedPriority === 'CRITICAL' ? '#fff1f2' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CRITICAL URGENT</span>
            <AlertOctagon size={16} color="var(--danger-rose)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger-rose)' }}>
            {priorityCounts.CRITICAL}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            SAE reporting clocks & critical deviations
          </div>
        </div>

        <div
          onClick={() => setSelectedPriority(selectedPriority === 'HIGH' ? 'ALL' : 'HIGH')}
          className="card"
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid var(--warning-amber)',
            background: selectedPriority === 'HIGH' ? '#fffbeb' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>HIGH PRIORITY</span>
            <AlertTriangle size={16} color="var(--warning-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
            {priorityCounts.HIGH}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Overdue data queries & integrity flags
          </div>
        </div>

        <div
          onClick={() => setSelectedPriority(selectedPriority === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className="card"
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid #2563eb',
            background: selectedPriority === 'MEDIUM' ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEDIUM / ROUTINE</span>
            <FileCheck2 size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>
            {priorityCounts.MEDIUM}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Site recruitment lag & document approvals
          </div>
        </div>

        <div
          onClick={() => setSelectedPriority(selectedPriority === 'INFO' ? 'ALL' : 'INFO')}
          className="card"
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid var(--ayush-teal)',
            background: selectedPriority === 'INFO' ? '#f0fdfa' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>INFORMATIONAL</span>
            <Info size={16} color="var(--ayush-teal)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ayush-teal)' }}>
            {priorityCounts.INFO}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            CTRI & IEC renewal notices
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8125rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Category Filter:</span>
          {['ALL', 'SAFETY', 'DEVIATION', 'DATA_QUALITY', 'COMPLIANCE', 'RECRUITMENT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredItems.length}</strong> of <strong>{allItems.length}</strong> prioritized items
        </div>
      </div>

      {/* Action Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredItems.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={32} color="var(--ayush-emerald)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Pending Actions Matching Filters</div>
            <div style={{ fontSize: '0.78125rem', marginTop: '4px' }}>
              All exceptions in this category have been triaged or resolved.
            </div>
          </div>
        ) : (
          filteredItems.map((item: any) => {
            const isCritical = item.priority === 'CRITICAL';
            const isHigh = item.priority === 'HIGH';
            const isResolving = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderLeft: isCritical
                    ? '4px solid var(--danger-rose)'
                    : isHigh
                    ? '4px solid var(--warning-amber)'
                    : '4px solid var(--ayush-teal)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div style={{ marginTop: '2px' }}>
                    {item.category === 'SAFETY' && <AlertOctagon size={20} color="var(--danger-rose)" />}
                    {item.category === 'DEVIATION' && <AlertTriangle size={20} color="var(--warning-amber)" />}
                    {item.category === 'DATA_QUALITY' && <FileCheck2 size={20} color="#2563eb Camacho" />}
                    {item.category === 'COMPLIANCE' && <ShieldCheck size={20} color="var(--ayush-emerald)" />}
                    {item.category === 'RECRUITMENT' && <Users size={20} color="var(--ayush-teal)" />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${
                        item.priority === 'CRITICAL' ? 'badge-rose' :
                        item.priority === 'HIGH' ? 'badge-amber' :
                        item.priority === 'MEDIUM' ? 'badge-blue' : 'badge-neutral'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                        {item.category.replace('_', ' ')}
                      </span>
                      {item.source_entity && (
                        <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Ref: {item.source_entity}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {item.description}
                    </div>

                    {item.consequence && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowRight size={12} color="var(--text-muted)" />
                        <span>System Impact: {item.consequence}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleExecuteAction(item)}
                    disabled={isResolving}
                    className="btn btn-primary"
                    style={{ fontSize: '0.78125rem', whiteSpace: 'nowrap' }}
                  >
                    {isResolving ? 'Executing...' : item.action_label || 'Take Action →'}
                  </button>

                  <button
                    onClick={() => onNavigate(item.target_tab, item.target_subtab)}
                    className="btn btn-secondary"
                    title="Open in Study Module"
                    style={{ padding: '6px 8px' }}
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
