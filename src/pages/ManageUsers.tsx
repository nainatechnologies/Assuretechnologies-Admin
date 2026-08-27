import { useState, useEffect } from 'react';
import { MdSearch, MdPeople, MdCheckCircle, MdBlock, MdRefresh, MdShoppingBag } from 'react-icons/md';
import type { Customer } from '../types';
import CustomerTable from '../components/CustomerTable';
import CustomerModal from '../components/CustomerModal';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import API from '../services/api';
import './ManageUsers.css';

export default function ManageUsers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [modalTab, setModalTab] = useState<'overview' | 'addresses' | 'orders' | 'edit'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/customers?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}`);
      if (response.data.success) {
        const mappedCustomers: Customer[] = response.data.data.map((c: any) => ({
          id: c.id,
          display_id: c.display_id,
          fullName: c.full_name,
          mobile: c.mobile,
          email: c.email || '',
          fullAddress: c.full_address || '',
          pincode: c.pincode || '',
          stateName: c.state_name || '',
          isMobileVerified: c.is_mobile_verified,
          status: c.is_active ? 'Active' : 'Inactive',
          ordersCount: c.ordersCount || 0,
          totalSpent: c.totalSpent || 0,
          createdAt: c.createdAt,
          addresses: c.addresses || [],
          orders: c.orders || []
        }));
        setCustomers(mappedCustomers);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || 0);
        } else {
          setTotalPages(1);
          setTotalItems(mappedCustomers.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      Swal.fire('Error', 'Failed to load customers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, debouncedSearch]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalTab('overview');
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalTab('edit');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isActivating = currentStatus !== 'Active';
    const actionText = isActivating ? 'Activate' : 'Deactivate / Block';
    const confirmColor = isActivating ? '#16a34a' : '#ef4444';

    const result = await Swal.fire({
      title: `${actionText} User?`,
      text: isActivating 
        ? 'This will enable the customer to log in, make purchases, and access their account.'
        : 'This customer will be prevented from logging in or placing new orders.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText}`
    });

    if (result.isConfirmed) {
      try {
        const response = await API.patch(`/admin/customers/${id}/status`, {
          is_active: isActivating
        });

        if (response.data.success) {
          setCustomers(prev => prev.map(c => 
            c.id === id ? { ...c, status: isActivating ? 'Active' : 'Inactive' } : c
          ));
          Swal.fire({
            title: 'Updated!',
            text: `Customer is now ${isActivating ? 'Active' : 'Inactive'}.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (err: any) {
        console.error('Toggle status error:', err);
        Swal.fire('Error', err?.response?.data?.message || 'Failed to update status', 'error');
      }
    }
  };

  // Metrics calculation
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;
  const totalOrdersSum = customers.reduce((sum, c) => sum + (c.ordersCount || 0), 0);

  return (
    <div className="manage-users-container">
      {/* Page Header */}
      <div className="manage-users-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Directory of registered store customers, profiles, delivery addresses, and orders.</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchCustomers} title="Refresh Table">
            <MdRefresh size={20} />
          </button>
          <div className="search-wrapper">
            <MdSearch className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search name, mobile, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="users-metrics-grid">
        <div className="user-metric-card">
          <div className="metric-icon-wrap icon-primary">
            <MdPeople size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Customers</span>
            <span className="metric-value">{totalItems}</span>
          </div>
        </div>

        <div className="user-metric-card">
          <div className="metric-icon-wrap icon-success">
            <MdCheckCircle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Users</span>
            <span className="metric-value text-success">{activeCount}</span>
          </div>
        </div>

        <div className="user-metric-card">
          <div className="metric-icon-wrap icon-danger">
            <MdBlock size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Blocked / Inactive</span>
            <span className="metric-value text-danger">{inactiveCount}</span>
          </div>
        </div>

        <div className="user-metric-card">
          <div className="metric-icon-wrap icon-indigo">
            <MdShoppingBag size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value text-indigo">{totalOrdersSum}</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay or Table */}
      {loading ? (
        <Loading />
      ) : (
        <CustomerTable 
          customers={customers}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        defaultTab={modalTab}
        onUpdateSuccess={() => {
          fetchCustomers();
          Swal.fire({
            title: 'Saved!',
            text: 'Customer profile updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }}
      />
    </div>
  );
}
