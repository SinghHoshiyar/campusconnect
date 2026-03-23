import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, Plus, Send, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function ProfessorAssignments() {
  const { user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    dueDate: '',
    priority: '📘 Low'
  });

  const [createdAssignments, setCreatedAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchMyAssignments();
    fetchAssignmentsGrouped();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/assignments/my', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMyAssignments(data);
        if (data.length > 0) setSelectedCourseId(data[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchAssignmentsGrouped = async () => {
    try {
      // Query assignments where 'course' matches professor's assigned courses
      const res = await fetch('http://localhost:5000/api/academic/assignments', { 
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        // Group by title and course
        const groupedMap: any = {};
        data.forEach((a: any) => {
          const key = `${a.course}-${a.title}`;
          if (!groupedMap[key]) {
            groupedMap[key] = { ...a, count: 0, submitted: 0 };
          }
          groupedMap[key].count++;
          if (a.status !== 'Not Started') groupedMap[key].submitted++;
        });
        setCreatedAssignments(Object.values(groupedMap));
      }
    } catch (err) { console.error(err); }
  };

  const fetchSubmissions = async (course: string, title: string) => {
    try {
      setSubLoading(true);
      const res = await fetch(`http://localhost:5000/api/academic/assignments/submissions?courseName=${encodeURIComponent(course)}&title=${encodeURIComponent(title)}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setSubmissions(data);
    } catch (err) { console.error(err); }
    finally { setSubLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newAssignment.title || !newAssignment.dueDate) return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/academic/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          courseAssignmentId: selectedCourseId,
          ...newAssignment
        })
      });
      if (res.ok) {
        alert('Assignment uploaded successfully');
        setNewAssignment({ title: '', dueDate: '', priority: '📘 Low' });
        fetchAssignmentsGrouped();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/academic/assignments/${gradingId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(gradeForm)
      });
      if (res.ok) {
        alert('Grade submitted');
        setGradingId(null);
        if (selectedAssignment) fetchSubmissions(selectedAssignment.course, selectedAssignment.title);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-syne fw700" style={{ fontSize: '18px' }}>Assignment & Grading</h2>
        <p className="text-muted text-sm">Upload materials and review student submissions in real-time</p>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-head"><span className="card-title">Upload New Assignment</span></div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Target Section</label>
              <select className="tb-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                {myAssignments.map(a => <option key={a._id} value={a._id}>{a.course?.name} — {a.section}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="text-xs fw600 mb4 block">Task Title</label>
              <input className="tb-input" placeholder="e.g., Assignment 1: React Hooks" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} required />
            </div>
            <div className="grid2">
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">Deadline</label>
                <input type="date" className="tb-input" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">Priority</label>
                <select className="tb-input" value={newAssignment.priority} onChange={e => setNewAssignment({...newAssignment, priority: e.target.value})}>
                  <option>📘 Low</option><option>⚡ Medium</option><option>🔥 High</option>
                </select>
              </div>
            </div>
            <button className="tb-btn primary" disabled={loading} style={{ marginTop: '10px' }}><Plus size={18} /> {loading ? 'Processing...' : 'Deploy to Students'}</button>
          </form>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Recent Creations</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {createdAssignments.map((a: any, i: number) => (
              <div 
                key={i} 
                className={`assignment-strip ${selectedAssignment?.title === a.title ? 'active' : ''}`}
                onClick={() => { setSelectedAssignment(a); fetchSubmissions(a.course, a.title); }}
                style={{ 
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '12px',
                  background: selectedAssignment?.title === a.title ? 'var(--surface2)' : 'transparent',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '8px', background: 'var(--professor-light)', borderRadius: '8px', color: 'var(--professor)' }}>
                  <BookOpen size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-sm fw600">{a.title}</div>
                  <div className="text-xs text-muted">{a.course} · {a.submitted}/{a.count} Submissions</div>
                </div>
                <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface3)' }}>
                  {a.priority}
                </div>
              </div>
            ))}
            {createdAssignments.length === 0 && <div className="text-muted text-sm" style={{padding:'20px', textAlign:'center'}}>No assignments created yet.</div>}
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-head">
            <span className="card-title">Submissions: {selectedAssignment.title}</span>
            <button className="tb-btn text-xs" onClick={() => setSelectedAssignment(null)}>Close</button>
          </div>
          {subLoading ? <div style={{padding:'20px', textAlign:'center'}}>Loading submissions...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Status</th><th>Submitted On</th><th>Grade</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {submissions.map(s => (
                    <tr key={s._id}>
                      <td><div className="fw600">{s.student?.name}</div><div className="text-xs text-muted">{s.student?.email}</div></td>
                      <td><span className={`badge badge-${s.status === 'Submitted' ? 'blue' : s.status === 'Graded' ? 'green' : 'gray'}`}>{s.status}</span></td>
                      <td className="text-sm text-muted">{s.submittedDate ? new Date(s.submittedDate).toLocaleString() : '—'}</td>
                      <td className="fw700">{s.grade || '—'}</td>
                      <td>
                        <button className="tb-btn text-xs" style={{padding:'4px 8px'}} onClick={() => { setGradingId(s._id); setGradeForm({ grade: s.grade || '', feedback: s.feedback || '' }); }}>Review</button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {gradingId && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setGradingId(null)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20}/></button>
            <h3 className="font-syne fw700 mb16" style={{fontSize: '20px'}}>Grade Submission</h3>
            <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">Assign Grade (e.g., A+, 95/100)</label>
                <input className="tb-input" value={gradeForm.grade} onChange={e => setGradeForm({...gradeForm, grade: e.target.value})} required placeholder="Enter grade..." />
              </div>
              <div className="form-group">
                <label className="text-xs fw600 mb4 block">Feedback</label>
                <textarea className="tb-input" style={{ height: '80px', padding: '10px' }} value={gradeForm.feedback} onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} placeholder="Write comments for the student..." />
              </div>
              <div className="flex gap8" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button type="submit" className="tb-btn primary flex1" style={{flex: 1}}>Submit Grade</button>
                <button type="button" className="tb-btn flex1" style={{flex: 1}} onClick={() => setGradingId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
