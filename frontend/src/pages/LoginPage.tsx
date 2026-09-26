import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Stethoscope,
  HeartPulse,
  FileCheck2,
  Settings
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userData: any) => void;
}

export const getRoleDashboardPath = (role: string): string => {
  switch (role) {
    case 'PI':
      return '/app/pi-dashboard';
    case 'PHARMACOVIGILANCE':
      return '/app/safety-dashboard';
    case 'STUDY_COORDINATOR':
      return '/app/coordinator-dashboard';
    case 'MONITOR':
      return '/app/monitor-dashboard';
    case 'ADMIN':
      return '/app/admin-dashboard';
    default:
      return '/app/pi-dashboard';
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('pi@aiia.gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const staffDirectory = [
    {
      name: 'Prof. (Dr.) Tanuja Manoj Nesari',
      role: 'PI',
      roleTitle: 'Principal Investigator',
      institution: 'AIIA Apex Center',
      email: 'pi@aiia.gov.in',
      destination: '/app/pi-dashboard',
      description: 'Multisite trial oversight, recruitment tracking & protocol approval sign-offs',
      icon: Stethoscope,
      badgeColor: 'badge-emerald'
    },
    {
      name: 'Dr. Rajesh Sharma',
      role: 'PHARMACOVIGILANCE',
      roleTitle: 'Safety & Vigilance Officer',
      institution: 'Central Safety Committee',
      email: 'pv@aiia.gov.in',
      destination: '/app/safety-dashboard',
      description: '24-hour statutory safety clock, adverse reaction triage & CDSCO regulatory alerts',
      icon: HeartPulse,
      badgeColor: 'badge-rose'
    },
    {
      name: 'Priya Nair',
      role: 'STUDY_COORDINATOR',
      roleTitle: 'Site Study Coordinator',
      institution: 'Delhi Clinical Hospital',
      email: 'coordinator@aiia.gov.in',
      destination: '/app/coordinator-dashboard',
      description: 'Daily patient appointment scheduling, vitals logging & visit window tracking',
      icon: Users,
      badgeColor: 'badge-cobalt'
    },
    {
      name: 'Vikram Malhotra',
      role: 'MONITOR',
      roleTitle: 'Clinical Research Associate (CRA)',
      institution: 'Quality & Audit Board',
      email: 'cra@aiia.gov.in',
      destination: '/app/monitor-dashboard',
      description: 'Hospital source data verification (SDV), clinical query queues & audit logs',
      icon: FileCheck2,
      badgeColor: 'badge-amber'
    },
    {
      name: 'Dr. Sanjay Verma',
      role: 'ADMIN',
      roleTitle: 'Institutional Administrator',
      institution: 'Directorate of Research',
      email: 'admin@aiia.gov.in',
      destination: '/app/admin-dashboard',
      description: 'Portfolio health, multi-study operations & system configuration',
      icon: Settings,
      badgeColor: 'badge-purple'
    }
  ];

  const handleLoginSubmit = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await api.login(loginEmail, password);
      onLoginSuccess(res);
      const targetPath = getRoleDashboardPath(res.role);
      navigate(targetPath);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (staffEmail: string) => {
    setEmail(staffEmail);
    handleLoginSubmit(undefined, staffEmail);
  };

  return (
    <div className="teal-wavy-hero-bg bg-decorative-shapes" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Organic Flowing Teal Waves Graphic Layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, width: '65%', height: '100%', opacity: 0.18 }} viewBox="0 0 900 600" preserveAspectRatio="none">
          <path fill="url(#login-teal-wave-grad)" d="M150 0 C400 180 350 380 900 600 L900 0 Z" />
          <defs>
            <linearGradient id="login-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '180px', opacity: 0.15 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#0F766E" d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L0,320Z" />
        </svg>
      </div>

      {/* Enterprise Top Header */}
      <header className="top-nav-bar" style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 32px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Shield size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              All India Institute of Ayurveda
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Clinical Research Operations & Governance Platform
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary btn-sm"
        >
          ← Return to Public Website
        </button>
      </header>

      {/* Main Container */}
      <main className="login-layout-grid" style={{
        flex: 1,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 20px',
        display: 'grid',
        alignItems: 'start'
      }}>
        {/* Left Column: Official Sign In Form */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-cobalt" style={{ marginBottom: '10px' }}>
              SECURE CLINICAL AUTHENTICATION
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Clinical Staff Sign In
            </h2>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)' }}>
              Enter your registered institutional credentials to access your clinical desk.
            </p>
          </div>

          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              background: 'var(--danger-rose-light)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-rose)',
              fontSize: '0.8125rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={(e) => handleLoginSubmit(e)}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Institutional Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@aiia.gov.in"
                  required
                  className="input-text"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-teal)', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="input-text"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'var(--primary-teal)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {loading ? (
                <span>Signing in to Clinical Workspace...</span>
              ) : (
                <>
                  <span>Sign In to Dedicated Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Official Clinical Portal · Protected under National Ethics and Good Clinical Practice (GCP) guidelines.
          </div>
        </div>

        {/* Right Column: Authorized Clinical Staff Access Directory */}
        <div>
          <div style={{ marginBottom: '18px' }}>
            <span className="badge badge-neutral" style={{ marginBottom: '6px' }}>
              DIRECT ROLE PORTALS
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Authorized Clinical Staff Directory
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)' }}>
              Click any staff profile to sign in immediately and route directly to their dedicated desk:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {staffDirectory.map((staff, idx) => {
              const Icon = staff.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectStaff(staff.email)}
                  className="card card-sm"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--clinical-cobalt)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--clinical-cobalt-light)',
                      color: 'var(--clinical-cobalt)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {staff.name}
                        </span>
                        <span className={`badge ${staff.badgeColor}`} style={{ fontSize: '0.65rem' }}>
                          {staff.roleTitle}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                        {staff.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clinical-cobalt)', fontWeight: 600, fontSize: '0.8125rem' }}>
                    <span>Access Desk</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
