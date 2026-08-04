import { useState, useEffect, useMemo } from 'react';
import PartnerBookingTable from '../components/PartnerBookingTable';
import Pagination from '../components/Pagination';
import AssignPartnerModal from '../components/AssignPartnerModal';
import PartnerBookingDetailsModal from '../components/PartnerBookingDetailsModal';
import type { PartnerBooking, DronePartner } from '../types';
import './ManageServiceAssignments.css'; // Reusing CSS
import Swal from 'sweetalert2';

// Mock Data
const MOCK_PARTNERS: DronePartner[] = [
  {
    id: 'DP1',
    name: 'AgriDrones AP',
    mobile: '9988776655',
    email: 'contact@agridrones.in',
    location: '522201, 522202, 500001',
    equipmentTypes: ['Standard Spray Drone (10L)', 'Heavy Lift (30L)'],
    status: 'Active',
    partnerType: 'Drone'
  },
  {
    id: 'DP2',
    name: 'Kisan Copters',
    mobile: '9876543210',
    email: 'info@kisancopters.in',
    location: '506001, 506015, 500001',
    equipmentTypes: ['High-Capacity Drone (20L)'],
    status: 'Active',
    partnerType: 'Drone'
  },
  {
    id: 'TP1',
    name: 'Rao Tractors',
    mobile: '9000112233',
    email: 'rao@tractors.in',
    location: '522201, 522202',
    equipmentTypes: ['Mini Tractor (Below 20 HP)', 'Tractor with Rotavator'],
    status: 'Active',
    partnerType: 'Tractor'
  }
];

const INITIAL_BOOKINGS: PartnerBooking[] = [
  {
    id: 'PB-101',
    userId: 'U1',
    userName: 'Rajesh Farmer',
    userMobile: '9988776655',
    surveyNumber: '123/A',
    district: 'Guntur',
    mandal: 'Tenali',
    village: 'Kolakaluru',
    pincode: '522201',
    equipmentType: 'Standard Spray Drone (10L)',
    date: '24 Jul 2026',
    time: '2 PM - 4 PM',
    status: 'Pending',
    partnerType: 'Drone'
  },
  {
    id: 'PB-102',
    userId: 'U3',
    userName: 'Subba Rao',
    userMobile: '9555443322',
    surveyNumber: '99/C',
    district: 'Guntur',
    mandal: 'Tenali',
    village: 'Kolakaluru',
    pincode: '522201',
    equipmentType: 'Tractor with Rotavator',
    date: '25 Jul 2026',
    time: '9 AM - 12 PM',
    status: 'Accepted',
    partnerType: 'Tractor'
  }
];

export default function ManagePartnerAssignments() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');
  const [bookings, setBookings] = useState<PartnerBooking[]>(INITIAL_BOOKINGS);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PartnerBooking | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      activeTab === 'pending' ? b.status === 'Pending' : b.status === 'Accepted'
    );
  }, [bookings, activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAccept = (id: string) => {
    Swal.fire({
      title: 'Accept Booking?',
      text: "Are you sure you want to accept this booking?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Accept'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(prev => prev.map(booking => 
          booking.id === id ? { ...booking, status: 'Accepted' } : booking
        ));
        Swal.fire('Accepted!', 'The booking has been accepted.', 'success');
      }
    });
  };

  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Reject Booking?',
      text: "Are you sure you want to reject this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(prev => prev.map(booking => 
          booking.id === id ? { ...booking, status: 'Cancelled' } : booking
        ));
        Swal.fire('Rejected!', 'The booking has been rejected.', 'success');
      }
    });
  };

  const openAssignModal = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setAssignModalOpen(true);
    }
  };

  const handleView = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setViewModalOpen(true);
    }
  };

  const handleAssign = (bookingId: string, partnerId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'Assigned', partnerId } : booking
    ));
    setAssignModalOpen(false);
    setSelectedBooking(null);
    Swal.fire('Assigned!', 'Partner has been assigned successfully.', 'success');
  };

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Partner Assignments</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button 
            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted (Assign Partner)
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'pending' && (
            <PartnerBookingTable 
              bookings={paginatedBookings}
              viewType="assignments-new"
              onAccept={handleAccept}
              onReject={handleReject}
              onView={handleView}
            />
          )}
          
          {activeTab === 'accepted' && (
            <PartnerBookingTable 
              bookings={paginatedBookings}
              viewType="assignments-accepted"
              onAssign={openAssignModal}
            />
          )}

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {assignModalOpen && selectedBooking && (
        <AssignPartnerModal 
          booking={selectedBooking}
          dronePartners={MOCK_PARTNERS.filter(p => p.partnerType === selectedBooking.partnerType || (!p.partnerType && selectedBooking.partnerType === 'Drone'))}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssign}
        />
      )}

      {viewModalOpen && selectedBooking && (
        <PartnerBookingDetailsModal 
          booking={selectedBooking}
          partner={selectedBooking.partnerId ? MOCK_PARTNERS.find(p => p.id === selectedBooking.partnerId) : undefined}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
}
