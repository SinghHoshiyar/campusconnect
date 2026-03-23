import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLogin] = useState(true); // Always true as public registration is disabled
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);
  
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow glow-1"></div>
      <div className="auth-bg-glow glow-2"></div>

      {/* Left Panel - Branding & Info */}
      <div className="auth-left">
        <Link to="/" className="auth-logo-top">
          <div className="auth-logo-mark">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.846l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.846l-7-3z" />
            </svg>
          </div>
          <span className="auth-logo-text">Campus Connect</span>
        </Link>

        <h1 className="auth-headline">
          Your Campus,
          <span>Intelligently Connected.</span>
        </h1>
        <p className="auth-sub">
          Join thousands of students and faculty members. Collaborate on projects, share resources, and stay updated with campus life.
        </p>

        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="feature-dot">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>University Verified</h4>
              <p>Exclusive access for students with valid .edu emails.</p>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="feature-dot">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Join Communities</h4>
              <p>Find study groups, clubs, and interest-based hubs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Card */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>Welcome Back</h2>
            <p>Enter your details to access your dashboard</p>
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">UNIVERSITY EMAIL / ROLL NO</label>
              <div className="form-input-wrap">
                <span className="form-icon"><Mail size={18} strokeWidth={2.5}/></span>
                <input 
                  className="form-input" 
                  type="text" 
                  placeholder="name@university.edu or Roll No" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <div className="form-input-wrap">
                <span className="form-icon"><Lock size={18} strokeWidth={2.5}/></span>
                <input 
                  className="form-input" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Sign In'} <span>→</span>
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface2)', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 700 }}>IDENTITY NOTE</div>
            <div>
              Academic accounts are institutionally managed. Access is restricted to registered students and faculty members only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
