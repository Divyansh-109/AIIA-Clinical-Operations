import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  HeartPulse,
  Activity,
  FileCheck2,
  RefreshCw,
  X
} from 'lucide-react';

interface PatientsPageProps {
  flagshipStudy: any;
  currentRole: string;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ flagshipStudy, currentRole }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Enrollment Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollSiteId, setEnrollSiteId] = useState('');
  const [enrollAge, setEnrollAge] = useState(28);
  const [enrollGender, setEnrollGender] = useState('FEMALE');
  const [enrollConsentVersion, setEnrollConsentVersion] = useState('v2.0');
  const [enrollmentFeedback, setEnrollmentFeedback] = useState<string | null>(null);

  // Visit Checkup Modal
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientVisits, setPatientVisits] = useState<any[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [sysBP, setSysBP] = useState('120');
  const [diaBP, setDiaBP] = useState('80');
  const [includeLab, setIncludeLab] = useState(true);
  const [guardianResult, setGuardianResult] = useState<any>(null);
  const [submittingVisit, setSubmittingVisit] = useState(false);

  const studyId = flagshipStudy?.id;

  const loadData = async () => {
    if (!studyId) return;
    try {
      setLoading(true);
      const [pList, sList] = await Promise.all([
        api.getParticipants(studyId),
        api.getSites(studyId)
      ]);
      setParticipants(pList);
      setSites(sList);
      if (sList.length > 0 && !enrollSiteId) {
        setEnrollSiteId(sList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studyId]);

  const handleOpenCheckup = async (p: any) => {
    setSelectedPatient(p);
    setGuardianResult(null);
    try {
      const v = await api.getVisits(p.id);
      setPatientVisits(v);
      const nextPending = v.find((x: any) => x.status === 'SCHEDULED') || v[0];
      if (nextPending) {
        setSelectedVisitId(nextPending.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
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
      await api.enrollParticipant(screened.id, today);
      setEnrollmentFeedback(`Patient ${screened.participant_code} successfully registered! Protocol checkup schedule initialized.`);
      setShowEnrollModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setEnrollmentFeedback(`Error enrolling patient: ${err?.message || 'Check site status'}`);
    }
  };

  const handleCompleteVisitWithGuardian = async () => {
    if (!selectedVisitId) return;
    try {
      setSubmittingVisit(true);
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
      // Reload visits
      if (selectedPatient) {
        const v = await api.getVisits(selectedPatient.id);
        setPatientVisits(v);
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVisit(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.participant_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSiteFilter === 'ALL' || p.site_id === selectedSiteFilter;
    return matchesSearch && matchesSite;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. HEADER WITH ACTIONS */}
      <div className="responsive-header-card" style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">PARTICIPANT MANAGEMENT</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              De-Identified Clinical Subjects · Protocol Schedule Tracking
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Patients & Visit Schedules
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Search registered participants, verify signed consent, log clinic attendance, and record vital signs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="btn btn-cobalt"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={16} />
            <span>Enroll New Patient</span>
          </button>
        </div>
      </div>

      {/* Enrollment Feedback Banner */}
      {enrollmentFeedback && (
        <div style={{
          background: 'var(--ayush-teal-light)',
          border: '1px solid #99f6e4',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--ayush-teal-dark)',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--ayush-teal)" />
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

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Code (e.g. P0042)..."
            className="input-text"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>

        {/* Site Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hospital Site:</span>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="input-select"
            style={{ width: '100%', maxWidth: '220px' }}
          >
            <option value="ALL">All 8 Hospital Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.site_code} - {s.site_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredParticipants.length}</strong> registered patients
        </div>
      </div>

      {/* 3. PATIENTS TABLE */}
      <div className="card table-responsive" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Patient Code</th>
              <th>Demographics</th>
              <th>Hospital Site</th>
              <th>Consent Form</th>
              <th>Status</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--ayush-teal-dark)' }}>{p.participant_code}</strong>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Registered: {p.screening_date || 'Active'}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.age} years</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.gender}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {sites.find(s => s.id === p.site_id)?.site_name || 'AIIA New Delhi'}
                  </div>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                    Site {sites.find(s => s.id === p.site_id)?.site_code || 'S01'}
                  </div>
                </td>
                <td>
                  <span className="badge badge-emerald" style={{ fontSize: '0.71875rem' }}>
                    {p.consent_version || 'v2.0 Approved'}
                  </span>
                </td>
                <td>
                  <span className="badge badge-blue">
                    {p.status || 'ENROLLED'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleOpenCheckup(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <HeartPulse size={14} color="var(--ayush-teal)" />
                    <span>Log Checkup Visit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. MODAL: ENROLL PATIENT */}
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
          zIndex: 100
        }}>
          <div className="card" style={{ width: '480px', maxWidth: '90vw', background: '#ffffff', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Enroll New Patient
              </h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Registers a consented participant into <strong>AIIA-PCOS-001</strong> and initializes their scheduled protocol visits.
            </p>

            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select Hospital Center:
                </label>
                <select
                  value={enrollSiteId}
                  onChange={(e) => setEnrollSiteId(e.target.value)}
                  className="input-select"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.site_code} - {s.site_name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Informed Consent Version:
                </label>
                <input
                  type="text"
                  value={enrollConsentVersion}
                  onChange={(e) => setEnrollConsentVersion(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm & Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: LOG CHECKUP VISIT (PROTOCOL GUARDIAN) */}
      {selectedPatient && (
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
          zIndex: 100
        }}>
          <div className="card" style={{ width: '560px', maxWidth: '90vw', background: '#ffffff', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '4px' }}>PROTOCOL GUARDIAN</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Log Checkup Visit: {selectedPatient.participant_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Submit actual patient clinic attendance and vitals. The Protocol Guardian validates visit-window tolerance (Day 28 ± 3) and mandatory laboratory tests in real time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select Scheduled Visit:
                </label>
                <select
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                  className="input-select"
                >
                  {patientVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visit_name} (Scheduled: {v.scheduled_date}) - [{v.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <input
                  type="checkbox"
                  id="include_lab_check"
                  checked={includeLab}
                  onChange={(e) => setIncludeLab(e.target.checked)}
                />
                <label htmlFor="include_lab_check" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Include Mandatory Lab Test (Fasting Glucose). <em>(Uncheck to simulate a missing-test protocol deviation!)</em>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={handleCompleteVisitWithGuardian}
                  disabled={submittingVisit}
                  className="btn btn-primary"
                >
                  {submittingVisit ? 'Validating...' : 'Submit & Validate Checkup'}
                </button>
              </div>

              {/* Protocol Guardian Result Box */}
              {guardianResult && (
                <div style={{
                  background: guardianResult.guardian_status === 'COMPLIANT' ? 'var(--ayush-teal-light)' : '#fff1f2',
                  border: `1px solid ${guardianResult.guardian_status === 'COMPLIANT' ? '#99f6e4' : '#fecaca'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginTop: '12px'
                }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: guardianResult.guardian_status === 'COMPLIANT' ? 'var(--ayush-teal-dark)' : 'var(--danger-rose)',
                    marginBottom: '4px'
                  }}>
                    Validation Result: {guardianResult.guardian_status === 'COMPLIANT' ? '✓ Fully Compliant' : '⚠ Protocol Deviation Detected'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Calculated Study Day: <strong>{guardianResult.study_day}</strong> · Visit Status: <strong>{guardianResult.status}</strong>
                  </div>
                  {guardianResult.deviations?.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--danger-rose)' }}>
                      <strong>Exceptions Logged:</strong>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                        {guardianResult.deviations.map((d: any, idx: number) => (
                          <li key={idx}>{d.type}: {d.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
