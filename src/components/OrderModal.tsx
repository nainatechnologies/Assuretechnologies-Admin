import { MdClose, MdPersonOutline, MdLocationOn, MdCreditCard, MdVerifiedUser } from 'react-icons/md';
import type { Order } from '../types';
import './OrderModal.css';

interface OrderModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
  return (
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
              </div>
            </div>

            <div className="order-card">
              <div className="order-card-title">
                <MdLocationOn size={18} /> Delivery Address
              </div>
              <div className="order-card-content">
                <p>{order.address}</p>
                <p className="bold-text">Pincode: {order.pincode}</p>
                <span className="saved-address-badge">Saved Address</span>
              </div>
            </div>

            <div className="order-card">
              <div className="order-card-title">
                <MdCreditCard size={18} /> Payment
              </div>
              <div className="order-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="payment-type-badge">{order.paymentMethod}</span>
                <span className="payment-status-badge">{order.paymentStatus}</span>
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
                  </tr>
                ))}
                <tr className="order-items-footer">
                  <td colSpan={4}></td>
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
    </div>
  );
}
