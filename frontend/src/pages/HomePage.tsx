import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Building2,
  Lock,
  HeartPulse,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
  Stethoscope,
  Microscope,
  CalendarCheck,
  Layers,
  Database,
  Share2
} from 'lucide-react';

interface HomePageProps {
  onQuickLogin?: (role: string, email: string) => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* 1. TOP ENTERPRISE NAVIGATION (VEEVA VAULT STYLE) */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          {/* Brand Identity */}
          <div className="home-nav-brand">
            <div className="home-nav-logo">
              <Shield size={22} strokeWidth={2.2} />
            </div>
            <div className="home-nav-title-group">
              <div className="home-nav-title">
                AIIA Clinical Operations
                <span className="badge badge-cobalt hide-mobile" style={{ fontSize: '0.625rem', padding: '2px 7px' }}>
                  National Platform
                </span>
              </div>
              <div className="home-nav-subtitle">
                <span className="hide-mobile">All India Institute of Ayurveda · </span>Ministry of Ayush, Govt. of India
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="desktop-nav-only" style={{ alignItems: 'center', gap: '32px', fontSize: '0.84375rem', fontWeight: 600 }}>
            <a href="#solutions" style={{ color: 'var(--text-secondary)' }}>Clinical Suite</a>
            <a href="#active-trials" style={{ color: 'var(--text-secondary)' }}>Active Studies</a>
            <a href="#patient-care" style={{ color: 'var(--text-secondary)' }}>Patient Safety & Care</a>
            <a href="#hospital-network" style={{ color: 'var(--text-secondary)' }}>Hospital Centers</a>
          </div>

