import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, AlertTriangle, AlertCircle, CheckCircle, Info, Trash2, Send, Edit2, X } from 'lucide-react';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // info, urgent, success, warn
  const [priorityLabel, setPriorityLabel] = useState('Info');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    }
  };

  const handlePublish = async () => {
    if (!title || !message) return alert('Title and message are required.');
    
    let badgeColor = 'blue';
    let icon = 'Info';
    if (type === 'urgent') { badgeColor = 'red'; icon = 'AlertCircle'; }
    if (type === 'warn') { badgeColor = 'warn'; icon = 'AlertTriangle'; }
    if (type === 'success') { badgeColor = 'green'; icon = 'CheckCircle'; }

    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/announcements/${editingId}`
        : 'http://localhost:5000/api/announcements';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ title, message, type, badgeColor, icon })
      });
      
      if (res.ok) {
        setTitle('');
        setMessage('');
        setType('info');
        setEditingId(null);
        fetchAnnouncements();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to publish announcement');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (p: any) => {
    setTitle(p.title);
    setMessage(p.message);
    setType(p.type || 'info');
    setEditingId(p._id);
  };

  const cancelEdit = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setEditingId(null);
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="font-syne fw700" style={{ fontSize: '18px' }}>Announcements Management</div>
      </div>

      <div className="grid2">
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">{editingId ? 'Edit Announcement' : 'Create Announcement'}</span>
            {editingId && <button onClick={cancelEdit} className="tb-btn" style={{ padding: '4px' }}><X size={16}/></button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>TITLE</label>
              <input 
                className="form-input" 
                placeholder="Announcement title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>PRIORITY</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Urgent', color: 'red', val: 'urgent', Icon: AlertCircle },
                  { label: 'Warning', color: 'warn', val: 'warn', Icon: AlertTriangle },
                  { label: 'Info', color: 'blue', val: 'info', Icon: Info },
                  { label: 'Success', color: 'green', val: 'success', Icon: CheckCircle }
                ].map((p, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setType(p.val); setPriorityLabel(p.label); }}
                    className={`badge badge-${type === p.val ? p.color : 'gray'}`} 
                    style={{ cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <p.Icon size={14} /> {p.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>MESSAGE</label>
              <textarea 
                className="form-input" 
                rows={4} 
                placeholder="Write your announcement here..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <button 
              className="tb-btn primary" 
              style={{ borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handlePublish}
              disabled={loading}
            >
              <Send size={16} /> {loading ? 'Processing...' : (editingId ? 'Update Announcement' : 'Publish Announcement')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Published</span><span className="text-sm text-muted">Recent</span></div>
          <div className="flex flex-col gap12" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((p, i) => (
              <div 
                key={p._id || i} 
                className="alert-item" 
                style={{ 
                  borderLeftColor: p.type === 'urgent' ? 'var(--danger)' : p.type === 'success' ? 'var(--student)' : p.type === 'warn' ? 'var(--warn)' : 'var(--professor)' 
                }}
              >
                <div className="alert-icon" style={{color: p.type === 'urgent' ? 'var(--danger)' : p.role === 'admin' ? 'var(--warn)' : p.type === 'success' ? 'var(--student)' : p.type === 'warn' ? 'var(--warn)' : 'var(--professor)'}}>
                  {p.type === 'urgent' ? <AlertCircle size={24} /> : p.type === 'warn' ? <AlertTriangle size={24} /> : p.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
                </div>
                <div className="alert-body">
                  <div className="alert-title">{p.title}</div>
                  <div className="alert-text">{p.message}</div>
                  <div className="alert-time">{new Date(p.createdAt).toLocaleDateString()} by {p.author?.name || 'Admin'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button onClick={() => startEdit(p)} className="tb-btn" style={{ fontSize: '10px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={12}/> Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="tb-btn" style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={12}/> Delete</button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p style={{ fontSize: '13px', color: 'var(--muted2)' }}>No announcements yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
