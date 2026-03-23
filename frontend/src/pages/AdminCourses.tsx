import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserCheck, Plus, Users, GraduationCap, Building, Edit2, Trash2, X } from 'lucide-react';

export default function AdminCourses() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'courses' | 'assign'>('courses');

  // ── Courses state ──
  const [courses, setCourses] = useState<any[]>([]);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', credits: 3, semester: 1, department: 'CSE', capacity: 60 });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Assignment state ──
  const [professors, setProfessors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({ 
    courseId: '', professorId: '', section: 'A', department: 'CSE', semester: 1,
    schedules: [{ day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' }], 
    color: '#5b8dff' 
  });
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);

  // ── Filters state ──
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSem, setCourseSem] = useState('all');
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSem, setAssignSem] = useState('all');

  useEffect(() => {
    if (user?.token) {
      fetchCourses();
      fetchProfessors();
      fetchAssignments();
    }
  }, [user]);

  const addScheduleSlot = () => {
    setAssignForm({
      ...assignForm,
      schedules: [...assignForm.schedules, { day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' }]
    });
  };

  const updateScheduleSlot = (index: number, field: string, value: string) => {
    const newSchedules = [...assignForm.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setAssignForm({ ...assignForm, schedules: newSchedules });
  };

  const removeScheduleSlot = (index: number) => {
    if (assignForm.schedules.length > 1) {
      setAssignForm({
        ...assignForm,
        schedules: assignForm.schedules.filter((_, i) => i !== index)
      });
    }
  };

  const api = async (path: string, opts?: any) => {
    const r = await fetch(`http://localhost:5000/api/courses${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}`, ...opts?.headers }
    });
    if (r.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return r;
  };

  const fetchCourses = async () => {
    try { 
      setLoading(true);
      const r = await api('/'); 
      const d = await r.json(); 
      if (r.ok) setCourses(d); 
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };
  const fetchProfessors = async () => {
    try { 
      const r = await api('/professors'); 
      const d = await r.json(); 
      if (r.ok) setProfessors(d); 
    } catch (e) { console.error(e); }
  };
  const fetchAssignments = async () => {
    try { 
      const r = await api('/assignments'); 
      const d = await r.json(); 
      if (r.ok) setAssignments(d); 
    } catch (e) { console.error(e); }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(courseSearch.toLowerCase()) || 
                         c.code?.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesSem = courseSem === 'all' || c.semester === parseInt(courseSem);
    return matchesSearch && matchesSem;
  });

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.course?.name?.toLowerCase().includes(assignSearch.toLowerCase()) || 
                         a.course?.code?.toLowerCase().includes(assignSearch.toLowerCase()) ||
                         a.professor?.name?.toLowerCase().includes(assignSearch.toLowerCase());
    const matchesSem = assignSem === 'all' || a.course?.semester === parseInt(assignSem);
    return matchesSearch && matchesSem;
  });

  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingCourseId ? 'PUT' : 'POST';
      const url = editingCourseId ? `/${editingCourseId}` : '/';
      const r = await api(url, { method, body: JSON.stringify(courseForm) });
      if (r.ok) {
        setShowCourseForm(false);
        setEditingCourseId(null);
        setCourseForm({ name: '', code: '', credits: 3, semester: 1, department: 'CSE', capacity: 60 });
        fetchCourses();
      } else {
        const d = await r.json();
        alert(d.message || 'Failed');
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure? This will fail if there are active assignments.')) return;
    try {
      const r = await api(`/${id}`, { method: 'DELETE' });
      if (r.ok) fetchCourses(); else { const d = await r.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const handleEditCourse = (c: any) => {
    setCourseForm({ name: c.name, code: c.code, credits: c.credits, semester: c.semester, department: c.department, capacity: c.capacity });
    setEditingCourseId(c._id);
    setShowCourseForm(true);
  };

  const handleAssignOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingAssignId ? 'PUT' : 'POST';
      const url = editingAssignId ? `/assignments/${editingAssignId}` : '/assignments';
      const r = await api(url, { method, body: JSON.stringify(assignForm) });
      if (r.ok) {
        setShowAssignForm(false);
        setEditingAssignId(null);
        setAssignForm({ 
          courseId: '', professorId: '', section: 'A', department: 'CSE', semester: 1,
          schedules: [{ day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' }], 
          color: '#5b8dff' 
        });
        fetchAssignments();
      } else {
        const d = await r.json();
        alert(d.message || 'Failed');
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Are you sure? This will fail if students are enrolled.')) return;
    try {
      const r = await api(`/assignments/${id}`, { method: 'DELETE' });
      if (r.ok) fetchAssignments(); else { const d = await r.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const handleEditAssignment = (a: any) => {
    setAssignForm({ 
      courseId: a.course?._id, 
      professorId: a.professor?._id, 
      section: a.section, 
      department: a.department || 'CSE',
      semester: a.semester || 1,
      schedules: a.schedules.length ? a.schedules : [{ day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' }], 
      color: a.color || '#5b8dff' 
    });
    setEditingAssignId(a._id);
    setShowAssignForm(true);
  };

  return (
    <div className="page-body">
      <h2 style={{ marginBottom: '20px' }}>Course Management</h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--surface2)', borderRadius: '10px', padding: '4px' }}>
        <button className={`tb-btn${tab === 'courses' ? ' primary' : ''}`} style={{ flex: 1 }} onClick={() => { setTab('courses'); setShowCourseForm(false); setEditingCourseId(null); }}>Courses</button>
        <button className={`tb-btn${tab === 'assign' ? ' primary' : ''}`} style={{ flex: 1 }} onClick={() => { setTab('assign'); setShowAssignForm(false); setEditingAssignId(null); }}>Assign Professors</button>
      </div>

      {/* ══════════ TAB 1: Courses ══════════ */}
      {tab === 'courses' && (
        <>
          <div className="card mb20" style={{ padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <input className="form-input" placeholder="Search course by name or code..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)} />
              <select className="form-input" value={courseSem} onChange={e => setCourseSem(e.target.value)}>
                <option value="all">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="text-muted text-sm">{filteredCourses.length} courses filtered</div>
            <button className="tb-btn primary" onClick={() => { setShowCourseForm(!showCourseForm); setEditingCourseId(null); setCourseForm({ name: '', code: '', credits: 3, semester: 1, department: 'CSE', capacity: 60 }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Create Course
            </button>
          </div>

          {showCourseForm && (
            <div className="card mb20" style={{ border: '1px solid var(--accent)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>{editingCourseId ? 'Edit Course' : 'New Course'}</h3>
              <form onSubmit={handleCreateOrUpdateCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Course Name</label>
                  <input className="form-input" required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Data Structures" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Code</label>
                  <input className="form-input" required value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="CS201" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Credits</label>
                  <input className="form-input" type="number" min={1} max={6} value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Semester</label>
                  <input className="form-input" type="number" min={1} max={8} value={courseForm.semester} onChange={e => setCourseForm({ ...courseForm, semester: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Department</label>
                  <select className="form-input" value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })}>
                    <option value="AI">AI</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="Food tech">Food tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Capacity</label>
                  <input className="form-input" type="number" min={1} value={courseForm.capacity} onChange={e => setCourseForm({ ...courseForm, capacity: +e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button type="button" className="tb-btn" onClick={() => { setShowCourseForm(false); setEditingCourseId(null); }}>Cancel</button>
                  <button type="submit" className="tb-btn" disabled={loading} style={{ background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' }}>{editingCourseId ? 'Update Course' : 'Create Course'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Credits</th><th>Sem</th><th>Dept</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>{c.semester}</td>
                    <td><span className="badge badge-blue">{c.department}</span></td>
                    <td>
                      <div className="flex gap8">
                        <button className="tb-btn" onClick={() => handleEditCourse(c)} style={{ padding: '6px' }}><Edit2 size={14}/></button>
                        <button className="tb-btn" onClick={() => handleDeleteCourse(c._id)} style={{ padding: '6px', color: 'var(--warn)' }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>No courses found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════ TAB 2: Assign Professors ══════════ */}
      {tab === 'assign' && (
        <>
          <div className="card mb20" style={{ padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <input className="form-input" placeholder="Search by professor, course or code..." value={assignSearch} onChange={e => setAssignSearch(e.target.value)} />
              <select className="form-input" value={assignSem} onChange={e => setAssignSem(e.target.value)}>
                <option value="all">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="text-muted text-sm">{filteredAssignments.length} assignments filtered</div>
            <button className="tb-btn primary" onClick={() => { setShowAssignForm(!showAssignForm); setEditingAssignId(null); setAssignForm({ courseId: '', professorId: '', section: 'A', schedules: [{ day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' }], color: '#5b8dff' }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} /> Assign Professor
            </button>
          </div>
          
          {showAssignForm && (
            <div className="card mb20" style={{ border: '1px solid var(--accent)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>{editingAssignId ? 'Edit Assignment' : 'New Assignment'}</h3>
              <form onSubmit={handleAssignOrUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Course</label>
                  <select className="form-input" required value={assignForm.courseId} onChange={e => setAssignForm({ ...assignForm, courseId: e.target.value })}>
                    <option value="">Select Course...</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Professor</label>
                  <select className="form-input" required value={assignForm.professorId} onChange={e => setAssignForm({ ...assignForm, professorId: e.target.value })}>
                    <option value="">Select Professor...</option>
                    {professors.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Target Department</label>
                  <select className="form-input" required value={assignForm.department} onChange={e => setAssignForm({ ...assignForm, department: e.target.value })}>
                    <option value="AI">AI</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="Food tech">Food tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Target Semester</label>
                  <input className="form-input" type="number" min={1} max={8} required value={assignForm.semester} onChange={e => setAssignForm({ ...assignForm, semester: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Section</label>
                  <input className="form-input" required value={assignForm.section} onChange={e => setAssignForm({ ...assignForm, section: e.target.value })} placeholder="A" />
                </div>

                <div style={{ gridColumn: 'span 3' }}>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '8px' }}>Weekly Schedule</label>
                  {assignForm.schedules.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 40px', gap: '8px', marginBottom: '8px' }}>
                      <select className="form-input" value={s.day} onChange={e => updateScheduleSlot(i, 'day', e.target.value)}>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d}>{d}</option>)}
                      </select>
                      <input className="form-input" type="time" value={s.startTime} onChange={e => updateScheduleSlot(i, 'startTime', e.target.value)} />
                      <input className="form-input" type="time" value={s.endTime} onChange={e => updateScheduleSlot(i, 'endTime', e.target.value)} />
                      <input className="form-input" placeholder="Room" value={s.room} onChange={e => updateScheduleSlot(i, 'room', e.target.value)} />
                      <button type="button" className="tb-btn" onClick={() => removeScheduleSlot(i)} style={{ color: 'var(--warn)' }}><X size={14}/></button>
                    </div>
                  ))}
                  <button type="button" className="tb-btn text-xs" onClick={addScheduleSlot} style={{ marginTop: '4px' }}>+ Add Slot</button>
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button type="button" className="tb-btn" onClick={() => { setShowAssignForm(false); setEditingAssignId(null); }}>Cancel</button>
                  <button type="submit" className="tb-btn" disabled={loading} style={{ background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' }}>{editingAssignId ? 'Update Assignment' : 'Assign'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <table className="data-table">
              <thead>
                <tr><th>Course</th><th>Professor</th><th>Section</th><th>Schedule</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredAssignments.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.course?.code} — {a.course?.name}</td>
                    <td>{a.professor?.name}</td>
                    <td>{a.section}</td>
                    <td>
                      <div className="flex flex-column gap4">
                        {a.schedules && a.schedules.map((s: any, i: number) => (
                          <div key={i} className="text-xs text-muted" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="fw700 color-accent">{s.day}</span>
                            <span>{s.startTime} - {s.endTime}</span>
                            {s.room && <span className="badge badge-blue" style={{ fontSize: '9px' }}>{s.room}</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap8">
                        <button className="tb-btn" onClick={() => handleEditAssignment(a)} style={{ padding: '6px' }}><Edit2 size={14}/></button>
                        <button className="tb-btn" onClick={() => handleDeleteAssignment(a._id)} style={{ padding: '6px', color: 'var(--warn)' }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssignments.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>No assignments found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
