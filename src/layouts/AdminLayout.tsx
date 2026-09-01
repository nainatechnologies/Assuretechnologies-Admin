import NotificationsDropdown from '../components/NotificationsDropdown';
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdInventory, MdLogout, MdEngineering, MdStore, MdBuild, MdShoppingCart, MdAssignment, MdAssignmentInd, MdReceipt, MdAttachMoney, MdWork, MdPeople } from 'react-icons/md';
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

          <div className="nav-group-header">MANAGEMENT</div>
          <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdPeople />
            Manage Users
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdInventory />
            Manage Products
          </NavLink>
          <NavLink to="/admin/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdInventory />
            Manage Stock
          </NavLink>
          <NavLink to="/admin/technicians" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdEngineering />
            Manage Technicians
          </NavLink>
          <NavLink to="/admin/vendors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdStore />
            Manage Vendors
          </NavLink>


          <div className="nav-group-header">OPERATIONS</div>
          <NavLink to="/admin/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdShoppingCart />
            Admin Orders
          </NavLink>
          <NavLink to="/admin/vendor-orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdShoppingCart />
            Vendor Orders
          </NavLink>
          <NavLink to="/admin/service-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdAssignment />
            Service Requests
          </NavLink>
          <NavLink to="/admin/service-assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdAssignmentInd />
            Service Assignments
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdBuild />
            Manage Services
          </NavLink>

          <div className="nav-group-header">PARTNERS</div>
          <NavLink to="/admin/partners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdStore />
            Manage Partners
          </NavLink>
          <NavLink to="/admin/partner-types" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdStore />
            Manage Partner Types
          </NavLink>
          <NavLink to="/admin/pricing-types" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdStore />
            Manage Pricing Types
          </NavLink>
          <NavLink to="/admin/partner-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdAssignment />
            Partner Requests
          </NavLink>
          <NavLink to="/admin/partner-assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdAssignmentInd />
            Partner Assignments
          </NavLink>
          <NavLink to="/admin/partner-services" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdBuild />
            Manage Partner Services
          </NavLink>

          <div className="nav-group-header">FINANCE</div>
          <NavLink to="/admin/quotations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdReceipt />
            Quotations
          </NavLink>
          <NavLink to="/admin/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdReceipt />
            Invoices
          </NavLink>
          <NavLink to="/admin/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdAttachMoney />
            Manage Payments
          </NavLink>

          <div className="nav-group-header">CAREERS</div>
          <NavLink to="/admin/job-portal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MdWork />
            Job Portal
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
          <div className="topbar-actions">
            <NotificationsDropdown />
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
          </div>
        </header>

        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
