import axios from 'axios';

const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set Auth Token dynamically
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('aiia_ctms_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('aiia_ctms_token');
  }
};

// Initialize from localStorage if present
const storedToken = localStorage.getItem('aiia_ctms_token');
if (storedToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

export const api = {
  // Auth & RBAC
  login: async (email: string, password = 'password123') => {
    const res = await apiClient.post('/auth/login', { email, password });
    setAuthToken(res.data.access_token);
    return res.data;
  },
  getMe: async () => (await apiClient.get('/auth/me')).data,
  switchRole: async (target_role: string) => {
    const res = await apiClient.post('/auth/switch-role', { target_role });
    setAuthToken(res.data.access_token);
    return res.data;
  },
  getAvailableRoles: async () => (await apiClient.get('/auth/available-roles')).data,

  // Studies & Protocols
  getStudies: async () => (await apiClient.get('/studies')).data,
  getStudy: async (id: string) => (await apiClient.get(`/studies/${id}`)).data,
  transitionLifecycle: async (id: string, new_status: string, reason: string) =>
    (await apiClient.put(`/studies/${id}/lifecycle`, { new_status, reason })).data,
  getSites: async (study_id: string) => (await apiClient.get(`/studies/${study_id}/sites`)).data,
  getProtocols: async (study_id: string) => (await apiClient.get(`/studies/${study_id}/protocols`)).data,
  getAmendmentImpact: async (study_id: string, old_v = 'v1.0', new_v = 'v2.0') =>
    (await apiClient.post('/protocols/impact-analysis', { study_id, old_version: old_v, new_version: new_v })).data,

  // Participants & Operations
  getParticipants: async (study_id: string) => (await apiClient.get(`/studies/${study_id}/participants`)).data,
  screenParticipant: async (study_id: string, data: any) =>
    (await apiClient.post(`/studies/${study_id}/participants/screen`, data)).data,
  enrollParticipant: async (participant_id: string, enrollment_date: string) =>
    (await apiClient.post(`/participants/${participant_id}/enroll`, { enrollment_date })).data,
  getVisits: async (participant_id: string) => (await apiClient.get(`/participants/${participant_id}/visits`)).data,
  completeVisit: async (visit_id: string, actual_date: string, assessments: any[], notes?: string) =>
    (await apiClient.post(`/visits/${visit_id}/complete`, { actual_date, assessments, notes })).data,
  getDeviationRisk: async (participant_id: string) =>
    (await apiClient.get(`/participants/${participant_id}/deviation-risk`)).data,

  // Protocol Deviations & Queries
  getDeviations: async (study_id: string) => (await apiClient.get(`/deviations/study/${study_id}`)).data,
  signoffDeviation: async (deviation_id: string) =>
    (await apiClient.put(`/deviations/${deviation_id}/signoff`)).data,
  getQueries: async (study_id: string) => (await apiClient.get(`/queries/study/${study_id}`)).data,
  respondQuery: async (query_id: string, resolution_text: string) =>
    (await apiClient.put(`/queries/${query_id}/respond`, { resolution_text })).data,
  resolveQuery: async (query_id: string, status = 'RESOLVED', notes = 'Verified by CRA') =>
    (await apiClient.put(`/queries/${query_id}/resolve`, { status, notes })).data,
  getQueryMetrics: async (study_id: string) => (await apiClient.get(`/queries/metrics/${study_id}`)).data,

  // Pharmacovigilance & Safety
  getAdverseEvents: async (study_id: string) => (await apiClient.get(`/safety/studies/${study_id}/adverse-events`)).data,
  reportAdverseEvent: async (data: any) => (await apiClient.post('/safety/adverse-events', data)).data,
  getSAEDeadlines: async (study_id?: string) => {
    const url = study_id ? `/safety/sae/deadlines?study_id=${study_id}` : '/safety/sae/deadlines';
    return (await apiClient.get(url)).data;
  },
  getSafetySignals: async (study_id: string) => (await apiClient.get(`/safety/studies/${study_id}/signals`)).data,
  searchTerminology: async (q = '') => (await apiClient.get(`/safety/terminology/search?q=${q}`)).data,

  // KPIs & Alerts
  getPortfolioKPIs: async () => (await apiClient.get('/kpis/portfolio')).data,
  getStudyKPIs: async (study_id: string) => (await apiClient.get(`/kpis/study/${study_id}`)).data,
  getStudyControlCenter: async (study_id: string) => (await apiClient.get(`/kpis/study/${study_id}/control-center`)).data,
  getAlerts: async (study_id?: string) => {
    const url = study_id ? `/alerts?study_id=${study_id}` : '/alerts';
    return (await apiClient.get(url)).data;
  },
  getCorrelatedAlerts: async (study_id: string) => (await apiClient.get(`/alerts/correlated/${study_id}`)).data,

  // Pharmacovigilance & Safety Workflows
  getReportingRules: async () => (await apiClient.get('/safety/reporting-rules')).data,
  reviewSAE: async (sae_id: string, data: any) =>
    (await apiClient.put(`/safety/sae/${sae_id}/review`, data)).data,
  submitSAE: async (sae_id: string, data: any) =>
    (await apiClient.post(`/safety/sae/${sae_id}/submit`, data)).data,

  // Document Management Lifecycle
  getDocuments: async (study_id: string) => (await apiClient.get(`/compliance/documents/${study_id}`)).data,
  createDocument: async (data: any) => (await apiClient.post('/compliance/documents', data)).data,
  updateDocumentStatus: async (doc_id: string, new_status: string) =>
    (await apiClient.put(`/compliance/documents/${doc_id}/status?new_status=${new_status}`)).data,

  // Trial Trust, Risk & Simulator
  getTrialTrust: async (study_id: string) => (await apiClient.get(`/trial-trust/study/${study_id}`)).data,
  getEvidenceGraph: async (study_id: string) => (await apiClient.get(`/trial-trust/evidence-graph/${study_id}`)).data,
  getStudyRisk: async (study_id: string) => (await apiClient.get(`/risk/study/${study_id}`)).data,
  runSimulation: async (study_id: string, params: any) =>
    (await apiClient.post('/simulation/run', { study_id, ...params })).data,

  // Compliance & Tamper-Evident Audit
  getAuditEvents: async (limit = 50) => (await apiClient.get(`/audit/events?limit=${limit}`)).data,
  verifyAuditIntegrity: async () => (await apiClient.post('/audit/verify-integrity')).data,
  getALCOA: async () => (await apiClient.get('/compliance/alcoa')).data,
  getEthics: async (study_id: string) => (await apiClient.get(`/compliance/ethics/${study_id}`)).data,
  getCTRI: async (study_id: string) => (await apiClient.get(`/compliance/ctri/${study_id}`)).data,

  // Interoperability (FHIR & CDISC)
  getFHIRPatient: async (participant_id: string) => (await apiClient.get(`/fhir/Patient/${participant_id}`)).data,
  getCDISCExport: async (study_id: string) => (await apiClient.post(`/cdisc/export/${study_id}`)).data,
  getDefineXML: async (study_id: string) => (await apiClient.get(`/cdisc/define-xml/${study_id}`)).data,

  // Explainable AI Assistants
  extractNarrative: async (narrative_text: string) =>
    (await apiClient.post('/ai/extract-narrative', { narrative_text })).data,
  translateConcept: async (source_concept: string) =>
    (await apiClient.post('/ai/translate-concept', { source_concept })).data,
};
