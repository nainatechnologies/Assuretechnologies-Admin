import { useCallback } from 'react';
import ServiceRequestTable from '../components/ServiceRequestTable';
import Pagination from '../components/Pagination';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import ServiceRequestDetailsModal from '../components/ServiceRequestDetailsModal';
import type { ServiceRequest } from '../types';
import useAssignmentPage from '../hooks/useAssignmentPage';
import './ManageServiceAssignments.css';

const mapServiceBooking = (b: any): ServiceRequest => {
  let parsedAddress = 'N/A';
  let pincode = '';
  if (b.address) {
    try {
      const obj = typeof b.address === 'string' ? JSON.parse(b.address) : b.address;
      parsedAddress = [obj.line1, obj.line2, obj.city, obj.state, obj.pincode].filter(Boolean).join(', ');
      pincode = obj.pincode || b.pincode;
    } catch (e) {
      parsedAddress = String(b.address);
      pincode = b.pincode;
    }
  } else {
    pincode = b.pincode;
  }

  return {
    id: b.id,
    displayId: b.Order?.order_number || 'N/A',
    userId: b.Order?.customer_id || '',
    userName: b.Order?.customer_name || 'N/A',
    userMobile: b.Order?.customer_contact || 'N/A',
    userEmail: b.Order?.customer?.email || 'N/A',
    userAddress: parsedAddress,
    pincode,
    serviceName: b.Service?.name || 'Unknown',
    date: b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
    time: b.scheduled_date ? new Date(b.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    status: b.status,
    technicianId: b.assigned_technician_id,
    paymentStatus: b.Order?.payment_status === 'PAID' ? 'Paid in Full' : (b.prebooking_paid ? 'Prebooking Paid' : 'Pending'),
    prebookingAmountPaid: b.prebooking_paid ? Number(b.Service?.prebooking_charge || 0) : 0,
    razorpayPaymentId: b.Order?.razorpay_payment_id || undefined,
    paymentMethod: b.Order?.payment_method || (b.Order?.payment_status === 'PAID' ? 'Online' : undefined),
    paymentDetails: b.Order?.payment_details || undefined,
    paidAt: b.Order?.paid_at ? new Date(b.Order.paid_at).toLocaleString() : undefined
  };
};

export default function ManageServiceAssignments() {
  const mapBooking = useCallback(mapServiceBooking, []);

  const {
    statuses, activeTab, setActiveTab,
    items: requests, currentPage, totalPages, setCurrentPage,
    assignModalOpen, viewModalOpen, selectedItem,
    handleAccept, handleReject, openAssignModal, handleView,
    handleAssignSuccess, closeAssignModal, closeViewModal,
  } = useAssignmentPage<ServiceRequest>({
    ownerType: 'ADMIN',
    mapBooking,
    entityLabel: 'request',
    assigneeLabel: 'Technician',
  });

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Service Assignments</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container">
          {statuses.map(status => {
            let label = status.replace('_', ' ');
            if (status === 'NEW') label = 'Pending Requests';
            if (status === 'ACCEPTED') label = 'Accepted (Assign Technician)';
            
            return (
              <button 
                key={status}
                className={`tab-btn ${activeTab === status ? 'active' : ''}`}
                onClick={() => setActiveTab(status)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="tab-content">
          <ServiceRequestTable 
            requests={requests}
            viewType={['NEW'].includes(activeTab) ? "assignments-new" : "assignments-accepted"}
            onAccept={handleAccept}
            onReject={handleReject}
            onView={handleView}
            onAssign={openAssignModal}
          />

          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {assignModalOpen && selectedItem && (
        <AssignTechnicianModal 
          request={selectedItem}
          onClose={closeAssignModal}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {viewModalOpen && selectedItem && (
        <ServiceRequestDetailsModal 
          request={selectedItem}
          technician={undefined}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
}
