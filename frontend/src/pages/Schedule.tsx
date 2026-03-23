import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import './Schedule.css';

export default function Schedule() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const timeSlots = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/schedule', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('refreshData', fetchSchedule);
      return () => { socket.off('refreshData', fetchSchedule); };
    }
  }, [socket]);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 className="font-syne fw700" style={{ fontSize: '18px' }}>Weekly Schedule</h2>
          <p className="text-muted text-sm" style={{ marginTop: '3px' }}>Semester {user?.semester || '?'} — {user?.department || 'General'} Branch</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tb-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Previous Week"><ChevronLeft size={16}/> Prev</button>
          <button className="tb-btn fw700" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Current Week</button>
          <button className="tb-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Next Week">Next <ChevronRight size={16}/></button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="week-grid">
          <div className="wg-head" style={{ background: 'var(--surface2)' }}>
            <span className="text-xs text-muted">TIME</span>
          </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                    <Clock size={10} /> {cls.startTime} - {cls.endTime}
                  </div>
                  {cls.room && <div className="sb-room" style={{ fontSize: '10px', marginTop: '2px' }}>{cls.room}</div>}
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
