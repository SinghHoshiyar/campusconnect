import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ChevronLeft, ChevronRight, Bell, CheckCircle, Trash2, BookOpen, Users, Clock, ClipboardCheck, ArrowRight, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Schedule.css';

export default function Dashboard() {
  const { currentRole, user } = useAuth();
  const { notifications, markAsRead, clearNotifications, unreadCount } = useSocket();
  
  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Universal Notifications Panel */}
      <div className="card">
        <div className="card-head">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} /> Notifications
            {unreadCount > 0 && <span className="nav-badge" style={{ position: 'static' }}>{unreadCount} new</span>}
          </span>
          {notifications.length > 0 && (
            <button className="tb-btn" onClick={clearNotifications} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <Trash2 size={14}/> Clear All
            </button>
          )}
        </div>
        
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.slice(0, 5).map(n => (
              <div key={n._id} className="card" style={{ 
                padding: '12px', 
                background: n.read ? 'var(--bg)' : 'var(--surface2)', 
                borderLeft: n.read ? '2px solid transparent' : '2px solid var(--accent)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div>
                  <div className="fw700" style={{ fontSize: '14px', marginBottom: '2px' }}>{n.title}</div>
                  <div className="text-xs text-muted">{n.text}</div>
                </div>
                <div className="flex gap8 items-center">
                  {n.link && (
                    <Link to={n.link} className="tb-btn" style={{ fontSize: '11px', padding: '4px 8px' }}>View</Link>
                  )}
                  {!n.read && (
                    <button className="tb-btn" onClick={() => markAsRead(n._id)} title="Mark as Read" style={{ padding: '4px' }}>
                      <CheckCircle size={14} color="var(--student)"/>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length > 5 && <div className="text-muted text-center text-sm" style={{marginTop: '10px'}}>+ {notifications.length - 5} older notifications</div>}
          </div>
        ) : (
          <div className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>You're all caught up! No recent notifications.</div>
        )}
      </div>

      {!currentRole && (
        <div className="card text-center" style={{ padding: '40px' }}>
          <h3>Initializing session...</h3>
          <p className="text-muted">If this takes too long, please <button onClick={() => window.location.assign('/login')} className="card-action" style={{ background: 'none', border: 'none', padding: 0 }}>Log Out</button> and Log In again.</p>
        </div>
      )}

      {currentRole === 'student' && user && <StudentDashboard user={user} />}
      {currentRole === 'professor' && user && <ProfessorDashboard user={user} />}
      {currentRole === 'admin' && user && <AdminDashboard user={user} />}
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  const { socket } = useSocket();
  const timeSlots = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'];
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/schedule', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    if (user?.token) fetchSchedule();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchSchedule);
      return () => { socket.off('refreshData', fetchSchedule); };
    }
  }, [socket]);

  return (
    <div className="student-accent view active" style={{ padding: 0 }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
        <div>
          <h2 className="font-syne fw700" style={{fontSize:'18px'}}>Weekly Schedule</h2>
          <p className="text-muted text-sm" style={{marginTop:'3px'}}>Semester {user?.semester || '?'} — {user?.department || 'General'} Branch</p>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button className="tb-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Previous Week"><ChevronLeft size={16}/> Prev</button>
          <button className="tb-btn fw700" style={{borderColor:'var(--accent)', color:'var(--accent)'}}>Current Week</button>
          <button className="tb-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Next Week">Next <ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="week-grid">
          <div className="wg-head" style={{background:'var(--surface2)'}}><span className="text-xs text-muted">TIME</span></div>
          {scheduleData.length > 0 ? scheduleData.map((d, i) => (
            <div key={d._id || i} className={`wg-head ${d.isToday ? 'today' : ''}`}>
              {d.day}<strong>{d.date}</strong>
            </div>
          )) : (
            <>
              {(() => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                const today = new Date();
                const distanceToMonday = today.getDay() === 0 ? -6 : 1 - today.getDay();
                const monday = new Date(today);
                monday.setDate(today.getDate() + distanceToMonday);
                return days.map((day, i) => {
                  const d = new Date(monday);
                  d.setDate(monday.getDate() + i);
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <div key={day} className={`wg-head ${isToday ? 'today' : ''}`}>
                      {day}<strong>{d.getDate().toString().padStart(2, '0')}</strong>
                    </div>
                  );
                });
              })()}
            </>
          )}
          
          <div className="wg-time">
            {timeSlots.map(t => (
              <div key={t} className="wg-slot">{t}</div>
            ))}
          </div>
          
          {scheduleData.length > 0 ? scheduleData.map((d, i) => (
            <div key={d._id || i} className="wg-day">
              {d.classes.map((cls: any, j: number) => (
                <div 
                  key={cls._id || j} 
                  className="sched-block" 
                  style={{ 
                    top: `${cls.top}px`, 
                    height: `${cls.height}px`, 
                    background: `rgba(${parseInt(cls.color.slice(1,3), 16)}, ${parseInt(cls.color.slice(3,5), 16)}, ${parseInt(cls.color.slice(5,7), 16)}, .18)`,
                    borderLeft: `3px solid ${cls.color}`,
                    color: cls.color
                  }}
                >
                  <div className="sb-name">{cls.name}</div>
                  {cls.room && <div className="sb-room">{cls.room}</div>}
                </div>
              ))}
            </div>
          )) : (
            <div style={{gridColumn: '2 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)'}}>No schedule found for this week.</div>
          )}
        </div>
      </div>
    </div>
  );
}
function ProfessorDashboard({ user }: { user: any }) {
  const { socket } = useSocket();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/assignments/my', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchClasses();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchClasses);
      return () => { socket.off('refreshData', fetchClasses); };
    }
  }, [socket]);

  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="stat-grid g4">
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><BookOpen size={20} /></div>
          <div className="stat-val">{classes.length}</div>
          <div className="stat-lbl">My Classes</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-val">{totalStudents}</div>
          <div className="stat-lbl">Enrolled Students</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><ClipboardCheck size={20} /></div>
          <div className="stat-val">{classes.length}</div>
          <div className="stat-lbl">Active Sections</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
          <div className="stat-icon"><Clock size={20} /></div>
          <div className="stat-val">{classes.filter(c => c.scheduleStr).length}</div>
          <div className="stat-lbl">Scheduled Today</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Class Overview</span>
          <Link to="/app/my_classes" className="tb-btn" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Manage All <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {classes.slice(0, 3).map(c => (
            <div key={c._id} className="card card-hover" style={{ 
              padding: '16px', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: `4px solid ${c.color || 'var(--professor)'}`
            }}>
              <div>
                <div className="fw700" style={{ fontSize: '16px' }}>{c.course?.name}</div>
                <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                  {c.course?.code} · Section {c.section} · {c.scheduleStr || 'No schedule'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="fw700 text-sm">{c.enrolledCount} Students</div>
                <div className="prog-wrap" style={{ width: '80px', marginTop: '6px', height: '4px' }}>
                  <div className="prog-fill" style={{ 
                    width: `${c.course?.capacity ? (c.enrolledCount / c.course.capacity) * 100 : 0}%`, 
                    background: c.color || 'var(--professor)' 
                  }}></div>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
              No classes assigned yet. Administration will assign your courses soon.
            </div>
          )}
          {classes.length > 3 && (
            <div className="text-muted text-center text-sm">And {classes.length - 3} more classes...</div>
          )}
        </div>
      </div>
    </div>
  );
}
function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ users: 0, courses: 0, students: 0, faculty: 0 });
  const [loading, setLoading] = useState(true);
  const [academicStats, setAcademicStats] = useState<{ batches: string[], departments: string[] }>({ batches: [], departments: [] });
  const [promotionForm, setPromotionForm] = useState({ batch: '', department: '' });
  const [promoting, setPromoting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', { 
        headers: { Authorization: `Bearer ${user?.token}` } 
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchAcademic = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/academic-stats', { 
        headers: { Authorization: `Bearer ${user?.token}` } 
      });
      const data = await res.json();
      if (res.ok) {
        setAcademicStats(data);
        if (data.batches.length > 0) setPromotionForm(prev => ({ ...prev, batch: data.batches[0] }));
        if (data.departments.length > 0) setPromotionForm(prev => ({ ...prev, department: data.departments[0] }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user?.token) {
      fetchStats();
      fetchAcademic();
    }
  }, [user]);

  const handlePromote = async () => {
    if (!promotionForm.batch || !promotionForm.department) return alert('Select Batch and Department');
    if (!window.confirm(`Are you sure you want to promote ALL active students in ${promotionForm.department} (${promotionForm.batch}) to their next semester?`)) return;

    setPromoting(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/promote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify(promotionForm)
      });
      const data = await res.json();
      alert(data.message);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <div>Loading admin operations...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="stat-grid g4">
        <div className="stat-card" style={{ '--c': 'var(--admin)' } as React.CSSProperties}>
          <div className="stat-icon"><Shield size={20} /></div>
          <div className="stat-val">{stats.users}</div>
          <div className="stat-lbl">Total Users</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-val">{stats.students}</div>
          <div className="stat-lbl">Students</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><BookOpen size={20} /></div>
          <div className="stat-val">{stats.courses}</div>
          <div className="stat-lbl">Courses</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><Zap size={20} /></div>
          <div className="stat-val">{stats.faculty}</div>
          <div className="stat-lbl">Faculty Members</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Institutional Management</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link to="/app/course-management" className="card card-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                <BookOpen size={24} color="var(--accent)" />
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Manage Courses</div>
              </Link>
              <Link to="/app/users" className="card card-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                <Users size={24} color="var(--student)" />
                <div style={{ fontWeight: 600, fontSize: '14px' }}>User Management</div>
              </Link>
            </div>

            <div className="card" style={{ background: 'var(--surface2)', padding: '16px', border: '1px solid var(--accent-low)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={14} color="var(--accent)" /> ACADEMIC PROGRESSION (BATCH PROMOTION)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Select Batch</label>
                  <select className="form-input" style={{ fontSize: '12px' }} value={promotionForm.batch} onChange={e => setPromotionForm({ ...promotionForm, batch: e.target.value })}>
                    {academicStats.batches.map(b => <option key={b}>{b}</option>)}
                    {academicStats.batches.length === 0 && <option>No Batches</option>}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Select Department</label>
                  <select className="form-input" style={{ fontSize: '12px' }} value={promotionForm.department} onChange={e => setPromotionForm({ ...promotionForm, department: e.target.value })}>
                    {academicStats.departments.map(d => <option key={d}>{d}</option>)}
                    {academicStats.departments.length === 0 && <option>No Departments</option>}
                  </select>
                </div>
              </div>
              <button 
                className="tb-btn primary" 
                onClick={handlePromote} 
                disabled={promoting || academicStats.batches.length === 0}
                style={{ width: '100%', fontSize: '12px', padding: '8px' }}
              >
                {promoting ? 'Promoting...' : 'Promote to Next Semester →'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Campus Health</span>
          </div>
          <div className="text-muted text-sm" style={{ padding: '10px 0' }}>
            Identity Management: <strong>Closed Institutional Control</strong>. <br/>
            Public registration is disabled. All user records are institutionally verified.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <span className="badge badge-green">● DB Status: Online</span>
            <span className="badge badge-green">● API: 12ms</span>
          </div>
          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--muted)' }}>
            <strong>System Version:</strong> Campus-ERP v2.4 (Enterprise Edition)
          </div>
        </div>
      </div>
    </div>
  );
}
