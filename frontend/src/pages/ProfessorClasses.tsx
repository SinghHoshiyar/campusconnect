import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BookOpen, Users, ClipboardCheck, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProfessorClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [classes, setClasses] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGlobalLookup, setShowGlobalLookup] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  const fetchMyClasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/assignments/my', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchMyClasses);
      return () => { socket.off('refreshData', fetchMyClasses); };
    }
  }, [socket]);

  const handleGlobalSearch = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users?role=student&q=${lookupQuery}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Since api/users returns all, we filter here for simplicity unless we add a backend search
        const filtered = data.filter((u: any) => 
          u.role === 'student' && (
            u.name?.toLowerCase().includes(lookupQuery.toLowerCase()) || 
            u.rollNo?.toLowerCase().includes(lookupQuery.toLowerCase())
          )
        );
        setLookupResults(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLookupLoading(false);
    }
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>My Classes</h2>
        <button 
          className={`tb-btn ${showGlobalLookup ? 'primary' : ''}`} 
          onClick={() => setShowGlobalLookup(!showGlobalLookup)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
        >
          <Users size={16} /> {showGlobalLookup ? 'Hide Global Lookup' : 'Global Student Lookup'}
        </button>
      </div>

      {showGlobalLookup && (
        <div className="card mb20" style={{ border: '1px solid var(--accent)', background: 'var(--surface2)' }}>
          <div className="font-syne mb12" style={{ fontSize: '14px' }}>University Student Directory (Cross-Semester)</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="form-input" 
              placeholder="Search by Name or Roll No..." 
              value={lookupQuery}
              onChange={e => setLookupQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
            />
            <button className="tb-btn primary" onClick={handleGlobalSearch} disabled={lookupLoading}>
              {lookupLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {lookupResults.length > 0 && (
            <div style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lookupResults.map(r => (
                <div key={r._id} className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.name}</div>
                    <div className="text-xs text-muted">{r.rollNo} · Sem {r.semester} · {r.department}</div>
                  </div>
                  <div className="text-xs font-mono">{r.email}</div>
                </div>
              ))}
            </div>
          )}
          {lookupResults.length === 0 && lookupQuery && !lookupLoading && (
            <div className="text-xs text-muted mt12">No results found for "{lookupQuery}"</div>
          )}
        </div>
      )}

      {/* Rest of the component */}
      <div className="stat-grid g4 mb20">
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><BookOpen size={20} /></div>
          <div className="stat-val">{classes.length}</div>
          <div className="stat-lbl">Assigned Courses</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-val">{totalStudents}</div>
          <div className="stat-lbl">Total Students</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><ClipboardCheck size={20} /></div>
          <div className="stat-val">{classes.length > 0 ? classes.length : 0}</div>
          <div className="stat-lbl">Active Sections</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
          <div className="stat-icon"><Clock size={20} /></div>
          <div className="stat-val">{classes.filter(c => c.scheduleStr).length}</div>
          <div className="stat-lbl">Scheduled</div>
        </div>
      </div>

      <div className="grid2">
        {classes.map((c) => (
          <div key={c._id} className="card card-hover">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color || '#5b8dff', marginTop: '4px', flexShrink: 0 }}></div>
              <span className="badge badge-green" style={{ fontSize: '10px' }}>Section {c.section}</span>
            </div>
            <div className="font-syne fw700" style={{ fontSize: '16px', marginBottom: '3px' }}>{c.course?.name}</div>
            <div className="text-xs text-muted mb12">{c.course?.code} · {c.enrolledCount} students · {c.course?.credits} credits</div>
            <div className="text-sm text-muted mb12" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {c.room || 'TBD'}, {c.scheduleStr || 'TBD'}</div>

            <div className="prog-wrap mb12">
              <div className="prog-fill" style={{ width: `${c.course?.capacity ? (c.enrolledCount / c.course.capacity) * 100 : 0}%`, background: c.color || '#5b8dff' }}></div>
            </div>
            <div className="text-xs text-muted mb12">{c.enrolledCount}/{c.course?.capacity || '60'} seats filled</div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="tb-btn" style={{ flex: 1, fontSize: '11px' }} onClick={() => navigate('/app/mark_att')}>Mark Att.</button>
              <button className="tb-btn" style={{ flex: 1, fontSize: '11px' }} onClick={() => navigate('/app/grades')}>Grades</button>
            </div>

            {/* Enrolled students expandable */}
            <button
              className="tb-btn"
              style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '11px' }}
              onClick={() => setExpanded(expanded === c._id ? null : c._id)}
            >
              <Users size={12} /> {expanded === c._id ? 'Hide' : 'View'} Students
              {expanded === c._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {expanded === c._id && (
              <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div className="mb12">
                  <input 
                    className="form-input" 
                    placeholder="Search students in this class..." 
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                {c.enrolledStudents && c.enrolledStudents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {c.enrolledStudents
                      .filter((s: any) => 
                        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((s: any) => (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                            {s.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                            <div className="text-xs text-muted">{s.rollNo}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-muted">{s.email}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted" style={{ textAlign: 'center', padding: '12px' }}>No students enrolled yet.</div>
                )}
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface2)', borderRadius: '12px' }}>
            No courses have been assigned to you yet. Contact administration.
          </div>
        )}
      </div>
    </div>
  );
}
