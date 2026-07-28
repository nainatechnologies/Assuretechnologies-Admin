import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import { MdClose, MdSearch } from 'react-icons/md';
import './AssignTechnicianModal.css';

interface Props {
  request: ServiceRequest;
  technicians: Technician[];
  onClose: () => void;
  onAssign: (requestId: string, technicianId: string) => void;
}

export default function AssignTechnicianModal({ request, technicians, onClose, onAssign }: Props) {
  const [selectedTech, setSelectedTech] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAssign = () => {
    if (selectedTech) {
      onAssign(request.id, selectedTech);
    }
  };

  const filteredTechnicians = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    return technicians.filter(tech => 
      tech.location.toLowerCase().includes(lowerQuery) ||
      tech.name.toLowerCase().includes(lowerQuery) ||
      tech.mobile.includes(lowerQuery)
    );
  }, [technicians, searchQuery]);

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

          <div className="mt-4 flex flex-col gap-3">
            <div className="pincode-search-wrapper">
              <MdSearch className="search-icon" size={20} />
              <input 
                type="text"
                placeholder="Search by name, mobile, or pincode..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {searchQuery.trim() && (
              <div className="technician-list-container">
                {filteredTechnicians.length === 0 ? (
                  <div className="no-technicians">No technicians found.</div>
                ) : (
                  <ul className="technician-list">
                    {filteredTechnicians.map(tech => (
                      <li 
                        key={tech.id} 
                        className={`technician-list-item ${selectedTech === tech.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTech(tech.id)}
                      >
                        <div className="tech-info-main">
                          <span className="tech-name">{tech.name}</span>
                          <span className="tech-mobile">{tech.mobile}</span>
                        </div>
                        {tech.location && (
                          <div className="tech-pincodes">{tech.location}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
