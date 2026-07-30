import React, { useState, useMemo } from 'react';
import { FiDollarSign, FiPlus, FiX, FiArrowDownRight, FiArrowUpRight, FiTrendingUp, FiCheckCircle, FiSearch, FiUsers } from 'react-icons/fi';
import Swal from 'sweetalert2';
import './ManagePayments.css';

type PaymentType = 'incoming' | 'outgoing';
type PaymentStatus = 'completed' | 'pending' | 'failed';

interface Payment {
  id: string;
  date: string;
  type: PaymentType;
  referenceId: string;
  party: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  notes?: string;
}

interface VendorOrderInfo {
  id: string;
  vendorName: string;
  date: string;
  amount: number;
  customerPaid: boolean;
  vendorPaid: boolean;
  paymentMethod: 'online' | 'cod';
}

const initialPayments: Payment[] = [
  { id: 'PAY-1001', date: '2026-07-28', type: 'incoming', referenceId: 'INV-202607-001', party: 'John Doe', amount: 1500, method: 'UPI', status: 'completed' },
  { id: 'PAY-1002', date: '2026-07-29', type: 'outgoing', referenceId: 'VO-202607-001', party: 'TechSupplies Inc.', amount: 4500, method: 'Bank Transfer', status: 'completed' },
  { id: 'PAY-1003', date: '2026-07-30', type: 'incoming', referenceId: '221we244444', party: 'SN Solutions', amount: 10000, method: 'UPI', status: 'completed' }
];

const mockVendorOrders: VendorOrderInfo[] = [
  { id: 'VO-202607-002', vendorName: 'TechSupplies Inc.', date: '2026-07-28', amount: 3000, customerPaid: true, vendorPaid: false, paymentMethod: 'online' },
  { id: 'VO-202607-003', vendorName: 'TechSupplies Inc.', date: '2026-07-29', amount: 1200, customerPaid: true, vendorPaid: false, paymentMethod: 'online' },
  { id: 'VO-202607-004', vendorName: 'Metro Hardware', date: '2026-07-29', amount: 800, customerPaid: true, vendorPaid: false, paymentMethod: 'online' },
  { id: 'VO-202607-005', vendorName: 'Metro Hardware', date: '2026-07-30', amount: 2100, customerPaid: false, vendorPaid: false, paymentMethod: 'cod' },
  { id: 'VO-202607-006', vendorName: 'City Electronics', date: '2026-07-30', amount: 1500, customerPaid: false, vendorPaid: false, paymentMethod: 'cod' }
];

