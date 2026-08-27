import type { ServiceRequest } from '../types';
import './ServiceRequestTable.css';

interface Props {
  requests: ServiceRequest[];
  viewType: 'assignments-new' | 'assignments-accepted' | 'requests';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  onAssign?: (id: string) => void;
  onReassign?: (id: string) => void;
  onMarkAsPaid?: (id: string) => void;
}

export default function ServiceRequestTable({ requests, viewType, onAccept, onReject, onView, onAssign, onReassign, onMarkAsPaid }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Request':
        return <span className="status-badge new-request">Request Received</span>;
      case 'Assigned':
        return <span className="status-badge assigned">Assigned</span>;
      case 'Accepted':
        return <span className="status-badge accepted">Accepted</span>;
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
                <th>Scheduled Date</th>
                <th>SR ID</th>
                <th>Service</th>
                <th>User</th>
                <th>Email</th>
                <th>Address</th>
                <th>Assign</th>
              </>
            ) : viewType === 'assignments-new' ? (
              <>
                <th>Date</th>
                <th>ID</th>
                <th>User</th>
                <th>Service</th>
                <th>Action</th>
              </>
            ) : (
              <>
                <th>Order ID</th>
                <th>User</th>
                <th>Service</th>
                <th>Scheduled Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={req.id}>
              {viewType === 'assignments-accepted' ? (
                <>
                  <td>{index + 1}</td>
                  <td>{req.date}</td>
                  <td>{req.displayId || req.id}</td>
                  <td>{req.serviceName}</td>
                  <td>{req.userName}</td>
                  <td>{req.userEmail}</td>
                  <td>{req.userAddress}</td>
                  <td>
                    <button 
                      className="btn-assign"
                      onClick={() => onAssign && onAssign(req.id)}
                    >
                      Assign Technician
                    </button>
                  </td>
                </>
              ) : viewType === 'assignments-new' ? (
                <>
                  <td>{req.date}</td>
                  <td>{req.displayId || req.id}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{req.userName}</span>
                      <span className="user-mobile">{req.userMobile}</span>
                    </div>
                  </td>
                  <td>{req.serviceName}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-accept" onClick={() => onAccept && onAccept(req.id)}>Accept</button>
                      <button className="btn-reject" onClick={() => onReject && onReject(req.id)}>Reject</button>
                      <button className="btn-view" onClick={() => onView && onView(req.id)}>View</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{req.displayId || req.id}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{req.userName}</span>
                      <span className="user-mobile">{req.userMobile}</span>
                    </div>
                  </td>
                  <td>{req.serviceName}</td>
                  <td>{req.date}</td>
                  <td>{req.time}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    {req.paymentStatus === 'Paid in Full' ? (
                      <span className="status-badge" style={{ backgroundColor: '#166534', color: 'white' }}>Paid in Full</span>
                    ) : req.paymentStatus === 'Prebooking Paid' ? (
                      <span className="status-badge" style={{ backgroundColor: '#10b981', color: 'white' }}>{req.paymentStatus}</span>
                    ) : (
                      <span className="status-badge" style={{ backgroundColor: '#f59e0b', color: 'white' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view-dark" onClick={() => onView && onView(req.id)}>
                        View
                      </button>
                      {req.status === 'In Progress' && onReassign && (
                        <button className="btn-assign" onClick={() => onReassign(req.id)}>
                          Reassign
                        </button>
                      )}
                      {req.status === 'Completed' && req.paymentStatus !== 'Paid in Full' && onMarkAsPaid && (
                        <button 
                          className="btn-assign" 
                          style={{ backgroundColor: '#10b981' }} 
                          onClick={() => onMarkAsPaid(req.id)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4">No requests found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
