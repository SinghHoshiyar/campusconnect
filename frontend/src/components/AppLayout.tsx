import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeSwitcher = () => {
    const switcher = document.getElementById('roleSwitcher');
    if (switcher && switcher.classList.contains('open')) {
      switcher.classList.remove('open');
      // Custom event if needed, but the layout clicking just removes the open class natively here
    }
  };

  return (
    <div className="screen active" style={{flexDirection: 'column', minHeight: '100vh'}} onClick={closeSwitcher}>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content" id="mainContent">
          <Topbar />
          <div id="viewContainer">
             <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
