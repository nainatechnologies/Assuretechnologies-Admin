import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PartnerBooking, DronePartner } from '../types';
import { MdClose, MdSearch } from 'react-icons/md';
import API from '../services/api';
import './AssignDronePartnerModal.css';
import Swal from 'sweetalert2';

interface Props {
  booking: PartnerBooking;
  onClose: () => void;
  onAssignSuccess: () => void;
}

export default function AssignPartnerModal({ booking, onClose, onAssignSuccess }: Props) {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [partners, setPartners] = useState<DronePartner[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (selectedPartner) {
      try {
        await API.post(`/admin/service-bookings/${booking.id}/assign`, { partner_id: selectedPartner });
        onAssignSuccess();
      } catch (error) {
        Swal.fire('Error', 'Failed to assign partner', 'error');
      }
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPartners([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/admin/drone-partners?search=${searchQuery}`);
        if (res.data.success && res.data.data) {
          const mapped = res.data.data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name,
            mobile: p.mobile,
            email: p.email,
            location: p.service_pincodes ? p.service_pincodes.join(', ') : '',
            status: p.is_active ? 'Active' : 'Inactive',
            equipmentTypes: p.equipment_types || [],
          }));
          setPartners(mapped);
        }
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
                {loading ? (
                  <div className="no-technicians">Searching...</div>
                ) : partners.length === 0 ? (
                  <div className="no-technicians">No partners found.</div>
                ) : (
                  <ul className="technician-list">
                    {partners.map(partner => (
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
