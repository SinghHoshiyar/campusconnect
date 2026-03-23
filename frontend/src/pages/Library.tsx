import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Book, 
  FileText, 
  Code, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit2,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  X
} from 'lucide-react';

export default function Library() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Notes',
    fileUrl: '',
    course: ''
  });

  const categories = ['All', 'Notes', 'Book', 'Research', 'Paper', 'Code'];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/resources?category=${filter}&course=${search}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filter, user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchResources);
      return () => { socket.off('refreshData', fetchResources); };
    }
  }, [socket]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/resources/${editingId}`
        : 'http://localhost:5000/api/resources';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowUpload(false);
        setEditingId(null);
        setForm({ title: '', description: '', category: 'Notes', fileUrl: '', course: '' });
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (r: any) => {
    setForm({
      title: r.title,
      description: r.description || '',
      category: r.category,
      fileUrl: r.fileUrl,
      course: r.course || ''
    });
    setEditingId(r._id);
    setShowUpload(true);
  };

  const getIcon = (cat: string) => {
    switch(cat) {
      case 'Book': return <Book size={20} />;
      case 'Code': return <Code size={20} />;
      case 'Research': return <Lightbulb size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 className="font-syne fw700" style={{ fontSize: '22px' }}>Digital Library</h2>
          <p className="text-muted text-sm">Access and share academic resources across the campus</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'professor') && (
          <button className="tb-btn primary" onClick={() => { setShowUpload(true); setEditingId(null); setForm({ title: '', description: '', category: 'Notes', fileUrl: '', course: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Upload Material
          </button>
        )}
      </div>

      <div className="flex gap16 mb24" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
          <input 
            className="tb-input" 
            placeholder="Search by course or title..." 
            style={{ paddingLeft: '36px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchResources()}
          />
        </div>
        <div className="flex gap8" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(c => (
            <button 
              key={c} 
              className={`tb-btn ${filter === c ? 'primary' : ''}`}
              style={{ fontSize: '12px', borderRadius: '99px', whiteSpace: 'nowrap' }}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading resources...</div> : (
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {resources.map((r, i) => (
            <div key={r._id || i} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ padding: '10px', background: 'var(--surface3)', borderRadius: '12px', color: 'var(--home-teal)' }}>
                  {getIcon(r.category)}
                </div>
                <div className={`badge badge-${r.category === 'Code' ? 'blue' : r.category === 'Research' ? 'warn' : 'green'}`} style={{ fontSize: '10px' }}>
                  {r.category}
                </div>
              </div>
              <div>
                <h4 className="fw700 mb4" style={{ fontSize: '15px' }}>{r.title}</h4>
                <p className="text-xs text-muted line-clamp2">{r.description || 'No description provided.'}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="text-xs">
                  <span className="fw600">{r.course || 'General'}</span>
                  <div className="text-muted">by {r.uploadedBy?.name}</div>
                </div>
                <div className="flex gap4">
                  <a href={r.fileUrl} target="_blank" rel="noreferrer" className="tb-btn" style={{ padding: '6px' }} title="View Resource"><ExternalLink size={14}/></a>
                  {(user?.role === 'admin' || r.uploadedBy?._id === user?._id) && (
                    <>
                      <button onClick={() => startEdit(r)} className="tb-btn" style={{ padding: '6px' }} title="Edit"><Edit2 size={14}/></button>
                      <button onClick={() => handleDelete(r._id)} className="tb-btn" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete"><Trash2 size={14}/></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {resources.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px' }}>
              <div style={{ marginBottom: '16px', opacity: 0.3 }}><FileText size={48} style={{ margin: '0 auto' }} /></div>
              <h3 className="fw700">No resources found</h3>
              <p className="text-sm text-muted">Try a different category or search term.</p>
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '450px', padding: '24px', position: 'relative' }}>
            <button onClick={() => { setShowUpload(false); setEditingId(null); }} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20}/></button>
            <h3 className="font-syne fw700 mb16" style={{ fontSize: '20px' }}>{editingId ? 'Edit Resource' : 'Upload New Resource'}</h3>
            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">RESOURCE TITLE</label>
                <input className="tb-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g., Intro to Machine Learning Notes" />
              </div>
              <div className="grid2">
                <div className="form-group">
                  <label className="text-xs fw600 mb4 block">CATEGORY</label>
                  <select className="tb-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-xs fw600 mb4 block">COURSE / CODE</label>
                  <input className="tb-input" value={form.course} onChange={e => setForm({...form, course: e.target.value})} placeholder="e.g., CS101" />
                </div>
              </div>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">FILE URL / LINK</label>
                <input className="tb-input" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} required placeholder="https://drive.google.com/..." />
              </div>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">DESCRIPTION</label>
                <textarea className="tb-input" style={{ height: '80px', padding: '12px' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Briefly describe the contents..." />
              </div>
              <button type="submit" className="tb-btn primary br12" style={{ padding: '12px', marginTop: '8px' }}>
                {editingId ? 'Update Resource' : 'Complete Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
