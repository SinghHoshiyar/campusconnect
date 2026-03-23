import React from 'react';
import { Building, Library, FlaskConical, Utensils, Home, Stethoscope } from 'lucide-react';
import './CampusMap.css';

export default function CampusMap() {
  const locations = [
    { icon: Building, name: 'Academic Block A', status: 'Open · 7AM–9PM', statusColor: 'green', walkTime: '5 min walk' },
    { icon: Library, name: 'Library', status: 'Open 24/7', statusColor: 'green', walkTime: '8 min walk' },
    { icon: FlaskConical, name: 'Labs Complex', status: 'Lab 3 Busy', statusColor: 'warn', walkTime: '4 min walk' },
    { icon: Utensils, name: 'Cafeteria', status: 'Lunch 12–2 PM', statusColor: 'green', walkTime: '6 min walk' },
    { icon: Home, name: 'Hostel Block', status: 'Always open', statusColor: 'green', walkTime: '12 min walk' },
    { icon: Stethoscope, name: 'Medical Centre', status: 'Open · 24hrs', statusColor: 'green', walkTime: '7 min walk' },
  ];

  return (
    <div className="page-body">
      <div className="card mb20" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="campus-map-wrap" style={{ height: '360px' }}>
          <svg viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="360" fill="#0f1219" />
            <line x1="0" y1="180" x2="800" y2="180" stroke="#1f2840" strokeWidth="18" />
            <line x1="400" y1="0" x2="400" y2="360" stroke="#1f2840" strokeWidth="18" />
            <line x1="200" y1="0" x2="200" y2="360" stroke="#1f2840" strokeWidth="8" />
            <line x1="600" y1="0" x2="600" y2="360" stroke="#1f2840" strokeWidth="8" />
            
            <rect x="24" y="24" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="104" y="74" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Academic Block A</text>
            
            <rect x="616" y="24" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="696" y="74" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Library</text>
            
            <rect x="24" y="140" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="104" y="190" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Academic Block B</text>
            
            <rect x="616" y="140" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="696" y="190" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Labs Complex</text>
            
            <rect x="24" y="260" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="104" y="310" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Hostel Block</text>
            
            <rect x="616" y="260" width="160" height="90" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="696" y="310" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Cafeteria</text>
            
            <rect x="310" y="120" width="180" height="120" rx="8" fill="#161b26" stroke="#1f2840" strokeWidth="1.5" />
            <text x="400" y="185" textAnchor="middle" fill="#5a6585" fontSize="12" fontFamily="DM Sans">Admin Block</text>
            
            {/* Route */}
            <path d="M400 180 L400 140 L200 140 L200 69 L184 69" stroke="#00e5a0" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.7" />
            
            {/* You */}
            <circle cx="400" cy="180" r="16" fill="rgba(91,141,255,.2)" stroke="#5b8dff" strokeWidth="2" />
            <circle cx="400" cy="180" r="7" fill="#5b8dff" />
            <text x="400" y="165" textAnchor="middle" fill="#5b8dff" fontSize="11" fontFamily="DM Sans">You</text>
            
            {/* Pins */}
            <circle cx="104" cy="69" r="8" fill="#00e5a0" stroke="#080b12" strokeWidth="2" />
            <circle cx="696" cy="69" r="8" fill="#5b8dff" stroke="#080b12" strokeWidth="2" />
            <circle cx="104" cy="185" r="8" fill="#ffc947" stroke="#080b12" strokeWidth="2" />
            <circle cx="696" cy="185" r="8" fill="#c084fc" stroke="#080b12" strokeWidth="2" />
            <circle cx="104" cy="305" r="8" fill="#ff9f43" stroke="#080b12" strokeWidth="2" />
            <circle cx="696" cy="305" r="8" fill="#ff6b6b" stroke="#080b12" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {locations.map((loc, i) => (
          <div key={i} className="card card-hover" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px', color: `var(--${loc.statusColor})` }}><loc.icon size={26} /></div>
            <div className="font-syne fw700 text-sm mb12" style={{ fontSize: '13px' }}>{loc.name}</div>
            <div className={`badge badge-${loc.statusColor}`} style={{ marginBottom: '8px' }}>● {loc.status}</div>
            <div className="text-xs text-muted">{loc.walkTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
