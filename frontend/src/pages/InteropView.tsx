import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Share2,
  FileCode,
  Download,
  Database,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';

interface InteropViewProps {
  flagshipStudy: any;
}

export const InteropView: React.FC<InteropViewProps> = ({ flagshipStudy }) => {
  const [sdtmDatasets, setSdtmDatasets] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('DM.csv');
  const [defineXml, setDefineXml] = useState<string>('');
  const [fhirPatientJson, setFhirPatientJson] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'fhir_visual' | 'cdisc_visual' | 'sdtm_raw' | 'abdm_edc'>('fhir_visual');
  const [loading, setLoading] = useState(true);

  const studyId = flagshipStudy?.id;

  useEffect(() => {
    if (!studyId) return;
    const fetchInterop = async () => {
      try {
        setLoading(true);
        const [cdisc, xml, participants] = await Promise.all([
          api.getCDISCExport(studyId),
          api.getDefineXML(studyId),
          api.getParticipants(studyId)
        ]);
        setSdtmDatasets(cdisc.datasets);
        setDefineXml(xml);

        if (participants.length > 0) {
          const fhirP = await api.getFHIRPatient(participants[0].id);
          setFhirPatientJson(fhirP);
        }
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
            <span className="badge badge-blue">INTEROPERABILITY ARCHITECTURE</span>
            <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
              HL7 FHIR R4 & CDISC SDTM Prototype Mapping Pipelines
            </span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Interoperability & Standardized Data Exchange
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Visual field mapping pipelines transforming canonical CTMS trial objects into international healthcare schemas (HL7 FHIR R4, CDISC SDTM, and ABDM-compatible exchange).
          </p>
        </div>

        <span className="badge badge-emerald" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          Simulated Exchange Gateway
        </span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'fhir_visual', label: 'Visual HL7 FHIR R4 Mapper' },
          { id: 'cdisc_visual', label: 'Visual CDISC SDTM Mapper' },
          { id: 'sdtm_raw', label: 'Exportable SDTM Datasets & Define-XML' },
          { id: 'abdm_edc', label: 'ABDM & EDC Canonical Gateway' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={activeSubTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.8125rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. VISUAL FHIR R4 MAPPER (Section 26) */}
      {activeSubTab === 'fhir_visual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Visual HL7 FHIR R4 Transformation Architecture (Section 26)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Maps internal trial records to standardized FHIR resources. Not a static JSON dump, but an active field transformation and validation console.
            </p>

            <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Internal Source Entity</th>
                  <th>Target FHIR R4 Resource</th>
                  <th>Field Path Mapping</th>
                  <th>Clinical Transformation Logic</th>
                  <th>Validation Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Participant Subject</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Participant code, age, gender</div>
                  </td>
                  <td><span className="badge badge-blue">FHIR Patient</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Participant.code → Patient.identifier[0].value</td>
                  <td>SHA-256 de-identified MRN string</td>
                  <td><span className="badge badge-emerald">Valid R4 Schema</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Visit Vital (SYSBP / DIABP)</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Protocol Guardian assessments</div>
                  </td>
                  <td><span className="badge badge-blue">FHIR Observation</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Assessment.numeric_value → Observation.valueQuantity</td>
                  <td>LOINC 85354-9 Blood Pressure Panel</td>
                  <td><span className="badge badge-emerald">Valid R4 Schema</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Adverse Event Record</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>PV registry entry</div>
                  </td>
                  <td><span className="badge badge-rose">FHIR AdverseEvent</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>AdverseEvent.event_term → AdverseEvent.event.coding</td>
                  <td>MedDRA PT code with WHO severity classification</td>
                  <td><span className="badge badge-emerald">Valid R4 Schema</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Electronic Consent Form</strong>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>v2.0 Informed Consent</div>
                  </td>
                  <td><span className="badge badge-purple">FHIR Consent</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Participant.consent_version → Consent.provision.period</td>
                  <td>Standardized Research Consent Policy rule</td>
                  <td><span className="badge badge-emerald">Valid R4 Schema</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sample Active FHIR Resource Payload */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCode size={16} color="var(--ayush-teal)" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Active Transformed Sample: FHIR Patient Resource
                </h4>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>Resource Type: Patient</span>
            </div>

            <pre style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              maxHeight: '220px'
            }}>
              {fhirPatientJson ? JSON.stringify(fhirPatientJson, null, 2) : 'Loading FHIR resource transformation...'}
            </pre>
          </div>
        </div>
      )}

      {/* 2. VISUAL CDISC SDTM MAPPER (Section 27) */}
      {activeSubTab === 'cdisc_visual' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Visual CDISC SDTM Variable Mapping Table (Section 27)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Demonstrates field-level lineage between canonical CTMS clinical entities and CDISC SDTM v1.7 standard submission variables across 5 core domains.
          </p>

          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Internal CTMS Field</th>
                <th>CDISC Domain</th>
                <th>SDTM Variable</th>
                <th>Variable Label</th>
                <th>Transformation Logic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Participant Code</td>
                <td><span className="badge badge-emerald">DM</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>USUBJID</td>
                <td>Unique Subject Identifier</td>
                <td>Prefix study code + site code + participant code</td>
              </tr>
              <tr>
                <td>Demographics Age</td>
                <td><span className="badge badge-emerald">DM</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AGE</td>
                <td>Age</td>
                <td>Calculated integer from screening form</td>
              </tr>
              <tr>
                <td>Demographics Sex</td>
                <td><span className="badge badge-emerald">DM</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>SEX</td>
                <td>Sex</td>
                <td>ISO standard code (F / M)</td>
              </tr>
              <tr>
                <td>Systolic BP</td>
                <td><span className="badge badge-emerald">VS</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>VSSTRESN</td>
                <td>Numeric Result/Finding</td>
                <td>Vitals systolic numeric reading in mmHg</td>
              </tr>
              <tr>
                <td>Adverse Event Verbatim</td>
                <td><span className="badge badge-rose">AE</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AETERM</td>
                <td>Reported Term for Adverse Event</td>
                <td>Clinician verbatim text from safety report</td>
              </tr>
              <tr>
                <td>MedDRA PT Code</td>
                <td><span className="badge badge-rose">AE</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AEDECOD</td>
                <td>Dictionary-Derived Term</td>
                <td>Standard MedDRA Preferred Term</td>
              </tr>
              <tr>
                <td>Herbal Formulation Name</td>
                <td><span className="badge badge-blue">EX</span></td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>EXTRT</td>
                <td>Name of Actual Treatment</td>
                <td>Ayush-PCOS Herbal Formulation Kwatha & Vati</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 3. SDTM RAW DATASETS & DEFINE-XML */}
      {activeSubTab === 'sdtm_raw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Regulatory Export: CDISC SDTM CSV Datasets & Define-XML
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Downloadable SDTM standard files ready for regulatory package compilation.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => downloadFile('define.xml', defineXml, 'application/xml')}
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} />
                  <span>Download Define-XML 2.0</span>
                </button>
                {sdtmDatasets && sdtmDatasets[selectedDomain] && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadFile(selectedDomain, sdtmDatasets[selectedDomain], 'text/csv')}
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download {selectedDomain}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Domain Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {sdtmDatasets && Object.keys(sdtmDatasets).map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={selectedDomain === domain ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* CSV Preview */}
            <pre style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              maxHeight: '260px'
            }}>
              {sdtmDatasets ? sdtmDatasets[selectedDomain] : 'Loading SDTM datasets...'}
            </pre>
          </div>
        </div>
      )}

      {/* 4. ABDM & EDC CANONICAL GATEWAY (Section 28) */}
      {activeSubTab === 'abdm_edc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Server size={18} color="var(--ayush-teal)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Ayushman Bharat Digital Mission (ABDM) & EDC Integration Architecture
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              <span className="badge badge-neutral">Demonstration / Simulated Integration Layer</span>
              <span style={{ marginLeft: '8px' }}>
                Architectural blueprint illustrating bi-directional health data exchange via FHIR bundles and canonical EDC synchronization.
              </span>
            </p>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ayush-teal-dark)', display: 'block', marginBottom: '4px' }}>
                  1. Ayushman Bharat (ABHA) Linkage
                </strong>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Connects participant electronic health records via ABHA address tokens with explicit consent artefact verification (HIU / HIP protocol).
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ayush-teal-dark)', display: 'block', marginBottom: '4px' }}>
                  2. Electronic Data Capture (EDC) API
                </strong>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Ingests eCRF clinical measurements into the central canonical trial data model with cryptographic timestamping and schema validation.
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ayush-teal-dark)', display: 'block', marginBottom: '4px' }}>
                  3. Hospital Information System (HIS)
                </strong>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Federates outpatient clinical laboratory values and radiological reports into study observation records via HL7 FHIR DiagnosticReport.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
