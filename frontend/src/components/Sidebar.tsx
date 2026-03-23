import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ROLES } from '../utils/constants';
import './Sidebar.css';

export default function Sidebar() {
  const { user, currentRole, logout } = useAuth();
  const { unreadCount } = useSocket();
  if (!user || !currentRole) return null;

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="brand-logo">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.846l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.846l-7-3z" />
            </svg>
          </div>
          <span className="brand-text">Campus Connect</span>
        </Link>
      </div>

      {/* User profile */}
      <div className="sidebar-user" id="sidebarUser">
        <div className="user-avatar" id="sidebarAvatar" style={{background: user.accent, color: currentRole === 'student' ? '#000' : '#fff'}}>
          {user.initials}
        </div>
        <div className="user-info">
          <div className="user-name" id="sidebarName">{user.name}</div>
          <div className="user-role" id="sidebarRole">{user.roleLabel}</div>
        </div>
      </div>


      {/* Nav */}
      <div className="sidebar-nav" id="sidebarNav">
        <div className="nav-section-label">Main Menu</div>
        {user.nav.map(item => {
          // Dynamically load the Lucide icon from the string name
          const IconComponent = (LucideIcons as any)[item.icon];
          let displayBadge = item.badge;
          if (item.id === 'announcements' || item.id === 'announcements_admin') {
            displayBadge = unreadCount > 0 ? unreadCount : undefined;
          }
          
          return (
            <NavLink 
              key={item.id}
              to={item.path} 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                {IconComponent ? <IconComponent size={20} /> : <div style={{width:20,height:20}}/>}
              </span>
              <span>{item.label}</span>
              {displayBadge && <span className="nav-badge">{displayBadge}</span>}
            </NavLink>
          );
        })}
      </div>


      <div className="sidebar-footer">
        <div className="logout-btn" onClick={logout}>
          <span className="nav-icon"><LogOut size={16} /></span>
          <span>Log Out</span>
        </div>
      </div>
    </nav>
  );
}