          {/* Portal Access Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary home-portal-btn"
            >
              <span className="hide-mobile">Staff & Researcher Portal</span>
              <span className="show-mobile">Staff Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION: ULTRA-PROFESSIONAL VEEVA/MEDIDATA CORPORATE STYLE */}
      <section className="teal-wavy-hero-bg bg-decorative-shapes home-section" style={{
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Organic Flowing Teal Waves Graphic Layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '65%', height: '100%', opacity: 0.18 }} viewBox="0 0 900 600" preserveAspectRatio="none">
            <path fill="url(#hero-teal-wave-grad)" d="M150 0 C400 180 350 380 900 600 L900 0 Z" />
            <defs>
              <linearGradient id="hero-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0F766E" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '160px', opacity: 0.15 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#0F766E" d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L0,320Z" />
          </svg>
        </div>

        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box' }}>
          <div className="home-hero-grid" style={{
            display: 'grid',
            alignItems: 'center'
          }}>
            {/* Left: Authoritative, Approachable Value Proposition */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span className="badge badge-cobalt" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                  <Sparkles size={13} style={{ marginRight: '4px' }} />
                  UNIFIED LIFE SCIENCES SUITE
                </span>
                <span className="badge badge-emerald" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                  GCP & CTRI REGISTERED
                </span>
              </div>

              <h1 className="hero-title">
                The Unified Clinical Operations Platform for <br className="hide-mobile" />
                <span style={{ color: 'var(--clinical-cobalt)' }}>Evidence-Based Ayurveda</span>
              </h1>

              <p className="hero-subtitle">
                A modern clinical trial platform connecting India’s premier teaching hospitals. 
                Streamline multicentric patient checkups, enforce 24-hour statutory safety alerts, 
                and advance traditional medicine with the highest standards of global scientific validation.
              </p>

              <div className="hero-btn-group">
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'var(--vault-navy)',
                    boxShadow: '0 4px 14px rgba(11, 26, 45, 0.25)'
                  }}
                >
                  <span>Sign In to Clinical Workspace</span>
                  <ArrowRight size={17} />
                </button>

                <a
                  href="#active-trials"
                  className="btn btn-secondary btn-lg"
                >
                  <span>Explore Active Studies</span>
                </a>
              </div>

              {/* Four Trust Stats */}
              <div className="home-stats-grid" style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '24px'
              }}>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--text-primary)' }}>8 Centers</div>
                  <div className="stat-label">Premier Teaching Hospitals</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--clinical-cobalt)' }}>500 Cohort</div>
                  <div className="stat-label">Active Phase III Participants</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--danger-rose)' }}>24-Hour Watch</div>
                  <div className="stat-label">Urgent Safety Alerts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--ayush-emerald)' }}>100% Sealed</div>
                  <div className="stat-label">Permanent Medical Trail</div>
                </div>
              </div>
            </div>

            {/* Right: High-Resolution Clinical Laboratory Visual with Floating Metadata Widget */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div className="image-card-container">
                <img
                  src="/images/hero_clinical_ayurveda.jpg"
                  alt="Modern pharmacology research laboratory with clinical researcher examining botanical formulations and digital analytics"
                />
              </div>

              {/* Floating Live Trial Metadata Pill */}
              <div className="hero-floating-pill">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                      LIVE STUDY
                    </span>
                    <strong style={{ fontSize: '0.84375rem', color: 'var(--text-primary)' }}>
                      AIIA-PCOS-001 (Phase III)
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clinical-cobalt)' }}>
                    320 / 500 Enrolled (64%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #0F766E, #14B8A6)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CLINICAL SUITE (MODELED AFTER VEEVA VAULT MODULAR ARCHITECTURE) */}
      <section id="solutions" className="teal-wavy-hero-bg bg-decorative-shapes home-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '140px', opacity: 0.16 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#0F766E" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,138,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,0L0,0Z" />
          </svg>
        </div>
        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-cobalt" style={{ marginBottom: '10px' }}>
              UNIFIED CLINICAL CARE
            </span>
            <h2 className="section-title">
              Engineered for Complete Clinical Governance
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '10px auto 0', lineHeight: 1.6 }}>
              A cohesive healthcare platform connecting trial management, safety reporting, scheduled checkups, and verified patient records.
            </p>
          </div>

          <div className="home-pillars-grid" style={{ display: 'grid' }}>
            {/* Module 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'var(--clinical-cobalt-light)',
                color: 'var(--clinical-cobalt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Hospital Trial Operations
              </h3>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                Real-time visibility across all 8 hospital centers. Track patient enrollment rates, protocol milestone timelines, and doctor oversight.
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ✓ Multicentric Oversight · Site Milestones
              </div>
            </div>

            {/* Module 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'var(--danger-rose-light)',
                color: 'var(--danger-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <HeartPulse size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Safety & Pharmacovigilance
              </h3>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                Automated 24-hour statutory countdown clock for serious adverse events. Integrated clinical causality evaluation for Ayurvedic formulations.
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ✓ 24h Regulatory Clock · CDSCO Rule 12(3)
              </div>
            </div>

            {/* Module 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'var(--ayush-teal-light)',
                color: 'var(--ayush-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <CalendarCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Scheduled Patient Checkups
              </h3>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                Visit Window Guardian with Day 28 ± 3 tolerance checking. Rapid clinic vitals entry, informed consent management, and regular health assessments.
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ✓ Visit Window Guardian · Rapid Vitals
              </div>
            </div>

            {/* Module 4 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'var(--purple-light)',
                color: 'var(--purple-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <FileCheck2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Verified Medical Records
              </h3>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                Permanent, tamper-proof clinical records ensuring complete accuracy. Standard medical data export for healthcare authorities and research publications.
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ✓ Permanent Records · Regulatory Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PATIENT CARE & ETHICAL SAFETY IN ACTION */}
      <section id="patient-care" className="teal-wavy-hero-bg bg-decorative-shapes home-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Organic Flowing Teal Waves Graphic Layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '65%', height: '100%', opacity: 0.16 }} viewBox="0 0 900 600" preserveAspectRatio="none">
            <path fill="url(#patient-teal-wave-grad)" d="M0 100 C300 0 600 300 900 150 L900 600 L0 600 Z" />
            <defs>
              <linearGradient id="patient-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0F766E" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '160px', opacity: 0.14 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#0F766E" d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L0,320Z" />
          </svg>
        </div>
        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="dashboard-split-grid" style={{
            display: 'grid',
            alignItems: 'center'
          }}>
            {/* Left: Patient Consultation Visual */}
            <div>
              <div className="image-card-container" style={{ height: '460px' }}>
                <img
                  src="/images/patient_consultation.jpg"
                  alt="Doctor consulting with a patient in an Ayurvedic hospital examination room reviewing digital health records"
                />
              </div>
              <div style={{
                fontSize: '0.78125rem',
                color: 'var(--text-muted)',
                marginTop: '10px',
                textAlign: 'center'
              }}>
                In-person patient consultation at the All India Institute of Ayurveda Clinical Hospital, New Delhi
              </div>
            </div>

            {/* Right: Conversational Patient Rights & Safety */}
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
                PATIENT-FIRST PHILOSOPHY
              </span>
              <h2 className="section-title" style={{ marginBottom: '16px' }}>
                Compassionate Care Backed by Rigorous Protection
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                Every participant in an AIIA clinical trial is treated as a valued partner in health research. 
                Our digital platform ensures that every doctor visit is on time, every health metric is carefully reviewed, 
                and your rights are upheld at every single step.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--clinical-cobalt-light)',
                    color: 'var(--clinical-cobalt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Voluntary Participation At All Times
                    </strong>
                    <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.5 }}>
                      Participants can choose to join or leave the study at any moment without affecting their routine hospital medical care.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--clinical-cobalt-light)',
                    color: 'var(--clinical-cobalt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Free Specialist Health Checkups & Certified Formulations
                    </strong>
                    <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.5 }}>
                      Participants receive comprehensive medical assessments, specialized blood and ultrasound tests, and certified herbal formulations at zero cost.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--clinical-cobalt-light)',
                    color: 'var(--clinical-cobalt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Lock size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Complete Patient Confidentiality
                    </strong>
                    <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.5 }}>
                      Personal identity details are strictly protected and de-identified so all medical records remain completely confidential.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Patient Inquiries & Ethics Committee
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Institutional Ethics Committee · AIIA New Delhi
                  </strong>
                </div>
                <span className="badge badge-emerald">IEC Accredited</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE CLINICAL TRIAL SPOTLIGHT */}
      <section id="active-trials" className="teal-wavy-hero-bg bg-decorative-shapes home-section" style={{ borderTop: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Organic Flowing Teal Waves Graphic Layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '180px', opacity: 0.16 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#0F766E" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,138,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,0L0,0Z" />
          </svg>
          <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '100%', opacity: 0.15 }} viewBox="0 0 600 600" preserveAspectRatio="none">
            <path fill="url(#active-teal-wave-grad)" d="M100 0 C400 200 200 500 600 600 L600 0 Z" />
            <defs>
              <linearGradient id="active-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F766E" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-cobalt" style={{ marginBottom: '10px' }}>
              LANDMARK MULTISITE TRIAL
            </span>
            <h2 className="section-title">
              Active Clinical Study in Progress
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
              Evaluating the therapeutic effectiveness and safety of classical Ayush formulations in women’s wellness.
            </p>
          </div>

          <div className="card" style={{
            padding: '36px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
            background: '#ffffff'
          }}>
            <div className="dashboard-split-grid" style={{ display: 'grid', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span className="badge badge-emerald">PHASE III MULTI-HOSPITAL STUDY</span>
                  <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>Registry Code: CTRI/2026/08/042109</span>
                </div>

                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '14px' }}>
                  Evaluation of Ayush-PCOS Herbal Formulation vs Standard Care
                </h3>

                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                  Polycystic Ovary Syndrome (PCOS) affects millions of women across India. This landmark clinical trial 
                  evaluates the therapeutic effectiveness and safety profile of classical <strong>Ayush-PCOS Kwatha & Vati</strong> herbal 
                  formulation in restoring menstrual regularity and metabolic balance across 500 participants.
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84375rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>National Participant Enrollment:</span>
                    <strong style={{ color: 'var(--clinical-cobalt)' }}>320 of 500 Participants (64% Complete)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #0066cc, #0284c7)' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary"
                    style={{ background: 'var(--vault-navy)' }}
                  >
                    <span>View Study In Portal</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Study Specifications Box */}
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  Protocol Summary
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Doctor (PI):</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Prof. (Dr.) Tanuja Manoj Nesari</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Investigational Drug:</span>
                  <strong style={{ color: 'var(--clinical-cobalt)' }}>Ayush-PCOS Kwatha & Vati</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dosage Regimen:</span>
                  <span style={{ color: 'var(--text-primary)' }}>500mg BID with warm water</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Classical Source:</span>
                  <span style={{ color: 'var(--text-primary)' }}>Sahasrayogam Reference</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clinical Sites:</span>
                  <span className="badge badge-emerald">8 Apex Medical Colleges</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ethics Status:</span>
                  <span className="badge badge-emerald">Approved & Active v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLINICAL HOSPITAL NETWORK */}
      <section id="hospital-network" className="teal-wavy-hero-bg bg-decorative-shapes home-section" style={{ borderTop: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Organic Flowing Teal Waves Graphic Layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', opacity: 0.16 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#0F766E" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L0,320Z" />
          </svg>
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '80%', opacity: 0.14 }} viewBox="0 0 800 500" preserveAspectRatio="none">
            <path fill="url(#hosp-teal-wave-grad)" d="M200 0 C500 150 400 350 800 500 L800 0 Z" />
            <defs>
              <linearGradient id="hosp-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0F766E" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>
              NATIONWIDE APEX NETWORK
            </span>
            <h2 className="section-title">
              Participating Hospital Centers
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
              Multicentric clinical trials conducted across premier government Ayurvedic medical colleges and national healthcare institutions.
            </p>
          </div>

          <div className="home-sites-grid" style={{ display: 'grid' }}>
            {[
              {
                city: 'New Delhi',
                name: 'All India Institute of Ayurveda',
                role: 'National Coordinating Center',
                patients: '84 Enrolled',
                badge: 'Apex Center'
              },
              {
                city: 'Varanasi',
                name: 'Faculty of Ayurveda, BHU',
                role: 'Trial Center 02',
                patients: '52 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Jamnagar',
                name: 'ITRA Teaching Hospital',
                role: 'Trial Center 03',
                patients: '48 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Jaipur',
                name: 'National Institute of Ayurveda',
                role: 'Trial Center 04',
                patients: '42 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Haridwar',
                name: 'Rishikul Govt Ayurvedic College',
                role: 'Trial Center 05',
                patients: '34 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Thiruvananthapuram',
                name: 'Govt. Ayurveda College Hospital',
                role: 'Trial Center 06',
                patients: '28 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Bengaluru',
                name: 'Govt. Ayurvedic Medical College',
                role: 'Trial Center 07',
                patients: '20 Enrolled',
                badge: 'Active'
              },
              {
                city: 'Mumbai',
                name: 'Podar Ayurvedic Medical Hospital',
                role: 'Trial Center 08',
                patients: '12 Enrolled',
                badge: 'Active'
              }
            ].map((site, idx) => (
              <div key={idx} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clinical-cobalt)' }}>{site.city}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{site.badge}</span>
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {site.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{site.role}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cohort:</span>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--clinical-cobalt)' }}>{site.patients}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL FOOTER */}
      <footer className="home-footer">
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div className="home-pillars-grid" style={{
            display: 'grid',
            marginBottom: '48px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--clinical-cobalt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Shield size={18} />
                </div>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>All India Institute of Ayurveda</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
                An autonomous organization under the Ministry of Ayush, Government of India, dedicated to bringing synergy between traditional wisdom of Ayurveda and modern scientific diagnostics.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Sarita Vihar, Mathura Road, New Delhi, Delhi 110076
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Regulatory Standards
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <li>CDSCO Good Clinical Practice (GCP)</li>
                <li>ICMR Ethical Guidelines</li>
                <li>Clinical Trials Registry - India (CTRI)</li>
                <li>Pharmacovigilance Program of India (PvPI)</li>
                <li>National Ayush Morbidity Code (NAMASTE)</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform Governance
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <li>Participant Rights & Consent</li>
                <li>24-Hour Adverse Event Reporting</li>
                <li>Multicentric Data Quality Review</li>
                <li>Data Safety Monitoring Board (DSMB)</li>
                <li>Cryptographic SHA-256 Audit Trail</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Authorized Personnel
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
                Clinical trial investigators, safety monitors, hospital site coordinators, and auditors may sign in below.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-cobalt btn-sm"
                style={{ width: '100%' }}
              >
                <span>Staff & Investigator Login</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="home-footer-bottom">
            <div>
              © 2026 All India Institute of Ayurveda (AIIA). Ministry of Ayush, Government of India. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span>Privacy Policy</span>
              <span>Terms of Clinical Protocol</span>
              <span>GCP Certification</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
