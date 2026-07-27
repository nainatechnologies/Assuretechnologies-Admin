import { useState, useEffect, useMemo } from 'react';
import ServiceRequestTable from '../components/ServiceRequestTable';
import Pagination from '../components/Pagination';
import ServiceRequestDetailsModal from '../components/ServiceRequestDetailsModal';
import type { ServiceRequest, Technician } from '../types';
import './ManageServiceAssignments.css';

const MOCK_TECHNICIANS: Technician[] = [
  { id: 'T1', name: 'John Doe', mobile: '9876543210', email: 'john@example.com', address: '', location: 'North', status: 'Active' },
  { id: 'T2', name: 'Jane Smith', mobile: '8765432109', email: 'jane@example.com', address: '', location: 'South', status: 'Active' }
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
    technicianId: 'T2'
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
    status: 'Assigned',
    technicianId: 'T2'
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
    status: 'New Request'
  }
];

export default function ManageServiceRequests() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'awaiting' | 'completed' | 'cancelled'>('assigned');
  const [requests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredRequests = useMemo(() => {
    switch(activeTab) {
      case 'assigned': return requests.filter(r => r.status === 'Assigned');
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
    </div>
  );
}
