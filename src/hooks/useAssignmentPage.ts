import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import Swal from 'sweetalert2';

interface UseAssignmentPageConfig {
  ownerType: 'ADMIN' | 'PARTNER';
  itemsPerPage?: number;
  mapBooking: (b: any) => any;
  entityLabel: string; // 'request' | 'booking' — used in Swal messages
  assigneeLabel: string; // 'Technician' | 'Partner' — used in Swal messages
}

export default function useAssignmentPage<T extends { id: string }>(config: UseAssignmentPageConfig) {
  const { ownerType, itemsPerPage = 10, mapBooking, entityLabel, assigneeLabel } = config;

  const [statuses, setStatuses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ owner_type: ownerType, page: String(page), limit: String(itemsPerPage) });
      if (activeTab) params.set('status', activeTab);
      const response = await API.get(`/admin/service-bookings?${params.toString()}`);

      if (response.data.success) {
        if (!activeTab && response.data.available_statuses?.length > 0) {
          const allowedStatuses = response.data.available_statuses.filter((s: string) => ['NEW', 'ACCEPTED'].includes(s));
          setStatuses(allowedStatuses);
          setActiveTab(allowedStatuses[0]);
        }
        setItems(response.data.data.map(mapBooking));
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error(`Failed to fetch ${entityLabel}s:`, error);
    }
  }, [activeTab, ownerType, itemsPerPage, mapBooking, entityLabel]);

  useEffect(() => { fetchBookings(currentPage); }, [fetchBookings, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const handleAccept = async (id: string) => {
    const result = await Swal.fire({
      title: `Accept ${entityLabel}?`,
      text: `Are you sure you want to accept this ${entityLabel}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Accept',
    });
    if (result.isConfirmed) {
      try {
        await API.put(`/admin/service-bookings/${id}/status`, { status: 'ACCEPTED' });
        Swal.fire('Accepted!', `The ${entityLabel} has been accepted.`, 'success');
        fetchBookings(currentPage);
      } catch { Swal.fire('Error', `Failed to accept ${entityLabel}`, 'error'); }
    }
  };

  const handleReject = async (id: string) => {
    const result = await Swal.fire({
      title: `Reject ${entityLabel}?`,
      text: `Please select a reason for rejecting this ${entityLabel} (this will queue a customer refund if paid):`,
      input: 'select',
      inputOptions: {
        'Technician unavailable': 'Technician unavailable',
        'Service area unserviceable': 'Service area unserviceable',
        'Customer requested cancellation': 'Customer requested cancellation',
        'Equipment / Spare parts unavailable': 'Equipment / Spare parts unavailable',
        'Other': 'Other reason'
      },
      inputPlaceholder: 'Select rejection reason',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirm Rejection',
      inputValidator: (value) => {
        if (!value) return 'Please select a reason for rejection!';
        return null;
      }
    });
    if (result.isConfirmed) {
      try {
        await API.put(`/admin/service-bookings/${id}/status`, { 
          status: 'CANCELLED',
          reason: result.value
        });
        Swal.fire('Rejected!', `The ${entityLabel} has been rejected and queued for customer refund if paid.`, 'success');
        fetchBookings(currentPage);
      } catch (error: any) { 
        Swal.fire('Error', error.response?.data?.message || `Failed to reject ${entityLabel}`, 'error'); 
      }
    }
  };

  const openAssignModal = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) { setSelectedItem(item); setAssignModalOpen(true); }
  };

  const handleView = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) { setSelectedItem(item); setViewModalOpen(true); }
  };

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    setSelectedItem(null);
    Swal.fire('Assigned!', `${assigneeLabel} has been assigned successfully.`, 'success');
    fetchBookings(currentPage);
  };

  const closeAssignModal = () => setAssignModalOpen(false);
  const closeViewModal = () => setViewModalOpen(false);

  return {
    statuses, activeTab, setActiveTab,
    items, currentPage, totalPages, setCurrentPage,
    assignModalOpen, viewModalOpen, selectedItem,
    handleAccept, handleReject, openAssignModal, handleView,
    handleAssignSuccess, closeAssignModal, closeViewModal,
    fetchBookings,
  };
}
