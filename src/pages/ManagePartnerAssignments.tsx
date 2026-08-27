import { useCallback } from 'react';
import PartnerBookingTable from '../components/PartnerBookingTable';
import Pagination from '../components/Pagination';
import AssignPartnerModal from '../components/AssignPartnerModal';
import PartnerBookingDetailsModal from '../components/PartnerBookingDetailsModal';
import type { PartnerBooking } from '../types';
import useAssignmentPage from '../hooks/useAssignmentPage';
import './ManageServiceAssignments.css';

const mapPartnerBooking = (b: any): PartnerBooking => ({
  id: b.id,
  displayId: b.Order?.order_number || 'N/A',
  userId: b.Order?.customer_id || '',
  userName: b.Order?.customer_name || 'N/A',
  userMobile: b.Order?.customer_contact || 'N/A',
  surveyNumber: b.metadata?.fld_1 || 'N/A',
  district: b.metadata?.fld_3 || 'N/A',
  mandal: b.metadata?.fld_4 || 'N/A',
  village: b.metadata?.fld_5 || 'N/A',
  pincode: b.pincode || 'N/A',
  equipmentType: b.Service?.name || 'Unknown',
  date: b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
  time: b.scheduled_date ? new Date(b.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
  status: b.status,
  partnerId: b.assigned_partner_id,
  totalAmount: b.Order?.total_amount || 0,
});

export default function ManagePartnerAssignments() {
  const mapBooking = useCallback(mapPartnerBooking, []);

  const {
    statuses, activeTab, setActiveTab,
    items: bookings, currentPage, totalPages, setCurrentPage,
    assignModalOpen, viewModalOpen, selectedItem,
    handleAccept, handleReject, openAssignModal, handleView,
    handleAssignSuccess, closeAssignModal, closeViewModal,
  } = useAssignmentPage<PartnerBooking>({
    ownerType: 'PARTNER',
    mapBooking,
    entityLabel: 'booking',
    assigneeLabel: 'Partner',
  });

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Partner Assignments</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container">
          {statuses.map(status => {
            let label = status.replace('_', ' ');
            if (status === 'NEW') label = 'Pending Requests';
            if (status === 'ACCEPTED') label = 'Accepted (Assign Partner)';
            
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
          <PartnerBookingTable 
            bookings={bookings}
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
        <AssignPartnerModal 
          booking={selectedItem}
          onClose={closeAssignModal}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {viewModalOpen && selectedItem && (
        <PartnerBookingDetailsModal 
          booking={selectedItem}
          partner={undefined}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
}
