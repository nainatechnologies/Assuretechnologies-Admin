import { useState, useMemo } from 'react';
import ServiceForm from '../components/ServiceForm';
import ServiceTable from '../components/ServiceTable';
import EditServiceModal from '../components/EditServiceModal';
import type { Service } from '../types';
import Swal from 'sweetalert2';
import './ManageProducts.css'; // Reusing the modern header styles

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      category: 'ITSupport',
      subCategory: 'On-Site IT Maintenance',
      image: '',
      imageName: 'itsupport.png'
    },
    {
      id: '2',
      category: 'Security',
      subCategory: '24/7 Monitoring',
      image: '',
      imageName: 'monitoring.jpg'
    }
  ]);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...newServiceData,
      id: Math.random().toString(36).substring(2, 9)
    };

    setServices(prevServices => [...prevServices, newService]);
    setIsAdding(false);
    Swal.fire({
      title: 'Added!',
      text: 'New service added successfully.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleEditService = (id: string) => {
    const targetService = services.find(s => s.id === id);
    if (targetService) {
      setEditingService(targetService);
    }
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(prevServices =>
      prevServices.map(s => (s.id === updatedService.id ? updatedService : s))
    );
    setEditingService(null);
    Swal.fire({
      title: 'Updated!',
      text: 'Service has been updated successfully in the table.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteService = (id: string) => {
    Swal.fire({
      title: 'Delete Service?',
      text: 'Are you sure you want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setServices(prevServices => prevServices.filter(s => s.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Service removed successfully.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return services.filter(s => 
      s.category.toLowerCase().includes(query) ||
      s.subCategory.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="manage-products-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="page-title manage-products-title">Manage Services</h1>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by category, name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              minWidth: '250px'
            }}
          />
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isAdding ? '#ef4444' : '#4F46E5',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isAdding ? 'Cancel' : '+ Add Service'}
          </button>
        </div>
      </div>

      {/* Service Form Modal */}
      {isAdding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
             <button 
               onClick={() => setIsAdding(false)}
               style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, color: '#64748b' }}
             >
               &times;
             </button>
             <ServiceForm onAddService={handleAddService} />
          </div>
        </div>
      )}

      {/* Service Table Component */}
      <ServiceTable
        services={paginatedServices}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px', alignItems: 'center' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: currentPage === 1 ? '#f1f5f9' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 15px', background: 'white', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 500 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: currentPage === totalPages ? '#f1f5f9' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          isOpen={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          onUpdateService={handleUpdateService}
        />
      )}
    </div>
  );
}
