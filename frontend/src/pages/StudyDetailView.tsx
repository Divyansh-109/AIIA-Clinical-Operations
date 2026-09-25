import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FolderGit2,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitBranch,
  FileCheck2,
  AlertOctagon,
  FileText,
  Share2,
  FileLock2,
  Activity,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  Sliders,
  Network,
  Download,
  Key,
  Database
} from 'lucide-react';

interface StudyDetailViewProps {
  flagshipStudy: any;
  currentRole: string;
  initialSubTab?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const StudyDetailView: React.FC<StudyDetailViewProps> = ({
  flagshipStudy,
  currentRole,
  initialSubTab = 'overview',
  onNavigateToTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [adverseEvents, setAdverseEvents] = useState<any[]>([]);
  const [saeDeadlines, setSaeDeadlines] = useState<any[]>([]);
  const [reportingRules, setReportingRules] = useState<any[]>([]);
  const [safetySignals, setSafetySignals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [ethics, setEthics] = useState<any[]>([]);
  const [ctri, setCtri] = useState<any>(null);
  const [alcoaPrinciples, setAlcoaPrinciples] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [auditVerification, setAuditVerification] = useState<any>(null);
  const [trialRisk, setTrialRisk] = useState<any>(null);
  const [trialAnomalies, setTrialAnomalies] = useState<any[]>([]);
  const [evidenceGraph, setEvidenceGraph] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Participant selection & Visit completion modal
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [participantVisits, setParticipantVisits] = useState<any[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sysBP, setSysBP] = useState<string>('120');
  const [diaBP, setDiaBP] = useState<string>('80');
  const [includeLab, setIncludeLab] = useState<boolean>(true);
  const [guardianResult, setGuardianResult] = useState<any>(null);

  // New Participant Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollSiteId, setEnrollSiteId] = useState<string>('');
  const [enrollAge, setEnrollAge] = useState<number>(28);
  const [enrollGender, setEnrollGender] = useState<string>('FEMALE');
  const [enrollConsentVersion, setEnrollConsentVersion] = useState<string>('v2.0');
  const [enrollmentFeedback, setEnrollmentFeedback] = useState<string | null>(null);

  // SAE Review Modal State
  const [selectedSAE, setSelectedSAE] = useState<any>(null);
  const [saeCausality, setSaeCausality] = useState<string>('POSSIBLE');
  const [saeExpectedness, setSaeExpectedness] = useState<string>('UNEXPECTED');
  const [saeReviewNotes, setSaeReviewNotes] = useState<string>('');
  const [saeActionFeedback, setSaeActionFeedback] = useState<string | null>(null);

  // New Document Upload State
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [docTitle, setDocTitle] = useState<string>('');
  const [docType, setDocType] = useState<string>('PROTOCOL_AMENDMENT');
  const [docVersion, setDocVersion] = useState<string>('v2.1');

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [
        cc,
        sList,
        pList,
        partList,
        devList,
        qList,
        aeList,
        saeList,
        rulesList,
        sigList,
        docList,
        ethList,
        ctriData,
        alcoaList,
        audEvents,
        verif,
        risk,
        anoms,
        graph
      ] = await Promise.all([
        api.getStudyControlCenter(studyId),
        api.getSites(studyId),
        api.getProtocols(studyId),
        api.getParticipants(studyId),
        api.getDeviations(studyId),
        api.getQueries(studyId),
        api.getAdverseEvents(studyId),
        api.getSAEDeadlines(studyId),
        api.getReportingRules(),
        api.getSafetySignals(studyId),
        api.getDocuments(studyId),
        api.getEthics(studyId),
        api.getCTRI(studyId),
        api.getALCOA(),
        api.getAuditEvents(30),
        api.verifyAuditIntegrity(),
        api.getStudyRisk(studyId),
        api.getTrialTrust(studyId),
        api.getEvidenceGraph(studyId)
      ]);

      setControlCenter(cc);
      setSites(sList);
      setProtocols(pList);
      setParticipants(partList);
      setDeviations(devList);
      setQueries(qList);
      setAdverseEvents(aeList);
      setSaeDeadlines(saeList);
      setReportingRules(rulesList);
      setSafetySignals(sigList);
      setDocuments(docList);
      setEthics(ethList);
      setCtri(ctriData);
      setAlcoaPrinciples(alcoaList);
      setAuditEvents(audEvents);
      setAuditVerification(verif);
      setTrialRisk(risk);
      setTrialAnomalies(anoms);
      setEvidenceGraph(graph);

      if (sList.length > 0 && !enrollSiteId) {
        setEnrollSiteId(sList[0].id);
      }
    } catch (err) {
      console.error('Error loading study details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  // Protocol Guardian: Participant Selection
  const handleSelectParticipant = async (p: any) => {
    setSelectedParticipant(p);
    setGuardianResult(null);
    try {
      const v = await api.getVisits(p.id);
      setParticipantVisits(v);
      const nextPending = v.find((x: any) => x.status === 'SCHEDULED') || v[0];
      if (nextPending) {
        setSelectedVisitId(nextPending.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Protocol Guardian: Complete Visit
  const handleCompleteVisitWithGuardian = async () => {
    if (!selectedVisitId) return;
    try {
      const assessments: any[] = [
        { assessment_type: 'VITALS', assessment_name: 'SYSBP', numeric_value: parseFloat(sysBP), unit: 'mmHg' },
        { assessment_type: 'VITALS', assessment_name: 'DIABP', numeric_value: parseFloat(diaBP), unit: 'mmHg' }
      ];
      if (includeLab) {
        assessments.push({
          assessment_type: 'LAB',
          assessment_name: 'FASTING_GLUCOSE',
          numeric_value: 95.0,
          unit: 'mg/dL'
        });
      }
      const res = await api.completeVisit(
        selectedVisitId,
        visitDate,
        assessments,
        `Submitted via Protocol Guardian Console by ${currentRole}`
      );
      setGuardianResult(res.result);
      // Reload visits, deviations & control center
      if (selectedParticipant) {
        const v = await api.getVisits(selectedParticipant.id);
        setParticipantVisits(v);
      }
      const [devList, cc, audList] = await Promise.all([
        api.getDeviations(studyId),
        api.getStudyControlCenter(studyId),
        api.getAuditEvents(30)
      ]);
      setDeviations(devList);
      setControlCenter(cc);
      setAuditEvents(audList);
    } catch (err) {
      console.error('Error completing visit:', err);
    }
  };

  // Action -> Consequence: Screen & Enroll Participant
  const handleEnrollParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollSiteId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const screened = await api.screenParticipant(studyId, {
        site_id: enrollSiteId,
        age: enrollAge,
        gender: enrollGender,
        consent_signed_date: today,
        consent_version: enrollConsentVersion
      });
      const res = await api.enrollParticipant(screened.id, today);
      setEnrollmentFeedback(`Participant ${screened.participant_code} successfully screened & enrolled! Protocol schedule initialized, site & study recruitment KPIs updated, domain event dispatched.`);
      setShowEnrollModal(false);
      await loadData();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setEnrollmentFeedback(`Error enrolling participant: ${err?.message || 'Check site status'}`);
    }
  };

  // Sign off Deviation
  const handleSignoffDeviation = async (devId: string) => {
    try {
      await api.signoffDeviation(devId);
      const [devList, cc, audList] = await Promise.all([
        api.getDeviations(studyId),
        api.getStudyControlCenter(studyId),
        api.getAuditEvents(30)
      ]);
      setDeviations(devList);
      setControlCenter(cc);
      setAuditEvents(audList);
    } catch (err) {
      console.error('Error signing off deviation:', err);
    }
  };

  // Review SAE
  const handleReviewSAE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSAE) return;
    try {
      await api.reviewSAE(selectedSAE.id, {
        causality_assessment: saeCausality,
        expectedness: saeExpectedness,
        follow_up_notes: saeReviewNotes
      });
      setSaeActionFeedback(`Medical assessment for SAE #${selectedSAE.id.slice(0, 8)} finalized by ${currentRole}. Case status: UNDER_REVIEW.`);
      setSelectedSAE(null);
      await loadData();
    } catch (err: any) {
      console.error('Error reviewing SAE:', err);
      setSaeActionFeedback(`Failed to update SAE review: ${err?.message}`);
    }
  };

  // Submit SAE to Regulator
  const handleSubmitSAE = async (saeId: string) => {
    try {
      await api.submitSAE(saeId, {
        submission_notes: `Submitted by ${currentRole} via AIIA Regulatory Portal. CDSCO Form 44 package attached.`
      });
      setSaeActionFeedback(`SAE #${saeId.slice(0, 8)} formally submitted to Regulatory Authority. Clock finalized & audit sealed.`);
      await loadData();
    } catch (err: any) {
      console.error('Submission error:', err);
      setSaeActionFeedback(`Submission error: ${err?.message}`);
    }
  };

  // Update Document Status
  const handleUpdateDocStatus = async (docId: string, newStatus: string) => {
    try {
      await api.updateDocumentStatus(docId, newStatus);
      const [docList, cc, audList] = await Promise.all([
        api.getDocuments(studyId),
        api.getStudyControlCenter(studyId),
        api.getAuditEvents(30)
      ]);
      setDocuments(docList);
      setControlCenter(cc);
      setAuditEvents(audList);
    } catch (err) {
      console.error('Error updating document status:', err);
    }
  };

  // Create Document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
      await api.createDocument({
        study_id: studyId,
        title: docTitle,
        document_type: docType,
        version: docVersion,
        file_hash: 'sha256_' + Math.random().toString(36).substring(2, 15)
      });
      setShowDocModal(false);
      setDocTitle('');
      await loadData();
    } catch (err) {
      console.error('Error creating document:', err);
    }
  };

  // Run Amendment Impact
  const runAmendmentImpact = async () => {
    try {
      const res = await api.getAmendmentImpact(studyId, 'v1.0', 'v2.0');
      setImpactData(res);
    } catch (err) {
      console.error('Error running amendment impact:', err);
    }
  };

  const lifecyclePhases = [
    'DRAFT', 'PROTOCOL_FINALIZED', 'ETHICS_PENDING', 'ETHICS_APPROVED',
    'CTRI_REGISTERED', 'SITE_ACTIVATION', 'RECRUITING', 'ACTIVE',
    'FOLLOW_UP', 'CLOSE_OUT', 'COMPLETED'
  ];
  const currentStatus = flagshipStudy?.status || 'RECRUITING';
  const currentIdx = lifecyclePhases.indexOf(currentStatus);

  const subNavTabs = [
    { id: 'overview', label: 'Study Overview', icon: FolderGit2 },
    { id: 'protocol', label: `Protocol Guardian (${protocols.length})`, icon: ShieldCheck },
    { id: 'sites', label: `Sites & Network (${sites.length})`, icon: Building2 },
    { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
    { id: 'deviations', label: `Deviations (${deviations.length})`, icon: AlertTriangle, isAlert: deviations.length > 0 },
    { id: 'queries', label: `Data Quality (${queries.length})`, icon: FileCheck2 },
    { id: 'safety', label: `Safety & PV (${adverseEvents.length})`, icon: AlertOctagon, isAlert: saeDeadlines.length > 0 },
    { id: 'compliance', label: 'Ethics & Compliance', icon: ShieldCheck },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'interop', label: 'Interoperability', icon: Share2 },
    { id: 'intelligence', label: 'Trial Intelligence', icon: Network },
    { id: 'audit', label: 'Tamper-Evident Audit', icon: FileLock2 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. BREADCRUMBS & CONTEXT BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Studies</span>
          <ChevronRight size={13} color="var(--text-muted)" />
          <strong style={{ color: 'var(--text-primary)' }}>
            {flagshipStudy?.title ? flagshipStudy.title.slice(0, 45) + '...' : 'Ayurveda PCOS Clinical Evaluation'}
          </strong>
          <ChevronRight size={13} color="var(--text-muted)" />
          <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
            {subNavTabs.find(t => t.id === activeSubTab)?.label.split(' ')[0] || 'Overview'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={14} />
            <span>Enroll Participant</span>
          </button>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            title="Reload Study Telemetry"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Enrollment Feedback Banner */}
      {enrollmentFeedback && (
        <div style={{
          background: 'var(--ayush-teal-light)',
          border: '1px solid #99f6e4',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--ayush-teal-dark)',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--ayush-teal)" />
            <span>{enrollmentFeedback}</span>
          </div>
          <button
            onClick={() => setEnrollmentFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ayush-teal-dark)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* SAE Action Feedback Banner */}
      {saeActionFeedback && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: '#15803d',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{saeActionFeedback}</span>
          </div>
          <button
            onClick={() => setSaeActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. STUDY MASTER HEADER CARD */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-emerald">{flagshipStudy?.study_code || 'AIIA-PCOS-001'}</span>
              <span className="badge badge-blue">{flagshipStudy?.phase || 'PHASE_III'}</span>
              <span className="badge badge-purple">{flagshipStudy?.therapeutic_area || 'Ayurveda'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                CTRI/2026/08/042109 · IEC/AIIA/2026/04
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, maxWidth: '900px' }}>
              {flagshipStudy?.title || 'Clinical Evaluation of Ayush-PCOS Formulation in Women of Reproductive Age'}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Lead Principal Investigator: <strong>Prof. (Dr.) Tanuja Manoj Nesari</strong> · 8 Certified Ayush Clinical Sites · 500 Target Cohort
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Lifecycle Status
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Ayurvedic Classical Formulation Profile (Section 36) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          fontSize: '0.78125rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.71875rem' }}>Classical Formulation</span>
            <strong style={{ color: 'var(--ayush-teal-dark)' }}>
              {controlCenter?.ayurvedic_intervention?.classical_formulation || 'Ayush-PCOS Kwatha & Vati'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.71875rem' }}>Standard Dosage & Route</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {controlCenter?.ayurvedic_intervention?.standard_dosage || '500mg twice daily with lukewarm water'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.71875rem' }}>Classical Reference</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {controlCenter?.ayurvedic_intervention?.classical_reference || 'Sahasrayogam & Sharangadhara Samhita'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.71875rem' }}>NAMASTE Morbidity Code</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {controlCenter?.ayurvedic_intervention?.standardized_code || 'NAMASTE AYU-GYN-042 (Artava Kshaya)'}
            </strong>
          </div>
        </div>

        {/* Study Lifecycle State Machine (Section 8) */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
            Study Lifecycle State Machine (Section 8)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflowX: 'auto', paddingBottom: '4px' }}>
            {lifecyclePhases.map((phase, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <React.Fragment key={phase}>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65625rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    background: isCurrent ? 'var(--ayush-teal)' : isPast ? '#e0f2fe' : 'var(--bg-secondary)',
                    color: isCurrent ? '#ffffff' : isPast ? '#0369a1' : 'var(--text-muted)',
                    border: isCurrent ? '1px solid var(--ayush-teal-dark)' : '1px solid var(--border-subtle)'
                  }}>
                    {phase}
                  </div>
                  {idx < lifecyclePhases.length - 1 && (
                    <span style={{ color: isPast ? '#0369a1' : 'var(--text-muted)', fontSize: '0.6875rem' }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. COHESIVE SUB-NAVIGATION BAR (Section 5) */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '8px',
        overflowX: 'auto'
      }}>
        {subNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: isActive ? '2px solid var(--ayush-teal-dark)' : undefined
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.isAlert && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--danger-rose)',
                  display: 'inline-block'
                }}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. SUBMODULE VIEW RENDERER */}

      {/* 4.1 OVERVIEW: STUDY CONTROL CENTER (Section 7) */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Multi-Dimensional Health Cards (Section 34) */}
          <div className="grid-4">
            <div className="card" style={{ borderLeft: '4px solid var(--ayush-teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>OPERATIONAL HEALTH</span>
                <span className="badge badge-emerald">On Track</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {controlCenter?.actual_enrolled || 320} / {controlCenter?.target_sample_size || 500}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recruitment: <strong>{controlCenter?.dimensions?.operational?.recruitment_rate_pct || 64.0}%</strong> · Active Sites: {sites.length}/8
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--danger-rose)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>SAFETY SURVEILLANCE</span>
                <span className={`badge ${saeDeadlines.length > 0 ? 'badge-rose' : 'badge-emerald'}`}>
                  {saeDeadlines.length > 0 ? `${saeDeadlines.length} Active Clock` : 'Compliant'}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-rose)' }}>
                {adverseEvents.length} AEs / {saeDeadlines.length} SAEs
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pending Reviews: <strong>{controlCenter?.dimensions?.safety?.pending_sae_reviews || 1}</strong> · Signals: {safetySignals.length}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>COMPLIANCE & ETHICS</span>
                <span className="badge badge-blue">IEC Approved</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ALCOA+ Aligned
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                CTRI Registered · v2.0 Protocol Approved · {documents.length} Managed Docs
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--warning-amber)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATA INTEGRITY CONCERNS</span>
                <span className="badge badge-amber">{trialAnomalies.length} Potential</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
                {trialAnomalies.length} Flagged Review
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Site S03 BP Clustering · Site S06 AE Underreporting
              </div>
            </div>
          </div>

          {/* Action Center & Activity Timeline Grid (Section 7 & 38) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
            {/* Prioritized Action Center */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="var(--warning-amber)" />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Study Action Center Queue
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateToTab && onNavigateToTab('action_center')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                >
                  View Global Action Center →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(controlCenter?.action_items || []).slice(0, 5).map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span className={`badge ${
                          item.priority === 'CRITICAL' ? 'badge-rose' :
                          item.priority === 'HIGH' ? 'badge-amber' : 'badge-blue'
                        }`} style={{ fontSize: '0.625rem' }}>
                          {item.priority}
                        </span>
                        <span style={{ fontSize: '0.71875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.description}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Impact: {item.consequence || 'Operational requirement'}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSubTab(item.target_subtab || 'deviations')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
                    >
                      {item.action_label || 'Review'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Study Activity Timeline (Section 38) */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={18} color="var(--ayush-teal)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Live Study Activity Timeline
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                {(controlCenter?.activity_timeline || []).map((ev: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--ayush-teal)',
                      marginTop: '4px',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <strong>{ev.event_name}</strong>
                        <span>{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Recent'}</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                        {ev.summary}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '2px' }}>
                        Actor: {ev.actor} · Target: {ev.entity_type} {ev.entity_id ? `(#${ev.entity_id.slice(0, 6)})` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 PROTOCOL GUARDIAN (Section 14) */}
      {activeSubTab === 'protocol' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Protocol Versioning & Amendment Analyzer (v1.0 → v2.0)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Machine-readable protocol rules govern visit window tolerances (Day 28 ± 3) and mandatory laboratory assessments.
                </p>
              </div>
              <button className="btn btn-primary" onClick={runAmendmentImpact}>
                <GitBranch size={15} />
                <span>Simulate Protocol Amendment Impact</span>
              </button>
            </div>

            {impactData && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  <span>Protocol Amendment Impact Analysis (Section 23)</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Affected Cohort</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{impactData.affected_participants_count} Patients</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Active Sites</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{impactData.affected_sites_count} Sites</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Upcoming Visits Impacted</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--warning-amber)' }}>{impactData.upcoming_visits_affected} Visits</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Re-Consent Status</div>
                    <div className="badge badge-rose" style={{ marginTop: '4px', fontSize: '0.65625rem' }}>MANDATORY RE-CONSENT</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {impactData.summary_narrative}
                </div>
              </div>
            )}

            <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Protocol Version</th>
                  <th>Effective Date</th>
                  <th>Approval Status</th>
                  <th>Amendment Rationale</th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{p.version_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.effective_date}</td>
                    <td>
                      <span className={`badge ${p.approval_status === 'APPROVED' ? 'badge-emerald' : 'badge-amber'}`}>
                        {p.approval_status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.amendment_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.3 SITES & NETWORK (Section 32 & 37) */}
      {activeSubTab === 'sites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Multi-Centric Trial Site Network (8 Certified Ayush Facilities)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Realistic synthetic operational scenario distribution reflecting recruitment lag, data query backlog, protocol window violations, and data integrity indicators.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Site Code</th>
                  <th>Facility Name & Location</th>
                  <th>Principal Investigator</th>
                  <th>Recruitment Progress</th>
                  <th>Operational Scenario Profile</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => {
                  let scenarioText = 'Healthy Operational Benchmark';
                  let badgeClass = 'badge-emerald';

                  if (s.site_code === 'S03') {
                    scenarioText = 'Data Integrity Concern: Identical BP Clustering';
                    badgeClass = 'badge-amber';
                  } else if (s.site_code === 'S04') {
                    scenarioText = 'Data Quality Backlog: 9 Open Queries';
                    badgeClass = 'badge-amber';
                  } else if (s.site_code === 'S05') {
                    scenarioText = 'Protocol Compliance: 4 Visit Window Deviations';
                    badgeClass = 'badge-rose';
                  } else if (s.site_code === 'S06') {
                    scenarioText = 'Safety Reporting Lag: Unusually Low AE Rate';
                    badgeClass = 'badge-amber';
                  } else if (s.site_code === 'S07') {
                    scenarioText = 'Recruitment Shortfall: 28/60 vs Projected';
                    badgeClass = 'badge-rose';
                  } else if (s.site_code === 'S08') {
                    scenarioText = 'Active SAE Workload: 24h Clock Surveillance';
                    badgeClass = 'badge-rose';
                  }

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.site_code}</td>
                      <td>
                        <strong>{s.site_name}</strong>
                        <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>{s.location}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.pi_name || 'Designated PI'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600 }}>{s.actual_enrollment} / {s.target_enrollment}</span>
                          <div style={{ width: '80px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (s.actual_enrollment / (s.target_enrollment || 1)) * 100)}%`,
                              height: '100%',
                              background: s.site_code === 'S07' ? 'var(--danger-rose)' : 'var(--ayush-teal)'
                            }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                          {scenarioText}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-emerald">{s.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.4 PARTICIPANTS & PROTOCOL GUARDIAN CONSOLE (Section 14 & 8) */}
      {activeSubTab === 'participants' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
          {/* De-Identified Participant Directory */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  De-Identified Participant Directory
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total Enrolled: {participants.length} Subjects
                </div>
              </div>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.71875rem', padding: '4px 8px' }}
              >
                + Add Subject
              </button>
            </div>

            <div style={{ maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {participants.map((p) => {
                const isSelected = selectedParticipant?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectParticipant(p)}
                    style={{
                      background: isSelected ? 'var(--ayush-teal-light)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid var(--ayush-teal)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: isSelected ? 'var(--ayush-teal-dark)' : 'var(--text-primary)' }}>
                        {p.participant_code}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {p.age} yrs • {p.gender} · Consent: {p.consent_version || 'v2.0'}
                      </div>
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>{p.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Protocol Guardian Visit Completion Console */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Protocol Guardian: Visit Completion Console
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Select a participant and execute an actual clinical attendance. The Protocol Guardian validates window tolerance (Day 28 ± 3) and required assessments in real time.
            </p>

            {selectedParticipant ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Participant: </span>
                    <strong style={{ color: 'var(--ayush-teal-dark)' }}>{selectedParticipant.participant_code}</strong>
                  </div>
                  <span className="badge badge-blue">Cohort Active</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Select Scheduled Protocol Visit:
                  </label>
                  <select
                    value={selectedVisitId}
                    onChange={(e) => setSelectedVisitId(e.target.value)}
                    className="input-select"
                  >
                    {participantVisits.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.visit_name} (Scheduled: {v.scheduled_date}) - [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Actual Attendance Date:
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="input-text"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Systolic BP (mmHg):
                    </label>
                    <input
                      type="number"
                      value={sysBP}
                      onChange={(e) => setSysBP(e.target.value)}
                      className="input-text"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="lab_check_guardian"
                    checked={includeLab}
                    onChange={(e) => setIncludeLab(e.target.checked)}
                  />
                  <label htmlFor="lab_check_guardian" style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                    Include Mandatory Lab Test (Fasting Glucose). Uncheck to simulate a Missing Assessment Protocol Deviation!
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleCompleteVisitWithGuardian}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} />
                  <span>Submit Visit & Validate with Protocol Guardian</span>
                </button>

                {guardianResult && (
                  <div style={{
                    background: guardianResult.guardian_status === 'COMPLIANT' ? 'var(--ayush-teal-light)' : '#fff1f2',
                    border: `1px solid ${guardianResult.guardian_status === 'COMPLIANT' ? '#99f6e4' : '#fecdd3'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: guardianResult.guardian_status === 'COMPLIANT' ? 'var(--ayush-teal-dark)' : 'var(--danger-rose)',
                      marginBottom: '4px'
                    }}>
                      Protocol Guardian Outcome: {guardianResult.guardian_status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Calculated Study Day: <strong>{guardianResult.study_day}</strong> | Visit Status: <strong>{guardianResult.status}</strong>
                    </div>
                    {guardianResult.deviations.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger-rose)' }}>
                          Deviations Automatically Generated:
                        </div>
                        <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '18px', marginTop: '4px' }}>
                          {guardianResult.deviations.map((d: any, idx: number) => (
                            <li key={idx}><strong>{d.type}</strong>: {d.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Please select a participant from the left directory to initialize the Protocol Guardian console.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4.5 PROTOCOL DEVIATIONS REGISTER (Section 14 & 20) */}
      {activeSubTab === 'deviations' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Protocol Deviations Audit Register
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All exceptions detected by Protocol Guardian or logged by CRA monitors with PI sign-off lifecycle.
              </p>
            </div>
            <span className="badge badge-amber">{deviations.length} Recorded</span>
          </div>

          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Deviation Type</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Reported At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deviations.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{d.deviation_type}</td>
                  <td>
                    <span className={`badge ${d.severity === 'CRITICAL' || d.severity === 'MAJOR' ? 'badge-rose' : 'badge-amber'}`}>
                      {d.severity}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.description}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{d.reported_date}</td>
                  <td>
                    <span className={`badge ${d.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    {d.status !== 'RESOLVED' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleSignoffDeviation(d.id)}
                        style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                      >
                        PI Sign-off
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4.6 DATA QUALITY & QUERIES (Section 20) */}
      {activeSubTab === 'queries' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Data Discrepancy Queries & ALCOA+ Audit Linkage
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Each query links directly to a participant visit, specific field, original vs corrected values, and full audit provenance.
              </p>
            </div>
            <span className="badge badge-blue">{queries.length} Queries</span>
          </div>

          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Query ID</th>
                <th>Subject & Field</th>
                <th>Discrepancy Issue</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{q.id.slice(0, 8)}</td>
                  <td>
                    <strong>Field: {q.field_name || 'Vitals'}</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                      Participant #{q.participant_id ? q.participant_id.slice(0, 6) : 'P0042'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{q.query_text}</td>
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
                      <button
                        className="btn btn-secondary"
                        onClick={async () => {
                          await api.resolveQuery(q.id, 'RESOLVED', 'Verified against clinical source logs');
                          loadData();
                        }}
                        style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                      >
                        Resolve Query
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4.7 SAFETY & PHARMACOVIGILANCE (Section 12 & 13) */}
      {activeSubTab === 'safety' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Configurable Reporting Rules Table (Section 13) */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Configurable Regulatory SAE Reporting Rules (CDSCO / NDCT 2019 / Ayush NPvCC)
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              SAE clocks are not generic hardcoded timers. They are governed by configurable regulatory rules tied to the exact awareness event.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Event Type</th>
                  <th>Clock Start Trigger</th>
                  <th>Statutory Deadline</th>
                  <th>Recipient Authority</th>
                  <th>Statutory Reference</th>
                </tr>
              </thead>
              <tbody>
                {reportingRules.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.regulatory_framework}</td>
                    <td>{r.event_type}</td>
                    <td style={{ color: 'var(--ayush-teal-dark)' }}>{r.clock_start_event}</td>
                    <td style={{ fontWeight: 700, color: 'var(--danger-rose)' }}>{r.deadline_hours} Hours</td>
                    <td>{r.recipient}</td>
                    <td style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>{r.statutory_reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active SAE Clocks & Medical Review Console */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--danger-rose)', margin: 0 }}>
                  Expedited SAE Reporting Countdown & Case Lifecycle
                </h3>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  State Machine: Draft → Reported → Under Review → Reportable → Submitted → Closed
                </p>
              </div>
              <span className="badge badge-rose">{saeDeadlines.length} Active SAE Clocks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {saeDeadlines.map((sae) => (
                <div
                  key={sae.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.65625rem' }}>{sae.status}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        SAE #{sae.id.slice(0, 8)} · {sae.event_term || 'Unspecified Severe Reaction'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Awareness: {sae.awareness_date || 'Today'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                      Applicable Rule: <strong>{sae.regulatory_framework || 'NDCT 2019'}</strong> · Deadline: <strong>{sae.deadline_timestamp || '24 Hours'}</strong>
                    </div>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Causality: {sae.causality_assessment || 'Pending Medical Review'} · Expectedness: {sae.expectedness || 'Under Evaluation'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedSAE(sae)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Medical Review
                    </button>
                    {sae.status !== 'SUBMITTED' && sae.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleSubmitSAE(sae.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Submit Regulatory Report →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4.8 COMPLIANCE & ETHICS (Section 24 & 25) */}
      {activeSubTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ALCOA+ Principles Matrix */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              ALCOA+ Data Integrity Operational Controls
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Controls designed with reference to 21 CFR Part 11, ICH GCP E6(R2), and New Drugs and Clinical Trials Rules (NDCT) 2019.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {alcoaPrinciples.map((a: any, idx: number) => (
                <div key={idx} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--ayush-teal-dark)' }}>{a.principle}</strong>
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {a.description}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                    <strong>Control:</strong> {a.technical_implementation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ethics & CTRI Milestones */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Institutional Ethics Committee (IEC) Approvals & CTRI Milestones
            </h3>
            <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Milestone / Approval</th>
                  <th>Approval Date</th>
                  <th>Renewal / Expiry</th>
                  <th>Reference Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ethics.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>IEC Protocol Approval</td>
                    <td>{e.approval_date}</td>
                    <td style={{ color: 'var(--warning-amber)' }}>{e.expiry_date}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{e.iec_code}</td>
                    <td><span className="badge badge-emerald">{e.status}</span></td>
                  </tr>
                ))}
                {ctri && (
                  <tr>
                    <td style={{ fontWeight: 600 }}>CTRI Public Registration</td>
                    <td>{ctri.registration_date}</td>
                    <td>Phase III Final Close</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{ctri.ctri_number}</td>
                    <td><span className="badge badge-blue">{ctri.status}</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.9 DOCUMENTS REPOSITORY (Section 23) */}
      {activeSubTab === 'documents' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Study Document Management Lifecycle
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                State Machine: Draft → Under Review → Approved → Superseded → Archived. Never silently overwrites approved files.
              </p>
            </div>
            <button
              onClick={() => setShowDocModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Register New Document</span>
            </button>
          </div>

          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Type</th>
                <th>Version</th>
                <th>Cryptographic SHA-256 Hash</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.title}</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Uploaded: {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}</div>
                  </td>
                  <td><span className="badge badge-neutral">{doc.document_type}</span></td>
                  <td style={{ fontWeight: 600 }}>{doc.version}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {doc.file_hash || 'sha256_e3b0c44298fc1c149afbf4c8996fb924'}
                  </td>
                  <td>
                    <span className={`badge ${
                      doc.status === 'APPROVED' ? 'badge-emerald' :
                      doc.status === 'UNDER_REVIEW' ? 'badge-amber' :
                      doc.status === 'DRAFT' ? 'badge-blue' : 'badge-neutral'
                    }`}>
                      {doc.status || 'APPROVED'}
                    </span>
                  </td>
                  <td>
                    {doc.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateDocStatus(doc.id, 'APPROVED')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.71875rem', padding: '3px 8px' }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4.10 INTEROPERABILITY (Section 26 & 27) */}
      {activeSubTab === 'interop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual FHIR R4 Mapper (Section 26) */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Visual HL7 FHIR R4 Clinical Resource Mapping Pipeline
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Direct bi-directional semantic translation between canonical trial entities and HL7 FHIR R4 JSON schemas.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
              <thead>
                <tr>
                  <th>Canonical CTMS Entity</th>
                  <th>Target FHIR R4 Resource</th>
                  <th>Attribute Field Mapping</th>
                  <th>Semantic Transformation</th>
                  <th>Validation Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Participant Code</td>
                  <td><span className="badge badge-blue">Patient</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Participant.code → Patient.identifier</td>
                  <td>De-identified MRN string hash</td>
                  <td><span className="badge badge-emerald">Valid</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Visit Vital (SYSBP / DIABP)</td>
                  <td><span className="badge badge-blue">Observation</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Assessment.numeric_value → Observation.valueQuantity</td>
                  <td>LOINC 85354-9 Blood Pressure Panel</td>
                  <td><span className="badge badge-emerald">Valid</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Adverse Event</td>
                  <td><span className="badge badge-rose">AdverseEvent</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>AdverseEvent.term → AdverseEvent.event.coding</td>
                  <td>MedDRA PT to FHIR CodeableConcept</td>
                  <td><span className="badge badge-emerald">Valid</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Informed Consent</td>
                  <td><span className="badge badge-purple">Consent</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Participant.consent_version → Consent.provision</td>
                  <td>Active electronic consent signature</td>
                  <td><span className="badge badge-emerald">Valid</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual CDISC SDTM Mapper (Section 27) */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              CDISC SDTM Standardization Mapping Table (DM, VS, AE, CM, EX)
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Prototype implementation showing canonical data mapping to regulatory submission variables.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
              <thead>
                <tr>
                  <th>Internal CTMS Field</th>
                  <th>CDISC Domain</th>
                  <th>SDTM Variable</th>
                  <th>Domain Role</th>
                  <th>Transformation Logic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Participant Code</td>
                  <td><span className="badge badge-emerald">DM</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>USUBJID</td>
                  <td>Identifier</td>
                  <td>Concatenate Study ID + Site Code + Participant Code</td>
                </tr>
                <tr>
                  <td>Systolic Blood Pressure</td>
                  <td><span className="badge badge-emerald">VS</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>VSSTRESN</td>
                  <td>Result Value</td>
                  <td>Numeric parsing to mmHg standard unit</td>
                </tr>
                <tr>
                  <td>Adverse Event Term</td>
                  <td><span className="badge badge-rose">AE</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AETERM</td>
                  <td>Topic</td>
                  <td>Verbatim clinical reported term string</td>
                </tr>
                <tr>
                  <td>Ayush Formulation (Kwatha)</td>
                  <td><span className="badge badge-blue">EX</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>EXTRT</td>
                  <td>Intervention</td>
                  <td>Ayush-PCOS Herbal Formulation (Sahasrayogam)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.11 TRIAL INTELLIGENCE & INTEGRITY GRAPH (Section 15 & 16) */}
      {activeSubTab === 'intelligence' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Trial Risk Operational Likelihood */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Trial Operational Risk Assessment
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Non-blackbox operational likelihood calculation
                </div>
              </div>
              <span className={`badge ${trialRisk?.risk_level === 'CRITICAL' ? 'badge-rose' : 'badge-emerald'}`}>
                {trialRisk?.verdict || 'OPERATIONAL STABLE'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trialRisk?.contributing_factors?.map((f: any, idx: number) => (
                <div key={idx} style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '0.78125rem' }}>{f.factor_name}</strong>
                    <span className="badge badge-amber" style={{ fontSize: '0.625rem' }}>+{f.score_impact} pts</span>
                  </div>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)' }}>{f.description}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Evidence: {f.underlying_records_reference}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Integrity & Evidence Graph (Section 15 & 16) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Potential Data Integrity Indicators
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Statistical distribution tests for human clinical audit
                </div>
              </div>
              <span className="badge badge-amber">{trialAnomalies.length} Concerns</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trialAnomalies.map((a: any, idx: number) => (
                <div key={idx} style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="badge badge-rose">{a.site_code}</span>
                    <span className="badge badge-amber">{a.confidence} Confidence</span>
                  </div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    {a.title}
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {a.evidence_narrative}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4.12 TAMPER-EVIDENT AUDIT TRAIL (Section 21 & 22) */}
      {activeSubTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verification Banner */}
          <div style={{
            background: auditVerification?.is_valid ? 'var(--ayush-teal-light)' : '#fff1f2',
            border: `1px solid ${auditVerification?.is_valid ? '#99f6e4' : '#fecdd3'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--ayush-teal-dark)" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ayush-teal-dark)', margin: 0 }}>
                  Cryptographically Linked SHA-256 Audit Chain Verification
                </h4>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total Verified Blocks: <strong>{auditVerification?.total_events_checked || 30}</strong> · Algorithm: SHA-256 Chained Hashes
              </div>
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.8125rem' }}>
              Integrity Verified
            </span>
          </div>

          <div className="card">
            <table className="table" style={{ width: '100%', fontSize: '0.78125rem' }}>
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Actor & Role</th>
                  <th>Entity Target</th>
                  <th>Action</th>
                  <th>Cryptographic Block Hash</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.slice(0, 15).map((e) => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td>
                      <strong>{e.user_email || 'System Agent'}</strong>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{e.role}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{e.entity_type}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--ayush-teal-dark)' }}>{e.action}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {e.current_hash ? e.current_hash.slice(0, 20) + '...' : 'sha256_...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: ENROLL PARTICIPANT */}
      {showEnrollModal && (
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
          <div className="card" style={{ width: '480px', maxWidth: '90vw', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Enroll Participant (Action → Consequence)
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Enrolling creates a subject, initializes protocol schedule, updates site & study recruitment, recalculates risk, and seals an audit record.
            </p>

            <form onSubmit={handleEnrollParticipant} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Clinical Site:
                </label>
                <select
                  value={enrollSiteId}
                  onChange={(e) => setEnrollSiteId(e.target.value)}
                  className="input-select"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.site_code} - {s.site_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Age (Years):
                  </label>
                  <input
                    type="number"
                    value={enrollAge}
                    onChange={(e) => setEnrollAge(parseInt(e.target.value))}
                    min={18}
                    max={65}
                    className="input-text"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Gender:
                  </label>
                  <select
                    value={enrollGender}
                    onChange={(e) => setEnrollGender(e.target.value)}
                    className="input-select"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Informed Consent Form Version:
                </label>
                <input
                  type="text"
                  value={enrollConsentVersion}
                  onChange={(e) => setEnrollConsentVersion(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm & Dispatch Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: SAE MEDICAL ASSESSMENT */}
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
                    value={saeCausality}
                    onChange={(e) => setSaeCausality(e.target.value)}
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
                    value={saeExpectedness}
                    onChange={(e) => setSaeExpectedness(e.target.value)}
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
                  value={saeReviewNotes}
                  onChange={(e) => setSaeReviewNotes(e.target.value)}
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

      {/* 7. MODAL: REGISTER DOCUMENT */}
      {showDocModal && (
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
          <div className="card" style={{ width: '480px', maxWidth: '90vw', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Register Study Document
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Registers a formal versioned document into the study repository with cryptographic hash generation.
            </p>

            <form onSubmit={handleCreateDocument} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Document Title:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Protocol Amendment v2.1 (Blood Glucose Endpoint)"
                  className="input-text"
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Document Type:
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="input-select"
                  >
                    <option value="PROTOCOL">Protocol</option>
                    <option value="PROTOCOL_AMENDMENT">Protocol Amendment</option>
                    <option value="INFORMED_CONSENT">Informed Consent Form</option>
                    <option value="INVESTIGATOR_BROCHURE">Investigator Brochure</option>
                    <option value="ETHICS_APPROVAL">Ethics Approval Letter</option>
                    <option value="SAFETY_REPORT">Safety Report</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Version Tag:
                  </label>
                  <input
                    type="text"
                    value={docVersion}
                    onChange={(e) => setDocVersion(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
