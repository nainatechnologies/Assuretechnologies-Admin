import { useState, useMemo, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import type { Vendor } from '../types';
import VendorTable from '../components/VendorTable';
import VendorModal from '../components/VendorModal';
import Pagination from '../components/Pagination';
import Swal from 'sweetalert2';
import API from '../services/api';
import './ManageVendors.css';

export default function ManageVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendors = async () => {
    try {
      const response = await API.get('/admin/vendors');
      if (response.data.success) {
        const mappedVendors: Vendor[] = response.data.data.map((v: any) => ({
          id: v.id,
          display_id: v.display_id,
          fullName: v.full_name,
          businessName: v.business_name,
          mobile: v.mobile,
          email: v.email,
          gstNumber: v.gst_number,
          fullAddress: v.address,
          pincode: v.pincode || '',
          businessDescription: v.business_description || '',
          bankAccountDetails: v.bank_account_details || '',
          status: v.is_active ? 'Active' : 'Inactive'
        }));
        setVendors(mappedVendors);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      Swal.fire('Error', 'Failed to load vendors', 'error');
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return vendors.filter(v => 
      (v.businessName || '').toLowerCase().includes(query) || 
      (v.fullName || '').toLowerCase().includes(query) ||
      (v.mobile || '').includes(query) ||
      (v.email || '').toLowerCase().includes(query) ||
      (v.pincode || '').includes(query) ||
      (v.gstNumber || '').toLowerCase().includes(query)
    );
  }, [vendors, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSave = async (vendorData: Vendor | Omit<Vendor, 'id' | 'status'>) => {
    if ('id' in vendorData) {
      // Edit existing
      setVendors(prev => prev.map(v => v.id === vendorData.id ? vendorData as Vendor : v));
      setIsModalOpen(false);
      setEditingVendor(undefined);
    } else {
      // Add new
      try {
        const payload = {
          email: vendorData.email,
          mobile: vendorData.mobile,
          password: vendorData.password || 'TempPass123!',
          full_name: vendorData.fullName,
          business_name: vendorData.businessName,
          address: vendorData.fullAddress,
          gst_number: vendorData.gstNumber,
          pincode: vendorData.pincode,
          business_description: vendorData.businessDescription,
          bank_account_details: vendorData.bankAccountDetails
        };
        const response = await API.post('/admin/vendors', payload);
        if (response.data.success) {
          Swal.fire('Added!', 'Vendor has been added.', 'success');
          fetchVendors();
          setIsModalOpen(false);
          setEditingVendor(undefined);
        }
      } catch (error: any) {
        console.error('Create vendor error:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to create vendor', 'error');
      }
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Vendor?',
      text: 'Are you sure you want to delete this vendor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setVendors(prev => prev.filter(v => v.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Vendor has been removed successfully.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return v;
    }));
  };

  return (
    <div className="manage-vendors-container">
      <div className="manage-vendors-header">
        <h1 className="page-title manage-vendors-title">Manage Vendors</h1>
        
        <div className="header-actions">
          <div className="search-wrapper">
            <MdSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary add-btn" onClick={() => { setEditingVendor(undefined); setIsModalOpen(true); }}>
            Add Vendor
          </button>
        </div>
      </div>

      <VendorTable 
        vendors={paginatedVendors} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && (
        <VendorModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingVendor(undefined); }}
          onSave={handleSave}
          vendor={editingVendor}
        />
      )}
    </div>
  );
}
