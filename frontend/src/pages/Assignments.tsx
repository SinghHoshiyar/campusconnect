import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Flame, Clock, CheckCircle, Trophy, PartyPopper } from 'lucide-react';

export default function Assignments() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/academic/assignments', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAssignments([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchAssignments);
      return () => { socket.off('refreshData', fetchAssignments); };
    }
  }, [socket]);

  const handleSubmit = async (id: string) => {
    try {
      setLoading(true);
      await fetch(`http://localhost:5000/api/academic/assignments/${id}/submit`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingAssignments = assignments.filter(a => a.status !== 'Submitted' && a.status !== 'Graded');
  const recentGrades = assignments.filter(a => (a.status === 'Submitted' || a.status === 'Graded') && a.grade);

  return (
    <div className="page-body">
      <div className="stat-grid g4 mb20">
        <div className="stat-card" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
          <div className="stat-icon"><Flame size={20} /></div><div className="stat-val">{pendingAssignments.length}</div><div className="stat-lbl">Due This Week</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><Clock size={20} /></div><div className="stat-val">{pendingAssignments.filter(a=>a.status==='In Progress').length}</div><div className="stat-lbl">In Progress</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><CheckCircle size={20} /></div><div className="stat-val">{assignments.filter(a=>a.status === 'Submitted').length}</div><div className="stat-lbl">Submitted</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><Trophy size={20} /></div><div className="stat-val">8.3</div><div className="stat-lbl">Avg Score</div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-head"><span className="card-title">Pending Assignments</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Assignment</th><th>Course</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingAssignments.map((a, i) => (
              <tr key={a._id || i}>
                <td style={{ fontWeight: 500 }}>{a.title}</td>
                <td>{a.course}</td>
                <td style={{ color: new Date(a.dueDate) < new Date() ? 'var(--danger)' : '' }}>{new Date(a.dueDate).toLocaleDateString()}</td>
                <td><span className={`badge badge-${a.priority.includes('High')?'red':a.priority.includes('Medium')?'warn':'blue'}`}>{a.priority}</span></td>
                <td><span className={`badge badge-${a.status==='In Progress'?'warn':'gray'}`}>{a.status}</span></td>
                <td>
                  <button 
                    className="tb-btn" 
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleSubmit(a._id)}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
            {pendingAssignments.length === 0 && <tr><td colSpan={6} style={{textAlign:'center', padding:'20px', color:'var(--muted)'}}><div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}><PartyPopper size={18}/> No pending assignments!</div></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-head"><span className="card-title">Recent Grades</span></div>
        <table className="data-table">
          <thead>
            <tr><th>Assignment</th><th>Course</th><th>Submitted</th><th>Score</th><th>Grade</th></tr>
          </thead>
          <tbody>
            {recentGrades.map((g, i) => (
              <tr key={g._id || i}>
                <td style={{ fontWeight: 500 }}>{g.title}</td>
                <td>{g.course}</td>
                <td className="text-muted text-sm">{new Date(g.submittedDate).toLocaleDateString()}</td>
                <td>{g.score}</td>
                <td><span className="badge badge-green">{g.grade}</span></td>
              </tr>
            ))}
            {recentGrades.length === 0 && <tr><td colSpan={5} style={{textAlign:'center', padding:'20px', color:'var(--muted)'}}>No graded assignments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
