import { useState, useEffect, useMemo } from 'react';
import { 
  FiX, 
  FiArrowDownRight, 
  FiArrowUpRight, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiSearch, 
  FiUsers, 
  FiExternalLink,
  FiClock,
  FiPhone,
  FiCreditCard
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import API, { BASE_URL } from '../services/api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import { Toast, getErrorMessage } from '../utils/errorHandler';
import type { 
  PaymentSummary, 
  PaymentTransaction, 
  PendingVendorPayoutItem, 
  VendorLedgerItem 
} from '../types';
import './ManagePayments.css';

export default function ManagePayments() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'ledger'>('transactions');
  const [loading, setLoading] = useState<boolean>(true);
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Summary State
  const [summary, setSummary] = useState<PaymentSummary>({
    totalRevenue: 0,
    totalPayouts: 0,
    netBalance: 0,
    pendingPayoutsCount: 0,
    pendingPayoutAmount: 0
  });

  // Tab 1: All Transactions State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

  // Tab 2: Pending Payouts State
  const [pendingPayouts, setPendingPayouts] = useState<PendingVendorPayoutItem[]>([]);

  // Tab 3: Ledger State
  const [ledgerVendors, setLedgerVendors] = useState<VendorLedgerItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [vendorSearch, setVendorSearch] = useState<string>('');

  // Payment Proof Modal State
  const [paymentProofState, setPaymentProofState] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    vendorId: string;
    vendorName: string;
    itemIds: string[];
    amount: number;
    referenceNote: string;
    file: File | null;
    fileName?: string;
  }>({
    isOpen: false,
    type: 'single',
    vendorId: '',
    vendorName: '',
    itemIds: [],
    amount: 0,
    referenceNote: '',
    file: null,
    fileName: ''
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Tab or search changes
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'payouts') {
      fetchPendingPayouts();
    } else if (activeTab === 'ledger') {
      fetchLedger();
    }
  }, [activeTab, currentPage, debouncedSearch]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSummary(),
        fetchTransactions(),
        fetchPendingPayouts(),
        fetchLedger()
      ]);
    } catch (err) {
      console.error('Failed to load payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await API.get('/admin/payments/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching payment summary:', err);
    }
  };

  const fetchTransactions = async () => {
    setTabLoading(true);
    try {
      const res = await API.get(
        `/admin/payments/transactions?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}`
      );
      if (res.data.success) {
        setTransactions(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchPendingPayouts = async () => {
    setTabLoading(true);
    try {
      const res = await API.get(
        `/admin/payments/pending-payouts?search=${encodeURIComponent(debouncedSearch)}`
      );
      if (res.data.success) {
        setPendingPayouts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching pending payouts:', err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchLedger = async () => {
    setTabLoading(true);
    try {
      const res = await API.get(
        `/admin/payments/vendor-ledger?search=${encodeURIComponent(vendorSearch)}`
      );
      if (res.data.success) {
        const list: VendorLedgerItem[] = res.data.data || [];
        setLedgerVendors(list);
        if (list.length > 0 && !selectedVendorId) {
          setSelectedVendorId(list[0].vendorId);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor ledger:', err);
    } finally {
      setTabLoading(false);
    }
  };

  // Filtered vendors for ledger sidebar
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

  // Vendor avatar color helper
  const getVendorColor = (name: string) => {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handlePayVendorOrder = (item: PendingVendorPayoutItem) => {
    setPaymentProofState({
      isOpen: true,
      type: 'single',
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      itemIds: [item.id],
      amount: item.netPayable,
      referenceNote: `Payout for Order #${item.orderNumber}`,
      file: null,
      fileName: ''
    });
  };

  const handleBulkSettle = (vendor: VendorLedgerItem) => {
    const payableOrders = vendor.orders.filter(o => o.customerPaid);
    const totalAmount = vendor.totalPendingCustomerPaid;

    if (payableOrders.length === 0 || totalAmount <= 0) {
      Toast.fire({ 
        icon: 'info', 
        title: 'No payable orders available for this vendor where customer has already paid.' 
      });
      return;
    }

    setPaymentProofState({
      isOpen: true,
      type: 'bulk',
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      itemIds: payableOrders.map(o => o.id),
      amount: totalAmount,
      referenceNote: `Bulk settlement for ${payableOrders.length} orders`,
      file: null,
      fileName: ''
    });
  };

  const handleConfirmPayout = async () => {
    const { vendorId, vendorName, itemIds, amount, referenceNote, file } = paymentProofState;

    if (itemIds.length === 0) {
      Toast.fire({ icon: 'warning', title: 'No orders selected for settlement.' });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Vendor Settlement',
      text: `Are you sure you want to process this payment of ₹${amount.toLocaleString()} to ${vendorName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Confirm Payout'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('vendor_id', vendorId);
      formData.append('order_item_ids', JSON.stringify(itemIds));
      formData.append('amount', amount.toString());
      formData.append('payment_method', 'Bank Transfer');
      if (referenceNote) formData.append('transaction_reference', referenceNote);
      if (file) formData.append('proof_image', file);

      const response = await API.post('/admin/payments/payout', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Settlement Successful!',
          text: `Payment of ₹${amount.toLocaleString()} to ${vendorName} has been recorded.`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });

        setPaymentProofState(prev => ({ ...prev, isOpen: false }));
        fetchAllData();
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Settlement Failed',
        text: getErrorMessage(err),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="manage-payments-container">
      <div className="page-header">
        <h1>Manage Payments</h1>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon revenue"><FiArrowDownRight /></div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="amount">₹{summary.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon payouts"><FiArrowUpRight /></div>
          <div className="card-content">
            <h3>Total Payouts</h3>
            <p className="amount">₹{summary.totalPayouts.toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon balance"><FiTrendingUp /></div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="amount">₹{summary.netBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Tabs */}
      <div className="payments-toolbar">
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} 
            onClick={() => setActiveTab('transactions')}
          >
            All Transactions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} 
            onClick={() => setActiveTab('payouts')}
          >
            Pending Vendor Payouts <span className="badge">{summary.pendingPayoutsCount}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ledger')}
          >
            Vendor Ledger
          </button>
        </div>

        {activeTab !== 'ledger' && (
          <div className="payments-search-container">
            <FiSearch className="payments-search-icon" />
            <input
              type="text"
              className="payments-search-input"
              placeholder={activeTab === 'transactions' ? 'Search by Order ID, Party, or Razorpay ID...' : 'Search pending vendor orders...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {loading || tabLoading ? (
          <div style={{ padding: '60px 0' }}>
            <Loading />
          </div>
        ) : (
          <>
            {/* TAB 1: ALL TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Reference / Order ID</th>
                      <th>Party</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.date}</td>
                        <td>
                          <span className={`type-badge ${payment.type}`}>
                            {payment.type === 'incoming' ? '↓ Incoming' : '↑ Outgoing'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#1e293b' }}>{payment.referenceId}</strong>
                          {payment.notes && payment.notes !== payment.referenceId && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {payment.notes}
                            </div>
                          )}
                        </td>
                        <td>{payment.party}</td>
                        <td>{payment.method}</td>
                        <td>
                          <span className={`status-badge ${payment.status}`}>
                            {payment.status === 'completed' && <FiCheckCircle style={{ marginRight: '4px' }} />}
                            {payment.status}
                          </span>
                        </td>
                        <td className={`amount-col ${payment.type === 'incoming' ? 'positive' : 'negative'}`}>
                          {payment.type === 'incoming' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                        </td>
                        <td>
                          {payment.proof_image ? (
                            <a 
                              href={`${BASE_URL}${payment.proof_image}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', textDecoration: 'none' }}
                            >
                              <FiExternalLink /> View
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <div className="payments-empty-state">
                            <FiSearch size={32} />
                            <p>No transactions found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div style={{ marginTop: '20px' }}>
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={page => setCurrentPage(page)} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PENDING VENDOR PAYOUTS */}
            {activeTab === 'payouts' && (
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
                          <div><strong>₹{item.netPayable.toLocaleString()}</strong></div>
                          {item.adminCommission > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              (Subtotal: ₹{item.amount.toLocaleString()} - Comm: ₹{item.adminCommission.toLocaleString()})
                            </div>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn-pay-action" 
                            onClick={() => handlePayVendorOrder(item)}
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
            )}

            {/* TAB 3: VENDOR LEDGER */}
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
                    {filteredVendors.map(vendor => (
                      <div 
                        key={vendor.vendorId} 
                        className={`vendor-list-item ${selectedVendorId === vendor.vendorId ? 'active' : ''}`}
                        onClick={() => setSelectedVendorId(vendor.vendorId)}
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
                          onClick={() => handleBulkSettle(selectedVendor)}
                          disabled={selectedVendor.totalPendingCustomerPaid <= 0}
                          style={{ opacity: selectedVendor.totalPendingCustomerPaid <= 0 ? 0.6 : 1 }}
                        >
                          <FiCheckCircle size={16} /> Bulk Settle Balance (₹{selectedVendor.totalPendingCustomerPaid.toLocaleString()})
                        </button>
                      </div>
                      
                      <div className="ledger-summary">
                        <div className="ledger-stat">
                          <span>Total Ready to Pay (Customer Paid)</span>
                          <strong>₹{selectedVendor.totalPendingCustomerPaid.toLocaleString()}</strong>
                        </div>
                        <div className="ledger-stat">
                          <span>Awaiting Customer Payment</span>
                          <strong style={{ color: '#64748b' }}>
                            ₹{selectedVendor.totalPendingCustomerUnpaid.toLocaleString()}
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
                                  <td>₹{order.amount.toLocaleString()}</td>
                                  <td><strong>₹{net.toLocaleString()}</strong></td>
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
            )}
          </>
        )}
      </div>

      {/* Payment Proof & Payout Modal */}
      {paymentProofState.isOpen && (
        <div 
          className="payment-modal-overlay" 
          onClick={() => !submitting && setPaymentProofState(prev => ({ ...prev, isOpen: false }))}
        >
          <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h2>Record Vendor Payout</h2>
              <button 
                className="btn-close" 
                disabled={submitting}
                onClick={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}
              >
                <FiX size={24} />
              </button>
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
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>
                      ✓ Bulk settling {paymentProofState.itemIds.length} orders in a single transaction.
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
                    background: paymentProofState.fileName ? '#eff6ff' : '#f8fafc',
                    borderColor: paymentProofState.fileName ? '#4f46e5' : '#cbd5e1',
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
                        const file = e.target.files[0];
                        setPaymentProofState(prev => ({ 
                          ...prev, 
                          file, 
                          fileName: file.name 
                        }));
                      }
                    }}
                  />
                  {paymentProofState.fileName ? (
                    <>
                      <FiCheckCircle size={28} color="#4f46e5" style={{ marginBottom: '6px' }} />
                      <p style={{ color: '#1e293b', margin: 0, fontWeight: 500 }}>{paymentProofState.fileName}</p>
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
                  value={paymentProofState.referenceNote} 
                  onChange={(e) => setPaymentProofState(prev => ({ ...prev, referenceNote: e.target.value }))} 
                />
              </div>
            </div>
            <div className="payment-modal-footer">
              <button 
                className="btn-cancel" 
                disabled={submitting}
                onClick={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                disabled={submitting}
                onClick={handleConfirmPayout}
              >
                {submitting ? 'Processing Payout...' : 'Confirm Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
