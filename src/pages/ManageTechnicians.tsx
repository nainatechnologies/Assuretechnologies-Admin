import { useState, useMemo, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import TechnicianTable from '../components/TechnicianTable';
import TechnicianModal from '../components/TechnicianModal';
import Pagination from '../components/Pagination';
import type { Technician } from '../types';
import Swal from 'sweetalert2';
import './ManageTechnicians.css';

export default function ManageTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([
    {
      id: 'TECH0001',
      name: 'admin',
      mobile: '9988776655',
      email: 'shyam.matham@nainatechnologies.in',
      address: '',
      location: 'Hyderabad',
      status: 'Active'
    },
    {
      id: 'TECH0002',
      name: 'admin',
      mobile: '9988776655',
      email: 'admin2@nainatechnologies.in',
      address: '',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'TECH0003',
      name: 'admin3',
      mobile: '9988776655',
      email: 'admin3@nainatechnologies.in',
      address: '',
      location: 'Chennai',
      status: 'Active'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTechnicians = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return technicians.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.email.toLowerCase().includes(query) ||
      t.mobile.includes(query) ||
      t.location.toLowerCase().includes(query)
    );
  }, [technicians, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);
  const paginatedTechnicians = filteredTechnicians.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddTechnician = (newTechData: Omit<Technician, 'id' | 'status'>) => {
    const newTech: Technician = {
      ...newTechData,
      id: `TECH000${technicians.length + 1}`,
      status: 'Active'
    };

    setTechnicians(prev => [...prev, newTech]);
    setIsModalOpen(false);
    Swal.fire({
      title: 'Added!',
      text: 'New technician added successfully.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleUpdateTechnician = (updatedTech: Technician) => {
    setTechnicians(prev =>
      prev.map(t => (t.id === updatedTech.id ? updatedTech : t))
    );
    setEditingTechnician(null);
    Swal.fire({
      title: 'Updated!',
      text: 'Technician has been updated.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteTechnician = (id: string) => {
    Swal.fire({
      title: 'Delete Technician?',
      text: 'Are you sure you want to delete this technician?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setTechnicians(prev => prev.filter(t => t.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Technician removed successfully.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleEditTechnician = (id: string) => {
    const target = technicians.find(t => t.id === id);
    if (target) {
      setEditingTechnician(target);
    }
  };

  const handleToggleStatus = (id: string) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return t;
    }));
  };

  return (
    <div className="manage-technicians-container">
      <div className="manage-technicians-header">
        <h1 className="page-title manage-technicians-title">Manage Technicians</h1>
        
        <div className="header-actions">
          <div className="search-wrapper">
            <MdSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search technicians..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary add-btn" onClick={() => setIsModalOpen(true)}>
            Add Technician
          </button>
        </div>
      </div>

      <TechnicianTable
        technicians={paginatedTechnicians}
        onEditTechnician={handleEditTechnician}
        onDeleteTechnician={handleDeleteTechnician}
        onToggleStatus={handleToggleStatus}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && (
        <TechnicianModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTechnician}
        />
      )}

      {editingTechnician && (
        <TechnicianModal
          isOpen={Boolean(editingTechnician)}
          technician={editingTechnician}
          onClose={() => setEditingTechnician(null)}
          onSave={(tech) => handleUpdateTechnician(tech as Technician)}
        />
      )}
    </div>
  );
}
