import { useState, useEffect } from 'react';
import { 
  FiArrowDownRight, 
  FiArrowUpRight, 
  FiTrendingUp, 
  FiSearch 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import API from '../services/api';
import Loading from '../components/Loading';
import { Toast, getErrorMessage } from '../utils/errorHandler';
import type { 
  PaymentSummary, 
  PaymentTransaction, 
  PendingVendorPayoutItem, 
  VendorLedgerItem 
} from '../types';
import { TransactionsTab } from './payments/TransactionsTab';
import { PayoutsTab } from './payments/PayoutsTab';
import { PayoutProofModal, type PaymentProofState } from './payments/PayoutProofModal';
import { LedgerTab } from './payments/LedgerTab';
import { RefundsTab } from './payments/RefundsTab';
import './ManagePayments.css';

export default function ManagePayments() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'ledger' | 'refunds'>('transactions');
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

  // Tab 4: Refunds State
  const [refunds, setRefunds] = useState<any[]>([]);
  const [refundFilter, setRefundFilter] = useState<string>('ALL');
  const [refundPage, setRefundPage] = useState<number>(1);
  const [refundTotalPages, setRefundTotalPages] = useState<number>(1);
  const [pendingRefundsCount, setPendingRefundsCount] = useState<number>(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [vendorSearch, setVendorSearch] = useState<string>('');

  // Payment Proof Modal State
  const [paymentProofState, setPaymentProofState] = useState<PaymentProofState>({
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
    } else if (activeTab === 'refunds') {
      fetchRefunds();
    }
  }, [activeTab, currentPage, debouncedSearch, refundFilter, refundPage]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSummary(),
        fetchTransactions(),
        fetchPendingPayouts(),
        fetchLedger(),
        fetchRefunds()
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
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        const totalRevenue = d.totalRevenue ?? d.inflow?.totalCustomerPaid ?? 0;
        const totalPayouts = d.totalPayouts ?? d.outflow?.totalVendorSettled ?? 0;
        const netBalance = d.netBalance ?? (totalRevenue - totalPayouts);
        const pendingPayoutsCount = d.pendingPayoutsCount ?? d.pending?.pendingItemsCount ?? 0;
        const pendingPayoutAmount = d.pendingPayoutAmount ?? d.pending?.totalPendingVendorPayout ?? 0;

        setSummary({
          totalRevenue,
          totalPayouts,
          netBalance,
          pendingPayoutsCount,
          pendingPayoutAmount
        });
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

  const fetchRefunds = async () => {
    setTabLoading(true);
    try {
      const res = await API.get('/admin/refunds', {
        params: {
          page: refundPage,
          limit: itemsPerPage,
          status: refundFilter,
          search: debouncedSearch || undefined
        }
      });
      const list = res.data?.refunds || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setRefunds(list);
      if (res.data?.pagination) {
        setRefundTotalPages(res.data.pagination.totalPages || 1);
      }
      
      // Update pending count
      const pendingCount = list.filter((r: any) => r.refund_status === 'REQUESTED' || r.payment_status === 'REFUND_PENDING').length;
      setPendingRefundsCount(pendingCount);
    } catch (err: any) {
      console.error('Failed to fetch refunds:', err);
      Toast.fire({ icon: 'error', title: 'Failed to load refunds: ' + getErrorMessage(err) });
    } finally {
      setTabLoading(false);
    }
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
            <p className="amount">₹{(summary?.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon payouts"><FiArrowUpRight /></div>
          <div className="card-content">
            <h3>Total Payouts</h3>
            <p className="amount">₹{(summary?.totalPayouts || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon balance"><FiTrendingUp /></div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="amount">₹{(summary?.netBalance || 0).toLocaleString()}</p>
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
            Pending Vendor Payouts <span className="badge">{summary?.pendingPayoutsCount || 0}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ledger')}
          >
            Vendor Ledger
          </button>
          <button 
            className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`} 
            onClick={() => setActiveTab('refunds')}
          >
            Customer Refunds {pendingRefundsCount > 0 && <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff' }}>{pendingRefundsCount}</span>}
          </button>
        </div>

        {activeTab !== 'ledger' && (
          <div className="payments-search-container">
            <FiSearch className="payments-search-icon" />
            <input
              type="text"
              className="payments-search-input"
              placeholder={activeTab === 'transactions' ? 'Search by Order ID, Party, or Razorpay ID...' : activeTab === 'refunds' ? 'Search refunds by order, customer...' : 'Search pending vendor orders...'}
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
            {activeTab === 'transactions' && (
              <TransactionsTab
                transactions={transactions}
                searchQuery={debouncedSearch}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => setCurrentPage(page)}
              />
            )}

            {activeTab === 'payouts' && (
              <PayoutsTab
                pendingPayouts={pendingPayouts}
                searchQuery={debouncedSearch}
                onPayVendorOrder={handlePayVendorOrder}
              />
            )}

            {activeTab === 'ledger' && (
              <LedgerTab
                ledgerVendors={ledgerVendors}
                selectedVendorId={selectedVendorId}
                onSelectVendor={id => setSelectedVendorId(id)}
                vendorSearch={vendorSearch}
                onVendorSearchChange={setVendorSearch}
                onBulkSettle={handleBulkSettle}
              />
            )}
          </>
        )}
      </div>

      {/* Customer Refunds Tab */}
      {activeTab === 'refunds' && (
        <RefundsTab
          refunds={refunds}
          refundFilter={refundFilter}
          onFilterChange={filter => { setRefundFilter(filter); setRefundPage(1); }}
          refundPage={refundPage}
          refundTotalPages={refundTotalPages}
          onPageChange={page => setRefundPage(page)}
          tabLoading={tabLoading}
          onRefundProcessed={() => { fetchRefunds(); fetchSummary(); }}
        />
      )}

      {/* Payment Proof & Payout Modal */}
      <PayoutProofModal
        state={paymentProofState}
        submitting={submitting}
        onClose={() => setPaymentProofState(prev => ({ ...prev, isOpen: false }))}
        onFileSelect={file => setPaymentProofState(prev => ({ ...prev, file, fileName: file.name }))}
        onChangeReferenceNote={note => setPaymentProofState(prev => ({ ...prev, referenceNote: note }))}
        onConfirm={handleConfirmPayout}
      />
    </div>
  );
}
