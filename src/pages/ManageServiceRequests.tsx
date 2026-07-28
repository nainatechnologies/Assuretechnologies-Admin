import { useState, useEffect, useMemo } from 'react';
import ServiceRequestTable from '../components/ServiceRequestTable';
import Pagination from '../components/Pagination';
import ServiceRequestDetailsModal from '../components/ServiceRequestDetailsModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import type { ServiceRequest, Technician } from '../types';
import Swal from 'sweetalert2';
import './ManageServiceAssignments.css';

const MOCK_TECHNICIANS: Technician[] = [
  {
    id: 'T1',
    name: 'Venkatesh',
    mobile: '9876543210',
    email: 'venkat@example.com',
    address: 'srnagar',
    location: '500001, 500002',
    status: 'Active'
  },
  {
    id: 'T2',
    name: 'Suresh',
    mobile: '9876543211',
    email: 'suresh@example.com',
    address: 'ameerpet',
    location: '500032, 500033',
    status: 'Active'
  }
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'SR1784871293',
    userId: 'U1',
    userName: 'admin',
    userMobile: '9988776655',
    userEmail: 'admin@example.com',
    userAddress: 'srnagar',
    serviceName: 'agricture',
    date: '24 Jul 2026',
    time: '2 PM - 4 PM',
    status: 'Assigned',
    technicianId: 'T1'
  },
  {
    id: 'SR1777906629',
    userId: 'U2',
    userName: 'Venkatesh Marripelly',
    userMobile: '9701712335',
    userEmail: 'venkatakrishnadandu@gmail.com',
    userAddress: 'srnagar',
    serviceName: 'walkie talkies',
    date: '06 May 2026',
    time: '9 AM - 11 AM',
    status: 'Assigned',
    technicianId: 'T2',
    startWorkPhotos: ['https://placehold.co/1200x900/e2e8f0/64748b?text=Before+1', 'https://placehold.co/1200x900/e2e8f0/64748b?text=Before+2']
  },
  {
    id: 'SR1767504918',
    userId: 'U3',
    userName: 'siri',
    userMobile: '9505261283',
    userEmail: 'siri@gmail.com',
    userAddress: 'srnagar',
    serviceName: 'Cctv installation',
    date: '06 Jan 2026',
    time: '9 AM - 11 AM',
    status: 'Assigned', // Let's keep it as Assigned but simulate awaiting approval data
    technicianId: 'T2'
  },
  {
    id: 'SR1767504955',
    userId: 'U3',
    userName: 'siri',
    userMobile: '9505261283',
    userEmail: 'siri@gmail.com',
    userAddress: 'srnagar',
    serviceName: 'Router installation',
    date: '10 Jan 2026',
    time: '2 PM - 4 PM',
    status: 'In Progress',
    technicianId: 'T1',
    progressUpdates: [
      {
        id: 'PRG1',
        date: '2026-07-25 10:00:00',
        description: 'Installed the main router, testing signal strength across rooms.',
        photos: ['https://placehold.co/150x150/e2e8f0/64748b?text=Progress+1'] // Added mock photo
      }
    ]
  },
  {
    id: 'SR1784884394',
    userId: 'U1',
    userName: 'admin',
    userMobile: '9988776655',
    userEmail: 'admin@example.com',
    userAddress: 'srnagar',
    serviceName: 'agricture',
    date: '24 Jul 2026',
    time: '4 PM - 6 PM',
    status: 'Pending'
  },
  {
    id: 'SR1784889999',
    userId: 'U4',
    userName: 'Ravi',
    userMobile: '9123456780',
    userEmail: 'ravi@example.com',
    userAddress: 'kondapur',
    serviceName: 'Plumbing Repair',
    date: '20 Jul 2026',
    time: '10 AM - 12 PM',
    status: 'Completed',
    technicianId: 'T1',
    startWorkPhotos: ['https://placehold.co/1200x900/e2e8f0/64748b?text=Before+Pipe+Leak'],
    completeWorkPhotos: ['https://placehold.co/1200x900/10b981/ffffff?text=After+Fixed+Pipe']
  }
];

export default function ManageServiceRequests() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'inProgress' | 'awaiting' | 'completed' | 'cancelled'>('assigned');
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReassignId, setSelectedReassignId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredRequests = useMemo(() => {
    switch(activeTab) {
      case 'assigned': return requests.filter(r => r.status === 'Assigned');
      case 'inProgress': return requests.filter(r => r.status === 'In Progress');
      case 'awaiting': return requests.filter(r => r.status === 'Awaiting Approval');
      case 'completed': return requests.filter(r => r.status === 'Completed');
      case 'cancelled': return requests.filter(r => r.status === 'Cancelled');
      default: return [];
    }
  }, [requests, activeTab]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setSelectedRequest(request);
      setViewModalOpen(true);
    }
  };

  const handleReassign = (id: string) => {
    setSelectedReassignId(id);
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = (requestId: string, technicianId: string) => {
    if (selectedReassignId) {
      Swal.fire({
        title: 'Reassign Technician?',
        text: "Are you sure you want to reassign this request?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Yes, Reassign'
      }).then((result) => {
        if (result.isConfirmed) {
          setRequests(prev => prev.map(req => 
            req.id === selectedReassignId 
              ? { ...req, technicianId, status: 'Assigned' } 
              : req
          ));
          setAssignModalOpen(false);
          setSelectedReassignId(null);
          setActiveTab('assigned');
          Swal.fire('Reassigned!', 'Technician has been reassigned successfully.', 'success');
        }
      });
    }
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
          <ServiceRequestTable 
            requests={paginatedRequests}
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

      {viewModalOpen && selectedRequest && (
        <ServiceRequestDetailsModal 
          request={selectedRequest}
          technician={selectedRequest.technicianId ? MOCK_TECHNICIANS.find(t => t.id === selectedRequest.technicianId) : undefined}
          onClose={() => setViewModalOpen(false)}
        />
      )}

      {assignModalOpen && selectedReassignId && (
        <AssignTechnicianModal 
          request={requests.find(r => r.id === selectedReassignId)!}
          technicians={MOCK_TECHNICIANS}
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
