import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FolderGit2,
  Users,
  AlertOctagon,
  FileCheck2,
  ShieldCheck,
  Building2,
  FileLock2,
  Share2,
  LogOut,
  ChevronDown,
  UserCheck,
  ExternalLink,
  Stethoscope,
  HeartPulse,
  Settings,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { getRoleDashboardPath } from '../pages/LoginPage';

interface AppLayoutProps {
  currentUser: any;
  currentRole: string;
  flagshipStudy: any;
  onLogout: () => void;
  onSwitchRole?: (role: string, email: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  currentRole,
  flagshipStudy,
  onLogout,
  onSwitchRole,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown & mobile drawer open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdowns on outside click
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setProfileDropdownOpen(false);
        setRoleSwitchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setProfileDropdownOpen(false);
    setRoleSwitchOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const myDeskPath = getRoleDashboardPath(currentRole);

  const roleLabels: Record<string, { title: string; color: string }> = {
    PI: { title: 'Principal Investigator', color: 'badge-emerald' },
    PHARMACOVIGILANCE: { title: 'Safety & Vigilance Officer', color: 'badge-rose' },
    STUDY_COORDINATOR: { title: 'Site Study Coordinator', color: 'badge-cobalt' },
    MONITOR: { title: 'CRA Clinical Monitor', color: 'badge-amber' },
    ADMIN: { title: 'Institutional Administrator', color: 'badge-purple' }
  };

  const allRoles = [
    { role: 'PI', email: 'pi@aiia.gov.in', title: 'Principal Investigator', desc: 'Trial oversight & approvals' },
    { role: 'PHARMACOVIGILANCE', email: 'pv@aiia.gov.in', title: 'Safety Officer', desc: '24h safety clocks & CDSCO alerts' },
    { role: 'STUDY_COORDINATOR', email: 'coordinator@aiia.gov.in', title: 'Study Coordinator', desc: 'Patient checkups & vitals' },
    { role: 'MONITOR', email: 'cra@aiia.gov.in', title: 'CRA Monitor', desc: 'Source verification & queries' },
    { role: 'ADMIN', email: 'admin@aiia.gov.in', title: 'Administrator', desc: 'Portfolio & system access' }
  ];

  const handleRoleSelect = (targetRole: string, targetEmail: string) => {
    if (onSwitchRole) {
      onSwitchRole(targetRole, targetEmail);
    }
    const targetPath = getRoleDashboardPath(targetRole);
    navigate(targetPath);
  };

  // Breadcrumb generation based on route
  const getPageTitle = () => {
    if (location.pathname.includes('pi-dashboard')) return 'Lead Doctor (PI) Clinical Oversight';
    if (location.pathname.includes('safety-dashboard')) return 'Pharmacovigilance & 24h Safety Clock Desk';
    if (location.pathname.includes('coordinator-dashboard')) return 'Hospital Study Coordinator Desk';
    if (location.pathname.includes('monitor-dashboard')) return 'CRA Quality & Source Verification Desk';
    if (location.pathname.includes('admin-dashboard')) return 'Institutional Administration Desk';
    if (location.pathname.includes('study')) return 'Study Specifications & Protocol';
    if (location.pathname.includes('patients')) return 'Patient Care & Scheduled Visits';
    if (location.pathname.includes('safety')) return 'Safety Vigilance & Adverse Event Reports';
    if (location.pathname.includes('protocol')) return 'Visit Window Guardian & Protocol Rules';
    if (location.pathname.includes('quality')) return 'Data Quality & Clinical Discrepancies';
    if (location.pathname.includes('sites')) return 'Participating Hospital Network';
    if (location.pathname.includes('audit')) return 'Official Clinical Audit Trail';
    if (location.pathname.includes('export')) return 'Official Clinical Reports & Exports';
    return 'Clinical Operations';
  };

  return (
    <div className="teal-wavy-hero-bg bg-decorative-shapes" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Organic Flowing Teal Waves Graphic Layer Across All Portal Pages */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, width: '65%', height: '500px', opacity: 0.18 }} viewBox="0 0 900 600" preserveAspectRatio="none">
          <path fill="url(#app-teal-wave-grad)" d="M150 0 C400 180 350 380 900 600 L900 0 Z" />
          <defs>
            <linearGradient id="app-teal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '220px', opacity: 0.15 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#0F766E" d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L0,320Z" />
        </svg>
      </div>

