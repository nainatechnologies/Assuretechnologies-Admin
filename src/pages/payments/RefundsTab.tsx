import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API from '../../services/api';
import Loading from '../../components/Loading';
import Pagination from '../../components/Pagination';
import { getErrorMessage } from '../../utils/errorHandler';

interface RefundsTabProps {
  refunds: any[];
  refundFilter: string;
  onFilterChange: (filter: string) => void;
  refundPage: number;
  refundTotalPages: number;
  onPageChange: (page: number) => void;
  tabLoading: boolean;
  onRefundProcessed: () => void;
}

export const RefundsTab: React.FC<RefundsTabProps> = ({
  refunds,
  refundFilter,
  onFilterChange,
  refundPage,
  refundTotalPages,
  onPageChange,
  tabLoading,
  onRefundProcessed
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [processRefundModal, setProcessRefundModal] = useState<{
    isOpen: boolean;
    order: any | null;
    amount: string;
    mode: 'GATEWAY' | 'MANUAL';
    referenceNote: string;
  }>({
    isOpen: false,
    order: null,
    amount: '',
    mode: 'GATEWAY',
    referenceNote: ''
  });

  const [rejectRefundModal, setRejectRefundModal] = useState<{
    isOpen: boolean;
    order: any | null;
    reason: string;
  }>({
    isOpen: false,
    order: null,
    reason: ''
  });

  const openProcessRefund = (order: any) => {
    setProcessRefundModal({
      isOpen: true,
      order,
      amount: String(order.refund_amount || order.total_amount || '0'),
      mode: order.razorpay_payment_id ? 'GATEWAY' : 'MANUAL',
      referenceNote: ''
    });
  };

  const confirmProcessRefund = async () => {
    if (!processRefundModal.order) return;
    const { order, amount, mode, referenceNote } = processRefundModal;

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Swal.fire('Invalid Amount', 'Please enter a valid refund amount.', 'warning');
      return;
    }

    if (parsed > parseFloat(order.total_amount)) {
      Swal.fire('Invalid Amount', `Refund amount cannot exceed total paid of ₹${order.total_amount}`, 'warning');
      return;
    }

    if (mode === 'MANUAL' && !referenceNote.trim()) {
      Swal.fire('Reference Required', 'Please enter a bank reference / transaction note for manual settlement.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/admin/refunds/${order.order_number}/process`, {
        amount: parsed,
        mode,
        referenceNote: referenceNote.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Refund Processed!',
        text: `Successfully refunded ₹${parsed.toFixed(2)} for Order #${order.order_number}.`,
        timer: 2000,
        showConfirmButton: false
      });

      setProcessRefundModal(prev => ({ ...prev, isOpen: false }));
      onRefundProcessed();
    } catch (err: any) {
      console.error('Refund processing error:', err);
      Swal.fire('Refund Failed', err.response?.data?.message || getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectRefund = (order: any) => {
    setRejectRefundModal({
      isOpen: true,
      order,
      reason: ''
    });
  };

  const confirmRejectRefund = async () => {
    if (!rejectRefundModal.order) return;
    const { order, reason } = rejectRefundModal;

    if (!reason.trim()) {
      Swal.fire('Reason Required', 'Please provide a reason for rejecting the refund.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/admin/refunds/${order.order_number}/reject`, {
        rejectionReason: reason.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Refund Declined',
        text: `Refund for Order #${order.order_number} has been rejected.`,
        timer: 2000,
        showConfirmButton: false
      });

      setRejectRefundModal(prev => ({ ...prev, isOpen: false }));
      onRefundProcessed();
    } catch (err: any) {
      console.error('Refund rejection error:', err);
      Swal.fire('Action Failed', err.response?.data?.message || getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tab-content" style={{ marginTop: '20px' }}>
      <div className="refund-filter-pills">
        <button 
          className={`refund-pill ${refundFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => onFilterChange('ALL')}
        >
          All Refunds
        </button>
        <button 
          className={`refund-pill ${refundFilter === 'REQUESTED' ? 'active' : ''}`}
          onClick={() => onFilterChange('REQUESTED')}
        >
          Pending Review ({refunds.filter(r => r.refund_status === 'REQUESTED' || r.payment_status === 'REFUND_PENDING').length})
        </button>
        <button 
          className={`refund-pill ${refundFilter === 'PROCESSED' ? 'active' : ''}`}
          onClick={() => onFilterChange('PROCESSED')}
        >
          Processed / Settled
        </button>
        <button 
          className={`refund-pill ${refundFilter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => onFilterChange('REJECTED')}
        >
          Rejected
        </button>
      </div>

      <div className="table-container refund-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Customer Info</th>
              <th>Original Paid</th>
              <th>Refund Amount</th>
              <th>Cancellation Reason</th>
              <th>Status</th>
              <th>Mode / Ref ID</th>
              <th className="refund-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tabLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <Loading />
                </td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No refund records found matching this filter.
                </td>
              </tr>
            ) : (
              refunds.map((refOrder: any) => {
                const isPending = refOrder.refund_status === 'REQUESTED' || refOrder.payment_status === 'REFUND_PENDING';
                const isProcessed = refOrder.refund_status === 'PROCESSED' || refOrder.payment_status === 'REFUNDED';
                const isRejected = refOrder.refund_status === 'REJECTED';

                return (
                  <tr key={refOrder.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>#{refOrder.order_number}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {refOrder.createdAt ? new Date(refOrder.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{refOrder.customer_name || refOrder.customer?.full_name || 'Customer'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{refOrder.customer_contact || refOrder.customer?.mobile || '—'}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      ₹{parseFloat(refOrder.total_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: isProcessed ? '#16a34a' : '#4f46e5' }}>
                      ₹{parseFloat(refOrder.refund_amount || refOrder.total_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: '#475569' }} title={refOrder.refund_reason}>
                      {refOrder.refund_reason || 'Customer cancellation'}
                      {refOrder.refund_rejection_reason && (
                        <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>
                          <strong>Declined note:</strong> {refOrder.refund_rejection_reason}
                        </div>
                      )}
                    </td>
                    <td>
                      {isPending && <span className="status-badge refund-requested">Pending Review</span>}
                      {isProcessed && <span className="status-badge refund-processed">Processed</span>}
                      {isRejected && <span className="status-badge refund-rejected">Rejected</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {refOrder.refund_mode === 'GATEWAY' ? 'Razorpay Source' : refOrder.refund_mode === 'MANUAL' ? 'Manual Transfer' : '—'}
                      </div>
                      {refOrder.refund_id && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {refOrder.refund_id}
                        </div>
                      )}
                    </td>
                    <td className="refund-actions-cell">
                      {isPending ? (
                        <div className="refund-actions-group">
                          <button
                            className="refund-btn-approve"
                            onClick={() => openProcessRefund(refOrder)}
                            title="Approve and disburse refund"
                          >
                            <FiCheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            className="refund-btn-reject"
                            onClick={() => openRejectRefund(refOrder)}
                            title="Decline refund request"
                          >
                            <FiXCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : isProcessed ? (
                        <div className="refund-action-badge settled">
                          <FiCheckCircle size={13} />
                          <span>Settled</span>
                        </div>
                      ) : isRejected ? (
                        <div className="refund-action-badge rejected">
                          <FiXCircle size={13} />
                          <span>Declined</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!tabLoading && refundTotalPages > 1 && (
        <div style={{ marginTop: '20px' }}>
          <Pagination
            currentPage={refundPage}
            totalPages={refundTotalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* ── PROCESS REFUND MODAL ── */}
      {processRefundModal.isOpen && processRefundModal.order && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content" style={{ maxWidth: '520px' }}>
            <div className="payment-modal-header">
              <h2>Approve & Process Refund</h2>
              <button 
                className="btn-close" 
                disabled={submitting}
                onClick={() => setProcessRefundModal(prev => ({ ...prev, isOpen: false }))}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="payment-modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#475569' }}>
                  Order <strong>#{processRefundModal.order.order_number}</strong> — {processRefundModal.order.customer_name || 'Customer'}
                </p>
                <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                  Total Paid: ₹{parseFloat(processRefundModal.order.total_amount).toLocaleString()}
                </p>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Cancellation Reason: <em>{processRefundModal.order.refund_reason || 'Customer cancellation'}</em>
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Refund Amount (₹) <span style={{ color: '#64748b', fontWeight: 400 }}>(Default full paid amount; edit for partial refund)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={processRefundModal.amount}
                  onChange={(e) => setProcessRefundModal(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Disbursement Mode
                </label>
                <div className="refund-mode-selector">
                  <div 
                    className={`refund-mode-card ${processRefundModal.mode === 'GATEWAY' ? 'selected' : ''}`}
                    onClick={() => setProcessRefundModal(prev => ({ ...prev, mode: 'GATEWAY' }))}
                  >
                    <h4>⚡ Razorpay 1-Click</h4>
                    <p>Reverses back to original payment card / UPI automatically (5-7 business days).</p>
                  </div>
                  <div 
                    className={`refund-mode-card ${processRefundModal.mode === 'MANUAL' ? 'selected' : ''}`}
                    onClick={() => setProcessRefundModal(prev => ({ ...prev, mode: 'MANUAL' }))}
                  >
                    <h4>🏦 Manual Transfer</h4>
                    <p>For manual bank NEFT / IMPS or direct UPI transfer. Requires reference note.</p>
                  </div>
                </div>
              </div>

              {processRefundModal.mode === 'MANUAL' && (
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                    Bank Reference / UTR Number / Transfer Note *
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. UTR-982341234901 or IMPS reference"
                    value={processRefundModal.referenceNote} 
                    onChange={(e) => setProcessRefundModal(prev => ({ ...prev, referenceNote: e.target.value }))} 
                  />
                </div>
              )}
            </div>
            <div className="payment-modal-footer">
              <button 
                className="btn-cancel" 
                disabled={submitting}
                onClick={() => setProcessRefundModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                style={{ background: '#10b981' }}
                disabled={submitting}
                onClick={confirmProcessRefund}
              >
                {submitting ? 'Processing...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT REFUND MODAL ── */}
      {rejectRefundModal.isOpen && rejectRefundModal.order && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content" style={{ maxWidth: '480px' }}>
            <div className="payment-modal-header">
              <h2>Decline Refund Request</h2>
              <button 
                className="btn-close" 
                disabled={submitting}
                onClick={() => setRejectRefundModal(prev => ({ ...prev, isOpen: false }))}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="payment-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
                Decline refund for Order <strong>#{rejectRefundModal.order.order_number}</strong> (₹{parseFloat(rejectRefundModal.order.total_amount).toLocaleString()}).
              </p>
              <div className="form-group">
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Reason for Rejection * <span style={{ color: '#64748b', fontWeight: 400 }}>(Visible to customer)</span>
                </label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="e.g. Order already custom manufactured or cancelled outside cancellation window."
                  value={rejectRefundModal.reason} 
                  onChange={(e) => setRejectRefundModal(prev => ({ ...prev, reason: e.target.value }))} 
                />
              </div>
            </div>
            <div className="payment-modal-footer">
              <button 
                className="btn-cancel" 
                disabled={submitting}
                onClick={() => setRejectRefundModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                style={{ background: '#ef4444' }}
                disabled={submitting}
                onClick={confirmRejectRefund}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
