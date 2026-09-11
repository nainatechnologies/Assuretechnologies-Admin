import { useState, useEffect, useCallback } from 'react';
import ServiceRequestTable from '../components/ServiceRequestTable';
import Pagination from '../components/Pagination';
import ServiceRequestDetailsModal from '../components/ServiceRequestDetailsModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import type { ServiceRequest, ServiceRequestStatus } from '../types';
import API from '../services/api';
import Swal from 'sweetalert2';
import './ManageServiceAssignments.css';

export default function ManageServiceRequests() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'inProgress' | 'awaiting' | 'completed' | 'cancelled'>('assigned');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReassignId, setSelectedReassignId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let backendStatus = 'ASSIGNED';
      if (activeTab === 'assigned') backendStatus = 'ASSIGNED';
      else if (activeTab === 'inProgress') backendStatus = 'IN_PROGRESS';
      else if (activeTab === 'awaiting') backendStatus = 'AWAITING_APPROVAL';
      else if (activeTab === 'completed') backendStatus = 'COMPLETED';
      else if (activeTab === 'cancelled') backendStatus = 'CANCELLED';

      const response = await API.get(`/admin/service-bookings?status=${backendStatus}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      if (response.data && response.data.success) {
        const payload = response.data.data;
        const rawData = Array.isArray(payload) ? payload : (payload?.data || []);
        const totalP = payload?.totalPages || 1;
        setTotalPages(totalP);

        const mapped: ServiceRequest[] = rawData.map((raw: any) => {
          let status: ServiceRequestStatus = 'Assigned';
          if (raw.status === 'NEW' || raw.status === 'ACCEPTED') status = 'Pending';
          else if (raw.status === 'ASSIGNED') status = 'Assigned';
          else if (raw.status === 'IN_PROGRESS') status = 'In Progress';
          else if (raw.status === 'AWAITING_APPROVAL') status = 'Awaiting Approval';
          else if (raw.status === 'COMPLETED') status = 'Completed';
          else if (raw.status === 'CANCELLED') status = 'Cancelled';

          let formattedAddress = 'Address not provided';
          if (raw.address) {
            try {
              const parsed = typeof raw.address === 'string' ? JSON.parse(raw.address) : raw.address;
              const parts = [parsed.line1, parsed.line2, parsed.city, parsed.state, parsed.country].filter(Boolean);
              if (parts.length > 0) {
                formattedAddress = parts.join(', ');
              } else {
                formattedAddress = typeof raw.address === 'string' ? raw.address : JSON.stringify(raw.address);
              }
            } catch (e) {
              formattedAddress = raw.address;
            }
          }

          let formattedDate = 'N/A';
          if (raw.scheduled_date) {
            const d = new Date(raw.scheduled_date);
            formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          }

          let paymentStatus: 'Prebooking Paid' | 'Pending' | 'Paid in Full' = 'Pending';
          if (raw.prebooking_paid || raw.Order?.payment_status === 'PAID') {
            if (raw.Service?.prebooking_charge && Number(raw.Service.prebooking_charge) > 0 && !raw.Service?.price) {
              paymentStatus = 'Prebooking Paid';
            } else {
              paymentStatus = 'Paid in Full';
            }
          }

          const startPhotos = raw.progress_updates
            ? raw.progress_updates.filter((p: any) => p.update_type === 'START').flatMap((p: any) => p.photos || [])
            : [];

          const completePhotos = raw.progress_updates
            ? raw.progress_updates.filter((p: any) => p.update_type === 'COMPLETE').flatMap((p: any) => p.photos || [])
            : [];

          const mappedProgress = raw.progress_updates ? raw.progress_updates.map((p: any) => ({
            id: p.id,
            date: new Date(p.createdAt).toLocaleString(),
            description: p.description,
            photos: p.photos || []
          })) : [];

          return {
            id: raw.id,
            displayId: raw.display_id || raw.id,
            userId: raw.Order?.customer_id || 'U1',
            userName: raw.Order?.customer_name || 'Customer',
            userMobile: raw.Order?.customer_contact || 'N/A',
            userEmail: raw.Order?.customer?.email || 'N/A',
            userAddress: formattedAddress,
            pincode: raw.pincode || '',
            serviceName: raw.Service?.name || 'Service Request',
            date: formattedDate,
            time: raw.scheduled_time_slot || raw.metadata?.scheduled_time_slot || raw.metadata?.time_slot || (raw.scheduled_date && !String(raw.scheduled_date).includes('T00:00:00') ? new Date(raw.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'),
            status: status,
            technicianId: raw.assigned_technician_id || undefined,
            technician: raw.assigned_technician ? {
              id: raw.assigned_technician.id,
              name: raw.assigned_technician.full_name || raw.assigned_technician.name || 'Technician',
              mobile: raw.assigned_technician.mobile,
              email: raw.assigned_technician.email,
              address: '',
              location: '',
              status: 'Active'
            } : undefined,
            paymentStatus: paymentStatus,
            prebookingAmountPaid: (raw.prebooking_paid || raw.Order?.payment_status === 'PAID') ? Number(raw.Order?.total_amount || raw.Service?.prebooking_charge || 0) : 0,
            razorpayPaymentId: raw.Order?.razorpay_payment_id || undefined,
            paymentMethod: raw.Order?.payment_method || (raw.Order?.payment_status === 'PAID' ? 'Online' : undefined),
            paymentDetails: raw.Order?.payment_details || undefined,
            paidAt: raw.Order?.paid_at ? new Date(raw.Order.paid_at).toLocaleString() : (raw.Order?.payment_status === 'PAID' ? new Date(raw.Order.updatedAt || raw.Order.createdAt).toLocaleString() : undefined),
            customFieldResponses: raw.metadata?.custom_field_responses || raw.metadata?.custom_fields || raw.metadata || {},
            startWorkPhotos: startPhotos,
            completeWorkPhotos: completePhotos,
            progressUpdates: mappedProgress
          };
        });
        setRequests(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleTabClick = (tab: 'assigned' | 'inProgress' | 'awaiting' | 'completed' | 'cancelled') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleView = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setSelectedRequest(request);
      setViewModalOpen(true);
    }
  };


  const handleMarkAsPaid = (id: string) => {
    Swal.fire({
      title: 'Approve & Mark as Completed?',
      text: "Do you want to approve this completed service and mark it complete?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Approve'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.patch(`/admin/service-bookings/${id}/status`, { status: 'COMPLETED' });
          await fetchRequests();
          if (selectedRequest?.id === id) {
            setViewModalOpen(false);
          }
          Swal.fire('Success', 'Service marked as Completed.', 'success');
        } catch (err: any) {
          Swal.fire('Error', err.response?.data?.message || 'Failed to update status', 'error');
        }
      }
    });
  };

  const handleReassign = (id: string) => {
    setSelectedReassignId(id);
    setAssignModalOpen(true);
  };

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Service Requests</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container overflow-x-auto">
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => handleTabClick('assigned')}
          >
            Assigned
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'inProgress' ? 'active' : ''}`}
            onClick={() => handleTabClick('inProgress')}
          >
            In Progress
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'awaiting' ? 'active' : ''}`}
            onClick={() => handleTabClick('awaiting')}
          >
            Awaiting Approval
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabClick('completed')}
          >
            Completed
          </button>
          <button 
            className={`tab-btn whitespace-nowrap ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabClick('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading service requests...
            </div>
          ) : (
            <ServiceRequestTable 
              requests={requests}
              viewType="requests"
              onView={handleView}
              onReassign={handleReassign}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {viewModalOpen && selectedRequest && (
        <ServiceRequestDetailsModal 
          request={selectedRequest}
          technician={selectedRequest.technician}
          onClose={() => setViewModalOpen(false)}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}

      {assignModalOpen && selectedReassignId && (
        <AssignTechnicianModal 
          request={requests.find(r => r.id === selectedReassignId)!}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedReassignId(null);
          }}
          onAssignSuccess={() => {
            setAssignModalOpen(false);
            setSelectedReassignId(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}
