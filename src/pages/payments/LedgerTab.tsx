import React, { useMemo } from 'react';
import { FiSearch, FiCheckCircle, FiClock, FiPhone, FiCreditCard, FiUsers } from 'react-icons/fi';
import type { VendorLedgerItem } from '../../types';

interface LedgerTabProps {
  ledgerVendors: VendorLedgerItem[];
  selectedVendorId: string | null;
  onSelectVendor: (id: string) => void;
  vendorSearch: string;
  onVendorSearchChange: (val: string) => void;
  onBulkSettle: (vendor: VendorLedgerItem) => void;
}

const getVendorColor = (name: string) => {
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const LedgerTab: React.FC<LedgerTabProps> = ({
  ledgerVendors,
  selectedVendorId,
  onSelectVendor,
  vendorSearch,
  onVendorSearchChange,
  onBulkSettle
}) => {
  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return ledgerVendors;
    const q = vendorSearch.toLowerCase();
    return ledgerVendors.filter(v => 
      v.vendorName.toLowerCase().includes(q) || (v.mobile && v.mobile.includes(q))
    );
  }, [ledgerVendors, vendorSearch]);

  const selectedVendor = useMemo(() => {
    return ledgerVendors.find(v => v.vendorId === selectedVendorId) || null;
  }, [ledgerVendors, selectedVendorId]);

  return (
    <div className="ledger-view">
      <div className="vendor-list-sidebar">
        <div className="vendor-sidebar-header">
          <h3>Vendors</h3>
          <div className="vendor-sidebar-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search vendors..."
              value={vendorSearch}
              onChange={e => onVendorSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="vendor-list-items">
          {filteredVendors.map(vendor => (
            <div 
              key={vendor.vendorId} 
              className={`vendor-list-item ${selectedVendorId === vendor.vendorId ? 'active' : ''}`}
              onClick={() => onSelectVendor(vendor.vendorId)}
            >
              <div className="vendor-avatar" style={{ background: getVendorColor(vendor.vendorName) }}>
                {vendor.vendorName.charAt(0).toUpperCase()}
              </div>
              <div className="vendor-item-info">
                <span className="vendor-item-name">{vendor.vendorName}</span>
                <span className="vendor-item-count">
                  {vendor.pendingPayoutCount} ready to pay ({vendor.unpaidCount} unpaid)
                </span>
              </div>
            </div>
          ))}
          {filteredVendors.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No vendors found.
            </div>
          )}
        </div>
      </div>
      
      <div className="vendor-ledger-details">
        {selectedVendor ? (
          <>
            <div className="ledger-header">
              <div>
                <h2>{selectedVendor.vendorName}</h2>
                <div className="ledger-subtitle" style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  {selectedVendor.mobile && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiPhone size={13} /> {selectedVendor.mobile}
                    </span>
                  )}
                  {selectedVendor.bankDetails && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiCreditCard size={13} /> {selectedVendor.bankDetails}
                    </span>
                  )}
                </div>
              </div>
              <button 
                className="btn-bulk-settle" 
                onClick={() => onBulkSettle(selectedVendor)}
                disabled={selectedVendor.totalPendingCustomerPaid <= 0}
                style={{ opacity: selectedVendor.totalPendingCustomerPaid <= 0 ? 0.6 : 1 }}
              >
                <FiCheckCircle size={16} /> Bulk Settle Balance (₹{(selectedVendor?.totalPendingCustomerPaid || 0).toLocaleString()})
              </button>
            </div>
            
            <div className="ledger-summary">
              <div className="ledger-stat">
                <span>Total Ready to Pay (Customer Paid)</span>
                <strong>₹{(selectedVendor?.totalPendingCustomerPaid || 0).toLocaleString()}</strong>
              </div>
              <div className="ledger-stat">
                <span>Awaiting Customer Payment</span>
                <strong style={{ color: '#64748b' }}>
                  ₹{(selectedVendor?.totalPendingCustomerUnpaid || 0).toLocaleString()}
                </strong>
              </div>
            </div>

            <h4 className="ledger-orders-title">Unpaid Items Breakdown</h4>
            <div className="table-container">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product & Qty</th>
                    <th>Date</th>
                    <th>Customer Status</th>
                    <th>Subtotal</th>
                    <th>Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendor.orders.map(order => {
                    const net = order.amount - (order.adminCommission || 0);
                    return (
                      <tr key={order.id}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>
                          <div>{order.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {order.qty}</div>
                        </td>
                        <td>{order.date}</td>
                        <td>
                          {order.customerPaid ? (
                            <span className="status-badge completed">
                              <FiCheckCircle style={{ marginRight: '4px' }} /> Ready to Pay
                            </span>
                          ) : (
                            <span className="status-badge pending">
                              <FiClock style={{ marginRight: '4px' }} /> Awaiting Customer
                            </span>
                          )}
                        </td>
                        <td>₹{(order.amount || 0).toLocaleString()}</td>
                        <td><strong>₹{(net || 0).toLocaleString()}</strong></td>
                      </tr>
                    );
                  })}
                  {selectedVendor.orders.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No unpaid orders for this vendor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-ledger">
            <FiUsers size={40} />
            <p>Select a vendor from the left list to view their ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
};
