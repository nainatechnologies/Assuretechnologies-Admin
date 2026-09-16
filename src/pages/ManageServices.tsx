import { useState, useMemo, useEffect } from 'react';
import ServiceForm from '../components/ServiceForm';
import ServiceTable from '../components/ServiceTable';
import EditServiceModal from '../components/EditServiceModal';
import type { Service } from '../types';
import Swal from 'sweetalert2';
import API from '../services/api';
import './ManageProducts.css'; // Reusing the modern header styles

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<{ id?: string; _id?: string; name: string }[]>([]);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/admin/categories');
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API.get('/admin/services?service_owner_type=Admin');
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data?.data)) {
        data = res.data.data;
      } else if (res.data?.data?.services && Array.isArray(res.data.data.services)) {
        data = res.data.data.services;
      } else if (res.data?.services && Array.isArray(res.data.services)) {
        data = res.data.services;
      } else if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      }
      
      console.log("Raw API Response:", res);
      console.log("Extracted Services Data:", data);
      
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddService = async (newServiceData: Omit<Service, 'id'>) => {
    try {
      const formData = new FormData();
      formData.append('category_id', (newServiceData.category_id || newServiceData.category || ''));
      formData.append('service_owner_type', 'Admin');
      formData.append('name', (newServiceData.name || newServiceData.subCategory || ''));
      if (newServiceData.prebookingCharge !== undefined) {
        formData.append('prebooking_charge', String(newServiceData.prebookingCharge));
      }
      if (newServiceData.customFields) {
        formData.append('custom_fields', JSON.stringify(newServiceData.customFields));
      }
      if (newServiceData.image && newServiceData.image instanceof File) {
        formData.append('image', newServiceData.image);
      }

      await API.post('/admin/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsAdding(false);
      fetchServices();
      Swal.fire({
        title: 'Added!',
        text: 'New service added successfully.',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error adding service:', error);
      Swal.fire('Error', error?.response?.data?.message || 'Failed to add service', 'error');
    }
  };

  const handleEditService = (id: string) => {
    const targetService = services.find(s => s.id === id);
    if (targetService) {
      setEditingService(targetService);
    }
  };

  const handleUpdateService = async (updatedService: Service) => {
    try {
      const formData = new FormData();
      formData.append('category_id', (updatedService.category_id || updatedService.category || ''));
      formData.append('service_owner_type', 'Admin');
      formData.append('name', (updatedService.name || updatedService.subCategory || ''));
      if (updatedService.prebookingCharge !== undefined) {
        formData.append('prebooking_charge', String(updatedService.prebookingCharge));
      }
      if (updatedService.customFields) {
        formData.append('custom_fields', JSON.stringify(updatedService.customFields));
      }
      if (updatedService.image && updatedService.image instanceof File) {
        formData.append('image', updatedService.image);
      }

      await API.put(`/admin/services/${updatedService.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setServices(prevServices =>
        prevServices.map(s => (s.id === updatedService.id ? updatedService : s))
      );
      setEditingService(null);
      Swal.fire({
        title: 'Updated!',
        text: 'Service has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 2000,
        showConfirmButton: false
      });
      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error);
      Swal.fire('Error', error?.response?.data?.message || 'Failed to update service', 'error');
    }
  };



  const handleToggleServiceStatus = async (id: string) => {
    const targetService = services.find(s => s.id === id);
    if (!targetService) return;

    const isCurrentlyActive = targetService.status === 'Active' || (targetService as any).is_active === true;
    const newIsActive = !isCurrentlyActive;

    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newIsActive ? 'Active' : 'Inactive', is_active: newIsActive };
      }
      return s;
    }));

    try {
      const res = await API.patch(`/admin/services/${id}/status`, { is_active: newIsActive });
      Swal.fire({
        title: newIsActive ? 'Activated!' : 'Deactivated!',
        text: res.data?.message || `Service status updated to ${newIsActive ? 'active' : 'inactive'}`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      setServices(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, status: isCurrentlyActive ? 'Active' : 'Inactive', is_active: isCurrentlyActive };
        }
        return s;
      }));
      Swal.fire({
        title: 'Error',
        text: 'Failed to update service status',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result = services.filter(s => {
      const matchCategory = s.category && typeof s.category === 'string' && s.category.toLowerCase().includes(query);
      const matchSub = s.subCategory && typeof s.subCategory === 'string' && s.subCategory.toLowerCase().includes(query);
      const matchName = s.name && typeof s.name === 'string' && s.name.toLowerCase().includes(query);
      return matchCategory || matchSub || matchName || query === '';
    });
    console.log("Filtered Services:", result);
    return result;
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
             <ServiceForm onAddService={handleAddService} categories={categories} />
          </div>
        </div>
      )}

      {/* Service Table Component */}
      <ServiceTable
        services={paginatedServices}
        onEditService={handleEditService}

        onToggleStatus={handleToggleServiceStatus}
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
          categories={categories}
        />
      )}
    </div>
  );
}
