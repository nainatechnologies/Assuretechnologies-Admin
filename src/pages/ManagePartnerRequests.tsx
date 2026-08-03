import { useState, useEffect, useMemo } from 'react';
import PartnerBookingTable from '../components/PartnerBookingTable';
import Pagination from '../components/Pagination';
import PartnerBookingDetailsModal from '../components/PartnerBookingDetailsModal';
import AssignPartnerModal from '../components/AssignPartnerModal';
import type { PartnerBooking, DronePartner } from '../types';
import Swal from 'sweetalert2';
import './ManageServiceAssignments.css';

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
    id: 'PB-201',
    userId: 'U1',
    userName: 'admin',
    userMobile: '9988776655',
    surveyNumber: '123/A',
    district: 'Guntur',
    mandal: 'Tenali',
    village: 'Kolakaluru',
    pincode: '522201',
    equipmentType: 'Standard Spray Drone (10L)',
    date: '24 Jul 2026',
    time: '2 PM - 4 PM',
    status: 'Assigned',
    partnerId: 'DP1',
    partnerType: 'Drone'
  },
  {
    id: 'PB-202',
    userId: 'U2',
    userName: 'Venkatesh Marripelly',
    userMobile: '9701712335',
    surveyNumber: '45/B',
    district: 'Warangal',
    mandal: 'Hanamkonda',
    village: 'Bheemaram',
    pincode: '506015',
    equipmentType: 'High-Capacity Drone (20L)',
    date: '06 May 2026',
    time: '9 AM - 11 AM',
    status: 'Assigned',
    partnerId: 'DP2',
    partnerType: 'Drone',
    startWorkPhotos: ['https://placehold.co/1200x900/e2e8f0/64748b?text=Before+1', 'https://placehold.co/1200x900/e2e8f0/64748b?text=Before+2'],
    customFieldResponses: {
      'Crop Type': 'Paddy',
      'Acres': '5'
    },
    paymentStatus: 'Prebooking Paid',
    prebookingAmountPaid: 500
  },
  {
    id: 'PB-203',
    userId: 'U3',
    userName: 'siri',
    userMobile: '9505261283',
    surveyNumber: '67/D',
    district: 'Guntur',
    mandal: 'Tenali',
    village: 'Kolakaluru',
    pincode: '522201',
    equipmentType: 'Mini Tractor (Below 20 HP)',
    date: '10 Jan 2026',
    time: '2 PM - 4 PM',
    status: 'In Progress',
    partnerId: 'TP1',
    partnerType: 'Tractor',
    progressUpdates: [
      {
        id: 'PRG1',
        date: '2026-07-25 10:00:00',
        description: 'Arrived at the field, starting the plowing process.',
        photos: ['https://placehold.co/150x150/e2e8f0/64748b?text=Progress+1']
      }
    ]
  },
  {
    id: 'PB-204',
    userId: 'U4',
    userName: 'Ravi',
    userMobile: '9123456780',
    surveyNumber: '88/E',
    district: 'Hyderabad',
    mandal: 'Serilingampally',
    village: 'Kondapur',
    pincode: '500084',
    equipmentType: 'Standard Spray Drone (10L)',
    date: '20 Jul 2026',
    time: '10 AM - 12 PM',
    status: 'Completed',
    partnerId: 'DP1',
    partnerType: 'Drone',
    startWorkPhotos: ['https://placehold.co/1200x900/e2e8f0/64748b?text=Before+Work'],
    completeWorkPhotos: ['https://placehold.co/1200x900/10b981/ffffff?text=After+Work']
  }
];

export default function ManagePartnerRequests() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'inProgress' | 'awaiting' | 'completed' | 'cancelled'>('assigned');
  const [bookings, setBookings] = useState<PartnerBooking[]>(INITIAL_BOOKINGS);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PartnerBooking | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReassignId, setSelectedReassignId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredBookings = useMemo(() => {
    switch(activeTab) {
      case 'assigned': return bookings.filter(b => b.status === 'Assigned');
      case 'inProgress': return bookings.filter(b => b.status === 'In Progress');
      case 'awaiting': return bookings.filter(b => b.status === 'Awaiting Approval');
      case 'completed': return bookings.filter(b => b.status === 'Completed');
      case 'cancelled': return bookings.filter(b => b.status === 'Cancelled');
      default: return [];
    }
  }, [bookings, activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setViewModalOpen(true);
    }
  };

  const handleReassign = (id: string) => {
    setSelectedReassignId(id);
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = (bookingId: string, partnerId: string) => {
    if (selectedReassignId) {
      Swal.fire({
        title: 'Reassign Partner?',
        text: "Are you sure you want to reassign this booking?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Yes, Reassign'
      }).then((result) => {
        if (result.isConfirmed) {
          setBookings(prev => prev.map(booking => 
            booking.id === selectedReassignId 
              ? { ...booking, partnerId, status: 'Assigned' } 
              : booking
          ));
          setAssignModalOpen(false);
          setSelectedReassignId(null);
          setActiveTab('assigned');
          Swal.fire('Reassigned!', 'Partner has been reassigned successfully.', 'success');
        }
      });
    }
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
          <PartnerBookingTable 
            bookings={paginatedBookings}
            viewType="requests"
            onView={handleView}
            onReassign={handleReassign}
          />
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {viewModalOpen && selectedBooking && (
        <PartnerBookingDetailsModal 
          booking={selectedBooking}
          partner={selectedBooking.partnerId ? MOCK_PARTNERS.find(p => p.id === selectedBooking.partnerId) : undefined}
          onClose={() => setViewModalOpen(false)}
        />
      )}

      {assignModalOpen && selectedReassignId && (
        <AssignPartnerModal 
          booking={bookings.find(b => b.id === selectedReassignId)!}
          dronePartners={MOCK_PARTNERS.filter(p => {
             const booking = bookings.find(b => b.id === selectedReassignId);
             return booking && (p.partnerType === booking.partnerType || (!p.partnerType && booking.partnerType === 'Drone'));
          })}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedReassignId(null);
          }}
          onAssign={handleAssignConfirm}
        />
      )}
    </div>
  );
}
