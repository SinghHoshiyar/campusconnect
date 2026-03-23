import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Library, 
  CalendarCheck, 
  FileText, 
  BarChart3, 
  Zap, 
  Globe, 
  Shield, 
  Cpu
} from 'lucide-react';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolePaths = [
    { title: 'Students', desc: 'Securely manage your courses, track attendance, and submit assignments.', icon: <GraduationCap size={32} />, color: '#00e5a0', path: '/app/dashboard' },
    { title: 'Professors', desc: 'Deliver lecture resources, automate attendance, and grade submissions.', icon: <Users size={32} />, color: '#5b8dff', path: '/app/dashboard' },
    { title: 'Administrators', desc: 'Oversee campus operations, manage faculty, and generate vital reports.', icon: <ShieldCheck size={32} />, color: '#ff6b6b', path: '/app/dashboard' }
  ];

  const features = [
    { label: 'Real-time Sync', icon: <Zap size={18} />, desc: 'Instant socket updates across all user dashboards.' },
    { label: 'Global Access', icon: <Globe size={18} />, desc: 'Cloud-integrated digital library for anywhere learning.' },
    { label: 'Built-in Security', icon: <Shield size={18} />, desc: 'Role-based access control with session protection.' },
    { label: 'AI Powered', icon: <Cpu size={18} />, desc: 'Smart academic assistant for student guidance.' }
  ];

  const modules = [
    { label: 'Digital Library', icon: <Library size={20} />, path: '/app/library' },
    { label: 'Attendance Hub', icon: <CalendarCheck size={20} />, path: '/app/attendance' },
    { label: 'Assignment Pipeline', icon: <FileText size={20} />, path: '/app/assignments' },
    { label: 'Grades & Reports', icon: <BarChart3 size={20} />, path: '/app/grades' }
  ];

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-content">
          <Link to="/" className="home-logo">
            <div className="logo-square">
              <GraduationCap size={20} color="#000" />
            </div>
            <span className="logo-text">Campus Connect</span>
          </Link>
          <div className="nav-links">
            <a href="#features" className="hidden-sm">Ecosystem</a>
            <a href="#modules" className="hidden-sm">Modules</a>
            {user ? (
              <button onClick={() => navigate('/app/dashboard')} className="btn-started flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-login">Log In</Link>
                <Link to="/login" className="btn-started">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="home-hero" style={{ background: 'linear-gradient(135deg, #0f1219, #1a2233)' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-tag">NEXT-GEN CAMPUS ERP</div>
          <h1 className="hero-title">
            The Future of <br /> <span style={{ color: 'var(--home-teal)' }}>Academic Management</span>
          </h1>
          <p className="hero-subtitle">
            An ultra-professional, real-time ecosystem designed for high-performance students, distinguished professors, and elite administrators.
          </p>
          <div className="hero-btns">
            <Link to={user ? "/app/dashboard" : "/login"} className="btn-hero-primary">
              {user ? 'Open Dashboard' : 'Explore Platform'}
            </Link>
            <a href="#features" className="btn-hero-outline">View Capabilities</a>
          </div>
        </div>
      </header>

      {/* Role Section */}
      <section className="home-section" id="roles">
        <div className="section-head">
          <h2>Select Your Pathway</h2>
          <p>Each interface is precision-engineered to meet your specific academic and operational needs.</p>
        </div>
        <div className="grid-roles">
          {rolePaths.map((role, i) => (
            <Link key={i} to={user ? role.path : '/login'} className="role-card">
              <div className="role-icon" style={{ background: `${role.color}20`, color: role.color }}>
                {role.icon}
              </div>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
              <div className="role-link">
                Access Gateway <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="home-section" id="features" style={{ background: 'rgba(255,255,255,0.02)', padding: '100px 0' }}>
        <div className="max-w-1200 mx-auto px-24">
          <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {features.map((f, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div style={{ color: 'var(--home-teal)', marginBottom: '12px' }}>{f.icon}</div>
                <h4 className="fw700 text-lg">{f.label}</h4>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Listing */}
      <section className="home-section" id="modules">
        <div className="section-head">
          <h2>Core Modules</h2>
          <p>One unified database. Infinite connectivity across all departments.</p>
        </div>
        <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {modules.map((m, i) => (
            <Link key={i} to={user ? m.path : '/login'} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
              <div style={{ color: 'var(--home-teal)' }}>{m.icon}</div>
              <span className="fw600" style={{ color: 'var(--text)' }}>{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-section" style={{ textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--home-blue), var(--home-teal))', padding: '80px 40px', borderRadius: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '16px' }}>Ready to Synchronize?</h2>
            <p className="mb-8 opacity-80" style={{ maxWidth: '600px', margin: '0 auto 32px' }}>Experience the industrial-grade performance of Campus Connect. Sign in with your institutional credentials to get started.</p>
            <Link to="/login" className="btn-hero-primary" style={{ padding: '16px 48px' }}>Launch Hub</Link>
          </div>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        </div>
      </section>

      {/* Industrial Footer */}
      <footer className="home-section" style={{ paddingBottom: '40px' }}>
        <div className="footer-grid">
          <div className="footer-col" style={{ paddingRight: '40px' }}>
            <Link to="/" className="home-logo" style={{ marginBottom: '24px' }}>
              <div className="logo-square"><GraduationCap size={18} color="#000" /></div>
              <span className="logo-text">Campus Connect</span>
            </Link>
            <p className="text-sm text-muted">A premium Academic Resource Planning (ERP) platform designed for the next generation of digital universities.</p>
          </div>
          <div className="footer-col">
            <h4>Academics</h4>
            <ul>
              <li><Link to={user ? "/app/library" : "/login"}>Digital Library</Link></li>
              <li><Link to={user ? "/app/courses" : "/login"}>Registration</Link></li>
              <li><Link to={user ? "/app/schedule" : "/login"}>School Schedule</Link></li>
              <li><Link to={user ? "/app/grades" : "/login"}>Results Hub</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Operations</h4>
            <ul>
              <li><Link to={user ? "/app/attendance" : "/login"}>Attendance Tracker</Link></li>
              <li><Link to={user ? "/app/mark_att" : "/login"}>Faculty Portal</Link></li>
              <li><Link to={user ? "/app/course-management" : "/login"}>Curriculum Management</Link></li>
              <li><Link to={user ? "/app/users" : "/login"}>User Directory</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to={user ? "/app/map" : "/login"}>Campus Map</Link></li>
              <li><Link to={user ? "/app/announcements" : "/login"}>Notice Board</Link></li>
              <li><Link to={user ? "/app/settings" : "/login"}>Security Center</Link></li>
              <li><Link to={user ? "/app/chat" : "/login"}>AI Concierge</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Institutional</h4>
            <div style={{ background: 'var(--glass)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div className="text-xs fw700 mb8 opacity-50 uppercase">Server Status</div>
              <div className="flex items-center gap2 text-sm">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 10px #00e5a0' }}></div>
                <span className="fw600 ms-1">Operations Normal</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', fontSize: '12px', color: 'var(--muted)' }}>
          <p>© 2026 Campus Connect ERP. Industrial Grade Academic Infrastructure.</p>
          <div className="flex gap-4">
            <a href="#">Privacy Engine</a>
            <a href="#">Security Protocol</a>
            <a href="#">SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
