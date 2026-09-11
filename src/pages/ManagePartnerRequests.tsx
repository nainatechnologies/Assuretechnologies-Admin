import { useState, useEffect, useCallback } from 'react';
import PartnerBookingTable from '../components/PartnerBookingTable';
import Pagination from '../components/Pagination';
import PartnerBookingDetailsModal from '../components/PartnerBookingDetailsModal';
import AssignPartnerModal from '../components/AssignPartnerModal';
import type { PartnerBooking } from '../types';
import API from '../services/api';
import './ManageServiceAssignments.css';

const TAB_STATUS_MAP: Record<string, string> = {
  assigned: 'ASSIGNED',
  inProgress: 'IN_PROGRESS',
  awaiting: 'AWAITING_APPROVAL',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const mapBackendToPartnerBooking = (b: any): PartnerBooking => {
  const customFields = b.metadata?.custom_field_responses || b.metadata?.custom_fields || b.metadata || {};
  
  let addressObj: any = {};
  let addressText = '';

  const rawAddress = b.address || b.Order?.customer_address || '';
  if (typeof rawAddress === 'string') {
    try {
      addressObj = JSON.parse(rawAddress);
      addressText = [addressObj.line1, addressObj.line2, addressObj.city, addressObj.state].filter(Boolean).join(', ');
    } catch {
      addressText = rawAddress;
    }
  } else if (typeof rawAddress === 'object' && rawAddress) {
    addressObj = rawAddress;
    addressText = [addressObj.line1, addressObj.line2, addressObj.city, addressObj.state].filter(Boolean).join(', ');
  }

  const village = customFields['Village'] || customFields['village'] || customFields['fld_5'] || addressObj.line1 || '';
  const mandal = customFields['Mandal'] || customFields['mandal'] || customFields['fld_4'] || addressObj.city || '';
  const district = customFields['District'] || customFields['district'] || customFields['fld_3'] || addressObj.state || '';
  const pincode = b.pincode || customFields['Pincode'] || customFields['fld_6'] || addressObj.pincode || 'N/A';

  const progressList = Array.isArray(b.progress_updates) ? b.progress_updates : [];
  const startUpdates = progressList.filter((p: any) => p.update_type === 'START');
  const completeUpdates = progressList.filter((p: any) => p.update_type === 'COMPLETE');

  let uiStatus: any = 'Assigned';
  if (b.status === 'ASSIGNED') uiStatus = 'Assigned';
  else if (b.status === 'IN_PROGRESS') uiStatus = 'In Progress';
  else if (b.status === 'AWAITING_APPROVAL') uiStatus = 'Awaiting Approval';
  else if (b.status === 'COMPLETED') uiStatus = 'Completed';
  else if (b.status === 'CANCELLED') uiStatus = 'Cancelled';
  else if (b.status === 'NEW') uiStatus = 'Pending';
  else if (b.status === 'ACCEPTED') uiStatus = 'Accepted';

  return {
    id: b.id,
    displayId: b.display_id || b.Order?.order_number || 'N/A',
    orderNumber: b.Order?.order_number || '',
    userId: b.Order?.customer_id || '',
    userName: b.Order?.customer_name || 'N/A',
    userMobile: b.Order?.customer_contact || 'N/A',
    surveyNumber: customFields['Survey Number'] || customFields['Survey No'] || customFields['Survey No.'] || customFields['Survey'] || customFields['fld_1'] || b.metadata?.fld_1 || 'N/A',
    district,
    mandal,
    village,
    pincode,
    fullAddress: addressText || [village, mandal, district].filter(Boolean).join(', '),
    equipmentType: b.Service?.name || 'Unknown',
    date: b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
    time: b.scheduled_time_slot || b.metadata?.scheduled_time_slot || b.metadata?.time_slot || (b.scheduled_date && !String(b.scheduled_date).includes('T00:00:00') ? new Date(b.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'),
    status: uiStatus,
    partnerId: b.assigned_partner_id,
    assignedPartner: b.assigned_partner ? {
      id: b.assigned_partner.id,
      display_id: b.assigned_partner.display_id,
      name: b.assigned_partner.full_name,
      mobile: b.assigned_partner.mobile,
      email: b.assigned_partner.email
    } : undefined,
    partnerType: b.Service?.name || 'Partner',
    pricingTypeId: b.Service?.pricing_type_id,
    quantity: b.quantity || 1,
    totalAmount: b.Order?.total_amount || 0,
    paymentStatus: b.Order?.payment_status === 'PAID' ? 'Paid' : 'Pending',
    cancelledBy: b.cancelled_by,
    cancellationReason: b.cancellation_reason,
    startWorkPhotos: startUpdates.flatMap((p: any) => p.photos || []),
    completeWorkPhotos: completeUpdates.flatMap((p: any) => p.photos || []),
    progressUpdates: progressList.map((p: any) => ({
      id: p.id,
      date: new Date(p.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      description: p.description,
      photos: Array.isArray(p.photos) ? p.photos : []
    })),
    customFieldResponses: customFields
  };
};

export default function ManagePartnerRequests() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'inProgress' | 'awaiting' | 'completed' | 'cancelled'>('assigned');
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PartnerBooking | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReassignBooking, setSelectedReassignBooking] = useState<PartnerBooking | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const backendStatus = TAB_STATUS_MAP[activeTab];
      const res = await API.get('/admin/service-bookings', {
        params: {
          owner_type: 'PARTNER',
          status: backendStatus,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }
      });

      if (res.data?.success) {
        const rawList = res.data.data?.data || res.data.data || [];
        const mapped = rawList.map(mapBackendToPartnerBooking);
        setBookings(mapped);
        setTotalPages(res.data.data?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to fetch partner requests:', err);
      setError(err.response?.data?.message || 'Failed to load partner requests');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleView = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setViewModalOpen(true);
    }
  };

  const handleReassign = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedReassignBooking(booking);
      setAssignModalOpen(true);
    }
  };

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    setSelectedReassignBooking(null);
    fetchBookings();
  };

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Partner Requests</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container overflow-x-auto">
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'inProgress' ? 'active' : ''}`}
            onClick={() => setActiveTab('inProgress')}
          >
            In Progress
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'awaiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('awaiting')}
          >
            Awaiting Approval
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading partner requests...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <PartnerBookingTable 
                bookings={bookings}
                viewType="requests"
                onView={handleView}
                onReassign={handleReassign}
              />
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {viewModalOpen && selectedBooking && (
        <PartnerBookingDetailsModal 
          booking={selectedBooking}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {assignModalOpen && selectedReassignBooking && (
        <AssignPartnerModal 
          booking={selectedReassignBooking}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedReassignBooking(null);
          }}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
