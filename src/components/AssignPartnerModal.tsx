import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { PartnerBooking, DronePartner } from '../types';
import { MdClose, MdSearch } from 'react-icons/md';
import './AssignDronePartnerModal.css';

interface Props {
  booking: PartnerBooking;
  dronePartners: DronePartner[];
  onClose: () => void;
  onAssign: (bookingId: string, partnerId: string) => void;
}

export default function AssignPartnerModal({ booking, dronePartners, onClose, onAssign }: Props) {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAssign = () => {
    if (selectedPartner) {
      onAssign(booking.id, selectedPartner);
    }
  };

  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    return dronePartners.filter(partner => 
      partner.location.toLowerCase().includes(lowerQuery) ||
      partner.name.toLowerCase().includes(lowerQuery) ||
      partner.mobile.includes(lowerQuery)
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
          <h2>Assign Partner</h2>
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
                {filteredPartners.length === 0 ? (
                  <div className="no-technicians">No partners found.</div>
                ) : (
                  <ul className="technician-list">
                    {filteredPartners.map(partner => (
                      <li 
                        key={partner.id} 
                        className={`technician-list-item ${selectedPartner === partner.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPartner(partner.id)}
                      >
                        <div className="tech-info-main">
                          <span className="tech-name">{partner.name}</span>
                          <span className="tech-mobile">{partner.mobile}</span>
                        </div>
                        {partner.location && (
                          <div className="tech-pincodes">Serves: {partner.location}</div>
                        )}
                        {partner.equipmentTypes && partner.equipmentTypes.length > 0 && (
                          <div className="tech-pincodes mt-1" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                            {partner.equipmentTypes.join(', ')}
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
            disabled={!selectedPartner}
          >
            Assign Partner
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
