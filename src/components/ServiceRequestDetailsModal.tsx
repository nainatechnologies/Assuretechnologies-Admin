import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ServiceRequest, Technician } from '../types';
import './ServiceRequestDetailsModal.css';

interface ServiceRequestDetailsModalProps {
  request: ServiceRequest;
  technician?: Technician;
  onClose: () => void;
}

export default function ServiceRequestDetailsModal({ request, technician, onClose }: ServiceRequestDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

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
          <div className="details-badge">
            {request.status}
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
        </div>

        <div className="details-footer">
          <button className="btn-close-gray" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
