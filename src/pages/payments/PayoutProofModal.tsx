import React from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

export interface PaymentProofState {
  isOpen: boolean;
  type: 'single' | 'bulk';
  vendorId: string;
  vendorName: string;
  itemIds: string[];
  amount: number;
  referenceNote: string;
  file: File | null;
  fileName?: string;
}

interface PayoutProofModalProps {
  state: PaymentProofState;
  submitting: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onChangeReferenceNote: (note: string) => void;
  onConfirm: () => void;
}

export const PayoutProofModal: React.FC<PayoutProofModalProps> = ({
  state,
  submitting,
  onClose,
  onFileSelect,
  onChangeReferenceNote,
  onConfirm
}) => {
  if (!state.isOpen) return null;

  return (
    <div 
      className="payment-modal-overlay" 
      onClick={() => !submitting && onClose()}
    >
      <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Record Vendor Payout</h2>
          <button 
            className="btn-close" 
            disabled={submitting}
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="payment-modal-body">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#475569' }}>
                Paying <strong>{state.vendorName}</strong>
              </p>
              <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                ₹{(state.amount || 0).toLocaleString()}
              </p>
              {state.type === 'bulk' && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>
                  ✓ Bulk settling {state.itemIds.length} orders in a single transaction.
                </p>
              )}
            </div>
            
            <label>Upload Payment Receipt / Proof (Optional)</label>
            <div 
              onClick={() => document.getElementById('proof-upload-input')?.click()}
              style={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: '8px', 
                padding: '24px', 
                textAlign: 'center',
                background: state.fileName ? '#eff6ff' : '#f8fafc',
                borderColor: state.fileName ? '#4f46e5' : '#cbd5e1',
                marginTop: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="file" 
                id="proof-upload-input" 
                style={{ display: 'none' }} 
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onFileSelect(e.target.files[0]);
                  }
                }}
              />
              {state.fileName ? (
                <>
                  <FiCheckCircle size={28} color="#4f46e5" style={{ marginBottom: '6px' }} />
                  <p style={{ color: '#1e293b', margin: 0, fontWeight: 500 }}>{state.fileName}</p>
                  <p style={{ color: '#4f46e5', fontSize: '0.8rem', marginTop: '4px' }}>Click to change file</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Click to browse or drop screenshot/receipt</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '6px' }}>PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Bank Reference / UTR Number / Notes</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. UTR123456789 or IMPS reference"
              value={state.referenceNote} 
              onChange={(e) => onChangeReferenceNote(e.target.value)} 
            />
          </div>
        </div>
        <div className="payment-modal-footer">
          <button 
            className="btn-cancel" 
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-save" 
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? 'Processing Payout...' : 'Confirm Settlement'}
          </button>
        </div>
      </div>
    </div>
  );
};
