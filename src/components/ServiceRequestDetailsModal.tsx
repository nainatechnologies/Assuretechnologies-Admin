import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import './ServiceRequestDetailsModal.css';

interface ServiceRequestDetailsModalProps {
  request: ServiceRequest;
  technician?: Technician;
  onClose: () => void;
  onMarkAsPaid?: (id: string) => void;
}

export default function ServiceRequestDetailsModal({ request, technician, onClose }: ServiceRequestDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content details-modal">
        <div className="details-header">
          <h2>Service Request Details</h2>
          <button className="details-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="details-body">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div className="details-badge" style={{ marginBottom: 0 }}>
              {request.status}
            </div>
            {request.paymentStatus === 'Prebooking Paid' && (
              <div className="details-badge" style={{ backgroundColor: '#10b981', color: 'white', marginBottom: 0 }}>
                {request.paymentStatus} {request.prebookingAmountPaid ? `(₹${request.prebookingAmountPaid})` : ''}
              </div>
            )}
            {request.paymentStatus === 'Paid in Full' && (
              <div className="details-badge" style={{ backgroundColor: '#166534', color: 'white', marginBottom: 0 }}>
                Paid in Full
              </div>
            )}
          </div>

          <div className="details-card">
            Customer <br/><br/>
            <div className="details-row">
              <strong>Name:</strong> {request.userName}
            </div>
            <div className="details-row">
              <strong>Mobile:</strong> {request.userMobile}
            </div>
            <div className="details-row">
              <strong>Email:</strong> {request.userEmail}
            </div>
          </div>

          <div className="details-card">
            Service <br/><br/>
            <div className="details-row">
              <strong>Service:</strong> {request.serviceName}
            </div>
            <div className="details-row">
              <strong>Date:</strong> {request.date}
            </div>
            <div className="details-row">
              <strong>Time:</strong> {request.time}
            </div>
          </div>


          <div className="details-card">
            Technician <br/><br/>
            <div className="details-row">
              {technician ? technician.name : '-'}
            </div>
          </div>

          {request.startWorkPhotos && request.startWorkPhotos.length > 0 && (
            <div className="details-card">
              Photos - Before Work <br/><br/>
              {request.startDescription && (
                <div style={{ marginBottom: '15px', padding: '10px', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '4px', fontSize: '14px', color: '#334155' }}>
                  {request.startDescription}
                </div>
              )}
              <div className="details-photo-grid">
                {request.startWorkPhotos.map((photo, index) => (
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

          {request.progressUpdates && request.progressUpdates.length > 0 && (
            <div className="details-card">
              Daily Progress Updates <br/><br/>
              <div className="progress-timeline">
                {request.progressUpdates.map((update) => (
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

          {request.completeWorkPhotos && request.completeWorkPhotos.length > 0 && (
            <div className="details-card">
              Photos - After Work <br/><br/>
              <div className="details-photo-grid">
                {request.completeWorkPhotos.map((photo, index) => (
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

        <div className="details-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {request.status === 'Completed' && request.paymentStatus !== 'Paid in Full' && onMarkAsPaid ? (
            <button 
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
              onClick={() => onMarkAsPaid(request.id)}
            >
              Mark as Paid
            </button>
          ) : (
            <div></div>
          )}
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
