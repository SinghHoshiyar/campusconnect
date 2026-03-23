import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './Announcements.css';

export default function Announcements() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchAnnouncements);
      return () => { socket.off('refreshData', fetchAnnouncements); };
    }
  }, [socket]);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Urgent' && a.type === 'urgent') return true;
    if (filter === 'Info' && a.type === 'info') return true;
    return false;
  });

  return (
    <div className="page-body">
      <div className="flex gap8 mb20" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`tb-btn ${filter === 'All' ? 'primary' : ''}`} onClick={() => setFilter('All')} style={{ borderRadius: '999px' }}>All</button>
        <button className={`tb-btn ${filter === 'Urgent' ? 'primary' : ''}`} onClick={() => setFilter('Urgent')}>Urgent</button>
        <button className={`tb-btn ${filter === 'Info' ? 'primary' : ''}`} onClick={() => setFilter('Info')}>Info</button>
      </div>
      <div className="flex flex-col gap12" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.map((a, i) => (
          <div 
            key={a._id || i} 
            className="alert-item" 
            style={{ 
              borderLeftColor: a.type === 'urgent' ? 'var(--danger)' : a.type === 'success' ? 'var(--student)' : a.type === 'warn' ? 'var(--warn)' : 'var(--professor)' 
            }}
          >
            <div className="alert-icon" style={{color: a.type === 'urgent' ? 'var(--danger)' : a.type === 'success' ? 'var(--student)' : a.type === 'warn' ? 'var(--warn)' : 'var(--professor)'}}>
              {a.type === 'urgent' ? <AlertCircle size={24} /> : a.type === 'warn' ? <AlertTriangle size={24} /> : a.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
            </div>
            <div className="alert-body">
              <div className="alert-title">{a.title}</div>
              <div className="alert-text">{a.message}</div>
              <div className="alert-time">{new Date(a.createdAt).toLocaleString()} by {a.author?.name || 'Admin'}</div>
            </div>
            <div>
              <span className={`badge badge-${a.badgeColor}`}>{a.type}</span>
            </div>
          </div>
        ))}
        {filteredAlerts.length === 0 && <p style={{ fontSize: '14px', color: 'var(--muted)' }}>No announcements found.</p>}
      </div>
    </div>
  );
}
