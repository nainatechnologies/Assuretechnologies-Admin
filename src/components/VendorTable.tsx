import type { Vendor } from '../types';
import './VendorTable.css';

interface VendorTableProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function VendorTable({ vendors, onEdit, onDelete, onToggleStatus }: VendorTableProps) {
  if (vendors.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">No vendors found.</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Vendor ID</th>
            <th>Full Name</th>
            <th>Business Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>GST</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.id}</td>
              <td>{vendor.fullName}</td>
              <td>{vendor.businessName}</td>
              <td>{vendor.mobile}</td>
              <td>{vendor.email}</td>
              <td>{vendor.gstNumber}</td>
              <td>{vendor.location}</td>
              <td>
                <span className={`status-badge ${vendor.status.toLowerCase()}`}>
                  {vendor.status}
                </span>
              </td>
              <td>
                <div className="actions-cell">
                  <button className="action-btn edit-btn" onClick={() => onEdit(vendor)}>Edit</button>
                  <button className="action-btn hide-btn" onClick={() => onToggleStatus(vendor.id)}>
                    {vendor.status === 'Active' ? 'Hide' : 'Show'}
                  </button>
                  <button className="action-btn delete-btn" onClick={() => onDelete(vendor.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
