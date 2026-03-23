import { Download, PlusCircle, Trash2 } from 'lucide-react';

export default function Grades() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customColumns, setCustomColumns] = useState<string[]>([]);

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/assignments/my', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyCourses(data);
        if (data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data[0]._id);
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchGrades = async (courseId: string) => {
    if (!courseId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/academic/grades?courseAssignmentId=${courseId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setStudents(Array.isArray(data) ? data : []);
      
      // Sync custom columns from existing data
      if (data.length > 0 && data[0].others) {
        setCustomColumns(Object.keys(data[0].others));
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) fetchGrades(selectedCourseId);
  }, [selectedCourseId]);

  const handleUpdate = async (gradeId: string, payload: any) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/academic/grades/${gradeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchGrades(selectedCourseId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: string, value: any, isOther = false) => {
    const newStudents = [...students];
    if (isOther) {
      newStudents[index].others = { ...newStudents[index].others, [field]: Number(value) };
    } else {
      newStudents[index] = { ...newStudents[index], [field]: Number(value) };
    }
    setStudents(newStudents);
  };

  const addColumn = () => {
    const name = prompt('Enter Assessment Name (e.g. Assignment 1):');
    if (name && !customColumns.includes(name)) {
      setCustomColumns([...customColumns, name]);
    }
  };

  const removeColumn = (col: string) => {
    setCustomColumns(customColumns.filter(c => c !== col));
  };

  const selectedCourse = myCourses.find(c => c._id === selectedCourseId);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          <div className="font-syne fw700" style={{ fontSize: '18px' }}>
            {selectedCourse?.course?.name || 'Loading Course...'} — Grades
          </div>
          <select 
            className="form-input" 
            style={{ width: '220px', fontSize: '13px', height: '36px' }}
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
          >
            {myCourses.map(c => (
              <option key={c._id} value={c._id}>{c.course?.code} — {c.course?.name} ({c.section})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing && (
            <button className="tb-btn" onClick={addColumn} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}>
              <PlusCircle size={14}/> Add Column
            </button>
          )}
          <button 
            className={`tb-btn ${isEditing ? 'primary' : ''}`} 
            onClick={() => setIsEditing(!isEditing)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isEditing ? '✔ Finish' : '✎ Edit Marks'}
          </button>
          <button className="tb-btn"><Download size={14}/> CSV</button>
        </div>
      </div>

      <div className="stat-grid g4 mb20">
        <div className="stat-card" style={{ '--c': 'var(--student)' } as React.CSSProperties}>
          <div className="stat-val">{(students.reduce((acc, s) => acc + (s.total || 0), 0) / (students.length || 1) / 10).toFixed(1)}</div>
          <div className="stat-lbl">Class Average (GPA)</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--professor)' } as React.CSSProperties}>
          <div className="stat-val">{Math.max(...students.map(s => s.total || 0), 0)}</div>
          <div className="stat-lbl">Highest Score</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
          <div className="stat-val">{Math.min(...students.map(s => s.total || 100), 100)}</div>
          <div className="stat-lbl">Lowest Score</div>
        </div>
        <div className="stat-card" style={{ '--c': 'var(--warn)' } as React.CSSProperties}>
          <div className="stat-val">{students.filter(s => (s.total || 0) < 50).length}</div>
          <div className="stat-lbl">Failing Students</div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No.</th><th>Name</th>
              <th>Mid (20)</th><th>Lab (20)</th><th>Quiz (10)</th>
              {customColumns.map(col => (
                <th key={col} style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    {col}
                    {isEditing && <Trash2 size={12} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => removeColumn(col)}/>}
                  </div>
                </th>
              ))}
              <th style={{ background: 'var(--surface2)' }}>Total (100)</th>
              <th>Grade</th><th>Risk</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s._id || i}>
                <td className="text-muted">{s.student?.rollNo || s.roll}</td>
                <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{s.student?.name}</td>
                <td>
                  {isEditing ? (
                    <input type="number" className="form-input" style={{ width: '50px', padding: '4px' }} value={s.mid} onChange={e => handleInputChange(i, 'mid', e.target.value)} />
                  ) : s.mid}
                </td>
                <td>
                  {isEditing ? (
                    <input type="number" className="form-input" style={{ width: '50px', padding: '4px' }} value={s.lab} onChange={e => handleInputChange(i, 'lab', e.target.value)} />
                  ) : s.lab}
                </td>
                <td>
                  {isEditing ? (
                    <input type="number" className="form-input" style={{ width: '50px', padding: '4px' }} value={s.quiz} onChange={e => handleInputChange(i, 'quiz', e.target.value)} />
                  ) : s.quiz}
                </td>
                {customColumns.map(col => (
                  <td key={col}>
                    {isEditing ? (
                      <input type="number" className="form-input" style={{ width: '50px', padding: '4px' }} value={s.others?.[col] || 0} onChange={e => handleInputChange(i, col, e.target.value, true)} />
                    ) : (s.others?.[col] || 0)}
                  </td>
                ))}
                <td className="font-syne fw700" style={{ background: 'var(--surface2)', color: 'var(--accent)' }}>
                  {isEditing ? (
                    <input type="number" className="form-input" style={{ width: '60px', padding: '4px', fontWeight: 700 }} value={s.total} onChange={e => handleInputChange(i, 'total', e.target.value)} />
                  ) : s.total}
                </td>
                <td>
                  <span className={`badge badge-${s.grade?.includes('A') ? 'green' : s.grade?.includes('B') ? 'blue' : s.grade?.includes('C') ? 'warn' : 'red'}`}>
                    {s.grade}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: s.risk === 'Good' ? 'var(--student)' : s.risk === 'At Risk' ? 'var(--warn)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
                    ● {s.risk}
                  </span>
                </td>
                <td>
                  {isEditing && (
                    <button className="tb-btn text-xs" style={{ padding: '4px 8px', background: 'var(--accent)', color: 'var(--bg)' }} 
                      onClick={() => handleUpdate(s._id, { mid: s.mid, lab: s.lab, quiz: s.quiz, others: s.others, total: s.total })}
                      disabled={loading}
                    >
                      Save
                    </button>
                  ) || '-'}
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={10 + customColumns.length} style={{textAlign:'center', padding:'20px', color:'var(--muted)'}}>No grade records found for this course.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
