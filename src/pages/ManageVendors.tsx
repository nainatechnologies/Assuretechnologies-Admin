import { useState, useMemo, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import type { Vendor } from '../types';
import VendorTable from '../components/VendorTable';
import VendorModal from '../components/VendorModal';
import Pagination from '../components/Pagination';
import './ManageVendors.css';

export default function ManageVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'VEND0001',
      fullName: 'admin',
      businessName: 'Naina-tech',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Hyderabad',
      status: 'Active'
    }, 
    {
      id: 'VEND0002',
      fullName: 'admin2',
      businessName: 'Naina-tech2',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'VEND0003',
      fullName: 'admin3',
      businessName: 'Naina-tech3',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Chennai',
      status: 'Active'
    }, 
    {
      id: 'VEND0001',
      fullName: 'admin',
      businessName: 'Naina-tech',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Hyderabad',
      status: 'Active'
    }, 
    {
      id: 'VEND0002',
      fullName: 'admin2',
      businessName: 'Naina-tech2',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'VEND0003',
      fullName: 'admin3',
      businessName: 'Naina-tech3',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Chennai',
      status: 'Active'
    },
    {
      id: 'VEND0001',
      fullName: 'admin',
      businessName: 'Naina-tech',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Hyderabad',
      status: 'Active'
    }, 
    {
      id: 'VEND0002',
      fullName: 'admin2',
      businessName: 'Naina-tech2',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'VEND0003',
      fullName: 'admin3',
      businessName: 'Naina-tech3',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Chennai',
      status: 'Active'
    },
    {
      id: 'VEND0001',
      fullName: 'admin',
      businessName: 'Naina-tech',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Hyderabad',
      status: 'Active'
    }, 
    {
      id: 'VEND0002',
      fullName: 'admin2',
      businessName: 'Naina-tech2',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'VEND0003',
      fullName: 'admin3',
      businessName: 'Naina-tech3',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      gstNumber: '112233445566',
      fullAddress: 'Sample address',
      pincode: '500001',
      businessDescription: 'Tech services',
      bankAccountDetails: 'SBI 1234',
      location: 'Chennai',
      status: 'Active'
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return vendors.filter(v => 
      v.businessName.toLowerCase().includes(query) || 
      v.fullName.toLowerCase().includes(query) ||
      v.mobile.includes(query) ||
      v.email.toLowerCase().includes(query) ||
      v.pincode.includes(query) ||
      v.gstNumber.toLowerCase().includes(query)
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

  const handleSave = (vendorData: Vendor | Omit<Vendor, 'id' | 'status'>) => {
    if ('id' in vendorData) {
      // Edit existing
      setVendors(prev => prev.map(v => v.id === vendorData.id ? vendorData as Vendor : v));
    } else {
      // Add new
      const newVendor: Vendor = {
        ...(vendorData as Omit<Vendor, 'id' | 'status'>),
        id: `VEND${String(vendors.length + 1).padStart(4, '0')}`,
        status: 'Active'
      };
      setVendors(prev => [...prev, newVendor]);
    }
    setIsModalOpen(false);
    setEditingVendor(undefined);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors(prev => prev.filter(v => v.id !== id));
    }
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
