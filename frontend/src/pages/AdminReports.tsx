import React, { useState, useEffect } from 'react';
import { BarChart2, GraduationCap, Zap, Trophy, FileText, LineChart, Users, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminReports.css';

export default function AdminReports() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reports/analytics', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="flex-col items-center gap12">
        <div className="spin" style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p className="text-muted">Loading Analytics...</p>
      </div>
    </div>;
  }

  const deptAttendance = analytics?.deptAttendance || [];
  const gradeDist = analytics?.gradeDist || [];

  return (
    <div className="page-body">
      <div className="stat-grid g4 mb20">
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><BarChart2 size={20} /></div><div className="stat-val">{analytics?.avgAttendance || 0}<span>%</span></div>
          <div className="stat-lbl">Avg Campus Attendance</div>
          <div className="stat-tag tag-up">Live from Database</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><GraduationCap size={20} /></div><div className="stat-val">{analytics?.avgCGPA || '0.0'}</div>
          <div className="stat-lbl">Avg CGPA</div>
          <div className="stat-tag tag-neutral">Academic Aggregate</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--admin)' } as React.CSSProperties}>
          <div className="stat-icon"><Zap size={20} /></div><div className="stat-val">{analytics?.energy || 0}<span>kW</span></div>
          <div className="stat-lbl">Energy This Month</div>
          <div className="stat-tag tag-up">System Estimate</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><Trophy size={20} /></div><div className="stat-val">{analytics?.courseCompletion || 0}<span>%</span></div>
          <div className="stat-lbl">Course Completion</div>
          <div className="stat-tag tag-up">Graded Ratio</div>
        </div>
      </div>

      <div className="grid2 mb20">
        <div className="card">
          <div className="card-head"><span className="card-title">Attendance by Department</span></div>
          <div className="chart-bars">
            {deptAttendance.length > 0 ? deptAttendance.map((d: any, i: number) => (
              <div key={i} className="chart-bar-wrap" title={`${d.name}: ${d.val}`}>
                <div className="chart-bar-val">{d.val}</div>
                <div className="chart-bar" style={{ height: `${d.height}%`, background: `${d.color}8A` }}></div>
                <div className="chart-bar-label">{d.name}</div>
              </div>
            )) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted2)' }}>
                No attendance data recorded yet.
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Grade Distribution</span></div>
          <div className="chart-bars">
            {gradeDist.length > 0 ? gradeDist.map((g: any, i: number) => (
              <div key={i} className="chart-bar-wrap" title={`${g.name}: ${g.val}`}>
                <div className="chart-bar-val">{g.val}</div>
                <div className="chart-bar" style={{ height: `${g.height}%`, background: `${g.color}8A` }}></div>
                <div className="chart-bar-label">{g.name}</div>
              </div>
            )) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted2)' }}>
               No grades assigned yet.
             </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><span className="card-title">Quick Reports</span></div>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { Icon: FileText, title: 'Attendance Report', desc: 'Export full attendance by branch/semester' },
            { Icon: LineChart, title: 'Academic Performance', desc: 'Grade analytics & CGPA distribution' },
            { Icon: Zap, title: 'Energy Report', desc: 'Monthly usage, savings, carbon footprint' },
            { Icon: Users, title: 'Faculty Report', desc: 'Workload, class coverage, evaluations' }
          ].map((r, i) => (
            <div key={i} className="card card-hover" style={{ cursor: 'pointer', padding: '16px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--accent)' }}><r.Icon size={24} /></div>
              <div className="font-syne fw700 text-sm mb12" style={{ fontSize: '13px' }}>{r.title}</div>
              <div className="text-xs text-muted mb12">{r.desc}</div>
              <button className="tb-btn" style={{ fontSize: '11px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Download size={12}/> Export</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
