import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import type { Order } from '../types';
import './TrackOrderModal.css';

interface TrackOrderModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (transportName: string, trackingId: string) => void;
}

export default function TrackOrderModal({ order, onClose, onSubmit }: TrackOrderModalProps) {
  const [transportName, setTransportName] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportName.trim() || !trackingId.trim()) return;
    onSubmit(transportName, trackingId);
  };

  return (
    <div className="track-modal-overlay" onClick={onClose}>
      <div className="track-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="track-modal-header">
          <h2>Track Order: {order.id}</h2>
          <button className="track-close-btn" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="track-modal-body">
          <div className="track-form-group">
            <label htmlFor="transportName">Transport Name</label>
            <input
              id="transportName"
              type="text"
              value={transportName}
              onChange={(e) => setTransportName(e.target.value)}
              placeholder="Enter transport name"
              required
            />
          </div>
          <div className="track-form-group">
            <label htmlFor="trackingId">Tracking ID</label>
            <input
              id="trackingId"
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID"
              required
            />
          </div>
          <div className="track-modal-footer">
            <button type="button" className="track-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="track-btn-submit">Save Tracking Info</button>
          </div>
        </form>
      </div>
    </div>
  );
}
