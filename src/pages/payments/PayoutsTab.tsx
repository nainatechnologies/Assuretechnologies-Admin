import React from 'react';
import { FiCheckCircle, FiPhone } from 'react-icons/fi';
import type { PendingVendorPayoutItem } from '../../types';

interface PayoutsTabProps {
  pendingPayouts: PendingVendorPayoutItem[];
  searchQuery: string;
  onPayVendorOrder: (item: PendingVendorPayoutItem) => void;
}

export const PayoutsTab: React.FC<PayoutsTabProps> = ({
  pendingPayouts,
  searchQuery,
  onPayVendorOrder
}) => {
  return (
    <div className="table-container">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Vendor Name</th>
            <th>Product & Qty</th>
            <th>Order Date</th>
            <th>Customer Status</th>
            <th>Amount Owed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingPayouts.map(item => (
            <tr key={item.id}>
              <td>
                <strong style={{ color: '#1e293b' }}>{item.orderNumber}</strong>
              </td>
              <td>
                <div><strong>{item.vendorName}</strong></div>
                {item.vendorMobile && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <FiPhone size={11} /> {item.vendorMobile}
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.qty}</div>
              </td>
              <td>{item.date}</td>
              <td>
                <span className="status-badge completed">
                  <FiCheckCircle style={{ marginRight: '4px' }} /> Customer Paid
                </span>
              </td>
              <td className="amount-col">
                <div><strong>₹{(item.netPayable || 0).toLocaleString()}</strong></div>
                {item.adminCommission > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    (Subtotal: ₹{(item.amount || 0).toLocaleString()} - Comm: ₹{(item.adminCommission || 0).toLocaleString()})
                  </div>
                )}
              </td>
              <td>
                <button 
                  className="btn-pay-action" 
                  onClick={() => onPayVendorOrder(item)}
                >
                  Pay Vendor
                </button>
              </td>
            </tr>
          ))}
          {pendingPayouts.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="payments-empty-state">
                  <FiCheckCircle size={32} />
                  <p>{searchQuery ? `No payouts found for "${searchQuery}".` : 'No pending payouts! All vendors are fully settled.'}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
