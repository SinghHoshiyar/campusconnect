import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Clock, MapPin, CheckCircle, BookOpen, XCircle } from 'lucide-react';

export default function AvailableCourses() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOfferings();
    fetchMyEnrollments();
  }, []);

  const api = (path: string, opts?: any) =>
    fetch(`http://localhost:5000/api/courses${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}`, ...opts?.headers }
    });

  const fetchOfferings = async () => {
    try { const r = await api('/assignments'); const d = await r.json(); if (r.ok) setOfferings(d); } catch (e) { console.error(e); }
  };
  const fetchMyEnrollments = async () => {
    try { const r = await api('/enrollments/my'); const d = await r.json(); if (r.ok) setMyEnrollments(d); } catch (e) { console.error(e); }
  };

  const isEnrolled = (assignmentId: string) => {
    return myEnrollments.some((e: any) => e.courseAssignment?._id === assignmentId);
  };

  const handleEnroll = async (id: string) => {
    setLoading(true);
    try {
      const r = await api(`/assignments/${id}/enroll`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        fetchOfferings();
        fetchMyEnrollments();
      } else {
        alert(d.message || 'Failed to enroll');
      }
    } catch (e) { console.error(e); alert('Network error'); } finally { setLoading(false); }
  };

  const handleDrop = async (id: string) => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    setLoading(true);
    try {
      const r = await api(`/assignments/${id}/drop`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        fetchOfferings();
        fetchMyEnrollments();
      } else {
        alert(d.message || 'Failed to drop');
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-syne fw700" style={{ fontSize: '18px' }}>Course Registration</h2>
        <p className="text-muted text-sm">Browse available course offerings and register for your semester.</p>
      </div>

      {/* My enrolled summary */}
      {myEnrollments.length > 0 && (
        <div className="card mb20" style={{ border: '1px solid var(--student)' }}>
          <div className="font-syne fw700" style={{ fontSize: '14px', marginBottom: '10px' }}>My Enrolled Courses ({myEnrollments.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {myEnrollments.map((e: any) => (
              <span key={e._id} className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                <CheckCircle size={12} />
                {e.courseAssignment?.course?.code} — {e.courseAssignment?.course?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid2">
        {offerings.map((o) => {
          const enrolled = isEnrolled(o._id);
          return (
            <div key={o._id} className="card card-hover" style={{ borderLeft: `3px solid ${o.color || '#5b8dff'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div className="font-syne fw700" style={{ fontSize: '16px' }}>{o.course?.name}</div>
                  <div className="text-xs text-muted">{o.course?.code} · {o.course?.credits} credits · Sem {o.course?.semester}</div>
                </div>
                {enrolled && <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Enrolled</span>}
                {o.isFull && !enrolled && <span className="badge badge-warn">Full</span>}
              </div>

              <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '12px 0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} className="text-muted" /> {o.professor?.name || 'TBA'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} className="text-muted" /> {o.scheduleStr || 'TBD'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} className="text-muted" /> {o.room || 'TBD'} · Section {o.section}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} className="text-muted" /> {o.enrolledCount}/{o.course?.capacity} seats</div>
              </div>

              {enrolled ? (
                <button className="tb-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDrop(o._id)} disabled={loading}>
                  <XCircle size={14} /> Drop Course
                </button>
              ) : (
                <button
                  className="tb-btn"
                  style={{ width: '100%', background: o.isFull ? 'var(--surface2)' : 'var(--accent)', color: o.isFull ? 'var(--muted)' : 'var(--bg)', borderColor: o.isFull ? 'var(--border)' : 'var(--accent)' }}
                  onClick={() => handleEnroll(o._id)}
                  disabled={o.isFull || loading}
                >
                  {o.isFull ? 'Course Full' : loading ? 'Processing...' : 'Enroll'}
                </button>
              )}
            </div>
          );
        })}
        {offerings.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface2)', borderRadius: '12px' }}>
            No course offerings are currently available. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
