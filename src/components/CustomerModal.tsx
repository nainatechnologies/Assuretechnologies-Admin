import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MdClose, 
  MdPerson, 
  MdLocationOn, 
  MdShoppingBag, 
  MdEdit, 
  MdCheckCircle, 
  MdCancel, 
  MdErrorOutline,
  MdLock,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import type { Customer } from '../types';
import API from '../services/api';
import Loading from './Loading';
import './CustomerModal.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const customerEditSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name must contain only letters and spaces'),
  email: z
    .string()
    .refine(val => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid email address'
    }),
  fullAddress: z
    .string()
    .min(5, 'Primary address must be at least 5 characters'),
  stateName: z
    .string()
    .min(1, 'Please select a state'),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, 'Pincode must be a valid 6-digit postal code'),
  status: z.enum(['Active', 'Inactive'])
});

type CustomerEditFormValues = z.infer<typeof customerEditSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onUpdateSuccess: () => void;
  defaultTab?: 'overview' | 'addresses' | 'orders' | 'edit';
}

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  customer, 
  onUpdateSuccess, 
  defaultTab = 'overview' 
}: CustomerModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'orders' | 'edit'>(defaultTab);
  const [fullCustomer, setFullCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  // Orders pagination
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<CustomerEditFormValues>({
    resolver: zodResolver(customerEditSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      fullAddress: '',
      pincode: '',
      stateName: '',
      status: 'Active'
    }
  });

  useEffect(() => {
    setActiveTab(defaultTab);
    setOrdersPage(1);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (isOpen && customer?.id) {
      fetchCustomerDetails(customer.id);
    }
  }, [isOpen, customer?.id]);

  const fetchCustomerDetails = async (id: string) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await API.get(`/admin/customers/${id}`);
      if (response.data.success) {
        const c = response.data.data;
        const mapped: Customer = {
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
          ordersCount: c.ordersCount ?? c.order_count ?? (c.orders ? c.orders.length : (customer?.ordersCount || 0)),
          totalSpent: c.totalSpent ?? c.total_spent ?? (c.orders ? c.orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0) : (customer?.totalSpent || 0)),
          createdAt: c.createdAt,
          addresses: (c.addresses || []).map((a: any) => ({
            id: a.id,
            fullName: a.full_name,
            mobileNumber: a.mobile_number,
            pincode: a.pincode,
            addressLine1: a.address_line1,
            addressLine2: a.address_line2,
            landmark: a.landmark,
            city: a.city,
            state: a.state
          })),
          orders: c.orders || []
        };
        setFullCustomer(mapped);
        reset({
          fullName: mapped.fullName,
          email: mapped.email || '',
          fullAddress: mapped.fullAddress || '',
          pincode: mapped.pincode || '',
          stateName: mapped.stateName || '',
          status: mapped.status
        });
      }
    } catch (err: any) {
      console.error('Failed to load customer details:', err);
      setApiError('Could not load detailed profile information.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: CustomerEditFormValues) => {
    if (!fullCustomer) return;
    setSaving(true);
    setApiError('');

    try {
      const payload = {
        full_name: values.fullName.trim(),
        email: values.email?.trim() || null,
        full_address: values.fullAddress.trim(),
        pincode: values.pincode.trim(),
        state_name: values.stateName,
        is_active: values.status === 'Active'
      };

      const res = await API.put(`/admin/customers/${fullCustomer.id}`, payload);
      if (res.data.success) {
        onUpdateSuccess();
        fetchCustomerDetails(fullCustomer.id);
        setActiveTab('overview');
      }
    } catch (err: any) {
      console.error('Update customer error:', err);
      setApiError(err?.response?.data?.message || 'Failed to update customer profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const activeCustomer = fullCustomer || customer;
  const customerOrders = activeCustomer?.orders || [];
  const totalOrderPages = Math.ceil(customerOrders.length / ordersPerPage) || 1;
  const paginatedOrders = customerOrders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage
  );

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customer-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="customer-modal-title-wrap">
            <div className="customer-modal-pill">
              {activeCustomer?.display_id || 'CUSTOMER'}
            </div>
            <h2>{activeCustomer?.fullName || 'Customer Profile'}</h2>
            <span className={`status-badge ${activeCustomer?.status === 'Active' ? 'active' : 'inactive'}`}>
              {activeCustomer?.status}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="customer-modal-tabs">
          <button 
            className={`customer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <MdPerson /> Overview
          </button>
          <button 
            className={`customer-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MdLocationOn /> Addresses ({activeCustomer?.addresses?.length || 0})
          </button>
          <button 
            className={`customer-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setOrdersPage(1);
            }}
          >
            <MdShoppingBag /> Orders ({customerOrders.length || activeCustomer?.ordersCount || 0})
          </button>
          <button 
            className={`customer-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <MdEdit /> Edit Profile
          </button>
        </div>

        {/* Body */}
        <div className="modal-body scrollable-body">
          {loading ? (
            <Loading />
          ) : (
            <>
              {apiError && (
                <div className="customer-modal-error">
                  <MdErrorOutline size={20} />
                  <span>{apiError}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && activeCustomer && (
                <div className="customer-overview-grid">
                  <div className="overview-card">
                    <h3>Contact Information</h3>
                    <div className="overview-row">
                      <span className="overview-label">Full Name:</span>
                      <span className="overview-val font-semibold">{activeCustomer.fullName}</span>
                    </div>
                    <div className="overview-row">
                      <span className="overview-label">Mobile Number:</span>
                      <span className="overview-val">
                        {activeCustomer.mobile}
                        {activeCustomer.isMobileVerified ? (
                          <span className="verified-tag"><MdCheckCircle /> Verified</span>
                        ) : (
                          <span className="unverified-tag"><MdCancel /> Unverified</span>
                        )}
                      </span>
                    </div>
                    <div className="overview-row">
                      <span className="overview-label">Email Address:</span>
                      <span className="overview-val">{activeCustomer.email || 'None provided'}</span>
                    </div>
                    <div className="overview-row">
                      <span className="overview-label">Joined Platform:</span>
                      <span className="overview-val">
                        {activeCustomer.createdAt ? new Date(activeCustomer.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="overview-card">
                    <h3>Registered Primary Address</h3>
                    <div className="overview-row">
                      <span className="overview-label">Address:</span>
                      <span className="overview-val">{activeCustomer.fullAddress || 'N/A'}</span>
                    </div>
                    <div className="overview-row">
                      <span className="overview-label">State:</span>
                      <span className="overview-val">{activeCustomer.stateName || 'N/A'}</span>
                    </div>
                    <div className="overview-row">
                      <span className="overview-label">Pincode:</span>
                      <span className="overview-val font-mono">{activeCustomer.pincode || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="overview-card full-width">
                    <h3>Activity & Store Metrics</h3>
                    <div className="customer-metrics-row">
                      <div className="metric-box">
                        <span className="metric-num">{customerOrders.length || activeCustomer?.ordersCount || 0}</span>
                        <span className="metric-title">Total Orders</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-num text-success">
                          ₹{(activeCustomer.totalSpent || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="metric-title">Total Spend</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-num text-indigo">
                          {activeCustomer.addresses?.length || 0}
                        </span>
                        <span className="metric-title">Saved Addresses</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="customer-addresses-section">
                  {(!activeCustomer?.addresses || activeCustomer.addresses.length === 0) ? (
                    <div className="empty-substate">
                      <MdLocationOn size={36} color="#cbd5e1" />
                      <p>No additional delivery addresses saved by this customer.</p>
                      <small>Primary registration address: {activeCustomer?.fullAddress}, {activeCustomer?.stateName} - {activeCustomer?.pincode}</small>
                    </div>
                  ) : (
                    <div className="addresses-grid">
                      {activeCustomer.addresses.map((addr, idx) => (
                        <div className="address-card" key={addr.id || idx}>
                          <div className="address-card-header">
                            <span className="address-badge">Address #{idx + 1}</span>
                            <span className="address-name">{addr.fullName}</span>
                          </div>
                          <div className="address-phone">{addr.mobileNumber}</div>
                          <div className="address-lines">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            {addr.landmark && ` (Near ${addr.landmark})`}
                          </div>
                          <div className="address-city-state">
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ORDERS (With Clean Pagination) */}
              {activeTab === 'orders' && (
                <div className="customer-orders-section">
                  {customerOrders.length === 0 ? (
                    <div className="empty-substate">
                      <MdShoppingBag size={36} color="#cbd5e1" />
                      <p>No orders placed yet by this customer.</p>
                    </div>
                  ) : (
                    <div className="orders-tab-wrapper">
                      <div className="orders-mini-table-wrapper">
                        <table className="mini-table">
                          <thead>
                            <tr>
                              <th>Order #</th>
                              <th>Date</th>
                              <th>Total Amount</th>
                              <th>Payment</th>
                              <th>Order Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedOrders.map((ord: any) => (
                              <tr key={ord.id}>
                                <td>
                                  <span className="font-mono text-indigo font-bold">
                                    {ord.order_number}
                                  </span>
                                </td>
                                <td>
                                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="font-semibold">
                                  ₹{parseFloat(ord.total_amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td>
                                  <span className={`mini-badge ${ord.payment_status === 'PAID' ? 'paid' : 'pending'}`}>
                                    {ord.payment_status || 'PENDING'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`mini-badge status-${(ord.status || 'NEW').toLowerCase()}`}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mini Pagination Bar */}
                      {customerOrders.length > ordersPerPage && (
                        <div className="modal-pagination">
                          <span className="modal-pagination-info">
                            Showing <strong>{((ordersPage - 1) * ordersPerPage) + 1}–{Math.min(ordersPage * ordersPerPage, customerOrders.length)}</strong> of <strong>{customerOrders.length}</strong> orders
                          </span>
                          <div className="modal-pagination-controls">
                            <button 
                              type="button"
                              className="modal-page-nav-btn" 
                              disabled={ordersPage === 1}
                              onClick={() => setOrdersPage(prev => Math.max(1, prev - 1))}
                              title="Previous Page"
                            >
                              <MdChevronLeft size={18} />
                            </button>
                            {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                type="button"
                                className={`modal-page-num ${ordersPage === page ? 'active' : ''}`}
                                onClick={() => setOrdersPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                            <button 
                              type="button"
                              className="modal-page-nav-btn" 
                              disabled={ordersPage === totalOrderPages}
                              onClick={() => setOrdersPage(prev => Math.min(totalOrderPages, prev + 1))}
                              title="Next Page"
                            >
                              <MdChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EDIT PROFILE (React Hook Form + Zod) */}
              {activeTab === 'edit' && (
                <form onSubmit={handleSubmit(onSubmit)} className="customer-edit-form" noValidate>
                  <div className="form-grid">
                    {/* Full Name */}
                    <div className="form-group">
                      <label htmlFor="fullName">
                        Full Name <span className="required-star">*</span>
                      </label>
                      <input 
                        id="fullName"
                        type="text" 
                        placeholder="e.g. Rahul Sharma"
                        className={`form-control ${errors.fullName ? 'input-error' : ''}`}
                        {...register('fullName')}
                      />
                      {errors.fullName && (
                        <span className="error-text">
                          <MdErrorOutline size={14} /> {errors.fullName.message}
                        </span>
                      )}
                    </div>

                    {/* Mobile (Read-Only) */}
                    <div className="form-group">
                      <label htmlFor="mobileNumber">
                        Mobile Number <span className="readonly-tag"><MdLock size={12} /> Read-Only</span>
                      </label>
                      <input 
                        id="mobileNumber"
                        type="text" 
                        value={activeCustomer?.mobile || ''}
                        disabled
                        className="form-control input-disabled"
                      />
                      <span className="helper-text">Phone is the primary account identifier</span>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input 
                        id="email"
                        type="email" 
                        placeholder="customer@example.com"
                        className={`form-control ${errors.email ? 'input-error' : ''}`}
                        {...register('email')}
                      />
                      {errors.email && (
                        <span className="error-text">
                          <MdErrorOutline size={14} /> {errors.email.message}
                        </span>
                      )}
                    </div>

                    {/* Account Status */}
                    <div className="form-group">
                      <label htmlFor="status">Account Status</label>
                      <select 
                        id="status"
                        className="form-control"
                        {...register('status')}
                      >
                        <option value="Active">🟢 Active (Access granted)</option>
                        <option value="Inactive">🔴 Inactive / Blocked</option>
                      </select>
                    </div>

                    {/* Full Address */}
                    <div className="form-group full-width">
                      <label htmlFor="fullAddress">
                        Primary Full Address <span className="required-star">*</span>
                      </label>
                      <textarea 
                        id="fullAddress"
                        rows={3}
                        placeholder="Door / Flat No, Street, Landmark..."
                        className={`form-control ${errors.fullAddress ? 'input-error' : ''}`}
                        {...register('fullAddress')}
                      />
                      {errors.fullAddress && (
                        <span className="error-text">
                          <MdErrorOutline size={14} /> {errors.fullAddress.message}
                        </span>
                      )}
                    </div>

                    {/* State */}
                    <div className="form-group">
                      <label htmlFor="stateName">
                        State <span className="required-star">*</span>
                      </label>
                      <select 
                        id="stateName"
                        className={`form-control ${errors.stateName ? 'input-error' : ''}`}
                        {...register('stateName')}
                      >
                        <option value="">-- Select State --</option>
                        {INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      {errors.stateName && (
                        <span className="error-text">
                          <MdErrorOutline size={14} /> {errors.stateName.message}
                        </span>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="form-group">
                      <label htmlFor="pincode">
                        Pincode <span className="required-star">*</span>
                      </label>
                      <input 
                        id="pincode"
                        type="text" 
                        maxLength={6}
                        placeholder="6-digit PIN code"
                        className={`form-control ${errors.pincode ? 'input-error' : ''}`}
                        {...register('pincode')}
                      />
                      {errors.pincode && (
                        <span className="error-text">
                          <MdErrorOutline size={14} /> {errors.pincode.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="modal-actions-bar">
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={() => setActiveTab('overview')}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-save" 
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
