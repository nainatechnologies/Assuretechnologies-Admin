import type { Technician } from '../types';
import { MdEdit, MdDelete } from 'react-icons/md';
import './TechnicianTable.css';

interface TechnicianTableProps {
  technicians: Technician[];
  onEditTechnician: (id: string) => void;
  onDeleteTechnician: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function TechnicianTable({ technicians, onEditTechnician, onDeleteTechnician, onToggleStatus }: TechnicianTableProps) {
  if (technicians.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <p>No technicians found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Tech ID</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Assigned Services</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {technicians.map((tech) => (
            <tr key={tech.id}>
              <td>{tech.id}</td>
              <td>{tech.name}</td>
              <td>
                <div>{tech.mobile}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{tech.email}</div>
              </td>
              <td>{tech.location}</td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {tech.services && tech.services.length > 0 ? tech.services.map((svc, index) => (
                    <span key={index} style={{ fontSize: '11px', padding: '2px 6px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {svc}
                    </span>
                  )) : (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>No services</span>
                  )}
                </div>
              </td>
              <td>
                <span className={`status-badge ${tech.status.toLowerCase()}`}>
                  {tech.status}
                </span>
              </td>
              <td>
                <div className="actions-cell">
                  <label className="switch" title="Toggle Status">
                    <input 
                      type="checkbox" 
                      checked={tech.status === 'Active'}
                      onChange={() => onToggleStatus(tech.id)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <button 
                    className="icon-btn edit-icon" 
                    onClick={() => onEditTechnician(tech.id)}
                    title="Edit"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button 
                    className="icon-btn delete-icon" 
                    onClick={() => onDeleteTechnician(tech.id)}
                    title="Delete"
                  >
                    <MdDelete size={20} />
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
