import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import './Topbar.css';

export default function Topbar() {
  const { user, currentRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to map route to title (simplified)
  const getPageTitle = () => {
    const path = location.pathname;
    const currentNavItem = user?.nav.find(item => item.path === path);
    return currentNavItem ? currentNavItem.label : 'Dashboard';
  };

  const ctaText = currentRole === 'admin' ? 'New Announcement' : 'Ask AI';
  const ctaAction = () => {
    if (currentRole === 'admin') navigate('/app/announcements');
    else navigate('/app/chat');
  };

  return (
    <div className="topbar">
      <div className="topbar-title">{getPageTitle()}</div>
      <div className="topbar-search">
        <span className="search-icon"><Search size={16} /></span>
        <input type="text" placeholder="Search Campus Connect..." />
      </div>
      <div className="topbar-actions">
        <div className="live">
          <div className="live-dot"></div> 
          <span>March 1, 2026</span>
        </div>
        <div className="topbar-notif">
          <Bell size={20} />
          <div className="notif-dot"></div>
        </div>
        <button className="tb-btn primary" onClick={ctaAction}>
          {ctaText}
        </button>
      </div>
    </div>
  );
}
