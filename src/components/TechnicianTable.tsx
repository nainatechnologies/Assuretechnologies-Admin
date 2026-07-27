import type { Technician } from '../types';
import './TechnicianTable.css';

interface TechnicianTableProps {
  technicians: Technician[];
  onEditTechnician: (id: string) => void;
  onDeleteTechnician: (id: string) => void;
}

export default function TechnicianTable({ technicians, onEditTechnician, onDeleteTechnician }: TechnicianTableProps) {
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
            <th>Mobile</th>
            <th>Email</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {technicians.map((tech) => (
            <tr key={tech.id}>
              <td>{tech.id}</td>
              <td>{tech.name}</td>
              <td>{tech.mobile}</td>
              <td>{tech.email}</td>
              <td>{tech.location}</td>
              <td>
                <span className={`status-badge ${tech.status.toLowerCase()}`}>
                  {tech.status}
                </span>
              </td>
              <td>
                <div className="actions-cell">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => onEditTechnician(tech.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn hide-btn"
                  >
                    Hide
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDeleteTechnician(tech.id)}
                  >
                    Delete
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
