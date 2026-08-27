import type { Customer } from '../types';
import { MdVisibility, MdEdit } from 'react-icons/md';
import './CustomerTable.css';

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export default function CustomerTable({ customers, onView, onEdit, onToggleStatus }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">No customers found.</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Full Name</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Orders</th>
            <th>Joined Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>
                <span className="customer-id-pill">
                  {c.display_id || `CUS-${c.id.substring(0, 6)}`}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.fullName}</div>
                {c.isMobileVerified && (
                  <span className="verified-badge">Verified</span>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 500 }}>{c.mobile}</div>
                {c.email ? (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No email</div>
                )}
              </td>
              <td>
                <div>{c.stateName || 'N/A'}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>PIN: {c.pincode || 'N/A'}</div>
              </td>
              <td>
                <div style={{ fontWeight: 600, color: '#4f46e5' }}>
                  {c.ordersCount || 0} order{(c.ordersCount || 0) !== 1 ? 's' : ''}
                </div>
                {c.totalSpent !== undefined && c.totalSpent > 0 && (
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
              </td>
              <td>
                <span className={`status-badge ${c.status === 'Active' ? 'active' : 'inactive'}`}>
                  {c.status}
                </span>
              </td>
              <td>
                <div className="actions-cell">
                  <label className="switch" title="Toggle Active / Blocked Status">
                    <input 
                      type="checkbox" 
                      checked={c.status === 'Active'}
                      onChange={() => onToggleStatus(c.id, c.status)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <button className="icon-btn view-icon" onClick={() => onView(c)} title="View Customer Details">
                    <MdVisibility size={20} />
                  </button>
                  <button className="icon-btn edit-icon" onClick={() => onEdit(c)} title="Edit Customer">
                    <MdEdit size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
