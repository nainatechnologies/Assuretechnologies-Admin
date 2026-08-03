import { useState, } from 'react';
import type { DronePartnerBooking, DronePartner } from '../types';
import Swal from 'sweetalert2';
import AssignDronePartnerModal from '../components/AssignDronePartnerModal';

const MOCK_DRONE_PARTNERS: DronePartner[] = [
  {
    id: 'DP1',
    name: 'AgriDrones AP',
    mobile: '9988776655',
    email: 'contact@agridrones.in',
    location: '522201, 522202, 500001',
    equipmentTypes: ['Standard Spray Drone (10L)', 'Heavy Lift (30L)'],
    status: 'Active'
  },
  {
    id: 'DP2',
    name: 'Kisan Copters',
    mobile: '9876543210',
    email: 'info@kisancopters.in',
    location: '506001, 506015, 500001',
    equipmentTypes: ['High-Capacity Drone (20L)'],
    status: 'Active'
  }
];

const MOCK_DRONE_BOOKINGS: DronePartnerBooking[] = [
  {
    id: 'DB1784871293',
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
    status: 'Pending'
  },
  {
    id: 'DB1777906629',
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
    dronePartnerId: 'DP2'
  }
];

export default function ManageDronePartnerBookings() {
  const [bookings, setBookings] = useState<DronePartnerBooking[]>(MOCK_DRONE_BOOKINGS);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<DronePartnerBooking | null>(null);

  const openAssignModal = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setAssignModalOpen(true);
    }
  };

  const handleAssign = (bookingId: string, dronePartnerId: string) => {
    setBookings(prev => prev.map(req => 
      req.id === bookingId 
        ? { ...req, dronePartnerId, status: 'Assigned' } 
        : req
    ));
    setAssignModalOpen(false);
    setSelectedBooking(null);
    Swal.fire('Assigned!', 'DronePartner has been assigned successfully.', 'success');
  };

  return (
    <div className="manage-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800" style={{ fontSize: '24px', fontWeight: 'bold', padding: '16px' }}>Drone Spray Bookings</h1>
      </div>
      
      <div className="content-card overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4" style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
        <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr className="border-b border-gray-200" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Order ID</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Farmer Info</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Location / Survey No.</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Drone Type</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Schedule</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-3 px-4 text-sm font-medium" style={{ padding: '12px' }}>{booking.id}</td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div>{booking.userName}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.userMobile}</div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#4f46e5' }}>Survey: {booking.surveyNumber}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.village}, {booking.mandal}, {booking.district}</div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{booking.equipmentType}</span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div>{booking.date}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.time}</div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, backgroundColor: booking.status === 'Assigned' ? '#dbeafe' : '#fef9c3', color: booking.status === 'Assigned' ? '#1e40af' : '#854d0e' }}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <button 
                    onClick={() => openAssignModal(booking.id)}
                    style={{ backgroundColor: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {booking.status === 'Pending' ? 'Assign Drone Partner' : 'Reassign'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModalOpen && selectedBooking && (
        <AssignDronePartnerModal 
          booking={selectedBooking}
          dronePartners={MOCK_DRONE_PARTNERS}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
