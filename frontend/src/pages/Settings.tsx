import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        // Update local auth state with new data (keeping token)
        login({ ...data, token: user?.token });
        setMsg({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="font-syne fw700" style={{ fontSize: '20px' }}>Account Settings</h2>
        <p className="text-muted text-sm">Manage your profile information and security preferences</p>
      </div>

      {msg.text && (
        <div 
          className={`flex items-center gap8 mb20 p12 br12 text-sm ${msg.type === 'success' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}
          style={{ background: msg.type === 'success' ? 'rgba(0, 229, 160, 0.1)' : 'rgba(255, 71, 87, 0.1)', color: msg.type === 'success' ? 'var(--student)' : 'var(--danger)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
        >
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <div className="card-head">
            <User size={18} className="text-professor" style={{ marginRight: '8px' }} />
            <span className="card-title">Profile Information</span>
          </div>
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
                <input 
                  className="tb-input" 
                  style={{ paddingLeft: '36px' }} 
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
                <input 
                  className="tb-input" 
                  style={{ paddingLeft: '36px' }} 
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <button className="tb-btn primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-head">
            <Lock size={18} className="text-warn" style={{ marginRight: '8px' }} />
            <span className="card-title">Security & Password</span>
          </div>
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Current Password</label>
              <input 
                className="tb-input" 
                type="password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">New Password</label>
              <input 
                className="tb-input" 
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Confirm New Password</label>
              <input 
                className="tb-input" 
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
                placeholder="••••••••"
              />
            </div>
            <button className="tb-btn" style={{ borderColor: 'var(--warn)', color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              <Lock size={16} /> {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {user?.role === 'admin' && (
         <div className="card" style={{ marginTop: '20px', borderColor: 'var(--danger-light)' }}>
            <div className="card-head"><span className="card-title text-danger">Advanced Admin Controls</span></div>
            <div className="text-sm text-muted mb16">These actions are irreversible. Please proceed with caution.</div>
            <div className="flex gap8" style={{ display: 'flex', gap: '8px' }}>
              <button className="tb-btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '11px' }}>Purge System Logs</button>
              <button className="tb-btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '11px' }}>Reset Semester Data</button>
            </div>
         </div>
      )}
    </div>
  );
}
