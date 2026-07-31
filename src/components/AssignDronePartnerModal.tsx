import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { DronePartnerBooking, DronePartner } from '../types';
import { MdClose, MdSearch } from 'react-icons/md';
import './AssignDronePartnerModal.css';

interface Props {
  booking: DronePartnerBooking;
  dronePartners: DronePartner[];
  onClose: () => void;
  onAssign: (bookingId: string, dronePartnerId: string) => void;
}

export default function AssignDronePartnerModal({ booking, dronePartners, onClose, onAssign }: Props) {
  const [selectedDronePartner, setSelectedDronePartner] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAssign = () => {
    if (selectedDronePartner) {
      onAssign(booking.id, selectedDronePartner);
    }
  };

  const filteredDronePartners = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    return dronePartners.filter(dronePartner => 
      dronePartner.location.toLowerCase().includes(lowerQuery) ||
      dronePartner.name.toLowerCase().includes(lowerQuery) ||
      dronePartner.mobile.includes(lowerQuery)
    );
  }, [dronePartners, searchQuery]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optionally default the search query to the booking's pincode
    if (booking.pincode) {
      setSearchQuery(booking.pincode);
    }
    return () => setMounted(false);
  }, [booking.pincode]);

  if (!mounted) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content assign-tech-modal">
        <div className="modal-header header-blue">
          <h2>Assign Drone DronePartner</h2>
          <button className="close-btn white-icon" onClick={onClose}>
            <MdClose />
          </button>
        </div>
        
        <div className="p-6">
          <div className="request-info">
            <h3>{booking.equipmentType} Booking</h3>
            <p>Target Location: {booking.village}, {booking.mandal}, {booking.district} {booking.pincode ? `- ${booking.pincode}` : ''}</p>
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
                {filteredDronePartners.length === 0 ? (
                  <div className="no-technicians">No drone dronePartners found.</div>
                ) : (
                  <ul className="technician-list">
                    {filteredDronePartners.map(dronePartner => (
                      <li 
                        key={dronePartner.id} 
                        className={`technician-list-item ${selectedDronePartner === dronePartner.id ? 'selected' : ''}`}
                        onClick={() => setSelectedDronePartner(dronePartner.id)}
                      >
                        <div className="tech-info-main">
                          <span className="tech-name">{dronePartner.name}</span>
                          <span className="tech-mobile">{dronePartner.mobile}</span>
                        </div>
                        {dronePartner.location && (
                          <div className="tech-pincodes">Serves: {dronePartner.location}</div>
                        )}
                        {dronePartner.equipmentTypes && dronePartner.equipmentTypes.length > 0 && (
                          <div className="tech-pincodes mt-1" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                            {dronePartner.equipmentTypes.join(', ')}
                          </div>
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
            disabled={!selectedDronePartner}
          >
            Assign Drone Partner
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
