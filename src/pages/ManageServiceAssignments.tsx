import { useState, useEffect, useMemo } from 'react';
import ServiceRequestTable from '../components/ServiceRequestTable';
import Pagination from '../components/Pagination';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import ServiceRequestDetailsModal from '../components/ServiceRequestDetailsModal';
import type { ServiceRequest, Technician } from '../types';
import './ManageServiceAssignments.css';
import Swal from 'sweetalert2';

// Mock Data
const MOCK_TECHNICIANS: Technician[] = [
  {
    id: 'T1',
    name: 'Venkatesh',
    mobile: '9876543210',
    email: 'venkat@example.com',
    address: 'srnagar',
    location: 'Hyderabad',
    status: 'Active'
  },
  {
    id: 'T2',
    name: 'Suresh',
    mobile: '9876543211',
    email: 'suresh@example.com',
    address: 'ameerpet',
    location: 'Hyderabad',
    status: 'Active'
  }
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'SR-41',
    userId: 'U1',
    userName: 'Venkatesh Marripelly',
    userMobile: '9701712335',
    userEmail: 'venkatakrishnadandu@gmail.com',
    userAddress: 'srnagar',
    serviceName: 'Baofeng Walkie Talkie BF-888S Pack of 2 with Earphone',
    date: '16 Jun 2026',
    time: '10 AM - 12 PM',
    status: 'New Request'
  },
  {
    id: 'SR-42',
    userId: 'U2',
    userName: 'Siri',
    userMobile: '9505261283',
    userEmail: 'siri@gmail.com',
    userAddress: 'srnagar',
    serviceName: 'Biometric device',
    date: '16 Jun 2026',
    time: '2 PM - 4 PM',
    status: 'Accepted'
  }
];

export default function ManageServiceAssignments() {
  const [activeTab, setActiveTab] = useState<'new' | 'accepted'>('new');
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => 
      activeTab === 'new' ? r.status === 'New Request' : r.status === 'Accepted'
    );
  }, [requests, activeTab]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAccept = (id: string) => {
    Swal.fire({
      title: 'Accept Request?',
      text: "Are you sure you want to accept this service request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Accept'
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'Accepted' } : req
        ));
        Swal.fire('Accepted!', 'The request has been accepted.', 'success');
      }
    });
  };

  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Reject Request?',
      text: "Are you sure you want to reject this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'Cancelled' } : req
        ));
        Swal.fire('Rejected!', 'The request has been rejected.', 'success');
      }
    });
  };

  const openAssignModal = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      setSelectedRequest(req);
      setAssignModalOpen(true);
    }
  };

  const handleView = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      setSelectedRequest(req);
      setViewModalOpen(true);
    }
  };

  const handleAssign = (requestId: string, technicianId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'Assigned', technicianId } : req
    ));
    setAssignModalOpen(false);
    setSelectedRequest(null);
    Swal.fire('Assigned!', 'Technician has been assigned successfully.', 'success');
  };

  return (
    <div className="manage-assignments-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Service Assignments</h1>
      </div>
      
      <div className="content-card">
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Requests
          </button>
          <button 
            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted (Assign Technician)
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'new' && (
            <ServiceRequestTable 
              requests={paginatedRequests}
              viewType="assignments-new"
              onAccept={handleAccept}
              onReject={handleReject}
              onView={handleView}
            />
          )}
          
          {activeTab === 'accepted' && (
            <ServiceRequestTable 
              requests={paginatedRequests}
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

      {assignModalOpen && selectedRequest && (
        <AssignTechnicianModal 
          request={selectedRequest}
          technicians={MOCK_TECHNICIANS}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssign}
        />
      )}

      {viewModalOpen && selectedRequest && (
        <ServiceRequestDetailsModal 
          request={selectedRequest}
          technician={selectedRequest.technicianId ? MOCK_TECHNICIANS.find(t => t.id === selectedRequest.technicianId) : undefined}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
}
