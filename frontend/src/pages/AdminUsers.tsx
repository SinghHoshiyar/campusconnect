import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ClipboardList, Building, UserX, Edit2, Trash2, X, UserPlus } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [isGrouped, setIsGrouped] = useState(false);
  
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'student',
    rollNo: '', uniRegNo: '', employeeId: '', department: 'CSE', semester: 1, section: 'A', batch: '2023-2027'
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSem = filterSemester === 'all' || u.semester === parseInt(filterSemester);
    const matchesDept = filterDept === 'all' || u.department === filterDept;
    return matchesSearch && matchesRole && matchesSem && matchesDept;
  });

  // Grouping Logic: Semester > Dept > Section
  const getGroupedData = () => {
    const groups: any = {};
    filteredUsers.filter(u => u.role === 'student').forEach(s => {
      const sem = s.semester || 'Unassigned';
      const dept = s.department || 'General';
      const sec = s.section || 'N/A';
      
      if (!groups[sem]) groups[sem] = {};
      if (!groups[sem][dept]) groups[sem][dept] = {};
      if (!groups[sem][dept][sec]) groups[sem][dept][sec] = [];
      
      groups[sem][dept][sec].push(s);
    });
    return groups;
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingUserId ? 'PUT' : 'POST';
      const url = editingUserId 
        ? `http://localhost:5000/api/users/${editingUserId}`
        : `http://localhost:5000/api/auth/register`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(userForm)
      });

      if (res.ok) {
        setShowUserForm(false);
        setEditingUserId(null);
        resetForm();
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserForm({
      name: '', email: '', password: '', role: 'student',
      rollNo: '', uniRegNo: '', employeeId: '', department: 'CSE', semester: 1, section: 'A', batch: '2023-2027'
    });
  };

  const handleDelete = async (id: string) => {
    if (id === user?._id) return alert("You cannot delete yourself!");
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) fetchUsers();
      else {
        const d = await res.json();
        alert(d.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (u: any) => {
    setUserForm({
      name: u.name, email: u.email, password: '', role: u.role,
      rollNo: u.rollNo || '', uniRegNo: u.uniRegNo || '', employeeId: u.employeeId || '', 
      department: u.department || 'CSE', semester: u.semester || 1, section: u.section || 'A', batch: u.batch || ''
    });
    setEditingUserId(u._id);
    setShowUserForm(true);
  };

  const studentsCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'professor').length;
  const staffCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="font-syne fw700" style={{ fontSize: '18px' }}>User Management</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`tb-btn ${isGrouped ? 'primary' : ''}`} onClick={() => setIsGrouped(!isGrouped)} style={{ fontSize: '12px' }}>
            {isGrouped ? 'List View' : 'Group by Semester'}
          </button>
          <button className="tb-btn primary" onClick={() => { setShowUserForm(!showUserForm); setEditingUserId(null); resetForm(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} /> {showUserForm ? 'Cancel' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb20" style={{ padding: '15px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Search Name / Roll No / Email</label>
            <input className="form-input" style={{ fontSize: '13px' }} placeholder="Filter users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Role</label>
            <select className="form-input" style={{ fontSize: '13px' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="professor">Professors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Semester</label>
            <select className="form-input" style={{ fontSize: '13px' }} value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="all">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Dept.</label>
                <select className="form-input" style={{ fontSize: '13px' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="all">All Depts</option>
                  <option value="AI">AI</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="Food tech">Food tech</option>
                </select>
          </div>
        </div>
      </div>

      {showUserForm && (
        <div className="card mb20" style={{ border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px' }}>{editingUserId ? 'Edit User' : 'Register New User'}</h3>
            <button className="tb-btn" onClick={() => { setShowUserForm(false); setEditingUserId(null); }} style={{ padding: '4px' }}><X size={16}/></button>
          </div>
          
          <form onSubmit={handleCreateOrUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input className="form-input" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>User Role</label>
              <select className="form-input" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input className="form-input" type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="john@university.edu" />
            </div>
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Password {editingUserId && '(Blank = Keep)'}</label>
              <input className="form-input" type="password" required={!editingUserId} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', gridColumn: 'span 3', margin: '10px 0' }}></div>

            {userForm.role === 'student' && (
              <>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Roll Number</label>
                  <input className="form-input" value={userForm.rollNo} onChange={e => setUserForm({ ...userForm, rollNo: e.target.value })} placeholder="2023CSE001" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Uni. Reg. No</label>
                  <input className="form-input" value={userForm.uniRegNo} onChange={e => setUserForm({ ...userForm, uniRegNo: e.target.value })} placeholder="REG-12345" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Batch</label>
                  <input className="form-input" value={userForm.batch} onChange={e => setUserForm({ ...userForm, batch: e.target.value })} placeholder="2023-2027" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Department</label>
                  <select className="form-input" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })}>
                    <option value="AI">AI</option><option value="CSE">CSE</option><option value="ECE">ECE</option><option value="Food tech">Food tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Semester</label>
                  <input className="form-input" type="number" value={userForm.semester} onChange={e => setUserForm({ ...userForm, semester: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Section</label>
                  <input className="form-input" value={userForm.section} onChange={e => setUserForm({ ...userForm, section: e.target.value })} placeholder="A" />
                </div>
              </>
            )}

            {userForm.role === 'professor' && (
              <>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Employee ID</label>
                  <input className="form-input" value={userForm.employeeId} onChange={e => setUserForm({ ...userForm, employeeId: e.target.value })} placeholder="EMP-101" />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px' }}>Department</label>
                  <select className="form-input" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })}>
                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="ME">ME</option><option value="CE">CE</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="tb-btn primary" disabled={loading} style={{ padding: '8px 24px' }}>
                {loading ? 'Processing...' : (editingUserId ? 'Update User' : 'Register Academic Record')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="stat-grid g4 mb20">
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-icon"><GraduationCap size={20} /></div><div className="stat-val">{studentsCount}</div>
          <div className="stat-lbl">Students</div><div className="stat-tag tag-up">Active DB</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-icon"><ClipboardList size={20} /></div><div className="stat-val">{facultyCount}</div>
          <div className="stat-lbl">Faculty</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--admin)' } as React.CSSProperties}>
          <div className="stat-icon"><Building size={20} /></div><div className="stat-val">{staffCount}</div>
          <div className="stat-lbl">Staff</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-icon"><UserX size={20} /></div><div className="stat-val">0</div>
          <div className="stat-lbl">Inactive Accounts</div>
        </div>
      </div>
      
      {!isGrouped ? (
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Role</th><th>Sem</th><th>Courses</th><th>Roll/Emp ID</th><th>Email</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u._id || i}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'warn' : u.role === 'professor' ? 'green' : 'blue'}`} style={{ fontSize: '10px' }}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm fw700">{u.role === 'student' ? u.semester : '-'}</td>
                    <td>
                      <div className="courses-scroll-cell">
                        {u.enrolledCourses && u.enrolledCourses.length > 0 ? (
                          u.enrolledCourses.map((c: string, ci: number) => (
                            <span key={ci} className="tag-course">{c}</span>
                          ))
                        ) : (
                          <span className="text-xs text-muted">No courses</span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{u.rollNo || u.employeeId || '-'}</td>
                    <td className="text-sm text-muted">{u.email}</td>
                    <td className="text-sm text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap8" style={{ justifyContent: 'flex-end' }}>
                        <button className="tb-btn" onClick={() => startEdit(u)} style={{ padding: '6px' }}><Edit2 size={14}/></button>
                        {u._id !== user?._id && (
                          <button className="tb-btn" onClick={() => handleDelete(u._id)} style={{ padding: '6px', color: 'var(--warn)' }}><Trash2 size={14}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>No users found matching your criteria.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(getGroupedData()).sort((a: any, b: any) => a[0] - b[0]).map(([sem, depts]: [string, any]) => (
            <div key={sem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, var(--accent), transparent)' }}></div>
                <h3 className="font-syne" style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)' }}>
                  Semester {sem}
                </h3>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, var(--accent), transparent)' }}></div>
              </div>

              {Object.entries(depts).map(([dept, sections]: [string, any]) => (
                <div key={dept} style={{ marginBottom: '16px', marginLeft: '10px' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', borderLeft: '3px solid var(--accent)', paddingLeft: '8px' }}>
                    Department of {dept}
                  </h4>

                  {Object.entries(sections).map(([sec, students]: [string, any]) => (
                    <div key={sec} className="card" style={{ marginBottom: '10px', padding: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>Section {sec}</span>
                        <span className="text-xs text-muted">{students.length} Students</span>
                      </div>
                      <div className="data-table-container">
                        <table className="data-table small">
                          <thead>
                            <tr>
                              <th>Roll No</th><th>Name</th><th>Courses</th><th>Email</th><th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.sort((a: any, b: any) => a.rollNo?.localeCompare(b.rollNo)).map((s: any) => (
                              <tr key={s._id}>
                                <td className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{s.rollNo}</td>
                                <td style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</td>
                                <td>
                                  <div className="courses-scroll-cell">
                                    {s.enrolledCourses && s.enrolledCourses.length > 0 ? (
                                      s.enrolledCourses.map((c: string, ci: number) => (
                                        <span key={ci} className="tag-course">{c}</span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted">No courses</span>
                                    )}
                                  </div>
                                </td>
                                <td className="text-xs text-muted">{s.email}</td>
                                <td>
                                  <div className="flex gap8" style={{ justifyContent: 'flex-end' }}>
                                    <button className="tb-btn" onClick={() => startEdit(s)} style={{ padding: '4px' }}><Edit2 size={12}/></button>
                                    <button className="tb-btn" onClick={() => handleDelete(s._id)} style={{ padding: '4px', color: 'var(--warn)' }}><Trash2 size={12}/></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
          {Object.keys(getGroupedData()).length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No students found in current search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
