import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import { MdClose } from 'react-icons/md';
import './AssignTechnicianModal.css';

interface Props {
  request: ServiceRequest;
  technicians: Technician[];
  onClose: () => void;
  onAssign: (requestId: string, technicianId: string) => void;
}

export default function AssignTechnicianModal({ request, technicians, onClose, onAssign }: Props) {
  const [selectedTech, setSelectedTech] = useState('');

  const handleAssign = () => {
    if (selectedTech) {
      onAssign(request.id, selectedTech);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content assign-tech-modal">
        <div className="modal-header header-blue">
          <h2>Assign Technician</h2>
          <button className="close-btn white-icon" onClick={onClose}>
            <MdClose />
          </button>
        </div>
        
        <div className="p-6">
          <div className="request-info">
            <h3>{request.serviceName}</h3>
            <p>{request.date}</p>
          </div>

          <div className="mt-4">
            <select 
              className="select-blue"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">-- Select Technician --</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.mobile}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="footer-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-assign-green" 
            onClick={handleAssign}
            disabled={!selectedTech}
          >
            Assign
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
