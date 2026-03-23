import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Save, CheckCircle2, XCircle } from 'lucide-react';
import './MarkAttendance.css';

type Student = {
  roll: string;
  name: string;
  overallAtt: string;
  isPresent: boolean;
};

export default function MarkAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/assignments/my', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMyAssignments(data);
        if (data.length > 0) {
          setActiveAssignmentId(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeAssignmentId) fetchStudents(activeAssignmentId);
  }, [activeAssignmentId]);

  const fetchStudents = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/academic/attendance/course?courseAssignmentId=${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!activeAssignmentId) return;
      setLoading(true);
      const activeName = myAssignments.find(a => a._id === activeAssignmentId)?.course?.name || 'Unknown';
      await fetch('http://localhost:5000/api/academic/attendance/mark', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({
          course: activeName,
          students
        })
      });
      alert('Attendance saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const toggleAtt = (roll: string) => {
    setStudents(prev => prev.map(s => s.roll === roll ? { ...s, isPresent: !s.isPresent } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, isPresent: true })));
  };

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const rate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 className="font-syne fw700" style={{ fontSize: '18px' }}>Mark Attendance</h2>
          <p className="text-muted text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tb-btn primary" onClick={markAllPresent} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckSquare size={16}/> Mark All Present</button>
          <button className="tb-btn" onClick={handleSave} disabled={loading || !activeAssignmentId} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Save size={16}/> {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div className="flex gap8 mb20" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
        {myAssignments.map((a) => {
          const isActive = activeAssignmentId === a._id;
          const color = a.color || 'var(--professor)';
          return (
            <div 
              key={a._id} 
              onClick={() => setActiveAssignmentId(a._id)}
              className="course-pill" 
              style={{ 
                cursor: 'pointer',
                borderColor: color, 
                color: color, 
                background: isActive ? `rgba(${parseInt(color.slice(1,3), 16) || 0}, ${parseInt(color.slice(3,5), 16) || 0}, ${parseInt(color.slice(5,7), 16) || 0}, .08)` : 'transparent' 
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
              {a.course?.name} · {a.section}
            </div>
          );
        })}
        {myAssignments.length === 0 && <div className="text-muted text-sm">No assigned courses found.</div>}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">
            {myAssignments.find(a => a._id === activeAssignmentId)?.course?.name || 'Class'} — Roster
          </span>
          <span className="text-sm text-muted">{students.length} students enrolled</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: 'var(--surface2)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <div className="font-syne fw700" style={{ fontSize: '22px', color: 'var(--student)' }}>{presentCount}</div>
            <div className="text-xs text-muted">Present</div>
          </div>
          <div style={{ flex: 1, background: 'var(--surface2)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <div className="font-syne fw700" style={{ fontSize: '22px', color: 'var(--danger)' }}>{absentCount}</div>
            <div className="text-xs text-muted">Absent</div>
          </div>
          <div style={{ flex: 1, background: 'var(--surface2)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <div className="font-syne fw700" style={{ fontSize: '22px', color: 'var(--professor)' }}>{rate}%</div>
            <div className="text-xs text-muted">Presence Rate</div>
          </div>
        </div>

        {loading ? <div style={{padding:'20px', textAlign:'center'}}>Loading roster...</div> : (
          <table className="data-table">
            <thead>
              <tr><th>Roll No.</th><th>Student Name</th><th>Overall Att.</th><th>Status</th><th>Toggle</th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.roll} className="att-mark-row">
                  <td className="text-muted">{s.roll}</td>
                  <td>{s.name}</td>
                  <td>{s.overallAtt}</td>
                  <td>
                    <span className={`badge badge-${s.isPresent ? 'green' : 'red'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {s.isPresent ? <><CheckCircle2 size={12}/> Present</> : <><XCircle size={12}/> Absent</>}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`att-toggle ${s.isPresent ? 'present' : ''}`} 
                      onClick={() => toggleAtt(s.roll)}
                    ></button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && activeAssignmentId && (
                <tr><td colSpan={5} style={{textAlign:'center', padding:'30px', color:'var(--muted)'}}>No students enrolled in this section.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
