import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Book, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import './Attendance.css';

export default function Attendance() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [ringOffset, setRingOffset] = useState(345);
  const [logData, setLogData] = useState<any[]>([]);
  const [overallRate, setOverallRate] = useState(0);

  useEffect(() => {
    // Animate ring on mount
    const timer = setTimeout(() => setRingOffset(44), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchStudentAttendance();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchStudentAttendance);
      return () => { socket.off('refreshData', fetchStudentAttendance); };
    }
  }, [socket]);

  const fetchStudentAttendance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/academic/attendance/student', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      
      let totAttended = 0;
      let totClass = 0;
      const arrData = Array.isArray(data) ? data : [];
      
      const mappedLog = arrData.map((d: any) => {
        totAttended += d.attended;
        totClass += d.total;
        
        let color = '#00e5a0';
        if (d.status === 'warn') color = '#ffc947';
        if (d.status === 'danger') color = '#ff6b6b';
        
        return [
          d.course, 
          String(d.attended), 
          String(d.total), 
          d.total > 0 ? `${Math.round((d.attended/d.total)*100)}%` : '0%', 
          d.status,
          d.canMiss,
          color
        ];
      });

      setLogData(mappedLog);
      
      if (totClass > 0) {
        setOverallRate(Math.round((totAttended / totClass) * 100));
        setRingOffset(((100 - (totAttended / totClass) * 100) / 100) * 283); // 283 is approx circumference
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-body">
      <div className="grid2 mb20">
        <div className="card card-hover">
          <div className="card-head">
            <span className="card-title">Overall Productivity</span>
            <span className="text-xs text-muted uppercase tracking-wider">Attendance Matrix</span>
          </div>
          <div className="att-ring-wrap">
            <div className="ring-container">
              <svg viewBox="0 0 110 110">
                <circle className="ring-bg" cx="55" cy="55" r="45" />
                <circle className="ring-fill" cx="55" cy="55" r="45" style={{ strokeDashoffset: ringOffset, stroke: 'var(--accent)' }} />
              </svg>
              <div className="ring-inner">
                <div className="ring-pct" style={{ color: 'var(--text)' }}>{overallRate}%</div>
                <div className="ring-lbl" style={{ color: 'var(--muted2)' }}>Presence</div>
              </div>
            </div>
            <div className="flex flex-col gap-3" style={{ flex: 1 }}>
              {logData.slice(0, 3).map(([n, a, t, p, s, m, c]) => (
                <div key={n}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="fw600">{n}</span>
                    <span style={{ color: c }}>{p}</span>
                  </div>
                  <div className="prog-wrap" style={{ height: '4px' }}>
                    <div className="prog-fill" style={{ width: p, background: c }}></div>
                  </div>
                </div>
              ))}
              {logData.length === 0 && <p className="text-xs text-muted">Awaiting semester synchronization...</p>}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Operation Summary</span></div>
          <div className="stat-grid g2">
            <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
              <div className="stat-icon"><Book size={20} /></div>
              <div className="stat-val">{overallRate}%</div>
              <div className="stat-lbl">Campus Average</div>
            </div>
            <div className="stat-card" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
              <div className="stat-icon"><AlertTriangle size={20} /></div>
              <div className="stat-val">{logData.filter(x=>x[4]==='warn').length}</div>
              <div className="stat-lbl">Critical Risks</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><span className="card-title">Detailed Log</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Course</th><th>Attended</th><th>Total</th><th>%</th><th>Status</th><th>Can Miss</th>
            </tr>
          </thead>
          <tbody>
            {logData.map(([c, a, t, p, s, m]) => (
              <tr key={c}>
                <td style={{ fontWeight: 500 }}>{c}</td>
                <td>{a}</td>
                <td>{t}</td>
                <td>{p}</td>
                <td>
                  <span className={`badge badge-${s === 'warn' ? 'warn' : 'green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {s === 'warn' ? <><AlertCircle size={12} /> Low</> : <><CheckCircle size={12} /> OK</>}
                  </span>
                </td>
                <td className="text-muted text-sm">{m}</td>
              </tr>
            ))}
            {logData.length === 0 && <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>No class data logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
