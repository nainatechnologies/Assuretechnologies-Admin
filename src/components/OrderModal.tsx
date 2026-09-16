import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdPersonOutline, MdLocationOn, MdCreditCard, MdVerifiedUser } from 'react-icons/md';
import type { Order, OrderItem } from '../types';
import './OrderModal.css';

interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onSplitClick?: (item: OrderItem) => void;
}

export default function OrderModal({ order, onClose, onSplitClick }: OrderModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  return createPortal(
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h2>Order Details</h2>
          <button className="order-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="order-modal-body">
          {/* Top Info */}
          <div className="order-summary-top">
            <div className="order-summary-item">
              <span className="order-summary-label">Order ID</span>
              <span className="order-id-value">{order.id}</span>
            </div>
            <div className="order-summary-item" style={{ alignItems: 'flex-end' }}>
              <span className="order-summary-label">Order Date</span>
              <span className="order-date-value">{order.date}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="order-cards-grid">
            <div className="order-card">
              <div className="order-card-title">
                <MdPersonOutline size={18} /> Customer
              </div>
              <div className="order-card-content">
                <p className="bold-text">{order.user}</p>
                <p>{order.mobile}</p>
                <p>{order.email}</p>
                {order.gstNumber && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                    <p className="bold-text">Business Customer</p>
                    {order.companyName && <p>{order.companyName}</p>}
                    <p>GST: {order.gstNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="order-card">
              <div className="order-card-title">
                <MdLocationOn size={18} /> Delivery Address
              </div>
              <div className="order-card-content">
                <p>{order.address}</p>
                <span className="saved-address-badge">Saved Address</span>
              </div>
            </div>

            <div className="order-card">
              <div className="order-card-title">
                <MdCreditCard size={18} /> Payment
              </div>
              <div className="order-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="payment-type-badge">{order.paymentDetails?.card ? 'Card' : order.paymentDetails?.vpa ? 'UPI' : order.paymentDetails?.bank ? 'Net Banking' : order.paymentDetails?.wallet ? 'Wallet' : order.paymentMethod || 'Online'}</span>
                  <span className="payment-status-badge" style={{ backgroundColor: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7', color: order.paymentStatus === 'Paid' ? '#166534' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{order.paymentStatus}</span>
                </div>
                {order.paidAt && (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Paid on {order.paidAt}</span>
                )}
                {order.paymentDetails?.vpa && (
                  <span style={{ fontSize: '11px', color: '#475569' }}>UPI: {order.paymentDetails.vpa}</span>
                )}
                {order.paymentDetails?.card && (
                  <span style={{ fontSize: '11px', color: '#475569' }}>{order.paymentDetails.card.network && order.paymentDetails.card.network !== 'Unknown' ? order.paymentDetails.card.network : 'Card'} •••• {order.paymentDetails.card.last4 || '****'}</span>
                )}
                {order.paymentDetails?.bank && (
                  <span style={{ fontSize: '11px', color: '#475569' }}>Bank: {order.paymentDetails.bank}</span>
                )}
                {order.paymentDetails?.wallet && (
                  <span style={{ fontSize: '11px', color: '#475569' }}>Wallet: {order.paymentDetails.wallet}</span>
                )}
                {order.razorpayPaymentId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', width: '100%', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>ID: <strong>{order.razorpayPaymentId}</strong></span>
                      <button
                        onClick={() => {
                          if (order.razorpayPaymentId) {
                            navigator.clipboard.writeText(order.razorpayPaymentId);
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }
                        }}
                        style={{
                          background: copiedId ? '#dcfce7' : '#fff',
                          color: copiedId ? '#166534' : '#334155',
                          border: '1px solid',
                          borderColor: copiedId ? '#86efac' : '#cbd5e1',
                          borderRadius: '3px',
                          padding: '1px 7px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: copiedId ? 'bold' : 'normal',
                          transition: 'all 0.2s'
                        }}
                        title="Copy"
                      >
                        {copiedId ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <a
                      href={'https://dashboard.razorpay.com/app/payments/' + order.razorpayPaymentId}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      View on Razorpay ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="order-items-table-wrapper">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  {onSplitClick && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.productName}</td>
                    <td>
                      <span className="vendor-badge">{item.vendorName}</span>
                    </td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.subtotal.toFixed(2)}</td>
                    {onSplitClick && (
                      <td>
                        <button
                          className="order-item-split-btn"
                          onClick={() => onSplitClick(item)}
                          title="Split order item to another vendor"
                        >
                          Split
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="order-items-footer">
                  <td colSpan={onSplitClick ? 5 : 4}></td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>Total Payable</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="order-verification">
            <MdVerifiedUser size={16} /> Vendor & address verified
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
