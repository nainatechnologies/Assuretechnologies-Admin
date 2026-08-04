import type { PartnerBooking } from '../types';
import './ServiceRequestTable.css'; // Reusing the same CSS

interface Props {
  bookings: PartnerBooking[];
  viewType: 'assignments-new' | 'assignments-accepted' | 'requests';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  onAssign?: (id: string) => void;
  onReassign?: (id: string) => void;
}

export default function PartnerBookingTable({ bookings, viewType, onAccept, onReject, onView, onAssign, onReassign }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="status-badge new-request">Pending</span>;
      case 'Assigned':
        return <span className="status-badge assigned">Assigned</span>;
      case 'Accepted':
        return <span className="status-badge accepted">Accepted</span>;
      case 'In Progress':
        return <span className="status-badge" style={{backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500}}>In Progress</span>;
      case 'Awaiting Approval':
        return <span className="status-badge awaiting-approval">Awaiting Approval</span>;
      case 'Completed':
        return <span className="status-badge completed">Completed</span>;
      case 'Cancelled':
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <table className="modern-table">
        <thead>
          <tr>
            {viewType === 'assignments-accepted' ? (
              <>
                <th>#</th>
                <th>Date</th>
                <th>Order ID</th>
                <th>Farmer Info</th>
                <th>Location / Survey No.</th>
                <th>Equipment Type</th>
                <th>Assign</th>
              </>
            ) : viewType === 'assignments-new' ? (
              <>
                <th>Date</th>
                <th>Order ID</th>
                <th>Farmer Info</th>
                <th>Location / Survey No.</th>
                <th>Equipment Type</th>
                <th>Action</th>
              </>
            ) : (
              <>
                <th>Order ID</th>
                <th>Farmer Info</th>
                <th>Location / Survey No.</th>
                <th>Equipment Type</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Action</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id}>
              {viewType === 'assignments-accepted' ? (
                <>
                  <td>{index + 1}</td>
                  <td>{booking.date}</td>
                  <td>{booking.id}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.userName}</span>
                      <span className="user-mobile">{booking.userMobile}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name" style={{ color: '#4f46e5' }}>Survey: {booking.surveyNumber}</span>
                      <span className="user-mobile">{booking.village}, {booking.district}</span>
                    </div>
                  </td>
                  <td>{booking.equipmentType}</td>
                  <td>
                    <button 
                      className="btn-assign"
                      onClick={() => onAssign && onAssign(booking.id)}
                    >
                      Assign Partner
                    </button>
                  </td>
                </>
              ) : viewType === 'assignments-new' ? (
                <>
                  <td>{booking.date}</td>
                  <td>{booking.id}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.userName}</span>
                      <span className="user-mobile">{booking.userMobile}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name" style={{ color: '#4f46e5' }}>Survey: {booking.surveyNumber}</span>
                      <span className="user-mobile">{booking.village}, {booking.district}</span>
                    </div>
                  </td>
                  <td>{booking.equipmentType}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-accept" onClick={() => onAccept && onAccept(booking.id)}>Accept</button>
                      <button className="btn-reject" onClick={() => onReject && onReject(booking.id)}>Reject</button>
                      <button className="btn-view" onClick={() => onView && onView(booking.id)}>View</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{booking.id}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.userName}</span>
                      <span className="user-mobile">{booking.userMobile}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name" style={{ color: '#4f46e5' }}>Survey: {booking.surveyNumber}</span>
                      <span className="user-mobile">{booking.village}, {booking.district}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {booking.equipmentType}
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.date}</span>
                      <span className="user-mobile">{booking.time}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view-dark" onClick={() => onView && onView(booking.id)}>
                        View
                      </button>
                      {booking.status === 'In Progress' && onReassign && (
                        <button className="btn-assign" onClick={() => onReassign(booking.id)}>
                          Reassign
                        </button>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4">No bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