      {/* 1. TOP HEADER NAVIGATION (ENTERPRISE VEEVA VAULT STANDARD) */}
      <header className="top-nav-bar" ref={navRef} style={{ position: 'relative', zIndex: 10 }}>
        <div className="top-nav-inner">
          {/* Left: Brand Identity & Active Study Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              onClick={() => navigate(myDeskPath)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)'
              }}>
                <Shield size={19} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  AIIA Vault
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Clinical Trial Operations Suite
                </div>
              </div>
            </div>

            <div className="desktop-nav-only" style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }}></div>

            {/* Nav Menu Items with Dropdowns */}
            <nav className="desktop-nav-only" style={{ alignItems: 'center', gap: '2px' }}>
              {/* My Desk (Dynamic based on logged in role) */}
              <button
                onClick={() => navigate(myDeskPath)}
                className={`nav-btn ${location.pathname.includes('-dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>My Desk</span>
              </button>

              {/* Dropdown 1: Clinical Studies */}
              <div className="nav-dropdown-wrapper">
                <button
                  onClick={() => toggleDropdown('studies')}
                  className={`nav-btn ${openDropdown === 'studies' || location.pathname.includes('/study') || location.pathname.includes('/protocol') || location.pathname.includes('/sites') ? 'active' : ''}`}
                >
                  <FolderGit2 size={15} />
                  <span>Studies & Sites</span>
                  <ChevronDown size={13} />
                </button>

                {openDropdown === 'studies' && (
                  <div className="nav-dropdown-menu">
                    <button
                      onClick={() => navigate('/app/study')}
                      className={`nav-dropdown-item ${location.pathname === '/app/study' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <FolderGit2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Active Trial Overview</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PCOS-001 protocol details</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/app/protocol')}
                      className={`nav-dropdown-item ${location.pathname === '/app/protocol' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <ShieldCheck size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Visit Window Guardian</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Protocol checkup tolerances</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/app/sites')}
                      className={`nav-dropdown-item ${location.pathname === '/app/sites' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <Building2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Hospital Trial Centers</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>8 Participating medical colleges</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Patients & Visits */}
              <button
                onClick={() => navigate('/app/patients')}
                className={`nav-btn ${location.pathname.includes('/patients') ? 'active' : ''}`}
              >
                <Users size={15} />
                <span>Patients & Visits</span>
              </button>

              {/* Dropdown 3: Safety & Adverse Events */}
              <button
                onClick={() => navigate('/app/safety')}
                className={`nav-btn ${location.pathname.includes('/safety') && !location.pathname.includes('-dashboard') ? 'active' : ''}`}
              >
                <AlertOctagon size={15} />
                <span>Safety & 24h Alerts</span>
              </button>

              {/* Dropdown 4: Data Quality & Governance */}
              <div className="nav-dropdown-wrapper">
                <button
                  onClick={() => toggleDropdown('quality')}
                  className={`nav-btn ${openDropdown === 'quality' || location.pathname.includes('/quality') || location.pathname.includes('/audit') || location.pathname.includes('/export') ? 'active' : ''}`}
                >
                  <FileCheck2 size={15} />
                  <span>Quality & Audits</span>
                  <ChevronDown size={13} />
                </button>

                {openDropdown === 'quality' && (
                  <div className="nav-dropdown-menu">
                    <button
                      onClick={() => navigate('/app/quality')}
                      className={`nav-dropdown-item ${location.pathname === '/app/quality' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <FileCheck2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Discrepancies & Queries</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Source data verification queue</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/app/audit')}
                      className={`nav-dropdown-item ${location.pathname === '/app/audit' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <FileLock2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Audit Trail</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Permanent verified clinical logs</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/app/export')}
                      className={`nav-dropdown-item ${location.pathname === '/app/export' ? 'active' : ''}`}
                    >
                      <div className="nav-item-icon">
                        <Share2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Official Clinical Reports</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Official dossiers & patient summaries</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Role Switcher, Public Link & User Profile (Desktop) */}
          <div className="desktop-nav-only" style={{ alignItems: 'center', gap: '12px' }}>
            {/* Quick Role Switcher Pill */}
            <div className="nav-dropdown-wrapper">
              <button
                onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78125rem', padding: '5px 10px' }}
              >
                <UserCheck size={13} color="var(--primary-teal)" />
                <span>Switch Role</span>
                <ChevronDown size={11} />
              </button>

              {roleSwitchOpen && (
                <div className="nav-dropdown-menu" style={{ right: 0, left: 'auto', width: '280px' }}>
                  <div style={{ padding: '8px 12px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Select Clinical Role
                  </div>
                  {allRoles.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setRoleSwitchOpen(false);
                        handleRoleSelect(r.role, r.email);
                      }}
                      className={`nav-dropdown-item ${currentRole === r.role ? 'active' : ''}`}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{r.title}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Public Website Link */}
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.78125rem' }}
            >
              <span>Public Site</span>
              <ExternalLink size={11} />
            </button>

            {/* User Profile Info */}
            <div className="nav-dropdown-wrapper">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: profileDropdownOpen ? 'var(--bg-subtle)' : 'transparent',
                  border: '1px solid',
                  borderColor: profileDropdownOpen ? 'var(--border-medium)' : 'transparent'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--light-teal)',
                  color: 'var(--primary-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  border: '1px solid #bfe8e2'
                }}>
                  {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentUser?.full_name || 'Dr. Tanuja Nesari'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {roleLabels[currentRole]?.title || currentRole}
                  </div>
                </div>

                <ChevronDown size={13} color="var(--text-muted)" />
              </div>

              {profileDropdownOpen && (
                <div className="nav-dropdown-menu" style={{ right: 0, left: 'auto', width: '240px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signed in as</div>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{currentUser?.email}</strong>
                  </div>

                  <button
                    onClick={() => { setProfileDropdownOpen(false); onLogout(); navigate('/login'); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8125rem',
                      color: 'var(--danger-rose)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-rose-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger button + current role badge */}
          <div className="mobile-nav-toggle" style={{ alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${roleLabels[currentRole]?.color || 'badge-teal'}`} style={{ fontSize: '0.6875rem', padding: '3px 8px' }}>
              {currentRole}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div style={{
            background: 'var(--bg-card)',
            borderBottom: '2px solid var(--border-medium)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            {/* User Profile Info card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--light-teal)',
                  color: 'var(--primary-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {currentUser?.full_name || 'Dr. Tanuja Nesari'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <span className={`badge ${roleLabels[currentRole]?.color || 'badge-teal'}`}>
                {currentRole}
              </span>
            </div>

            {/* Quick Role Switcher section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Switch Clinical Role
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {allRoles.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoleSelect(r.role, r.email);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid',
                      borderColor: currentRole === r.role ? 'var(--primary-teal)' : 'var(--border-subtle)',
                      background: currentRole === r.role ? 'var(--light-teal)' : 'var(--bg-card)',
                      color: currentRole === r.role ? 'var(--primary-teal)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Workspaces & Clinical Desks */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Workspaces & Desks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate(myDeskPath); }}
                  className={`nav-dropdown-item ${location.pathname.includes('-dashboard') ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} />
                  <span style={{ fontWeight: 600 }}>My Desk ({roleLabels[currentRole]?.title || currentRole})</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/study'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/study' ? 'active' : ''}`}
                >
                  <FolderGit2 size={16} />
                  <span>Active Trial Overview</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/protocol'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/protocol' ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} />
                  <span>Visit Window Guardian</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/sites'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/sites' ? 'active' : ''}`}
                >
                  <Building2 size={16} />
                  <span>Hospital Trial Centers</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/patients'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/patients' ? 'active' : ''}`}
                >
                  <Users size={16} />
                  <span>Patients & Scheduled Visits</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/safety'); }}
                  className={`nav-dropdown-item ${location.pathname.includes('/safety') && !location.pathname.includes('-dashboard') ? 'active' : ''}`}
                >
                  <AlertOctagon size={16} />
                  <span>Safety Vigilance & 24h Alerts</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/quality'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/quality' ? 'active' : ''}`}
                >
                  <FileCheck2 size={16} />
                  <span>Discrepancies & Verification</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/audit'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/audit' ? 'active' : ''}`}
                >
                  <FileLock2 size={16} />
                  <span>Permanent Audit Trail</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/app/export'); }}
                  className={`nav-dropdown-item ${location.pathname === '/app/export' ? 'active' : ''}`}
                >
                  <Share2 size={16} />
                  <span>Official Clinical Reports</span>
                </button>
              </div>
            </div>

            {/* Footer actions: Public Site & Logout */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Public Site</span>
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); navigate('/login'); }}
                className="btn btn-danger"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. SUB-BAR: ACTIVE TRIAL CONTEXT & BREADCRUMB */}
        <div className="app-sub-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Trial:</span>
            <span className="badge badge-emerald" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
              Phase III
            </span>
            <strong style={{ color: 'var(--text-primary)' }}>AIIA-PCOS-001</strong>
            <span className="desktop-nav-only" style={{ color: 'var(--text-muted)' }}>· Ayush-PCOS Kwatha & Vati vs Standard Care (320 / 500 Participants)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', flexWrap: 'wrap', minWidth: 0 }}>
            <span>Portal</span>
            <ChevronRight size={12} />
            <strong style={{ color: 'var(--primary-teal)', wordBreak: 'break-word' }}>{getPageTitle()}</strong>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER (MINIMAL, UNCLUTTERED & SPACIOUS) */}
      <main className="app-main-content">
        {children}
      </main>
    </div>
  );
};