export default function ManagePayments() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'ledger'>('transactions');
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [vendorOrders, setVendorOrders] = useState<VendorOrderInfo[]>(mockVendorOrders);
  
  const [paymentProofState, setPaymentProofState] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    vendorName: string;
    orderId?: string;
    amount: number;
    referenceNote: string;
    fileName?: string;
  }>({
    isOpen: false,
    type: 'single',
    vendorName: '',
    amount: 0,
    referenceNote: '',
    fileName: ''
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');

  // Ledger State
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Computations
  const totalRevenue = payments.filter(p => p.type === 'incoming' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPayouts = payments.filter(p => p.type === 'outgoing' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const netBalance = totalRevenue - totalPayouts;

  const pendingPayouts = vendorOrders.filter(vo => vo.customerPaid && !vo.vendorPaid);
  
  // Vendors List for Ledger
  const uniqueVendors = Array.from(new Set(vendorOrders.map(vo => vo.vendorName)));

  // Filtered vendors for sidebar search
  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return uniqueVendors;
    return uniqueVendors.filter(v => v.toLowerCase().includes(vendorSearch.toLowerCase()));
  }, [uniqueVendors, vendorSearch]);

  // Filtered data based on search
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(p =>
      p.id.toLowerCase().includes(q) ||
      p.party.toLowerCase().includes(q) ||
      p.referenceId.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const filteredPendingPayouts = useMemo(() => {
    const base = vendorOrders.filter(vo => vo.customerPaid && !vo.vendorPaid);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(vo =>
      vo.id.toLowerCase().includes(q) ||
      vo.vendorName.toLowerCase().includes(q)
    );
  }, [vendorOrders, searchQuery]);

  // Vendor avatar color helper
  const getVendorColor = (name: string) => {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handlePayVendorOrder = (orderId: string, vendorName: string, amount: number) => {
    setPaymentProofState({
      isOpen: true,
      type: 'single',
      vendorName,
      orderId,
      amount,
      referenceNote: `Payment for ${orderId}`,
      fileName: ''
    });
  };

  const handleBulkSettle = (vendorName: string) => {
    const unpaidForVendor = vendorOrders.filter(vo => vo.vendorName === vendorName && vo.customerPaid && !vo.vendorPaid);
    const totalAmount = unpaidForVendor.reduce((sum, vo) => sum + vo.amount, 0);
    
    setPaymentProofState({
      isOpen: true,
      type: 'bulk',
      vendorName,
      amount: totalAmount,
      referenceNote: `Bulk settlement for ${unpaidForVendor.length} orders`,
      fileName: ''
    });
  };

  const handleConfirmPayout = () => {
    const { type, vendorName, orderId, referenceNote, fileName } = paymentProofState;
    
    if (!fileName) {
      alert("Please upload a payment proof before confirming.");
      return;
    }

    Swal.fire({
      title: 'Confirm Payment',
      text: `Are you sure you want to process this payment to ${vendorName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Pay Now'
    }).then((result) => {
      if (result.isConfirmed) {
        if (type === 'single' && orderId) {
          // 1-to-1 payment logic
          const payment: Payment = {
            id: `PAY-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString().split('T')[0],
            type: 'outgoing',
            referenceId: orderId,
            party: vendorName,
            amount: paymentProofState.amount,
            method: 'Bank Transfer',
            status: 'completed',
            notes: referenceNote || 'Generated from Vendor Payouts'
          };
          
          setPayments(prev => [payment, ...prev]);
          setVendorOrders(prev => prev.map(vo => vo.id === orderId ? { ...vo, vendorPaid: true } : vo));
          Swal.fire('Success!', 'Payment proof uploaded and vendor paid successfully!', 'success');
        } else if (type === 'bulk') {
          const unpaidForVendor = vendorOrders.filter(vo => vo.vendorName === vendorName && vo.customerPaid && !vo.vendorPaid);
          
          // Strict 1-to-1 generation
          const generatedPayments: Payment[] = unpaidForVendor.map(vo => ({
            id: `PAY-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString().split('T')[0],
            type: 'outgoing',
            referenceId: vo.id,
            party: vendorName,
            amount: vo.amount,
            method: 'Bank Transfer',
            status: 'completed',
            notes: referenceNote || 'Bulk settled from Ledger'
          }));

          setPayments(prev => [...generatedPayments, ...prev]);
          setVendorOrders(prev => prev.map(vo => (vo.vendorName === vendorName && vo.customerPaid && !vo.vendorPaid) ? { ...vo, vendorPaid: true } : vo));
          Swal.fire('Success!', `Payment proof uploaded! Successfully generated ${generatedPayments.length} separate payment records for ${vendorName}.`, 'success');
        }

        setPaymentProofState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };



  return (
    <div className="manage-payments-container">
      <div className="page-header">
        <h1>Manage Payments</h1>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon revenue"><FiArrowDownRight /></div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="amount">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon payouts"><FiArrowUpRight /></div>
          <div className="card-content">
            <h3>Total Payouts</h3>
            <p className="amount">₹{totalPayouts.toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon balance"><FiTrendingUp /></div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="amount">₹{netBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="payments-toolbar">
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            All Transactions
          </button>
          <button className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>
            Pending Vendor Payouts <span className="badge">{pendingPayouts.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
            Vendor Ledger
          </button>
        </div>
        {activeTab !== 'ledger' && (
          <div className="payments-search-container">
            <FiSearch className="payments-search-icon" />
            <input
              type="text"
              className="payments-search-input"
              placeholder={activeTab === 'transactions' ? 'Search transactions...' : 'Search vendors or orders...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'transactions' && (
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Order ID</th><th>Party</th><th>Method</th><th>Status</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.date}</td>
                    <td>
                      <span className={`type-badge ${payment.type}`}>
                        {payment.type === 'incoming' ? '↓ Incoming' : '↑ Outgoing'}
                      </span>
                    </td>
                    <td>{payment.referenceId}</td>
                    <td>{payment.party}</td>
                    <td>{payment.method}</td>
                    <td><span className={`status-badge ${payment.status}`}>{payment.status}</span></td>
                    <td className={`amount-col ${payment.type === 'incoming' ? 'positive' : 'negative'}`}>
                      {payment.type === 'incoming' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="payments-empty-state">
                        <FiSearch size={32} />
                        <p>No transactions found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr><th>Vendor Order</th><th>Vendor Name</th><th>Order Date</th><th>Customer Status</th><th>Amount Owed</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredPendingPayouts.map(vo => (
                  <tr key={vo.id}>
                    <td>{vo.id}</td>
                    <td>{vo.vendorName}</td>
                    <td>{vo.date}</td>
                    <td><span className="status-badge completed"><FiCheckCircle style={{marginRight: '4px'}}/>Customer Paid</span></td>
                    <td className="amount-col">₹{vo.amount.toLocaleString()}</td>
                    <td>
                      <button className="btn-pay-action" onClick={() => handlePayVendorOrder(vo.id, vo.vendorName, vo.amount)}>
                        Pay Vendor
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPendingPayouts.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="payments-empty-state">
                        <FiCheckCircle size={32} />
                        <p>{searchQuery ? `No payouts found for "${searchQuery}".` : 'No pending payouts! All vendors are settled.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ledger' && (
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
                    onChange={e => setVendorSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="vendor-list-items">
                {filteredVendors.map(vendor => {
                  const orderCount = vendorOrders.filter(vo => vo.vendorName === vendor && !vo.vendorPaid).length;
                  return (
                    <div 
                      key={vendor} 
                      className={`vendor-list-item ${selectedVendor === vendor ? 'active' : ''}`}
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <div className="vendor-avatar" style={{ background: getVendorColor(vendor) }}>
                        {vendor.charAt(0)}
                      </div>
                      <div className="vendor-item-info">
                        <span className="vendor-item-name">{vendor}</span>
                        <span className="vendor-item-count">{orderCount} pending order{orderCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
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
                      <h2>{selectedVendor}</h2>
                      <span className="ledger-subtitle">Vendor Account & Settlement Overview</span>
                    </div>
                    <button className="btn-bulk-settle" onClick={() => handleBulkSettle(selectedVendor)}>
                      <FiCheckCircle size={16} /> Bulk Settle Balance
                    </button>
                  </div>
                  
                  <div className="ledger-summary">
                    <div className="ledger-stat">
                      <span>Total Pending (Customer Paid)</span>
                      <strong>₹{vendorOrders.filter(vo => vo.vendorName === selectedVendor && vo.customerPaid && !vo.vendorPaid).reduce((s, vo) => s + vo.amount, 0).toLocaleString()}</strong>
                    </div>
                    <div className="ledger-stat">
                      <span>Awaiting Customer Payment</span>
                      <strong style={{color: '#64748b'}}>₹{vendorOrders.filter(vo => vo.vendorName === selectedVendor && !vo.customerPaid && !vo.vendorPaid).reduce((s, vo) => s + vo.amount, 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  <h4 className="ledger-orders-title">Unpaid Orders</h4>
                  <div className="table-container">
                    <table className="payments-table">
                      <thead>
                        <tr><th>Order ID</th><th>Date</th><th>Customer Status</th><th>Amount</th></tr>
                      </thead>
                      <tbody>
                        {vendorOrders.filter(vo => vo.vendorName === selectedVendor && !vo.vendorPaid).map(vo => (
                          <tr key={vo.id}>
                            <td>{vo.id}</td>
                            <td>{vo.date}</td>
                            <td>
                              {vo.customerPaid ? 
                                <span className="status-badge completed">Ready to Pay</span> : 
                                <span className="status-badge pending">Awaiting Customer</span>
                              }
                            </td>
                            <td>₹{vo.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-ledger">
                  <FiUsers size={40} />
                  <p>Select a vendor from the list to view their ledger.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {paymentProofState.isOpen && (
        <div className="payment-modal-overlay" onClick={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}>
          <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h2>Upload Payment Proof</h2>
              <button className="btn-close" onClick={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}><FiX size={24} /></button>
            </div>
            <div className="payment-modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#475569' }}>
                    Paying <strong>{paymentProofState.vendorName}</strong>
                  </p>
                  <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ₹{paymentProofState.amount.toLocaleString()}
                  </p>
                  {paymentProofState.type === 'bulk' && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#10b981' }}>
                      Auto-generating separate payment records for each selected order.
                    </p>
                  )}
                </div>
                
                <label>Upload Screenshot / Receipt</label>
                <div 
                  onClick={() => document.getElementById('proof-upload-input')?.click()}
                  style={{ 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '32px', 
                    textAlign: 'center',
                    background: paymentProofState.fileName ? '#eff6ff' : '#f8fafc',
                    borderColor: paymentProofState.fileName ? '#3b82f6' : '#cbd5e1',
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
                        setPaymentProofState(prev => ({ ...prev, fileName: e.target.files![0].name }));
                      }
                    }}
                  />
                  {paymentProofState.fileName ? (
                    <>
                      <FiCheckCircle size={32} color="#3b82f6" style={{ marginBottom: '8px' }} />
                      <p style={{ color: '#1e293b', margin: 0, fontWeight: 500 }}>{paymentProofState.fileName}</p>
                      <p style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '4px' }}>Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#64748b', margin: 0 }}>Click to browse or drag and drop file here</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>PNG, JPG, PDF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Reference Note (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={paymentProofState.referenceNote} 
                  onChange={(e) => setPaymentProofState(prev => ({ ...prev, referenceNote: e.target.value }))} 
                />
              </div>
            </div>
            <div className="payment-modal-footer">
              <button className="btn-cancel" onClick={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
              <button className="btn-save" onClick={handleConfirmPayout}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
