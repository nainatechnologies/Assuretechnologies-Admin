import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PartnerBooking, DronePartner } from '../types';
import './ServiceRequestDetailsModal.css'; // Reusing CSS

import { usePartnerContext } from '../context/PartnerContext';

interface PartnerBookingDetailsModalProps {
  booking: PartnerBooking;
  partner?: DronePartner;
  onClose: () => void;
}

export default function PartnerBookingDetailsModal({ booking, partner, onClose }: PartnerBookingDetailsModalProps) {
  const { pricingTypes } = usePartnerContext();
  const [mounted, setMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const pType = pricingTypes.find(pt => pt.id === booking.pricingTypeId);
  const unitName = pType ? pType.name.replace('Per ', '') : 'Units';

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content details-modal">
        <div className="details-header">
          <h2>Partner Booking Details</h2>
          <button className="details-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="details-body">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div className="details-badge" style={{ marginBottom: 0 }}>
              {booking.status}
            </div>
            {booking.paymentStatus === 'Paid' && (
              <div className="details-badge" style={{ backgroundColor: '#10b981', color: 'white', marginBottom: 0 }}>
                Paid (₹{booking.totalAmount?.toLocaleString('en-IN')})
              </div>
            )}
            {booking.quantity && (
              <div className="details-badge" style={{ backgroundColor: '#6366f1', color: 'white', marginBottom: 0 }}>
                {booking.quantity} {unitName}
              </div>
            )}
          </div>

          <div className="details-card">
            Farmer <br/><br/>
            <div className="details-row">
              <strong>Name:</strong> {booking.userName}
            </div>
            <div className="details-row">
              <strong>Mobile:</strong> {booking.userMobile}
            </div>
            <div className="details-row">
              <strong>Location:</strong> {booking.village}, {booking.mandal}, {booking.district} - {booking.pincode}
            </div>
            <div className="details-row" style={{ color: '#4f46e5', fontWeight: 600 }}>
              <strong>Survey Number:</strong> {booking.surveyNumber}
            </div>
          </div>

          <div className="details-card">
            Service Details <br/><br/>
            <div className="details-row">
              <strong>Equipment Type:</strong> {booking.equipmentType}
            </div>
            <div className="details-row">
              <strong>Date:</strong> {booking.date}
            </div>
            <div className="details-row">
              <strong>Time:</strong> {booking.time}
            </div>
          </div>

          {booking.customFieldResponses && Object.keys(booking.customFieldResponses).length > 0 && (
            <div className="details-card">
              Additional Information <br/><br/>
              {Object.entries(booking.customFieldResponses).map(([key, value]) => (
                <div className="details-row" key={key}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          )}

          <div className="details-card">
            Assigned Partner <br/><br/>
            <div className="details-row">
              {partner ? partner.name : '-'}
            </div>
            {partner && (
              <div className="details-row mt-2" style={{ fontSize: '14px', color: '#64748b' }}>
                Contact: {partner.mobile}
              </div>
            )}
          </div>

          {booking.startWorkPhotos && booking.startWorkPhotos.length > 0 && (
            <div className="details-card">
              Photos - Before Work <br/><br/>
              <div className="details-photo-grid">
                {booking.startWorkPhotos.map((photo, index) => (
                  <img 
                    key={index} 
                    src={photo} 
                    alt={`Before work ${index + 1}`} 
                    className="details-photo-thumbnail cursor-pointer" 
                    onClick={() => setPreviewImage(photo)}
                  />
                ))}
              </div>
            </div>
          )}

          {booking.progressUpdates && booking.progressUpdates.length > 0 && (
            <div className="details-card">
              Daily Progress Updates <br/><br/>
              <div className="progress-timeline">
                {booking.progressUpdates.map((update) => (
                  <div key={update.id} className="progress-item">
                    <div className="progress-date">{update.date}</div>
                    <div className="progress-description">{update.description}</div>
                    {update.photos && update.photos.length > 0 && (
                      <div className="details-photo-grid mt-2">
                        {update.photos.map((photo, idx) => (
                          <img 
                            key={idx} 
                            src={photo} 
                            alt={`Progress ${idx + 1}`} 
                            className="details-photo-thumbnail cursor-pointer" 
                            onClick={() => setPreviewImage(photo)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.completeWorkPhotos && booking.completeWorkPhotos.length > 0 && (
            <div className="details-card">
              Photos - After Work <br/><br/>
              <div className="details-photo-grid">
                {booking.completeWorkPhotos.map((photo, index) => (
                  <img 
                    key={index} 
                    src={photo} 
                    alt={`After work ${index + 1}`} 
                    className="details-photo-thumbnail cursor-pointer" 
                    onClick={() => setPreviewImage(photo)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="details-footer">
          <button className="btn-close-gray" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <button className="image-preview-close" onClick={() => setPreviewImage(null)}>&times;</button>
            <img src={previewImage} alt="Preview" className="image-preview-full" />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
