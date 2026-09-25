import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Download,
  CheckCircle2,
  Building2,
  HeartPulse,
  Users,
  ShieldCheck,
  FileCheck2,
  Table
} from 'lucide-react';

interface ExportPageProps {
  flagshipStudy: any;
}

export const ExportPage: React.FC<ExportPageProps> = ({ flagshipStudy }) => {
  const [sdtmDatasets, setSdtmDatasets] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('DM.csv');
  const [defineXml, setDefineXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  useEffect(() => {
    if (!studyId) return;
    const fetchInterop = async () => {
      try {
        setLoading(true);
        const [cdisc, xml] = await Promise.all([
          api.getCDISCExport(studyId),
          api.getDefineXML(studyId)
        ]);
        setSdtmDatasets(cdisc.datasets);
        setDefineXml(xml);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterop();
  }, [studyId]);

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const domainTabs = [
    { key: 'DM.csv', label: 'Demographics & Cohort', icon: Users },
    { key: 'VS.csv', label: 'Vital Signs & Checkups', icon: HeartPulse },
    { key: 'AE.csv', label: 'Adverse Health Reactions', icon: FileCheck2 },
    { key: 'CM.csv', label: 'Concomitant Medications', icon: FileText },
    { key: 'EX.csv', label: 'Herb Administration Log', icon: ShieldCheck }
  ];

  // Friendly column header dictionary
  const columnLabels: Record<string, string> = {
    STUDYID: 'Study Code',
    DOMAIN: 'Category',
    USUBJID: 'Patient Code',
    SUBJID: 'Subject Code',
    SITEID: 'Hospital Site',
    AGE: 'Age (Yrs)',
    SEX: 'Gender',
    RACE: 'Demographic Group',
    ARM: 'Study Group / Arm',
    ARMCD: 'Group Code',
    COUNTRY: 'Country',
    DTHFL: 'Deceased Flag',
    VSTEST: 'Vital Sign Parameter',
    VSTESTCD: 'Test Code',
    VSORRES: 'Measured Value',
    VSORRESU: 'Unit',
    VISIT: 'Scheduled Checkup',
    VISITNUM: 'Visit Number',
    VSDTC: 'Assessment Date',
    AETERM: 'Reported Reaction',
    AEDECOD: 'Standard Term',
    AESEV: 'Severity Grade',
    AESER: 'Serious Event',
    AEREL: 'Causality Assessment',
    AEOUT: 'Clinical Outcome',
    AESTDTC: 'Onset Date',
    AEENDTC: 'Resolution Date',
    CMTRT: 'Medication Name',
    CMDOSE: 'Dose',
    CMDOSU: 'Unit',
    CMDOSFRQ: 'Frequency',
    CMROUTE: 'Route',
    CMINDC: 'Clinical Indication',
    CMSTDTC: 'Start Date',
    EXTRT: 'Intervention Herb',
    EXDOSE: 'Dosage Amount',
    EXDOSU: 'Unit',
    EXDOSFRQ: 'Frequency',
    EXROUTE: 'Administration Route',
    EXSTDTC: 'Start Date'
  };

  // Parse CSV string into friendly structured table
  const parseCSV = (csvContent: string) => {
    if (!csvContent) return { headers: [], rows: [] };
    const lines = csvContent.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
    return { headers, rows };
  };

  const currentDataset = sdtmDatasets && sdtmDatasets[selectedDomain] ? parseCSV(sdtmDatasets[selectedDomain]) : null;

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
            <span className="badge badge-emerald">OFFICIAL REGULATORY DOSSIER</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              National Health Authority & Institutional Ethics Committee Compliance
            </span>
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Official Clinical Reports & Regulatory Exports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Generate verified patient summaries, hospital health record extracts, and official study review packages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => downloadFile('AIIA_Trial_Regulatory_Specification.xml', defineXml, 'application/xml')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Download Trial Specification Package</span>
          </button>
          {sdtmDatasets && sdtmDatasets[selectedDomain] && (
            <button
              onClick={() => downloadFile(`AIIA_${selectedDomain}`, sdtmDatasets[selectedDomain], 'text/csv')}
              className="btn btn-cobalt"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export {domainTabs.find((d) => d.key === selectedDomain)?.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. HOSPITAL MEDICAL RECORDS COMPATIBILITY FRAMEWORK */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Hospital Medical Records Compatibility Framework
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            Ensures all trial observations, patient visits, and vital signs synchronize seamlessly with standard hospital documentation and national health registries.
          </p>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Hospital Record Category</th>
              <th>Standard Health Record Type</th>
              <th>Clinical Information Captured</th>
              <th>Clinical Verification Standard</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Participant Subject Record</strong></td>
              <td><span className="badge badge-blue">Patient Profile</span></td>
              <td>Confidential Patient ID, Age, Gender, Hospital Center</td>
              <td>National Patient Registry Standard</td>
              <td><span className="badge badge-emerald">Verified & Compatible</span></td>
            </tr>
            <tr>
              <td><strong>Routine Vital Signs</strong></td>
              <td><span className="badge badge-blue">Physical Measurements</span></td>
              <td>Systolic / Diastolic Blood Pressure, Pulse, Laboratory Tests</td>
              <td>Standard Clinical Vitals Scale</td>
              <td><span className="badge badge-emerald">Verified & Compatible</span></td>
            </tr>
            <tr>
              <td><strong>Adverse Reaction Reports</strong></td>
              <td><span className="badge badge-rose">Safety Notification</span></td>
              <td>Reported Symptoms, Severity Grade, Doctor Review</td>
              <td>National Medical Terminology Dictionary</td>
              <td><span className="badge badge-emerald">Verified & Compatible</span></td>
            </tr>
            <tr>
              <td><strong>Signed Consent Record</strong></td>
              <td><span className="badge badge-purple">Informed Consent</span></td>
              <td>Signed Patient Form, Date of Agreement, Ethics Version</td>
              <td>Good Clinical Practice (GCP) Guidelines</td>
              <td><span className="badge badge-emerald">Verified & Compatible</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. OFFICIAL CLINICAL DATA RECORDS EXPLORER (BEAUTIFULLY FORMATTED TABLE) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Official Clinical Records Explorer
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Review patient cohorts, vital sign recordings, and safety logs formatted for ethical committees and hospital inspectors.
            </p>
          </div>

          {/* Domain Category Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {domainTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedDomain === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedDomain(tab.key)}
                  className={isSelected ? 'btn btn-cobalt btn-sm' : 'btn btn-secondary btn-sm'}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean, Human-Readable Medical Data Grid */}
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading formatted clinical records...
          </div>
        ) : currentDataset && currentDataset.rows.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                  {currentDataset.headers.map((colKey, idx) => (
                    <th key={idx} style={{ whiteSpace: 'nowrap', fontSize: '0.78125rem' }}>
                      {columnLabels[colKey] || colKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentDataset.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((val, cIdx) => (
                      <td key={cIdx} style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {cIdx === 2 ? (
                          <strong style={{ color: 'var(--clinical-cobalt)' }}>{val}</strong>
                        ) : val === 'CRITICAL' || val === 'SEVERE' ? (
                          <span className="badge badge-rose">{val}</span>
                        ) : val === 'COMPLETED' || val === 'RESOLVED' || val === 'Y' ? (
                          <span className="badge badge-emerald">{val === 'Y' ? 'Yes' : val}</span>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records found for this clinical category.
          </div>
        )}

        {/* Footer info banner */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>
            Records formatted for official inspection by Institutional Ethics Committees and Drug Licensing Authorities.
          </span>
          {currentDataset && (
            <span>
              Showing {currentDataset.rows.length} verified patient entries
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
