import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import { MdClose, MdSearch, MdFilterList, MdCheckCircle } from 'react-icons/md';
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
  const [filterBySkill, setFilterBySkill] = useState(true);
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
        let url = `/admin/service-bookings/${request.id}/available-technicians`;
        const res = await API.get(url);
        if (res.data.success && res.data.data) {
          const mapped = res.data.data
            .filter((t: any) => !request.technicianId || t.id !== request.technicianId)
            .map((t: any) => ({
              id: t.id,
              name: t.full_name,
              mobile: t.mobile,
              email: t.email,
              address: t.address || '',
              location: t.service_pincodes ? t.service_pincodes.join(', ') : '',
              status: t.is_active ? 'Active' : 'Inactive',
              services: t.services_provided || [],
              services_names: t.services_names || []
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
  }, [searchQuery, filterBySkill, request.serviceName, request.technicianId]);

  const handleAssign = async () => {
    if (selectedTech) {
      try {
        await API.post(`/admin/service-bookings/${request.id}/assign`, { technician_id: selectedTech });
        onAssignSuccess();
      } catch (error: any) {
        Swal.fire('Cannot Assign', error.response?.data?.message || 'Failed to assign technician', 'warning');
      }
    }
  };

  const isSkillMatched = (tech: Technician) => {
    if (!request.serviceName) return false;
    const reqLower = request.serviceName.toLowerCase();
    return (tech.services_names || []).some(name => 
      name.toLowerCase().includes(reqLower) || reqLower.includes(name.toLowerCase())
    );
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
            <div className="flex justify-between items-start">
              <div>
                <h3>{request.serviceName}</h3>
                <p>{request.date} &bull; Pincode: <strong>{request.pincode || 'N/A'}</strong></p>
              </div>
            </div>
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

            {/* Filter Toggle Bar */}
            <div className="skill-filter-bar">
              <div className="flex items-center gap-2">
                <MdFilterList size={18} className="text-gray-500" />
                <span className="skill-filter-label">
                  Skill Match: <strong>{request.serviceName}</strong>
                </span>
              </div>
              <button
                type="button"
                className={`skill-toggle-btn ${filterBySkill ? 'active' : 'inactive'}`}
                onClick={() => setFilterBySkill(!filterBySkill)}
                title="Toggle filtering technicians by requested service"
              >
                {filterBySkill ? 'Filtering ON' : 'All Nearby'}
              </button>
            </div>
            
            {searchQuery.trim() && (
              <div className="technician-list-container">
                {loading ? (
                  <div className="no-technicians">Searching technicians...</div>
                ) : technicians.length === 0 ? (
                  <div className="no-technicians-fallback">
                    <p>
                      No available technicians found
                      {filterBySkill ? ` offering "${request.serviceName}"` : ''} in this area.
                    </p>
                    {filterBySkill && (
                      <button
                        type="button"
                        className="btn-show-all-techs"
                        onClick={() => setFilterBySkill(false)}
                      >
                        Show All Nearby Technicians
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="technician-list">
                    {technicians.map(tech => {
                      const matched = isSkillMatched(tech);
                      return (
                        <li 
                          key={tech.id} 
                          className={`technician-list-item ${selectedTech === tech.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTech(tech.id)}
                        >
                          <div className="tech-info-main">
                            <span className="tech-name flex items-center gap-2">
                              {tech.name}
                              {matched && (
                                <span className="skill-match-pill" title="Matches requested service">
                                  <MdCheckCircle size={14} /> Skill Match
                                </span>
                              )}
                            </span>
                            <span className="tech-mobile">{tech.mobile}</span>
                          </div>

                          {/* Services / Skills Provided */}
                          {tech.services_names && tech.services_names.length > 0 && (
                            <div className="tech-skills-wrap">
                              {tech.services_names.map((sName, idx) => {
                                const isThisMatched = request.serviceName && (
                                  sName.toLowerCase().includes(request.serviceName.toLowerCase()) ||
                                  request.serviceName.toLowerCase().includes(sName.toLowerCase())
                                );
                                return (
                                  <span
                                    key={idx}
                                    className={`tech-skill-tag ${isThisMatched ? 'highlight' : ''}`}
                                  >
                                    {sName}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {tech.location && (
                            <div className="tech-pincodes">Areas: {tech.location}</div>
                          )}
                        </li>
                      );
                    })}
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
