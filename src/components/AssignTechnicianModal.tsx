import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import { MdClose, MdSearch } from 'react-icons/md';
import API from '../services/api';
import './AssignTechnicianModal.css';
import Swal from 'sweetalert2';

interface Props {
  request: ServiceRequest;
  onClose: () => void;
  onAssignSuccess: () => void;
}

export default function AssignTechnicianModal({ request, onClose, onAssignSuccess }: Props) {
  const [selectedTech, setSelectedTech] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (request.pincode) {
      setSearchQuery(request.pincode);
    }
    return () => setMounted(false);
  }, [request.pincode]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTechnicians([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/admin/technicians?search=${searchQuery}&available_only=true`);
        if (res.data.success && res.data.data) {
          const mapped = res.data.data.map((t: any) => ({
            id: t.id,
            name: t.full_name,
            mobile: t.mobile,
            email: t.email,
            address: t.address || '',
            location: t.service_pincodes ? t.service_pincodes.join(', ') : '',
            status: t.is_active ? 'Active' : 'Inactive'
          }));
          setTechnicians(mapped);
        }
      } catch (err) {
        console.error('Error fetching technicians:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAssign = async () => {
    if (selectedTech) {
      try {
        await API.post(`/admin/service-bookings/${request.id}/assign`, { technician_id: selectedTech });
        onAssignSuccess();
      } catch (error) {
        Swal.fire('Error', 'Failed to assign technician', 'error');
      }
    }
  };

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
                {loading ? (
                  <div className="no-technicians">Searching...</div>
                ) : technicians.length === 0 ? (
                  <div className="no-technicians">No technicians found.</div>
                ) : (
                  <ul className="technician-list">
                    {technicians.map(tech => (
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
