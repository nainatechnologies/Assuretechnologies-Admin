import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdInventory, MdLogout, MdDesignServices } from 'react-icons/md';
import Swal from 'sweetalert2';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, log me out!'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/');
      }
    });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon"></div>
          Assure Admin
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdDashboard />
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdInventory />
            Manage Products
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdDesignServices />
            Manage Services
          </NavLink>
        </nav>
        
        <div className="logout-wrapper">
          <button 
            onClick={handleLogout}
            className="nav-item logout-btn" 
          >
            <MdLogout />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="profile-container">
            <div className="topbar-user" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <span className="topbar-username">Admin User</span>
              <div className="topbar-avatar">
                A
              </div>
            </div>
            
            {isProfileOpen && (
              <div className="profile-dropdown animate-fade-in">
                <button className="dropdown-item" onClick={handleLogout}>
                  <MdLogout />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
