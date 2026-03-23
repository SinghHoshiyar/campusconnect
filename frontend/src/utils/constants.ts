export interface NavItem {
  id: string;
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

export interface Role {
  id: string; // This is the role string like 'student'
  name: string;
  initials: string;
  email: string;
  role: string; // Map back to role as well for convenience
  roleLabel: string;
  accent: string;
  accentVar: string;
  nav: NavItem[];
}

export interface User extends Role {
  _id?: string;
  token?: string;
  semester?: number;
  department?: string;
}


export const ROLES: Record<string, Role> = {
  student: {
    id: 'student',
    role: 'student',
    name: 'Aryan Kumar', initials: 'AK', email: 'aryan@campus.edu',
    roleLabel: 'Student · Sem 6', accent: '#00e5a0', accentVar: 'var(--student)',
    nav: [
      { id:'home', path: '/app/dashboard', icon:'LayoutDashboard', label:'Dashboard' },
      { id:'courses', path: '/app/courses', icon:'Book', label:'Register Courses' },
      { id:'schedule', path: '/app/schedule', icon:'Calendar', label:'My Schedule' },
      { id:'attendance', path: '/app/attendance', icon:'CalendarCheck', label:'Attendance' },
      { id:'assignments', path: '/app/assignments', icon:'FileText', label:'Assignments' },
      { id:'chat', path: '/app/chat', icon:'Bot', label:'AI Assistant' },
      { id:'map', path: '/app/map', icon:'Map', label:'Campus Map' },
      { id:'library', path: '/app/library', icon:'Library', label:'Digital Library' },
      { id:'announcements', path: '/app/announcements', icon:'Megaphone', label:'Announcements' },
    ]
  },
  professor: {
    id: 'professor',
    role: 'professor',
    name: 'Prof. Priya Mehta', initials: 'PM', email: 'pmehta@campus.edu',
    roleLabel: 'Professor · CSE Dept', accent: '#5b8dff', accentVar: 'var(--professor)',
    nav: [
      { id:'home', path: '/app/dashboard', icon:'LayoutDashboard', label:'Dashboard' },
      { id:'mark_att', path: '/app/mark_att', icon:'CalendarCheck', label:'Mark Attendance' },
      { id:'my_classes', path: '/app/my_classes', icon:'BookOpen', label:'My Classes' },
      { id:'grades', path: '/app/grades', icon:'BarChart', label:'Grades & Results' },
      { id:'chat', path: '/app/chat', icon:'Bot', label:'AI Assistant' },
      { id:'timetable', path: '/app/schedule', icon:'Clock', label:'Timetable' },
      { id:'assignments_prof', path: '/app/professor-assignments', icon:'FilePlus', label:'Manage Assignments' },
      { id:'library', path: '/app/library', icon:'Library', label:'Digital Library' },
      { id:'announcements', path: '/app/announcements', icon:'Megaphone', label:'Announcements' },
    ]
  },
  admin: {
    id: 'admin',
    role: 'admin',
    name: 'Dr. Vikram Singh', initials: 'VS', email: 'vsingh@campus.edu',
    roleLabel: 'Dean · Administration', accent: '#ff6b6b', accentVar: 'var(--admin)',
    nav: [
      { id:'home', path: '/app/dashboard', icon:'LayoutDashboard', label:'Dashboard' },
      { id:'course_mgmt', path: '/app/course-management', icon:'BookOpen', label:'Course Management' },
      { id:'users', path: '/app/users', icon:'Users', label:'User Management' },
      { id:'campus_map', path: '/app/map', icon:'Map', label:'Campus Overview' },
      { id:'announcements_admin', path: '/app/announcements_admin', icon:'Megaphone', label:'Announcements' },
      { id:'reports', path: '/app/reports', icon:'BarChart', label:'Reports & Analytics' },
      { id:'library', path: '/app/library', icon:'Library', label:'Digital Library' },
      { id:'chat', path: '/app/chat', icon:'Bot', label:'AI Assistant' },
      { id:'settings', path: '/app/settings', icon:'Settings', label:'System Settings' },
    ]
  }
};
